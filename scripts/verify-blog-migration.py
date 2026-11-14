#!/usr/bin/env python3
"""Run after `bun run build`; checks the actual static migration artifact."""
from html.parser import HTMLParser
from pathlib import Path
import unittest
import xml.etree.ElementTree as ET
import http.client
import os
import socket
import subprocess
import tempfile
import time

ROOT = Path(__file__).resolve().parents[1]
DESTINATION = "https://optihealth.devpins.org/blog/whoop-vs-fitbit"


class WritingParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.language = None
        self.links = []
        self.anchor = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "section" and "data-language-panel" in attrs:
            self.language = attrs["data-language-panel"]
        if tag == "a":
            self.anchor = {"href": attrs.get("href"), "language": self.language, "text": ""}

    def handle_data(self, data):
        if self.anchor is not None:
            self.anchor["text"] += data

    def handle_endtag(self, tag):
        if tag == "a" and self.anchor is not None:
            self.links.append(self.anchor)
            self.anchor = None
        if tag == "section":
            self.language = None


class MigrationArtifactTests(unittest.TestCase):
    def test_home_and_writing_link_to_english_optihealth_article_only(self):
        for relative in ("index.html", "blog/index.html"):
            with self.subTest(page=relative):
                parser = WritingParser()
                parser.feed((ROOT / "dist" / relative).read_text())
                external = [link for link in parser.links if link["href"] == DESTINATION]
                self.assertEqual(len(external), 1, "missing/duplicate external article listing")
                self.assertEqual(external[0]["language"], "en", "not a Russian translation")
                self.assertIn("WHOOP vs Fitbit: Real-World Data (N=97)", external[0]["text"])
                self.assertIn("optiHealth", external[0]["text"])
                old_links = [link for link in parser.links if link["href"] and
                             link["href"].startswith("/blog/whoop-vs-fitbit")]
                self.assertEqual(old_links, [])

    def test_moved_and_deleted_articles_have_no_local_html_or_hreflang(self):
        for slug in ("whoop-vs-fitbit", "whoop-vs-fitbit-ru"):
            self.assertFalse((ROOT / "dist/blog" / slug).exists())
            self.assertFalse((ROOT / "dist/blog" / f"{slug}.html").exists())
        for page in (ROOT / "dist").rglob("*.html"):
            with self.subTest(page=str(page.relative_to(ROOT / "dist"))):
                self.assertNotIn("whoop-vs-fitbit-ru", page.read_text())

    def test_sitemaps_and_feed_contain_exactly_the_other_six_local_posts(self):
        expected = {
            f"https://devpins.org/blog/{slug}/" for slug in (
                "ai360-itmo-ru", "fear-of-calculus-itmo-ai360", "fitbit-vs-oura",
                "fitbit-vs-oura-ru", "ne-ya-umer-en", "ne-ya-umer",
            )
        }
        namespace = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        for name in ("sitemap-0.xml", "sitemap.xml"):
            tree = ET.parse(ROOT / "dist" / name)
            urls = [item.text for item in tree.findall("sm:url/sm:loc", namespace) if item.text]
            self.assertEqual(len(urls), len(set(urls)))
            self.assertEqual({url for url in urls if "/blog/" in url and url != "https://devpins.org/blog/"}, expected)
            self.assertNotIn(DESTINATION, urls)
        feed = ET.parse(ROOT / "dist/rss.xml")
        links = [item.text for item in feed.findall("./channel/item/link")]
        self.assertEqual(set(links), expected)
        self.assertEqual(len(links), len(expected))


@unittest.skipUnless(os.environ.get("MIGRATION_CADDY"), "set MIGRATION_CADDY to a Caddy binary for HTTP rehearsal")
class MigrationHTTPTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with socket.socket() as sock:
            sock.bind(("127.0.0.1", 0))
            cls.port = sock.getsockname()[1]
        cls.temporary = tempfile.TemporaryDirectory(prefix="migration-http-", dir=ROOT / ".astro")
        cls.addClassCleanup(cls.temporary.cleanup)
        directory = Path(cls.temporary.name)
        snippet = ROOT / "docker/whoop-vs-fitbit.caddy"
        rules = snippet.read_text() if snippet.exists() else ""
        config = directory / "Caddyfile"
        config.write_text(
            "{\n admin off\n auto_https off\n}\n"
            f"http://127.0.0.1:{cls.port} {{\n{rules}\n"
            f' handle {{\n root * "{ROOT / "dist"}"\n'
            " try_files {path} {path}.html {path}/index.html\n file_server\n }\n}\n"
        )
        log = (directory / "caddy.log").open("w+")
        cls.addClassCleanup(log.close)
        cls.server = subprocess.Popen(
            [os.environ["MIGRATION_CADDY"], "run", "--config", str(config), "--adapter", "caddyfile"],
            stdout=log, stderr=log,
        )
        def stop():
            cls.server.terminate()
            cls.server.wait(timeout=10)
        cls.addClassCleanup(stop)
        for _ in range(100):
            if cls.server.poll() is not None:
                log.seek(0)
                raise RuntimeError(log.read())
            try:
                with socket.create_connection(("127.0.0.1", cls.port), timeout=0.1):
                    return
            except OSError:
                time.sleep(0.05)
        raise RuntimeError("isolated Caddy failed to start")

    def request(self, path, method="GET"):
        connection = http.client.HTTPConnection("127.0.0.1", self.port, timeout=10)
        try:
            connection.request(method, path)
            response = connection.getresponse()
            result = response.status, response.getheader("Location"), response.read()
            return result
        finally:
            connection.close()

    def test_english_old_urls_permanently_redirect_to_exact_destination(self):
        for method in ("GET", "HEAD"):
            for suffix in ("", "/", "?utm_source=old", "/?utm_source=old"):
                with self.subTest(method=method, suffix=suffix):
                    status, location, _ = self.request("/blog/whoop-vs-fitbit" + suffix, method)
                    self.assertEqual(status, 301)
                    self.assertEqual(location, DESTINATION)

    def test_russian_old_urls_are_gone_without_a_redirect(self):
        for method in ("GET", "HEAD"):
            for suffix in ("", "/", "?utm_source=old", "/?utm_source=old"):
                with self.subTest(method=method, suffix=suffix):
                    status, location, _ = self.request("/blog/whoop-vs-fitbit-ru" + suffix, method)
                    self.assertEqual(status, 410)
                    self.assertIsNone(location)

    def test_other_articles_and_home_still_serve_without_redirecting(self):
        for slug in ("", "blog/", "blog/ai360-itmo-ru/", "blog/fear-of-calculus-itmo-ai360/",
                     "blog/fitbit-vs-oura/", "blog/fitbit-vs-oura-ru/", "blog/ne-ya-umer/", "blog/ne-ya-umer-en/"):
            with self.subTest(slug=slug):
                status, location, body = self.request("/" + slug)
                self.assertEqual(status, 200)
                self.assertIsNone(location)
                self.assertIn(b"<html", body)
        for path in ("/blog/whoop-vs-fitbit-unrelated", "/blog/whoop-vs-fitbit/nested",
                     "/blog/whoop-vs-fitbit-ru-unrelated", "/blog/whoop-vs-fitbit-ru/nested"):
            with self.subTest(path=path):
                status, location, _ = self.request(path)
                self.assertEqual(status, 404)
                self.assertIsNone(location)


if __name__ == "__main__":
    unittest.main(verbosity=2)

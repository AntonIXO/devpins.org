#!/usr/bin/env python3
"""Build a small, browser-ready graph snapshot from an Obsidian vault.

The generated JSON intentionally contains only graph metadata and positions,
not note contents. This keeps the public preview useful without publishing the
vault itself.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
from collections import Counter, defaultdict
from pathlib import Path


WIKILINK_RE = re.compile(r"(?<!\!)\[\[([^\]|#]+)(?:\|[^\]]+)?\]\]")
FRONTMATTER_RE = re.compile(r"^---\s*\n(.*?)\n---\s*\n", re.S)
KEY_RE = re.compile(r"^(id|status):\s*(?:['\"]([^'\"]+)['\"]|(.+?))\s*$", re.M)


def parse_simple_frontmatter(text: str) -> dict[str, str]:

	match = FRONTMATTER_RE.match(text)
	if not match:
		return {}

	values: dict[str, str] = {}
	for key, quoted, plain in KEY_RE.findall(match.group(1)):
		values[key] = (quoted or plain).strip()
	return values


def humanize(value: str) -> str:
	value = re.sub(r"[-_]+", " ", value).strip()
	value = re.sub(r"\s+", " ", value)
	return value[:1].upper() + value[1:] if value else "Untitled note"


def stable_unit(value: str) -> float:
	digest = hashlib.sha256(value.encode("utf-8")).digest()
	return int.from_bytes(digest[:8], "big") / 2**64


def git_metadata(source: Path) -> tuple[str | None, str | None]:
	try:
		commit = subprocess.run(
			["git", "-C", str(source), "rev-parse", "HEAD"],
			check=True,
			capture_output=True,
			text=True,
		).stdout.strip()
		snapshot = subprocess.run(
			["git", "-C", str(source), "show", "-s", "--format=%cI", "HEAD"],
			check=True,
			capture_output=True,
			text=True,
		).stdout.strip()
		return commit, snapshot
	except (OSError, subprocess.CalledProcessError):
		return None, None


def build_graph(source: Path) -> dict:
	files = sorted(source.rglob("*.md"))
	commit, snapshot = git_metadata(source)
	nodes_by_key: dict[str, str] = {}
	nodes: dict[str, dict] = {}

	for path in files:
		relative = path.relative_to(source)
		folder = relative.parts[0] if len(relative.parts) > 1 else "root"
		frontmatter = parse_simple_frontmatter(path.read_text(errors="ignore"))
		node_id = frontmatter.get("id") or path.stem
		# A vault can contain a tag note and a note id with the same stem. The
		# frontmatter id is canonical; the relative path remains a unique key.
		if node_id in nodes:
			node_id = f"{folder}/{path.stem}"

		nodes[node_id] = {
			"id": node_id,
			"label": humanize(path.stem),
			"path": relative.as_posix(),
			"kind": folder,
			"status": frontmatter.get("status", ""),
			"x": (stable_unit(node_id) - 0.5) * 1400,
			"y": (stable_unit(f"{node_id}:y") - 0.5) * 900,
			"degree": 0,
		}
		for key in {node_id, path.stem, relative.as_posix(), relative.with_suffix("").as_posix()}:
			nodes_by_key[key] = node_id

	edges: Counter[tuple[str, str]] = Counter()
	for path in files:
		relative = path.relative_to(source)
		frontmatter = parse_simple_frontmatter(path.read_text(errors="ignore"))
		source_id = frontmatter.get("id") or path.stem
		if source_id not in nodes:
			source_id = nodes_by_key.get(relative.as_posix(), source_id)
		text = path.read_text(errors="ignore")
		for raw_target in WIKILINK_RE.findall(text):
			target = raw_target.strip()
			target_id = nodes_by_key.get(target) or nodes_by_key.get(Path(target).stem)
			if not target_id or target_id == source_id:
				continue
			key = tuple(sorted((source_id, target_id)))
			edges[key] += 1

	for (source_id, target_id), weight in edges.items():
		nodes[source_id]["degree"] += weight
		nodes[target_id]["degree"] += weight

	node_values = list(nodes.values())
	max_degree = max((node["degree"] for node in node_values), default=1)
	for node in node_values:
		node["size"] = round(2.2 + 6.8 * (node["degree"] / max_degree) ** 0.55, 2)

	return {
		"source": {
			"repository": "AntonIXO/vibescience-EiV",
			"url": "https://github.com/AntonIXO/vibescience-EiV",
			"commit": commit,
			"snapshot": snapshot or "generated from the repository snapshot provided for this preview",
			"noteCount": len(node_values),
			"edgeCount": len(edges),
		},
		"nodes": node_values,
		"edges": [
			{"source": source_id, "target": target_id, "weight": weight}
			for (source_id, target_id), weight in sorted(edges.items())
		],
	}


def main() -> None:
	parser = argparse.ArgumentParser()
	parser.add_argument("source", type=Path)
	parser.add_argument("output", type=Path)
	args = parser.parse_args()
	graph = build_graph(args.source)
	args.output.parent.mkdir(parents=True, exist_ok=True)
	args.output.write_text(json.dumps(graph, ensure_ascii=False, separators=(",", ":")) + "\n")
	print(f"wrote {len(graph['nodes'])} nodes and {len(graph['edges'])} edges to {args.output}")


if __name__ == "__main__":
	main()

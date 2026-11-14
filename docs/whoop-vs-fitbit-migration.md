# WHOOP vs Fitbit migration: activation handoff

**Do not activate until `https://optihealth.devpins.org/blog/whoop-vs-fitbit`
serves the complete English article with a self-referencing canonical.** This
branch is intentionally not a deployment. It removes both local article bodies
and keeps one English-only external entry on the homepage and writing index.
No Russian replacement or external Russian listing is created. All other posts
and all source assets are retained.

## Production topology and required external change

Production is Traefik → `127.0.0.1:8088` → container `static-caddy`:

- `/opt/devpins.org/dist` is mounted read-only at `/srv/devpins`.
- `/opt/static-caddy/Caddyfile` is mounted read-only at `/etc/caddy/Caddyfile`.
- The relevant site block is
  `http://devpins.org:8088, http://www.devpins.org:8088`.
- The repository's `compose.yaml`, Dockerfile and nginx config are not the
  production serving path. Astro's static redirect pages do **not** provide an
  HTTP 301 on this topology.

After the destination is live, copy the **contents** of
`docker/whoop-vs-fitbit.caddy` inside that existing site block, immediately before
its final catch-all `handle { root * /srv/devpins ... }`. Do not replace the whole
Caddyfile or alter `/email/*`, Matrix well-known, vitals or other vhosts. The
exact rules are:

```caddyfile
@whoopFitbitEnglish path /blog/whoop-vs-fitbit /blog/whoop-vs-fitbit/
redir @whoopFitbitEnglish https://optihealth.devpins.org/blog/whoop-vs-fitbit 301

@whoopFitbitRussian path /blog/whoop-vs-fitbit-ru /blog/whoop-vs-fitbit-ru/
handle @whoopFitbitRussian {
    respond "Gone" 410
}
```

Both English spellings redirect directly to the exact canonical destination,
without preserving the old query string. Both Russian spellings return HTTP
410 with no Location header. Matchers are exact: no wildcard prefix. The
Russian response belongs inside a `handle`: a bare top-level `respond` sorts
**after** the existing catch-all `handle` and would not execute.

Validate the complete candidate Caddyfile before activation. The live config
has `admin off`, so `caddy reload` cannot apply it through the admin API. The
operator must validate the updated bind-mounted file with
`docker exec static-caddy caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile`,
then deliberately restart `static-caddy` (briefly affects its other vhosts too).
If an atomic file replacement changed the bind-mounted inode, first validate the
candidate independently and ensure the restarted container sees the new bytes;
do not assume an in-container pre-restart validation read the updated host file.

Merge this branch and build the canonical site **only after** the destination
is live and the HTTP rules are ready. A canonical `bun run build` publishes
`/opt/devpins.org/dist`; builds in this isolated worktree do not publish it.
After activation verify public GET and HEAD for old English paths → 301 with
exact Location, old Russian paths → 410 without Location, `/` and `/blog/` →
200 with the English external entry, both Fitbit-vs-Oura routes → 200, and both
sitemap XML aliases and RSS contain neither old WHOOP article URL. Verify
`/api/vitals.json`, Matrix delegation and relevant other static vhosts too.

## Local verification (no deploy)

```sh
bun test
bun run build
# Read-only copy of the running server's binary, or use another local Caddy:
docker cp static-caddy:/usr/bin/caddy .astro/migration-caddy
MIGRATION_CADDY="$PWD/.astro/migration-caddy" python3 scripts/verify-blog-migration.py
```

Use a memory-bounded `systemd-run --wait --pipe --collect` build on this shared
host. The Python checks inspect built HTML/sitemaps/RSS and start a short-lived
Caddy on a random **loopback** port with admin disabled, using the committed
rules and worktree `dist`. They never reload or edit the production server.
Omitting `MIGRATION_CADDY` runs artifact checks but explicitly skips HTTP tests.

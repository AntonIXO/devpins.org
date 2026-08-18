## Deploy

Production is the static tree at `dist/`, bind-mounted into `static-caddy` as `/srv/devpins`. Building **is** deploying. Do not `docker compose up`, do not use the Dockerfile, do not restart Caddy.

```
bash scripts/deploy.sh           # bun test + bun run build + live probe
bash scripts/deploy.sh --check   # live probe only
```

`/api/vitals.json` is served from `/var/lib/devpins`, not from `dist/`. A rebuild must not overwrite it.

## Dev server

```
astro dev --background
```

`astro dev stop`, `astro dev status`, `astro dev logs`.

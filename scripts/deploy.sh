#!/usr/bin/env bash
# Deploy https://devpins.org
#
# Production is NOT compose.yaml and NOT the Dockerfile. Those are leftovers.
# `bun run build` writes ./dist, which static-caddy bind-mounts at /srv/devpins.
# A successful build IS the deploy. Do not restart Caddy. Do not docker compose up.
#
# /api/vitals.json is served from /var/lib/devpins, not from dist/. A rebuild
# must not touch that file.
#
# Usage:
#   scripts/deploy.sh           # test + build + live probe
#   scripts/deploy.sh --check   # live probe only
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ORIGIN="${ORIGIN:-https://devpins.org}"
cd "$ROOT"

die() { echo "FAIL: $*" >&2; exit 1; }

probe() {
	local code
	code="$(curl -sS -o /tmp/devpins-probe.body -w '%{http_code}' --max-time 20 "$1")"
	[[ "$code" == "$2" ]] || die "$1 → HTTP $code (want $2)"
}

check() {
	probe "$ORIGIN/" 200
	probe "$ORIGIN/favicon.svg" 200
	probe "$ORIGIN/favicon.ico" 200
	probe "$ORIGIN/apple-touch-icon.png" 200
	probe "$ORIGIN/api/vitals.json" 200

	python3 - "$ORIGIN" <<'PY'
import json, sys, urllib.request
origin = sys.argv[1]
with urllib.request.urlopen(origin + "/favicon.ico", timeout=20) as r:
    sig = r.read(4)
if sig != b"\x00\x00\x01\x00":
    raise SystemExit(f"favicon.ico sig={sig.hex()} (want 00000100 ICO; 89504e47 = leftover Astro PNG)")
with urllib.request.urlopen(origin + "/favicon.svg", timeout=20) as r:
    svg = r.read().decode()
if 'width="120" height="120" fill="#0F1211"' not in svg:
    raise SystemExit("favicon.svg plate is not a full-bleed square")
if 'width="120" height="120" rx=' in svg:
    raise SystemExit("favicon.svg plate still has rx (white corners)")
with urllib.request.urlopen(origin + "/api/vitals.json", timeout=20) as r:
    data = json.load(r)
need = ("bpm", "hrv", "sleepHours")
missing = [k for k in need if k not in data]
if missing:
    raise SystemExit(f"vitals.json missing {missing}: {data!r}")
print(f"favicon.ico ICO  vitals bpm={data['bpm']} hrv={data['hrv']} sleep={data['sleepHours']}")
PY

	echo "CHECK OK  $ORIGIN"
}

if [[ "${1:-}" == "--check" ]]; then
	check
	exit 0
fi
if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
	sed -n '2,16p' "$0"
	exit 0
fi
if [[ $# -gt 0 ]]; then
	die "unknown arg: $*  (try --check)"
fi

[[ -d node_modules ]] || bun install --frozen-lockfile

echo "== test =="
bun test
echo "== build → $ROOT/dist (live mount) =="
bun run build
echo "== probe $ORIGIN =="
check
echo "DEPLOY OK"

# Mod Decoded (moddecoded.com)

Static site explaining modded Minecraft mechanics from each mod's own code.
Hosted on Cloudflare Pages. No build step: everything in `site/` is served as-is.

```
site/                      what gets deployed
  index.html               home page
  404.html                 served automatically by Pages for missing paths
  _headers                 security headers (Pages reads this file)
  robots.txt
  tools/<mod>/<tool>/index.html
research/                  source notes behind each tool (not deployed)
wrangler.toml              Pages project config for CLI deploys
```

## Preview locally

```bash
npx wrangler pages dev site
```

## Deploy

**Option A — connect GitHub (auto-deploys on every push):**
1. Push this repo to GitHub.
2. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git.
3. Framework preset: *None*. Build command: *(empty)*. Build output directory: `site`.

**Option B — upload from this machine** with the saved, encrypted API token:

```powershell
powershell -NoProfile -File scripts\save-cloudflare-token.ps1   # once
powershell -NoProfile -File scripts\wrangler.ps1 pages deploy site --project-name=moddecoded
```

The token is stored DPAPI-encrypted in `%APPDATA%\moddecoded\`, never in this repo.

## Live

- Production: https://moddecoded.com (and www), Pages project `moddecoded`, branch `main`.
- Project was created on classic Pages with `--force` once (wrangler 4.139 otherwise delegates
  Pages commands to Workers). Later deploys need no `--force`.
- Custom domains were attached via the API (`scripts/cf-api.ps1`). Pages did **not** create the DNS
  records itself, so proxied CNAMEs `moddecoded.com` and `www` -> `moddecoded.pages.dev` were added by hand.

## Adding a tool

Create `site/tools/<mod>/<tool>/index.html`, add a card for it in `site/index.html`, and
put the source notes (class/method references, version) in `research/`.

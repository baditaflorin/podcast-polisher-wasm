# Deploy

Live site:

https://baditaflorin.github.io/podcast-polisher-wasm/

Repository:

https://github.com/baditaflorin/podcast-polisher-wasm

## Publishing

GitHub Pages serves the `main` branch from `/docs`.

Manual publish:

```bash
npm install
make lint
make test
make build
git add docs package-lock.json package.json app public scripts
git commit -m "feat: update static site"
git push
```

## Rollback

Revert the commit that changed `docs/`, then push `main`.

```bash
git revert <commit_sha>
git push
```

## Local Preview

```bash
make build
make pages-preview
```

Open:

http://127.0.0.1:4173/podcast-polisher-wasm/

## Custom Domain

No custom domain is configured in v1. If one is added later, place `CNAME` in `docs/` and configure DNS with GitHub Pages as documented at:

https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site

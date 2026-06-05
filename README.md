# npm-start

pnpm monorepo starter for publishing scoped npm packages to the public registry.

## Packages

| Package | Published | Description |
| --- | --- | --- |
| `@bsgrigorov/npm-start` | no | private workspace root |
| `@bsgrigorov/npm-start-eslint-config` | no | shared ESLint flat config |
| `@bsgrigorov/npm-start-typescript-config` | no | shared TypeScript bases |
| `@bsgrigorov/npm-start-market` | yes | Yahoo Finance quote helpers |

## Requirements

- Node.js 24+
- pnpm 10.32.0 (`corepack enable`)

## Commands

```bash
pnpm install
pnpm build
pnpm test
pnpm lint
pnpm typecheck
```

## Release flow (Changesets)

1. Make changes under `packages/market`.
2. Run `pnpm changeset` and describe the bump.
3. Merge the PR to `main`.
4. The release workflow opens/updates a "Version Packages" PR.
5. Merge that PR to publish.

Only packages with a changeset are versioned and published.

## Trusted publishing

Configure [npm trusted publishers](https://docs.npmjs.com/trusted-publishers) for `@bsgrigorov/npm-start-market`:

- Provider: GitHub Actions
- Repository: `bsgrigorov/npm-start`
- Workflow: `release.yml`
- Environment: (none)

After the first manual publish (or empty package registration), restrict token publishing in npm package settings.

The release workflow sets `id-token: write` and publishes with provenance. No long-lived `NPM_TOKEN` is required.

## Manual publish (optional)

For one-off local publishes after `pnpm build`:

```bash
cd packages/market
npm publish --access public
```

For interactive semver + git tags on a single package, [np](https://github.com/sindresorhus/np) works, but this repo uses Changesets for monorepo releases.

## License

MIT

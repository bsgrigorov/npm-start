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

## Trusted publishing setup

This repo publishes with [npm trusted publishers](https://docs.npmjs.com/trusted-publishers) (OIDC). No `NPM_TOKEN` secret is required.

### 1. GitHub Actions permissions

In **bsgrigorov/npm-start → Settings → Actions → General**:

- **Workflow permissions:** Read and write permissions
- Enable **Allow GitHub Actions to create and approve pull requests** (required for Changesets release PRs)

### 2. npm trusted publisher (after first package exists on npm)

You need the package name reserved on npm before trusted publishing works. Either:

- publish once manually from your machine (`cd packages/market && npm publish --access public`), or
- merge the first Changesets release PR and let CI publish (after step 3 below)

Then on [npmjs.com](https://www.npmjs.com):

1. Open **@bsgrigorov/npm-start-market → Settings → Publishing access**
2. **Add trusted publisher → GitHub Actions**
3. Set:
   - **Organization or user:** `bsgrigorov`
   - **Repository:** `npm-start`
   - **Workflow filename:** `release.yml` (exact, including `.yml`)
   - **Environment:** leave blank
   - **Allowed actions:** `npm publish`
4. Optional but recommended: under **Publishing access**, set **Disallow publishing access tokens** once trusted publishing is verified.

Trusted publishing requires a **public GitHub repository** for provenance.

### 3. Release flow

1. Change code under `packages/market` (or other publishable packages).
2. Run `pnpm changeset`, pick semver bump, commit the generated file in `.changeset/`.
3. Merge PR to `main`.
4. **Release** workflow runs:
   - if changesets are pending → opens/updates a **Version Packages** PR
   - if the Version Packages PR was just merged → runs `pnpm release` and publishes to npm with provenance
5. Merge the Version Packages PR when ready to release.

The pending changeset at `.changeset/initial-market-release.md` will produce `@bsgrigorov/npm-start-market@0.1.0` on the first release merge.

### 4. Verify publish

```bash
npm view @bsgrigorov/npm-start-market version
npm view @bsgrigorov/npm-start-market --json | jq '.dist.provenance'
```

## Manual publish (optional)

For one-off local publishes after `pnpm build`:

```bash
cd packages/market
npm publish --access public
```

For interactive semver + git tags on a single package, [np](https://github.com/sindresorhus/np) works, but this repo uses Changesets for monorepo releases.

## License

MIT

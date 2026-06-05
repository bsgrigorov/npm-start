# npm publishing setup

How we got `@bsgrigorov/npm-start-market` publishing from GitHub Actions via [npm trusted publishing](https://docs.npmjs.com/trusted-publishers). No `NPM_TOKEN` secret.

## Steps we took

### 1. Release workflow

`.github/workflows/release.yml` runs on push to `main`:

- `permissions.id-token: write` — OIDC for npm
- `actions/setup-node` with `registry-url: https://registry.npmjs.org`
- `changesets/action` with `publish: pnpm release` (`pnpm build && changeset publish`)
- `NPM_CONFIG_PROVENANCE: true`

### 2. Fix invalid action SHA

First release run failed: `changesets/action` was pinned to a commit that does not exist.

Re-pinned all workflow actions to real release SHAs (e.g. `changesets/action` **v1.9.0**). Verify tags before pinning:

```bash
gh api repos/changesets/action/git/ref/tags/v1.9.0
```

### 3. GitHub repo settings

**bsgrigorov/npm-start → Settings → Actions → General:**

- Workflow permissions: **Read and write**
- Enable **Allow GitHub Actions to create and approve pull requests**

Repo must be **public** for provenance.

### 4. npm trusted publisher

On npm → **@bsgrigorov/npm-start-market → Settings → Publishing access → Add trusted publisher → GitHub Actions:**

| Field | Value |
| --- | --- |
| Organization or user | `bsgrigorov` |
| Repository | `npm-start` |
| Workflow filename | `release.yml` |
| Environment | (blank) |
| Allowed actions | `npm publish` |

### 5. First release via Changesets

1. Added `.changeset/initial-market-release.md` for `@bsgrigorov/npm-start-market`.
2. Merged to `main` → Release workflow opened **Version Packages** PR #1.
3. Merged that PR → Release workflow published **`0.1.0`** to npm.

Successful publish run: https://github.com/bsgrigorov/npm-start/actions/runs/27034619952

## Release flow (two steps)

A green Release job does **not** always publish. Changesets uses two runs:

1. **Merge PR with a `.changeset/` file** → Release opens/updates **Version Packages** PR. No npm publish yet.
2. **Merge Version Packages PR** → versions bump, `changeset publish` runs, package goes to npm.

Check the **Create release PR or publish** step for `packages published successfully`.

## Manual publish (what we tried first)

Optional bootstrap only. CI is the intended path.

```bash
pnpm --filter @bsgrigorov/npm-start-market build
cd packages/market
npm publish --access public --provenance=false
```

We published **`0.0.0`** manually (~19:03 UTC). CI later published **`0.1.0`** (~19:06 UTC) after merging the Version Packages PR.

### 403: “Two-factor authentication … required to publish”

`npm profile get` showed 2FA disabled, but publish still failed with 403. npm requires one of:

- 2FA enabled + `npm publish --otp=<code>`, or
- Granular publish token, or
- **Trusted publishing from CI** (what worked for us)

A classic `npm_…` token can pass `npm whoami` but not publish.

## Verify

```bash
npm view @bsgrigorov/npm-start-market version   # 0.1.0
npm view @bsgrigorov/npm-start-market versions  # ["0.0.0", "0.1.0"]
```

Package: https://www.npmjs.com/package/@bsgrigorov/npm-start-market

## Ongoing releases

1. `pnpm changeset` → commit under `.changeset/`
2. Merge to `main` → wait for Version Packages PR
3. Merge Version Packages PR → confirm publish in workflow logs

## References

- [npm trusted publishers](https://docs.npmjs.com/trusted-publishers)
- [changesets/action](https://github.com/changesets/action)

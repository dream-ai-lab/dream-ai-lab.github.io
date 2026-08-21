# Decap CMS OAuth proxy (Cloudflare Worker)

Makes **Login with GitHub** work at <https://dream-ai-lab.github.io/admin/>.

## Why this exists

`public/admin/config.yml` uses the `github` backend. Without a `base_url`, Decap CMS
falls back to Netlify's OAuth endpoint (`https://api.netlify.com/auth`), which returns
**404 Not Found** for sites not hosted on Netlify — that's the "not found" you get when
clicking the login button. GitHub's OAuth code→token exchange needs a client secret,
which a static site can't hold, so it has to happen on a server. This ~90-line Worker is
that server. It's free on Cloudflare's plan and holds no state.

## Deploy (one time, ~5 minutes)

### 1. Register a GitHub OAuth App

<https://github.com/settings/developers> → **New OAuth App**

| Field | Value |
|---|---|
| Application name | `DreamAI CMS` |
| Homepage URL | `https://dream-ai-lab.github.io` |
| Authorization callback URL | `https://dreamai-cms-oauth.<your-subdomain>.workers.dev/callback` |

You don't know `<your-subdomain>` yet — put a placeholder, deploy step 2, then come back
and correct it. The callback URL must match the deployed Worker exactly.

Generate a client secret and keep both values to hand.

> Register it under the **dream-ai-lab org** (Settings → Developer settings) rather than a
> personal account, so the app outlives any one member.

### 2. Deploy the Worker

```bash
cd oauth-proxy
npx wrangler login
npx wrangler deploy
```

Note the printed URL, e.g. `https://dreamai-cms-oauth.dreamai.workers.dev`.

### 3. Add the secrets

```bash
npx wrangler secret put GITHUB_CLIENT_ID
```

```bash
npx wrangler secret put GITHUB_CLIENT_SECRET
```

### 4. Point the CMS at it

In `public/admin/config.yml`, replace `YOUR-SUBDOMAIN` in `backend.base_url` with the real
Worker subdomain from step 2. Commit and push — GitHub Actions redeploys the site.

### 5. Fix the callback URL

Go back to the OAuth App and set the callback to the real
`https://dreamai-cms-oauth.<your-subdomain>.workers.dev/callback`.

## Verify

Open <https://dream-ai-lab.github.io/admin/>, click **Login with GitHub**, authorize. The
popup should close and drop you into the CMS.

If it fails, `npx wrangler tail` streams live Worker logs. Two common causes:

- **`redirect_uri` mismatch** — the OAuth App callback ≠ the deployed Worker URL.
- **Popup hangs open** — the site's origin isn't in `ALLOWED_ORIGINS` in `wrangler.toml`.
  Fix it and redeploy.

## Who can log in

Anyone with **write access to `dream-ai-lab/dream-ai-lab.github.io`**. The Worker doesn't
maintain its own user list — GitHub authorizes the user, and commits are attributed to
them. Revoking repo access revokes CMS access.

/**
 * Decap CMS GitHub OAuth proxy.
 *
 * GitHub requires a client secret to exchange an OAuth code for a token, which a
 * static site can't hold. This Worker does that exchange and hands the token back
 * to the CMS popup via postMessage, using Decap's handshake protocol.
 *
 * Secrets (wrangler secret put ...): GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
 * Var (wrangler.toml): ALLOWED_ORIGINS — comma-separated origins allowed to receive a token
 */

const STATE_COOKIE = 'decap_oauth_state';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/auth') return startAuth(url, env);
    if (url.pathname === '/callback') return finishAuth(request, url, env);

    return new Response('Decap CMS OAuth proxy. Endpoints: /auth, /callback', {
      headers: { 'content-type': 'text/plain' },
    });
  },
};

function startAuth(url, env) {
  const state = crypto.randomUUID();
  const authorize = new URL('https://github.com/login/oauth/authorize');
  authorize.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  authorize.searchParams.set('redirect_uri', `${url.origin}/callback`);
  authorize.searchParams.set('scope', url.searchParams.get('scope') || 'repo');
  authorize.searchParams.set('state', state);

  return new Response(null, {
    status: 302,
    headers: {
      location: authorize.toString(),
      'set-cookie': `${STATE_COOKIE}=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    },
  });
}

async function finishAuth(request, url, env) {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookieState = readCookie(request.headers.get('cookie'), STATE_COOKIE);

  if (!code) return popup('error', { message: 'No code returned by GitHub' }, env);
  if (!state || state !== cookieState) {
    return popup('error', { message: 'State mismatch — possible CSRF, try again' }, env);
  }

  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/json' },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });
  const data = await res.json();

  if (data.error || !data.access_token) {
    return popup('error', { message: data.error_description || data.error || 'Token exchange failed' }, env);
  }
  return popup('success', { token: data.access_token, provider: 'github' }, env);
}

function readCookie(header, name) {
  if (!header) return null;
  const hit = header.split(';').find((c) => c.trim().startsWith(`${name}=`));
  return hit ? hit.trim().slice(name.length + 1) : null;
}

/**
 * Decap's handshake: the popup announces "authorizing:github" to its opener, the
 * CMS replies, and only then does the popup send the payload back — to an origin
 * we've allowlisted, so an unrelated site can't open this popup and take the token.
 */
function popup(status, content, env) {
  const allowed = (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  const html = `<!doctype html>
<html><body>
<script>
  var allowed = ${JSON.stringify(allowed)};
  var payload = 'authorization:github:${status}:' + ${JSON.stringify(JSON.stringify(content))};
  function receive(e) {
    if (allowed.indexOf(e.origin) === -1) return;
    window.opener.postMessage(payload, e.origin);
    window.removeEventListener('message', receive, false);
  }
  window.addEventListener('message', receive, false);
  window.opener.postMessage('authorizing:github', '*');
</script>
<p>Completing sign-in…</p>
</body></html>`;

  return new Response(html, {
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
  });
}

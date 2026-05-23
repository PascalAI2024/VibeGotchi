const json = (body, init = {}) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...corsHeaders(init.origin),
      ...(init.headers || {}),
    },
  });

const corsHeaders = (origin = '*') => ({
  'access-control-allow-origin': origin,
  'access-control-allow-methods': 'GET, OPTIONS',
  'access-control-allow-headers': 'content-type',
});

const encodeState = (payload) =>
  btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const decodeState = (state) => JSON.parse(atob(state.replace(/-/g, '+').replace(/_/g, '/')));

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const requestOrigin = request.headers.get('origin') || '*';

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(requestOrigin) });
    }

    if (url.pathname === '/api/auth/url') {
      if (!env.GITHUB_CLIENT_ID) {
        return json({ error: 'GITHUB_CLIENT_ID is not configured.' }, { status: 500, origin: requestOrigin });
      }

      const origin = url.searchParams.get('origin') || requestOrigin;
      const redirectUri = `${url.origin}/auth/callback`;
      const params = new URLSearchParams({
        client_id: env.GITHUB_CLIENT_ID,
        redirect_uri: redirectUri,
        scope: 'read:user',
        state: encodeState({ origin }),
      });

      return json({ url: `https://github.com/login/oauth/authorize?${params}` }, { origin: requestOrigin });
    }

    if (url.pathname === '/auth/callback') {
      try {
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');
        const { origin } = state ? decodeState(state) : {};

        if (!code || !env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
          throw new Error('Missing GitHub OAuth configuration.');
        }

        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            accept: 'application/json',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            client_id: env.GITHUB_CLIENT_ID,
            client_secret: env.GITHUB_CLIENT_SECRET,
            code,
            redirect_uri: `${url.origin}/auth/callback`,
          }),
        });

        const data = await tokenResponse.json();
        if (!tokenResponse.ok || !data.access_token) {
          throw new Error(data.error_description || 'GitHub did not return an access token.');
        }

        const targetOrigin = origin || '*';
        return new Response(
          `<!doctype html><html><body><script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', token: ${JSON.stringify(data.access_token)} }, ${JSON.stringify(targetOrigin)});
              window.close();
            } else {
              window.location.href = ${JSON.stringify(targetOrigin)};
            }
          </script><p>Authentication successful. This window should close automatically.</p></body></html>`,
          { headers: { 'content-type': 'text/html; charset=utf-8' } },
        );
      } catch (error) {
        return new Response(`Authentication failed: ${error.message}`, { status: 400 });
      }
    }

    return new Response('Not found', { status: 404, headers: corsHeaders(requestOrigin) });
  },
};

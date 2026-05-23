const decodeState = (state: string) =>
  JSON.parse(atob(state.replace(/-/g, '+').replace(/_/g, '/'))) as { origin?: string };

export const onRequestGet: PagesFunction<{
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
}> = async ({ request, env }) => {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const state = requestUrl.searchParams.get('state');
  const targetOrigin = state ? decodeState(state).origin || requestUrl.origin : requestUrl.origin;

  try {
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
        redirect_uri: `${requestUrl.origin}/auth/callback`,
      }),
    });

    const data = (await tokenResponse.json()) as {
      access_token?: string;
      error_description?: string;
    };

    if (!tokenResponse.ok || !data.access_token) {
      throw new Error(data.error_description || 'GitHub did not return an access token.');
    }

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
    const message = error instanceof Error ? error.message : 'Authentication failed.';
    return new Response(`Authentication failed: ${message}`, { status: 400 });
  }
};

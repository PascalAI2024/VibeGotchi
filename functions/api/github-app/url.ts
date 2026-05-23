export const onRequestGet: PagesFunction<{
  GITHUB_APP_CLIENT_ID: string;
}> = async ({ request, env }) => {
  if (!env.GITHUB_APP_CLIENT_ID) {
    return Response.json({ error: 'GITHUB_APP_CLIENT_ID is not configured.' }, { status: 500 });
  }

  const requestUrl = new URL(request.url);
  const origin = requestUrl.searchParams.get('origin') || requestUrl.origin;
  const redirectUri = `${requestUrl.origin}/github-app/callback`;
  const state = btoa(JSON.stringify({ origin }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const params = new URLSearchParams({
    client_id: env.GITHUB_APP_CLIENT_ID,
    redirect_uri: redirectUri,
    state,
  });

  return Response.json({ url: `https://github.com/login/oauth/authorize?${params}` });
};

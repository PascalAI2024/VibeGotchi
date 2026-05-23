import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import {join} from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

app.get('/api/auth/url', (req, res) => {
  if (!process.env['GITHUB_CLIENT_ID']) {
    res.status(500).json({ error: 'GITHUB_CLIENT_ID is not configured.' });
    return;
  }

  const redirectUri = `${process.env['APP_URL'] || 'http://localhost:3000'}/auth/callback`;
  const origin =
    typeof req.query['origin'] === 'string'
      ? req.query['origin']
      : process.env['APP_URL'] || 'http://localhost:3000';
  const state = Buffer.from(JSON.stringify({ origin })).toString('base64url');
  const params = new URLSearchParams({
    client_id: process.env['GITHUB_CLIENT_ID'] || '',
    redirect_uri: redirectUri,
    scope: 'read:user',
    state,
  });
  
  res.json({ url: `https://github.com/login/oauth/authorize?${params}` });
});

app.get(['/auth/callback', '/auth/callback/'], async (req, res) => {
  const { code, state } = req.query;
  const redirectUri = `${process.env['APP_URL'] || 'http://localhost:3000'}/auth/callback`;
  const targetOrigin = typeof state === 'string'
    ? JSON.parse(Buffer.from(state, 'base64url').toString('utf8')).origin
    : process.env['APP_URL'] || 'http://localhost:3000';

  try {
    if (!code || !process.env['GITHUB_CLIENT_ID'] || !process.env['GITHUB_CLIENT_SECRET']) {
      throw new Error('Missing GitHub OAuth configuration.');
    }

    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env['GITHUB_CLIENT_ID'],
        client_secret: process.env['GITHUB_CLIENT_SECRET'],
        code,
        redirect_uri: redirectUri
      })
    });
    
    if (!tokenResponse.ok) {
       throw new Error('Failed to exchange token');
    }
    
    const data = await tokenResponse.json();
    const token = data.access_token;
    if (!token) {
      throw new Error(data.error_description || 'GitHub did not return an access token.');
    }
    
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage(
                { type: 'OAUTH_AUTH_SUCCESS', token: ${JSON.stringify(token)} },
                ${JSON.stringify(targetOrigin)}
              );
              window.close();
            } else {
              window.location.href = ${JSON.stringify(targetOrigin)};
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.send(`<html><body>Authentication failed.</body></html>`);
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);

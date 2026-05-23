import { spawnSync } from 'node:child_process';

const configuration = process.env.CF_PAGES ? 'cloudflare' : 'pages';
const result = spawnSync('npx', ['ng', 'build', '--configuration', configuration], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

process.exit(result.status ?? 1);

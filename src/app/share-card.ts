import { AchievementBadge, GitHubUser, PetState } from './models';

export type ShareCardPattern = 'none' | 'grid' | 'dots' | 'sunset' | 'circuit';

export interface ShareCardTheme {
  id: string;
  label: string;
  backgroundStops: { offset: number; color: string }[];
  borderColor: string;
  accentColor: string;
  monoColor: string;
  headingColor: string;
  subtleColor: string;
  fontFamily: 'sans' | 'mono' | 'display';
  pattern: ShareCardPattern;
}

export const SHARE_CARD_THEMES: ShareCardTheme[] = [
  {
    id: 'classic',
    label: 'Classic',
    backgroundStops: [
      { offset: 0, color: '#020617' },
      { offset: 0.55, color: '#0f172a' },
      { offset: 1, color: '#064e3b' },
    ],
    borderColor: '#10b981',
    accentColor: '#10b981',
    monoColor: '#a7f3d0',
    headingColor: '#f8fafc',
    subtleColor: '#cbd5e1',
    fontFamily: 'mono',
    pattern: 'none',
  },
  {
    id: 'cyberpunk',
    label: 'Cyberpunk',
    backgroundStops: [
      { offset: 0, color: '#0c0a1f' },
      { offset: 0.5, color: '#1a0b3d' },
      { offset: 1, color: '#2c0e5a' },
    ],
    borderColor: '#22d3ee',
    accentColor: '#f0abfc',
    monoColor: '#67e8f9',
    headingColor: '#fdf4ff',
    subtleColor: '#c4b5fd',
    fontFamily: 'mono',
    pattern: 'grid',
  },
  {
    id: 'terminal',
    label: 'Terminal',
    backgroundStops: [
      { offset: 0, color: '#000000' },
      { offset: 1, color: '#021a02' },
    ],
    borderColor: '#22c55e',
    accentColor: '#4ade80',
    monoColor: '#86efac',
    headingColor: '#bbf7d0',
    subtleColor: '#4ade80',
    fontFamily: 'mono',
    pattern: 'dots',
  },
  {
    id: 'synthwave',
    label: 'Synthwave',
    backgroundStops: [
      { offset: 0, color: '#1a0b2e' },
      { offset: 0.5, color: '#581c87' },
      { offset: 1, color: '#db2777' },
    ],
    borderColor: '#facc15',
    accentColor: '#fb923c',
    monoColor: '#fde68a',
    headingColor: '#fef3c7',
    subtleColor: '#fdba74',
    fontFamily: 'display',
    pattern: 'sunset',
  },
];

export function getShareCardTheme(id?: string): ShareCardTheme {
  return SHARE_CARD_THEMES.find((t) => t.id === id) ?? SHARE_CARD_THEMES[0];
}

export interface ShareCardRenderInput {
  user: GitHubUser;
  state: PetState;
  vitalityOverride?: number;
  xpOverride?: number;
  /** Optional extra achievements line (e.g. the most recent unlock). */
  recentAchievement?: AchievementBadge;
}

const CARD_W = 1200;
const CARD_H = 630;
const MARGIN = 70;
const BADGE_W = 230;
const BADGE_H = 82;
const BADGE_GAP = 30;

/**
 * Renders a VibeGotchi share card to a 1200x630 canvas using the chosen theme.
 * Returns the data URL of the rendered PNG.
 */
export function renderShareCard(input: ShareCardRenderInput, theme: ShareCardTheme): string {
  const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
  if (!canvas) {
    return '';
  }
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return '';
  }

  const vitality = input.vitalityOverride ?? input.state.health;
  const topBadges = input.state.techBadges.slice(0, 4);

  // 1. Background gradient
  const bg = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
  theme.backgroundStops.forEach((stop) => bg.addColorStop(stop.offset, stop.color));
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // 2. Pattern overlay
  drawPattern(ctx, theme);

  // 3. Outer border
  ctx.strokeStyle = theme.borderColor;
  ctx.lineWidth = 4;
  ctx.strokeRect(28, 28, CARD_W - 56, CARD_H - 56);

  // 4. Brand mark
  ctx.fillStyle = theme.monoColor;
  ctx.font = '700 30px ui-monospace, monospace';
  ctx.fillText('VIBE GOTCHI', MARGIN, 90);

  // 5. Stage / level
  ctx.fillStyle = theme.headingColor;
  ctx.font = '800 68px "Space Grotesk", Inter, sans-serif';
  ctx.fillText(`${input.state.stage} · Level ${input.state.level}`, MARGIN, 175);

  // 6. Login / status line
  ctx.fillStyle = theme.subtleColor;
  ctx.font = '28px ui-monospace, monospace';
  ctx.fillText(`@${input.user.login}`, MARGIN, 225);
  ctx.fillText(
    `${input.state.careState} · ${vitality}% vitality · ${input.state.commitStreak} day streak`,
    MARGIN,
    270
  );

  // 7. Personality line
  ctx.fillStyle = theme.headingColor;
  ctx.font = '24px ui-monospace, monospace';
  wrapText(ctx, input.state.personalityLine, MARGIN, 335, 820, 34);

  // 8. Tech badges header
  ctx.fillStyle = theme.accentColor;
  ctx.font = '700 26px ui-monospace, monospace';
  ctx.fillText('Top Tech Badges', MARGIN, 455);

  // 9. Badge grid
  topBadges.forEach((badge, index) => {
    const x = MARGIN + index * (BADGE_W + BADGE_GAP);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x, 485, BADGE_W, BADGE_H);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, 485, BADGE_W, BADGE_H);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 24px "Space Grotesk", Inter, sans-serif';
    ctx.fillText(badge.tech.slice(0, 13), x + 18, 522);
    ctx.fillStyle = theme.monoColor;
    ctx.font = '18px ui-monospace, monospace';
    ctx.fillText(`Lv ${badge.level} ${badge.tier}`, x + 18, 552);
  });

  // 10. Footer URL
  ctx.fillStyle = theme.subtleColor;
  ctx.font = '18px ui-monospace, monospace';
  ctx.fillText('vibegotchi.pages.dev', CARD_W - 220, CARD_H - 45);

  return canvas.toDataURL('image/png');
}

function drawPattern(ctx: CanvasRenderingContext2D, theme: ShareCardTheme) {
  ctx.save();
  switch (theme.pattern) {
    case 'grid': {
      ctx.strokeStyle = hexToRgba(theme.accentColor, 0.18);
      ctx.lineWidth = 1;
      const step = 40;
      for (let x = 0; x < CARD_W; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CARD_H);
        ctx.stroke();
      }
      for (let y = 0; y < CARD_H; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CARD_W, y);
        ctx.stroke();
      }
      break;
    }
    case 'dots': {
      ctx.fillStyle = hexToRgba(theme.accentColor, 0.25);
      const step = 28;
      for (let x = 0; x < CARD_W; x += step) {
        for (let y = 0; y < CARD_H; y += step) {
          ctx.beginPath();
          ctx.arc(x, y, 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }
    case 'sunset': {
      // Perspective sun + grid horizon
      const sunY = 320;
      const sunR = 130;
      const grad = ctx.createRadialGradient(CARD_W / 2, sunY, 10, CARD_W / 2, sunY, sunR);
      grad.addColorStop(0, hexToRgba(theme.accentColor, 0.9));
      grad.addColorStop(0.7, hexToRgba(theme.accentColor, 0.4));
      grad.addColorStop(1, hexToRgba(theme.accentColor, 0));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(CARD_W / 2, sunY, sunR, 0, Math.PI * 2);
      ctx.fill();
      // horizontal grid lines
      ctx.strokeStyle = hexToRgba(theme.borderColor, 0.35);
      ctx.lineWidth = 1;
      for (let y = 460; y < CARD_H; y += 16) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CARD_W, y);
        ctx.stroke();
      }
      // perspective lines
      ctx.strokeStyle = hexToRgba(theme.accentColor, 0.25);
      for (let i = -10; i <= 10; i++) {
        const x = CARD_W / 2 + i * 80;
        ctx.beginPath();
        ctx.moveTo(x, 460);
        ctx.lineTo(CARD_W / 2 + i * 600, CARD_H);
        ctx.stroke();
      }
      break;
    }
    case 'circuit': {
      ctx.strokeStyle = hexToRgba(theme.accentColor, 0.15);
      ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) {
        const y = 80 + i * 80;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(220, y);
        ctx.lineTo(280, y - 30);
        ctx.lineTo(CARD_W, y - 30);
        ctx.stroke();
      }
      break;
    }
    case 'none':
    default:
      break;
  }
  ctx.restore();
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(' ');
  let line = '';
  for (const word of words) {
    const testLine = `${line}${word} `;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = `${word} `;
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

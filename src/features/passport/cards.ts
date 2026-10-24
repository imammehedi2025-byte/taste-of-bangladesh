/**
 * Shareable PNG cards drawn locally with Canvas 2D. Nothing is uploaded anywhere.
 * Size 1080×1350 (4:5) suits Facebook, Instagram and WhatsApp status.
 */
import type { Food, District } from '../../types';
import { DISTRICT_PATHS, MAP_H, MAP_W } from '../../data/mapPaths';
import { CATEGORY_BY_ID, SITE_URL } from '../../utils/meta';
import { toBnDigits } from '../../utils/text';

const W = 1080;
const H = 1350;
const C = {
  paddy: '#0F4A37',
  paddyDeep: '#0A3627',
  paper: '#F5EEDC',
  paperHi: '#FBF7EC',
  chili: '#C4352B',
  turmeric: '#E0A21C',
  ink: '#22201C',
  inkSoft: '#5B564C',
};
const SANS = '"Bricolage Grotesque Variable", "Hind Siliguri", sans-serif';
const BN = '"Noto Serif Bengali", "Hind Siliguri", serif';

async function ready() {
  if (!('fonts' in document)) return;
  await Promise.all([
    document.fonts.load(`700 40px ${BN}`, 'বাংলা'),
    document.fonts.load(`600 40px ${BN}`, 'বাংলা'),
    document.fonts.load(`700 40px ${SANS}`, 'Taste'),
    document.fonts.load(`400 40px ${SANS}`, 'Taste'),
    document.fonts.load(`600 20px "Hind Siliguri"`, 'বাংলা'),
  ]).catch(() => undefined);
}

function canvas() {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported on this browser');
  return { c, ctx };
}

function toBlob(c: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => c.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG export failed'))), 'image/png'));
}

/** Wraps text to a max width; returns lines. Shrinks nothing — callers pick sizes that fit. */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number, maxLines = 3): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const cut = lines.slice(0, maxLines);
    let last = cut[maxLines - 1];
    while (ctx.measureText(last + '…').width > maxW && last.length > 1) last = last.slice(0, -1);
    cut[maxLines - 1] = last + '…';
    return cut;
  }
  return lines;
}

/** Fits a single line by shrinking the font until it fits. */
function fitFont(ctx: CanvasRenderingContext2D, text: string, family: string, weight: number, start: number, min: number, maxW: number) {
  let size = start;
  ctx.font = `${weight} ${size}px ${family}`;
  while (ctx.measureText(text).width > maxW && size > min) {
    size -= 2;
    ctx.font = `${weight} ${size}px ${family}`;
  }
  return size;
}

function stitchRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.setLineDash([16, 12]);
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.stroke();
  ctx.restore();
}

function footer(ctx: CanvasRenderingContext2D, dark: boolean) {
  ctx.save();
  ctx.fillStyle = dark ? 'rgba(251,247,236,0.75)' : C.inkSoft;
  ctx.font = `500 26px ${SANS}`;
  ctx.textAlign = 'left';
  ctx.fillText(SITE_URL.replace(/^https?:\/\//, ''), 72, H - 64);
  ctx.textAlign = 'right';
  ctx.font = `400 22px ${SANS}`;
  ctx.fillText('Developed by Imam Mehedi Hasan', W - 72, H - 64);
  ctx.restore();
}

function brand(ctx: CanvasRenderingContext2D, dark: boolean, y = 120) {
  ctx.save();
  ctx.fillStyle = dark ? C.paperHi : C.paddy;
  ctx.font = `700 34px ${SANS}`;
  ctx.textAlign = 'left';
  ctx.fillText('Taste of Bangladesh', 72, y);
  ctx.fillStyle = dark ? C.turmeric : C.chili;
  ctx.font = `600 30px ${BN}`;
  ctx.textAlign = 'right';
  ctx.fillText('বাংলার স্বাদ', W - 72, y);
  ctx.restore();
}

/* ───────────────────────── Taste map card ───────────────────────── */

export interface PassportInput {
  nickname: string;
  explored: Set<string>;
  triedCount: number;
  titleEn: string;
  titleBn: string;
  highlights: Food[];
}

function drawMap(ctx: CanvasRenderingContext2D, explored: Set<string>, x: number, y: number, w: number) {
  const s = w / MAP_W;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.lineJoin = 'round';
  for (const [id, p] of Object.entries(DISTRICT_PATHS)) {
    const path = new Path2D(p.d);
    const on = explored.has(id);
    ctx.fillStyle = on ? C.chili : 'rgba(251,247,236,0.10)';
    ctx.fill(path);
    ctx.strokeStyle = on ? 'rgba(251,247,236,0.9)' : 'rgba(251,247,236,0.32)';
    ctx.lineWidth = 1.1 / s;
    ctx.stroke(path);
  }
  ctx.restore();
  return MAP_H * s;
}

export async function drawPassport(p: PassportInput): Promise<Blob> {
  await ready();
  const { c, ctx } = canvas();
  const n = p.explored.size;
  ctx.fillStyle = C.paddy;
  ctx.fillRect(0, 0, W, H);

  brand(ctx, true, 110);

  // Map on the right, as big as the card allows
  const mapW = 560;
  const mapX = W - 48 - mapW;
  const mapY = 170;
  const mapH = drawMap(ctx, p.explored, mapX, mapY, mapW);

  // Left column: the score in plain words
  const L = 72;
  const colW = mapX - L + 40;
  ctx.textAlign = 'left';
  ctx.fillStyle = C.turmeric;
  const who = p.nickname || 'আমার স্বাদের ম্যাপ';
  fitFont(ctx, who, /[\u0980-\u09FF]/.test(who) ? BN : SANS, 700, 54, 30, colW);
  ctx.fillText(who, L, 250);

  ctx.fillStyle = 'rgba(251,247,236,0.85)';
  ctx.font = `600 42px ${BN}`;
  ctx.fillText('আমি বাংলাদেশের', L, 350);

  ctx.fillStyle = C.paperHi;
  ctx.font = `700 230px ${BN}`;
  const big = toBnDigits(n);
  ctx.fillText(big, L - 6, 560);
  const bigW = ctx.measureText(big).width;
  ctx.fillStyle = 'rgba(251,247,236,0.65)';
  ctx.font = `700 64px ${BN}`;
  ctx.fillText(`/${toBnDigits(64)}`, L + bigW + 4, 560);

  ctx.fillStyle = 'rgba(251,247,236,0.9)';
  ctx.font = `600 46px ${BN}`;
  ctx.fillText('জেলার স্বাদ নিয়েছি', L, 640);

  // title pill
  ctx.font = `700 32px ${BN}`;
  const tw = ctx.measureText(p.titleBn).width;
  ctx.fillStyle = C.turmeric;
  ctx.beginPath();
  ctx.roundRect(L, 690, tw + 48, 64, 32);
  ctx.fill();
  ctx.fillStyle = C.ink;
  ctx.fillText(p.titleBn, L + 24, 734);

  // progress bar
  const pct = Math.round((n / 64) * 100);
  const bw = Math.min(colW - 30, 380);
  ctx.fillStyle = 'rgba(251,247,236,0.18)';
  ctx.beginPath();
  ctx.roundRect(L, 800, bw, 16, 8);
  ctx.fill();
  ctx.fillStyle = C.chili;
  ctx.beginPath();
  ctx.roundRect(L, 800, Math.max(16, (bw * n) / 64), 16, 8);
  ctx.fill();
  ctx.fillStyle = 'rgba(251,247,236,0.85)';
  ctx.font = `600 30px ${BN}`;
  ctx.fillText(`বাংলাদেশের ${toBnDigits(pct)}% · ${toBnDigits(p.triedCount)}টি খাবার`, L, 868);

  // legend under the left column
  ctx.fillStyle = C.chili;
  ctx.beginPath();
  ctx.roundRect(L, 920, 28, 28, 6);
  ctx.fill();
  ctx.fillStyle = 'rgba(251,247,236,0.85)';
  ctx.font = `500 28px ${BN}`;
  ctx.fillText('= যে জেলার খাবার খেয়েছি', L + 42, 944);

  // tasted foods line below the map
  const listY = Math.max(mapY + mapH + 40, 1010);
  if (p.highlights.length) {
    ctx.fillStyle = 'rgba(251,247,236,0.9)';
    ctx.font = `600 32px ${BN}`;
    const line = 'খেয়েছি: ' + p.highlights.slice(0, 3).map((f) => f.nameBn).join(' · ');
    wrap(ctx, line, W - 2 * L, 1).forEach((l) => ctx.fillText(l, L, listY));
  }

  // call to action band
  const by = 1120;
  ctx.fillStyle = C.paperHi;
  ctx.beginPath();
  ctx.roundRect(48, by, W - 96, 130, 28);
  ctx.fill();
  ctx.fillStyle = C.paddy;
  ctx.font = `700 40px ${BN}`;
  ctx.fillText('আপনি কয়টা জেলার স্বাদ নিয়েছেন?', 88, by + 56);
  ctx.fillStyle = C.chili;
  ctx.font = `600 30px ${SANS}`;
  ctx.fillText(SITE_URL.replace(/^https?:\/\//, ''), 88, by + 102);

  ctx.fillStyle = 'rgba(251,247,236,0.7)';
  ctx.font = `400 22px ${SANS}`;
  ctx.textAlign = 'right';
  ctx.fillText('Developed by Imam Mehedi Hasan', W - 56, H - 36);
  ctx.textAlign = 'left';
  ctx.fillText('Map: BBS / OCHA (CC BY 3.0 IGO)', 56, H - 36);
  return toBlob(c);
}

/* ───────────────────────── Food cards ───────────────────────── */

function foodHeader(ctx: CanvasRenderingContext2D, food: Food, district: District | undefined) {
  const cat = CATEGORY_BY_ID[food.category];
  ctx.fillStyle = C.paper;
  ctx.fillRect(0, 0, W, H);
  // plate
  ctx.fillStyle = cat.bg;
  ctx.beginPath();
  ctx.roundRect(56, 170, W - 112, 640, 48);
  ctx.fill();
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(56, 170, W - 112, 640, 48);
  ctx.clip();
  ctx.strokeStyle = cat.fg;
  ctx.globalAlpha = 0.28;
  ctx.lineWidth = 4;
  ctx.setLineDash([18, 14]);
  ctx.beginPath();
  ctx.arc(W - 180, 720, 260, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(W - 180, 720, 190, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = cat.fg;
  const bnSize = fitFont(ctx, food.nameBn, BN, 700, 104, 56, W - 220);
  const bnLines = wrap(ctx, food.nameBn, W - 220, 2);
  bnLines.forEach((l, i) => ctx.fillText(l, 104, 690 - (bnLines.length - 1 - i) * bnSize * 1.3));
  ctx.font = `600 34px ${SANS}`;
  ctx.fillText(cat.label, 104, 250);

  ctx.fillStyle = C.ink;
  fitFont(ctx, food.nameEn, SANS, 700, 64, 40, W - 144);
  ctx.fillText(food.nameEn, 72, 900);
  ctx.fillStyle = C.inkSoft;
  ctx.font = `500 34px ${SANS}`;
  const where = district ? `${district.nameEn} · ${district.nameBn}` : '';
  ctx.fillText(where, 72, 955);
}

export async function drawRatingCard(food: Food, district: District | undefined, myRating: number, community?: { avg: number; count: number }): Promise<Blob> {
  await ready();
  const { c, ctx } = canvas();
  foodHeader(ctx, food, district);
  brand(ctx, false);

  // stars
  const y = 1060;
  for (let i = 0; i < 5; i++) {
    const cx = 100 + i * 92;
    drawStar(ctx, cx, y, 38, i < myRating ? C.turmeric : 'rgba(34,32,28,0.15)');
  }
  ctx.fillStyle = C.ink;
  ctx.font = `700 40px ${SANS}`;
  ctx.fillText(`My rating ${myRating}/5`, 572, y + 14);
  if (community && community.count > 0) {
    ctx.fillStyle = C.inkSoft;
    ctx.font = `500 28px ${SANS}`;
    ctx.fillText(`Community average ${community.avg} from ${community.count} rating${community.count === 1 ? '' : 's'}`, 72, y + 100);
  }
  footer(ctx, false);
  return toBlob(c);
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.45;
    ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export async function drawMustTryCard(food: Food, district: District | undefined): Promise<Blob> {
  await ready();
  const { c, ctx } = canvas();
  foodHeader(ctx, food, district);
  brand(ctx, false);
  // circular stamp
  ctx.save();
  ctx.translate(W - 210, 1090);
  ctx.rotate(-0.16);
  ctx.strokeStyle = C.chili;
  ctx.fillStyle = C.chili;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(0, 0, 120, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 104, 0, Math.PI * 2);
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.font = `700 46px ${BN}`;
  ctx.fillText('অবশ্যই', 0, -6);
  ctx.font = `700 34px ${SANS}`;
  ctx.fillText('Must try', 0, 42);
  ctx.restore();

  ctx.fillStyle = C.ink;
  ctx.font = `600 38px ${SANS}`;
  wrap(ctx, `I recommend this when you’re in ${district?.nameEn ?? 'Bangladesh'}.`, 620, 2).forEach((l, i) => ctx.fillText(l, 72, 1060 + i * 52));
  ctx.fillStyle = C.inkSoft;
  ctx.font = `400 26px ${SANS}`;
  ctx.fillText('A personal recommendation, not an official award.', 72, 1180);
  footer(ctx, false);
  return toBlob(c);
}

export async function drawContributionCard(input: { nameEn: string; nameBn: string; district?: District; statusLabel: string }): Promise<Blob> {
  await ready();
  const { c, ctx } = canvas();
  ctx.fillStyle = C.paper;
  ctx.fillRect(0, 0, W, H);
  stitchRect(ctx, 36, 36, W - 72, H - 72, 36, 'rgba(15,74,55,0.55)');
  brand(ctx, false);
  ctx.fillStyle = C.chili;
  ctx.font = `700 40px ${BN}`;
  ctx.fillText('আমার জেলার স্বাদ', 72, 290);
  ctx.fillStyle = C.ink;
  ctx.font = `600 36px ${SANS}`;
  ctx.fillText('I added a local food to the map', 72, 345);

  ctx.fillStyle = C.paddy;
  const s = fitFont(ctx, input.nameBn || input.nameEn, BN, 700, 120, 60, W - 144);
  wrap(ctx, input.nameBn || input.nameEn, W - 144, 2).forEach((l, i) => ctx.fillText(l, 72, 620 + i * s * 1.25));
  ctx.fillStyle = C.ink;
  fitFont(ctx, input.nameEn, SANS, 700, 60, 36, W - 144);
  ctx.fillText(input.nameEn, 72, 840);
  ctx.fillStyle = C.inkSoft;
  ctx.font = `500 34px ${SANS}`;
  if (input.district) ctx.fillText(`${input.district.nameEn} · ${input.district.nameBn}`, 72, 900);

  ctx.fillStyle = C.turmeric;
  ctx.beginPath();
  ctx.roundRect(72, 980, 520, 76, 38);
  ctx.fill();
  ctx.fillStyle = C.ink;
  ctx.font = `700 32px ${SANS}`;
  ctx.fillText(input.statusLabel, 104, 1030);
  footer(ctx, false);
  return toBlob(c);
}

export const bnCount = (n: number) => toBnDigits(n);

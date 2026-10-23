/**
 * Shareable PNG cards drawn locally with Canvas 2D. Nothing is uploaded anywhere.
 * Size 1080×1350 (4:5) suits Facebook, Instagram and WhatsApp status.
 */
import type { Food, District } from '../../types';
import { DISTRICTS } from '../../data/districts';
import { DIVISIONS } from '../../data/divisions';
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

/** First user-perceived character, so Bangla conjuncts are never split. */
export function firstGrapheme(s: string): string {
  const Seg = (Intl as unknown as { Segmenter?: new (l: string, o: object) => { segment: (s: string) => Iterable<{ segment: string }> } }).Segmenter;
  if (Seg) for (const g of new Seg('bn', { granularity: 'grapheme' }).segment(s)) return g.segment;
  return s.slice(0, 1);
}

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

function stamp(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string, label: string, filled: boolean) {
  ctx.save();
  ctx.translate(cx, cy);
  if (filled) ctx.rotate(-0.14);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  if (filled) {
    ctx.globalAlpha = 0.95;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, r - 7, 0, Math.PI * 2);
    ctx.globalAlpha = 0.9;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = C.paperHi;
    ctx.font = `700 ${Math.round(r * 0.55)}px ${BN}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 0, 2);
  } else {
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, r - 4, 0, Math.PI * 2);
    ctx.stroke();
  }
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

/* ───────────────────────── Food Passport ───────────────────────── */

export interface PassportInput {
  nickname: string;
  explored: Set<string>;
  triedCount: number;
  titleEn: string;
  titleBn: string;
  highlights: Food[];
}

export async function drawPassport(p: PassportInput): Promise<Blob> {
  await ready();
  const { c, ctx } = canvas();
  ctx.fillStyle = C.paddy;
  ctx.fillRect(0, 0, W, H);
  stitchRect(ctx, 36, 36, W - 72, H - 72, 36, 'rgba(224,162,28,0.7)');
  brand(ctx, true);

  ctx.fillStyle = C.paperHi;
  ctx.font = `600 34px ${SANS}`;
  ctx.fillText('Food Passport', 72, 200);
  const name = p.nickname || 'A curious taster';
  fitFont(ctx, name, SANS, 700, 76, 44, W - 144);
  ctx.fillText(name, 72, 285);
  ctx.fillStyle = C.turmeric;
  ctx.font = `700 40px ${BN}`;
  ctx.fillText(p.titleBn, 72, 350);
  ctx.fillStyle = 'rgba(251,247,236,0.8)';
  ctx.font = `500 30px ${SANS}`;
  ctx.fillText(p.titleEn, 72, 395);

  // Stamp grid: 8 rows (divisions) of up to 13 districts → laid out as 8×8 in division order.
  const ordered = DIVISIONS.flatMap((d) => DISTRICTS.filter((x) => x.divisionId === d.id));
  const cols = 11;
  const gx = 72;
  const gy = 430;
  const cell = (W - 144) / cols;
  const r = cell * 0.42;
  ordered.forEach((d, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = gx + cell * col + cell / 2;
    const cy = gy + cell * row + cell / 2;
    const on = p.explored.has(d.id);
    stamp(ctx, cx, cy, r, on ? C.chili : C.paperHi, firstGrapheme(d.nameBn), on);
  });

  const gridBottom = gy + cell * Math.ceil(ordered.length / cols);
  ctx.fillStyle = C.paperHi;
  ctx.font = `700 64px ${SANS}`;
  ctx.textAlign = 'left';
  ctx.fillText(`${p.explored.size}/64`, 72, gridBottom + 80);
  const wNum = ctx.measureText(`${p.explored.size}/64`).width;
  ctx.font = `500 28px ${SANS}`;
  ctx.fillStyle = 'rgba(251,247,236,0.8)';
  ctx.fillText(`districts tasted · ${p.triedCount} food${p.triedCount === 1 ? '' : 's'}`, 72 + wNum + 18, gridBottom + 74);

  // progress bar
  const bx = 72;
  const by = gridBottom + 106;
  const bw = W - 144;
  ctx.fillStyle = 'rgba(251,247,236,0.18)';
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, 14, 7);
  ctx.fill();
  ctx.fillStyle = C.turmeric;
  ctx.beginPath();
  ctx.roundRect(bx, by, Math.max(14, (bw * p.explored.size) / 64), 14, 7);
  ctx.fill();

  if (p.highlights.length) {
    ctx.fillStyle = C.paperHi;
    ctx.font = `600 30px ${BN}`;
    const line = p.highlights.slice(0, 3).map((f) => f.nameBn).join('  ·  ');
    wrap(ctx, line, W - 144, 1).forEach((l) => ctx.fillText(l, 72, by + 70));
  }
  footer(ctx, true);
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

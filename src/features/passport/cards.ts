/**
 * Shareable PNG cards drawn locally with Canvas 2D. Nothing is uploaded anywhere.
 * Size 1080×1350 (4:5) suits Facebook, Instagram and WhatsApp status.
 */
import type { Food, District } from '../../types';
import { DISTRICT_PATHS, MAP_H, MAP_W } from '../../data/mapPaths';
import { DISTRICTS } from '../../data/districts';
import { DIVISIONS } from '../../data/divisions';
import { foodEmoji } from '../../utils/emoji';
import { layoutPins } from '../../utils/mapLayout';
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
  titleBn: string;
  /** every researched food marked as tried */
  tried: Food[];
}

const EMOJI = '"Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
const LABEL = '"Hind Siliguri", sans-serif';
const NAMES_BN = Object.fromEntries(DISTRICTS.map((d) => [d.id, d.nameBn]));

/** "নাটোরের কাঁচাগোল্লা" → "কাঁচাগোল্লা" when the row already says নাটোর. */
function shortName(f: Food) {
  const d = NAMES_BN[f.districtId];
  for (const suf of ['ের ', 'র ', 'এর ']) if (d && f.nameBn.startsWith(d + suf)) return f.nameBn.slice(d.length + suf.length);
  return f.nameBn;
}

function drawMap(ctx: CanvasRenderingContext2D, explored: Set<string>, pins: Record<string, { emoji: string; count: number }>, x: number, y: number, w: number) {
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
  // pins + names (same layout rules as the website map)
  const R = 16;
  const F = 19;
  ctx.font = `600 ${F}px ${LABEL}`;
  const layout = layoutPins(Object.keys(pins), (t) => ctx.measureText(t).width * 1.08, NAMES_BN, R, F);
  for (const l of layout) {
    ctx.beginPath();
    ctx.arc(l.x, l.y, R, 0, Math.PI * 2);
    ctx.fillStyle = C.paperHi;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = C.chili;
    ctx.stroke();
    ctx.font = `19px ${EMOJI}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = C.ink;
    ctx.fillText(pins[l.id].emoji, l.x, l.y + 1);
    if (pins[l.id].count > 1) {
      ctx.beginPath();
      ctx.arc(l.x + R * 0.8, l.y - R * 0.8, 8, 0, Math.PI * 2);
      ctx.fillStyle = C.turmeric;
      ctx.fill();
      ctx.fillStyle = C.ink;
      ctx.font = `700 11px ${SANS}`;
      ctx.fillText(String(pins[l.id].count), l.x + R * 0.8, l.y - R * 0.8 + 0.5);
    }
    if (l.label) {
      ctx.font = `600 ${F}px ${LABEL}`;
      ctx.textAlign = l.label.anchor === 'start' ? 'left' : l.label.anchor === 'end' ? 'right' : 'center';
      ctx.lineWidth = 4;
      ctx.strokeStyle = C.paddyDeep;
      ctx.strokeText(NAMES_BN[l.id], l.label.x, l.label.y);
      ctx.fillStyle = C.paperHi;
      ctx.fillText(NAMES_BN[l.id], l.label.x, l.label.y);
    }
  }
  ctx.restore();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  return MAP_H * s;
}

interface Row {
  emoji: string;
  district: string;
  foods: string;
}

/** Lays the tasted-food list out in up to two balanced columns; returns lines with positions. */
function planList(ctx: CanvasRenderingContext2D, tried: Food[], width: number) {
  const byDistrict = new Map<string, Food[]>();
  for (const f of tried) {
    if (!byDistrict.has(f.districtId)) byDistrict.set(f.districtId, []);
    byDistrict.get(f.districtId)!.push(f);
  }
  const blocks: { title: string; rows: Row[] }[] = [];
  for (const div of DIVISIONS) {
    const rows: Row[] = [];
    for (const d of DISTRICTS.filter((x) => x.divisionId === div.id)) {
      const fs = byDistrict.get(d.id);
      if (!fs) continue;
      rows.push({ emoji: foodEmoji(fs[0]), district: d.nameBn, foods: fs.map(shortName).join(', ') });
    }
    if (rows.length) blocks.push({ title: `${div.nameBn} বিভাগ`, rows });
  }
  const totalRows = blocks.reduce((n, b) => n + b.rows.length, 0);
  const cols = totalRows > 6 ? 2 : 1;
  const gutter = 40;
  const colW = cols === 2 ? (width - gutter) / 2 : width;
  const ROW = 30;
  const LH = 42;
  const HEAD = 52;

  type Item = { kind: 'head'; text: string } | { kind: 'row'; emoji: string; district: string; lines: string[] };
  const measured = blocks.map((b) => {
    const items: Item[] = [{ kind: 'head', text: b.title }];
    let h = HEAD;
    for (const r of b.rows) {
      ctx.font = `700 ${ROW}px ${BN}`;
      const prefix = `${r.district}: `;
      const pw = ctx.measureText(prefix).width;
      ctx.font = `500 ${ROW}px ${LABEL}`;
      // first line shares space with the district name; the rest use the full column
      const words = r.foods.split(' ');
      const lines: string[] = [];
      let line = '';
      let avail = colW - 50 - pw;
      for (const w of words) {
        const t = line ? `${line} ${w}` : w;
        if (ctx.measureText(t).width > avail && line) {
          lines.push(line);
          line = w;
          avail = colW - 50;
        } else line = t;
      }
      if (line) lines.push(line);
      items.push({ kind: 'row', emoji: r.emoji, district: prefix, lines });
      h += lines.length * LH + 8;
    }
    return { items, h: h + 16 };
  });
  // greedy balance: each division block goes to the shorter column
  const colsH = [0, 0];
  const placed: { col: number; y: number; items: Item[] }[] = [];
  for (const m of measured) {
    const c = cols === 1 ? 0 : colsH[0] <= colsH[1] ? 0 : 1;
    placed.push({ col: c, y: colsH[c], items: m.items });
    colsH[c] += m.h;
  }
  return { placed, height: Math.max(...colsH), colW, gutter, ROW, LH, HEAD };
}

export async function drawPassport(p: PassportInput): Promise<Blob> {
  await ready();
  await document.fonts?.load(`30px ${EMOJI}`, '🥭').catch(() => undefined);
  const n = p.explored.size;
  const pins: Record<string, { emoji: string; count: number }> = {};
  for (const f of p.tried) {
    if (pins[f.districtId]) pins[f.districtId].count++;
    else pins[f.districtId] = { emoji: foodEmoji(f), count: 1 };
  }

  // measure pass for the list, so the card is exactly as tall as it needs to be
  const L = 72;
  const innerW = W - 2 * L;
  const scratch = document.createElement('canvas').getContext('2d')!;
  const list = planList(scratch, p.tried, innerW);

  const mapW = 800;
  const mapH = (MAP_H * mapW) / MAP_W;
  const mapY = 660;
  const listTop = mapY + mapH + 110;
  const listBodyTop = listTop + 70;
  const listH = p.tried.length ? list.height : 60;
  const ctaY = listBodyTop + listH + 30;
  const height = Math.max(1350, ctaY + 130 + 90);

  const c = document.createElement('canvas');
  c.width = W;
  c.height = height;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported on this browser');
  ctx.fillStyle = C.paddy;
  ctx.fillRect(0, 0, W, height);

  brand(ctx, true, 100);

  // ── score ──
  const who = p.nickname || 'আমার স্বাদের ম্যাপ';
  ctx.fillStyle = C.turmeric;
  fitFont(ctx, who, /[ঀ-৿]/.test(who) ? BN : SANS, 700, 54, 30, innerW);
  ctx.fillText(who, L, 205);

  ctx.fillStyle = 'rgba(251,247,236,0.85)';
  ctx.font = `600 40px ${BN}`;
  ctx.fillText('আমি বাংলাদেশের', L, 280);

  ctx.fillStyle = C.paperHi;
  ctx.font = `700 200px ${BN}`;
  const big = toBnDigits(n);
  ctx.fillText(big, L - 6, 475);
  const bx = L + ctx.measureText(big).width + 24;
  ctx.fillStyle = 'rgba(251,247,236,0.7)';
  ctx.font = `700 64px ${BN}`;
  ctx.fillText(`/ ${toBnDigits(64)} জেলার`, bx, 395);
  ctx.fillStyle = C.paperHi;
  ctx.font = `600 52px ${BN}`;
  ctx.fillText('স্বাদ নিয়েছি', bx, 465);

  ctx.font = `700 30px ${BN}`;
  const tw = ctx.measureText(p.titleBn).width;
  ctx.fillStyle = C.turmeric;
  ctx.beginPath();
  ctx.roundRect(L, 515, tw + 44, 58, 29);
  ctx.fill();
  ctx.fillStyle = C.ink;
  ctx.fillText(p.titleBn, L + 22, 555);
  const pct = Math.round((n / 64) * 100);
  ctx.fillStyle = 'rgba(251,247,236,0.85)';
  ctx.font = `600 30px ${BN}`;
  ctx.fillText(`বাংলাদেশের ${toBnDigits(pct)}% · ${toBnDigits(p.tried.length)}টি খাবার`, L + tw + 70, 555);

  ctx.fillStyle = 'rgba(251,247,236,0.18)';
  ctx.beginPath();
  ctx.roundRect(L, 605, innerW, 14, 7);
  ctx.fill();
  ctx.fillStyle = C.chili;
  ctx.beginPath();
  ctx.roundRect(L, 605, Math.max(14, (innerW * n) / 64), 14, 7);
  ctx.fill();

  // ── map ──
  drawMap(ctx, p.explored, pins, (W - mapW) / 2, mapY, mapW);
  ctx.fillStyle = C.chili;
  ctx.beginPath();
  ctx.roundRect(L, mapY + mapH + 28, 26, 26, 6);
  ctx.fill();
  ctx.fillStyle = 'rgba(251,247,236,0.85)';
  ctx.font = `500 28px ${BN}`;
  ctx.fillText('= যে জেলার খাবার খেয়েছি', L + 40, mapY + mapH + 51);

  // ── full list ──
  ctx.fillStyle = C.paperHi;
  ctx.font = `700 40px ${BN}`;
  ctx.fillText('যা যা খেয়েছি', L, listTop + 30);
  ctx.strokeStyle = 'rgba(224,162,28,0.6)';
  ctx.setLineDash([14, 10]);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(L, listTop + 54);
  ctx.lineTo(W - L, listTop + 54);
  ctx.stroke();
  ctx.setLineDash([]);

  if (!p.tried.length) {
    ctx.fillStyle = 'rgba(251,247,236,0.75)';
    ctx.font = `500 30px ${BN}`;
    ctx.fillText('এখনো কোনো খাবার যোগ করা হয়নি।', L, listBodyTop + 30);
  }
  for (const blk of list.placed) {
    const x0 = L + blk.col * (list.colW + list.gutter);
    let y = listBodyTop + blk.y;
    for (const it of blk.items) {
      if (it.kind === 'head') {
        ctx.fillStyle = C.turmeric;
        ctx.font = `700 28px ${BN}`;
        ctx.fillText(it.text, x0, y + 30);
        y += list.HEAD;
        continue;
      }
      ctx.font = `${list.ROW}px ${EMOJI}`;
      ctx.fillText(it.emoji, x0, y + 30);
      ctx.fillStyle = C.paperHi;
      ctx.font = `700 ${list.ROW}px ${BN}`;
      ctx.fillText(it.district, x0 + 50, y + 30);
      const pw = ctx.measureText(it.district).width;
      ctx.font = `500 ${list.ROW}px ${LABEL}`;
      ctx.fillStyle = 'rgba(251,247,236,0.88)';
      it.lines.forEach((ln, i) => ctx.fillText(ln, x0 + 50 + (i === 0 ? pw : 0), y + 30 + i * list.LH));
      y += it.lines.length * list.LH + 8;
    }
  }

  // ── call to action ──
  ctx.fillStyle = C.paperHi;
  ctx.beginPath();
  ctx.roundRect(48, ctaY, W - 96, 130, 28);
  ctx.fill();
  ctx.fillStyle = C.paddy;
  ctx.font = `700 40px ${BN}`;
  ctx.fillText('আপনি কয়টা জেলার স্বাদ নিয়েছেন?', 88, ctaY + 56);
  ctx.fillStyle = C.chili;
  ctx.font = `600 30px ${SANS}`;
  ctx.fillText(SITE_URL.replace(/^https?:\/\//, ''), 88, ctaY + 102);

  ctx.fillStyle = 'rgba(251,247,236,0.7)';
  ctx.font = `400 22px ${SANS}`;
  ctx.textAlign = 'right';
  ctx.fillText('Developed by Imam Mehedi Hasan', W - 56, height - 40);
  ctx.textAlign = 'left';
  ctx.fillText('Map: BBS / OCHA (CC BY 3.0 IGO)', 56, height - 40);
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

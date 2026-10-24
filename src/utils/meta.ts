import { Beef, Candy, Citrus, Coffee, Cookie, Fish, Milk, Mountain, Soup, Sparkles, Wheat, type LucideIcon } from 'lucide-react';
import { foodEmoji } from './emoji';
import type { FoodCategory, Food, ProgressState } from '../types';
import { FOODS } from '../data/foods';
import { DISTRICTS } from '../data/districts';

export interface CategoryMeta {
  id: FoodCategory;
  label: string;
  labelBn: string;
  icon: LucideIcon;
  /** plate background + ink, chosen to stay ≥ 4.5:1 for the text set on them */
  bg: string;
  fg: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'sweets', label: 'Sweets & desserts', labelBn: 'মিষ্টি', icon: Candy, bg: '#F6DCD6', fg: '#7A1F18' },
  { id: 'dairy', label: 'Doi, ghee & dairy', labelBn: 'দই ও দুগ্ধ', icon: Milk, bg: '#EDE6D2', fg: '#4A3F25' },
  { id: 'pitha', label: 'Pitha & snacks', labelBn: 'পিঠা', icon: Cookie, bg: '#F7E7BD', fg: '#6B4A06' },
  { id: 'rice', label: 'Rice dishes', labelBn: 'ভাত ও চাল', icon: Wheat, bg: '#E9E1C3', fg: '#4F4410' },
  { id: 'fish', label: 'Fish & seafood', labelBn: 'মাছ', icon: Fish, bg: '#D6E6E4', fg: '#14453F' },
  { id: 'meat', label: 'Meat dishes', labelBn: 'মাংস', icon: Beef, bg: '#EBD3C5', fg: '#6A2B12' },
  { id: 'street', label: 'Street food', labelBn: 'পথের খাবার', icon: Soup, bg: '#F2D9B8', fg: '#6A3A06' },
  { id: 'produce', label: 'Fruits & produce', labelBn: 'ফল ও ফসল', icon: Citrus, bg: '#DFE8DC', fg: '#0F4A37' },
  { id: 'drinks', label: 'Drinks', labelBn: 'পানীয়', icon: Coffee, bg: '#E3DCD1', fg: '#3E2F1E' },
  { id: 'indigenous', label: 'Indigenous & hill cuisine', labelBn: 'পাহাড়ি খাবার', icon: Mountain, bg: '#D9E3D0', fg: '#2C4A1B' },
  { id: 'other', label: 'Other specialties', labelBn: 'অন্যান্য', icon: Sparkles, bg: '#E6E0EC', fg: '#3D2E52' },
];
export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<FoodCategory, CategoryMeta>;

/* ───── Progress maths ───── */

export interface Journey {
  triedFoods: Food[];
  wantFoods: Food[];
  exploredDistricts: Set<string>;
  communityTried: number;
  title: Achievement;
}

export interface Achievement {
  en: string;
  bn: string;
  next?: { en: string; at: number };
}

/**
 * A district counts as explored when at least one ORIGINAL (researched) food from it is marked Tried.
 * Community foods never count toward the 64-district challenge.
 */
export function achievementFor(explored: number): Achievement {
  if (explored >= 64) return { en: 'Bangladesh Food Champion', bn: 'বাংলাদেশের খাদ্য চ্যাম্পিয়ন' };
  if (explored >= 32) return { en: 'Regional Taste Hunter', bn: 'আঞ্চলিক স্বাদ শিকারি', next: { en: 'Bangladesh Food Champion', at: 64 } };
  if (explored >= 8) return { en: 'Food Explorer', bn: 'খাদ্য অভিযাত্রী', next: { en: 'Regional Taste Hunter', at: 32 } };
  if (explored >= 1) return { en: 'First Taster', bn: 'নতুন স্বাদগ্রাহী', next: { en: 'Food Explorer', at: 8 } };
  return { en: 'Passport ready', bn: 'পাসপোর্ট প্রস্তুত', next: { en: 'First Taster', at: 1 } };
}

const FOOD_IDS = new Set(FOODS.map((f) => f.id));

export function computeJourney(progress: Record<string, ProgressState>, community: Food[] = []): Journey {
  const triedFoods: Food[] = [];
  const wantFoods: Food[] = [];
  const explored = new Set<string>();
  for (const f of FOODS) {
    const s = progress[f.id];
    if (s === 'tried') {
      triedFoods.push(f);
      explored.add(f.districtId);
    } else if (s === 'want') wantFoods.push(f);
  }
  let communityTried = 0;
  for (const [id, s] of Object.entries(progress)) {
    if (!FOOD_IDS.has(id) && id.startsWith('c_')) {
      if (s === 'tried') communityTried++;
      else if (s === 'want') {
        const cf = community.find((c) => c.id === id);
        if (cf) wantFoods.push(cf);
      }
    }
  }
  return { triedFoods, wantFoods, exploredDistricts: explored, communityTried, title: achievementFor(explored.size) };
}

export const TOTAL_DISTRICTS = DISTRICTS.length;

export function avgRating(sum: number, count: number) {
  return count ? Math.round((sum / count) * 10) / 10 : 0;
}

export const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') || (typeof location !== 'undefined' ? location.origin : '');

/** Districts with a want-to-try original food and nothing tasted yet. */
export function wantDistricts(progress: Record<string, ProgressState>, tasted: Set<string>): Set<string> {
  const out = new Set<string>();
  for (const f of FOODS) if (progress[f.id] === 'want' && !tasted.has(f.districtId)) out.add(f.districtId);
  return out;
}

export function achievementBn(next?: { en: string; at: number }) {
  const map: Record<string, string> = {
    'First Taster': 'নতুন স্বাদগ্রাহী',
    'Food Explorer': 'খাদ্য অভিযাত্রী',
    'Regional Taste Hunter': 'আঞ্চলিক স্বাদ শিকারি',
    'Bangladesh Food Champion': 'বাংলাদেশের খাদ্য চ্যাম্পিয়ন',
  };
  return next ? map[next.en] ?? next.en : '';
}

/** One emoji pin per tasted district: the first tasted food's emoji and how many foods were tasted there. */
export function districtPins(triedFoods: Food[]): Record<string, { emoji: string; count: number }> {
  const out: Record<string, { emoji: string; count: number }> = {};
  for (const f of triedFoods) {
    if (f.community) continue;
    const cur = out[f.districtId];
    if (cur) cur.count++;
    else out[f.districtId] = { emoji: foodEmoji(f), count: 1 };
  }
  return out;
}

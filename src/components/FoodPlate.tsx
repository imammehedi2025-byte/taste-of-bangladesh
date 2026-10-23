import type { Food } from '../types';
import { CATEGORY_BY_ID } from '../utils/meta';

/**
 * Designed artwork that stands in for a photo: the Bangla name set large on a category-coloured
 * plate, with a kantha stitch ring. No external images, so nothing can break or infringe.
 */
export function FoodPlate({ food, size = 'md' }: { food: Food; size?: 'sm' | 'md' | 'lg' }) {
  const cat = CATEGORY_BY_ID[food.category];
  const Icon = cat.icon;
  const h = size === 'lg' ? 'h-56 sm:h-72' : size === 'sm' ? 'h-24' : 'h-36';
  const t = size === 'lg' ? 'text-4xl sm:text-5xl' : size === 'sm' ? 'text-lg' : 'text-2xl';
  return (
    <div
      className={`relative ${h} overflow-hidden rounded-[var(--radius-plate)]`}
      style={{ background: cat.bg, color: cat.fg }}
      aria-hidden="true"
    >
      <svg className="absolute -right-6 -bottom-8 h-40 w-40 opacity-30" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 4" />
        <circle cx="50" cy="50" r="34" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <Icon className="absolute top-3 right-3 h-5 w-5 opacity-60" strokeWidth={1.75} />
      <div className={`bn absolute inset-x-4 bottom-3 leading-[1.25] font-bold ${t}`}>
        <span className="line-clamp-2">{food.nameBn}</span>
      </div>
    </div>
  );
}

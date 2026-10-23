import { Heart, MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Food } from '../types';
import { DISTRICT_BY_ID } from '../data/districts';
import { FoodPlate } from './FoodPlate';
import { StatusBadge } from './ui';
import { useApp } from '../hooks/useApp';
import { avgRating } from '../utils/meta';
import { ProgressControl } from '../features/ratings/Controls';

export function FoodCard({ food, showProgress = true }: { food: Food; showProgress?: boolean }) {
  const { stats, progress } = useApp();
  const d = DISTRICT_BY_ID[food.districtId];
  const s = stats[food.id];
  const tried = progress[food.id] === 'tried';
  return (
    <article className="group flex flex-col gap-3">
      <Link to={`/food/${encodeURIComponent(food.id)}`} className="relative block rounded-[var(--radius-plate)] focus-visible:outline-offset-4">
        <FoodPlate food={food} />
        {tried && (
          <span className="stamp-in absolute top-3 left-3 rounded-full border-2 border-chili bg-paper-hi/90 px-2.5 py-0.5 text-xs font-bold text-chili">
            Tasted
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 px-1">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/food/${encodeURIComponent(food.id)}`} className="text-lg leading-snug font-bold hover:text-paddy">
            {food.nameEn}
          </Link>
          <StatusBadge food={food} compact />
        </div>
        <Link to={`/district/${food.districtId}`} className="inline-flex items-center gap-1 text-sm text-ink-soft hover:text-paddy">
          <MapPin className="h-3.5 w-3.5" />
          {d?.nameEn} <span className="bnui">· {d?.nameBn}</span>
        </Link>
        {s && (s.ratingCount > 0 || s.mustTryCount > 0) && (
          <p className="flex gap-3 text-sm text-ink-soft">
            {s.ratingCount > 0 && (
              <span className="inline-flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-turmeric text-turmeric" /> {avgRating(s.ratingSum, s.ratingCount)} ({s.ratingCount})
              </span>
            )}
            {s.mustTryCount > 0 && (
              <span className="inline-flex items-center gap-1">
                <Heart className="h-3.5 w-3.5 fill-chili text-chili" /> {s.mustTryCount} must-try
              </span>
            )}
          </p>
        )}
        {showProgress && (
          <div className="mt-auto pt-2">
            <ProgressControl foodId={food.id} compact />
          </div>
        )}
      </div>
    </article>
  );
}

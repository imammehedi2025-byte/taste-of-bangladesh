import { BadgeCheck, Info, LoaderCircle, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Food } from '../types';

export function StatusBadge({ food, compact }: { food: Food; compact?: boolean }) {
  if (food.status === 'Verified') {
    const gi = food.evidenceLevel === 'gi';
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full bg-paddy-soft px-2.5 py-0.5 text-xs font-semibold text-paddy"
        title={gi ? `Registered Geographical Indication no. ${food.giNumber}` : 'Two or more independent sources agree'}
      >
        <BadgeCheck className="h-3.5 w-3.5" />
        {gi ? (compact ? 'GI' : `GI registered`) : 'Verified'}
      </span>
    );
  }
  if (food.status === 'Community Contributed')
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-turmeric-soft px-2.5 py-0.5 text-xs font-semibold text-[#6B4A06]">
        <Users className="h-3.5 w-3.5" /> Community
      </span>
    );
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border border-ink/25 px-2.5 py-0.5 text-xs font-semibold text-ink-soft"
      title={food.evidenceLevel === 'conflict' ? 'Sources disagree' : 'Only one source found so far'}
    >
      <Info className="h-3.5 w-3.5" /> Needs review
    </span>
  );
}

export function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
  return <LoaderCircle className={`animate-spin ${className}`} aria-hidden="true" />;
}

export function PageHeader({ title, titleBn, children }: { title: string; titleBn?: string; children?: ReactNode }) {
  return (
    <header className="mb-6 pt-6 sm:pt-10">
      {titleBn && <p className="bn mb-1 text-lg text-chili">{titleBn}</p>}
      <h1 className="text-3xl font-bold tracking-tight sm:text-5xl" style={{ fontVariationSettings: '"wdth" 85' }}>
        {title}
      </h1>
      {children && <div className="mt-3 max-w-2xl text-ink-soft">{children}</div>}
    </header>
  );
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="stitch rounded-2xl p-8 text-center text-ink/40">
      <p className="text-lg font-semibold text-ink">{title}</p>
      {children && <div className="mt-1 text-ink-soft">{children}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-0 sm:items-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-paper-hi p-5 shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold">{title}</h2>
          <button className="btn-ghost min-h-10 px-4 text-sm" onClick={onClose} autoFocus>
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

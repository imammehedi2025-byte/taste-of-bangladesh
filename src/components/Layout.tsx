import { BookOpen, Compass, House, Map, Plus, ShieldCheck, Ticket, Users, X } from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useApp } from '../hooks/useApp';

const NAV = [
  { to: '/', label: 'Home', icon: House, end: true },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/districts', label: 'Districts', icon: Map },
  { to: '/community', label: 'Community', icon: Users },
  { to: '/passport', label: 'Passport', icon: Ticket },
];

export function Layout() {
  const { isAdmin } = useApp();
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-paper-hi focus:px-4 focus:py-2">
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-paddy-deep bg-paddy text-paper-hi">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <NavLink to="/" className="flex items-center gap-2.5">
            <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden="true">
              <circle cx="20" cy="20" r="18" fill="none" stroke="#E0A21C" strokeWidth="2" strokeDasharray="4 3" />
              <circle cx="20" cy="20" r="9" fill="#C4352B" />
            </svg>
            <span className="leading-tight">
              <span className="block text-[17px] font-bold" style={{ fontVariationSettings: '"wdth" 85' }}>
                Taste of Bangladesh
              </span>
              <span className="bn block text-xs text-turmeric">বাংলার স্বাদ</span>
            </span>
          </NavLink>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {NAV.slice(1).map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `rounded-full px-3.5 py-2 text-[15px] font-semibold transition-colors ${isActive ? 'bg-paper-hi text-paddy' : 'text-paper-hi/85 hover:text-paper-hi'}`
                }
              >
                {n.label}
              </NavLink>
            ))}
            <NavLink to="/about" className={({ isActive }) => `rounded-full px-3.5 py-2 text-[15px] font-semibold ${isActive ? 'bg-paper-hi text-paddy' : 'text-paper-hi/85 hover:text-paper-hi'}`}>
              How it works
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" className="ml-1 rounded-full px-3 py-2 text-[15px] font-semibold text-turmeric">
                <ShieldCheck className="inline h-4 w-4" /> Admin
              </NavLink>
            )}
            <NavLink to="/add" className="btn ml-2 min-h-10 bg-turmeric px-4 text-ink hover:bg-[#f0b53a]">
              <Plus className="h-4 w-4" /> Add a food
            </NavLink>
          </nav>
          <NavLink to="/add" className="btn min-h-10 bg-turmeric px-3.5 text-sm text-ink md:hidden" aria-label="Add a missing food">
            <Plus className="h-4 w-4" /> Add
          </NavLink>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 md:pb-16">
        <Outlet />
      </main>

      <footer className="border-t border-ink/10 bg-paper-hi pb-24 md:pb-0">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <NavLink to="/about" className="hover:text-paddy">
              <BookOpen className="mr-1 inline h-4 w-4" />
              About & sources
            </NavLink>
            <NavLink to="/add" className="hover:text-paddy">
              Add a missing food
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" className="hover:text-paddy">
                Moderation
              </NavLink>
            )}
          </div>
          <p>Developed by Imam Mehedi Hasan</p>
        </div>
      </footer>

      {/* Mobile tab bar — one-handed reach */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-paper-hi/95 backdrop-blur md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        aria-label="Main"
      >
        <div className="mx-auto grid max-w-md grid-cols-5">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) => `flex min-h-16 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${isActive ? 'text-paddy' : 'text-ink-soft'}`}
            >
              {({ isActive }) => (
                <>
                  <span className={`grid h-7 w-12 place-items-center rounded-full ${isActive ? 'bg-paddy-soft' : ''}`}>
                    <n.icon className="h-5 w-5" strokeWidth={isActive ? 2.25 : 1.75} />
                  </span>
                  {n.label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
      <Toaster />
    </div>
  );
}

function Toaster() {
  const { toasts, dismiss } = useApp();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 md:bottom-6" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast-in pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl px-4 py-3 shadow-lg ${
            t.kind === 'error' ? 'bg-chili text-white' : t.kind === 'success' ? 'bg-paddy text-paper-hi' : 'bg-ink text-paper-hi'
          }`}
          role={t.kind === 'error' ? 'alert' : 'status'}
        >
          <p className="flex-1 text-sm leading-snug">{t.text}</p>
          {t.action && (
            <button
              className="shrink-0 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold hover:bg-white/25"
              onClick={() => {
                t.action!.run();
                dismiss(t.id);
              }}
            >
              {t.action.label}
            </button>
          )}
          <button className="shrink-0 rounded-full p-1 hover:bg-white/15" aria-label="Dismiss" onClick={() => dismiss(t.id)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

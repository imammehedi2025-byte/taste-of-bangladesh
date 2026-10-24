import { Link } from 'react-router-dom';
import { PageHeader } from '../components/ui';
import { FOODS } from '../data/foods';
import { SOURCES } from '../data/sources';
import { useApp } from '../hooks/useApp';

export default function About() {
  const { user } = useApp();
  const verified = FOODS.filter((f) => f.status === 'Verified').length;
  const gi = FOODS.filter((f) => f.evidenceLevel === 'gi').length;
  return (
    <div className="max-w-3xl">
      <PageHeader title="How it works" titleBn="কীভাবে কাজ করে">
        A guide to the famous foods of all 64 districts, built to be honest about what is known and what still needs checking.
      </PageHeader>

      <div className="space-y-10 text-[17px] leading-relaxed">
        <section>
          <h2 className="mb-2 text-2xl font-bold">The challenge</h2>
          <p>
            Your passport is a map of Bangladesh. Mark any of a district’s researched foods as <em>Tried</em> and that district turns red on your map. Taste something from
            all 64 to become a Bangladesh Food Champion. Titles along the way: First Taster (1 district), Food Explorer (8), Regional Taste Hunter (32) and Bangladesh
            Food Champion (64).
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-2xl font-bold">How the food list was researched</h2>
          <p>
            The launch list has {FOODS.length} foods across all 64 districts. Each one carries its sources and one of three labels:
          </p>
          <ul className="mt-3 space-y-2">
            <li>
              <strong className="text-paddy">Verified</strong> — {verified} foods. Either registered on the government’s Geographical Indication (GI) list ({gi} foods),
              or named by two or more independent sources.
            </li>
            <li>
              <strong>Needs review</strong> — only one source so far, or sources disagree. These are shown so every district has something, but treat them as leads.
            </li>
            <li>
              <strong className="text-[#6B4A06]">Community</strong> — added by visitors and approved by a moderator. Not counted as verified.
            </li>
          </ul>
          <p className="mt-3">
            District map boundaries: Bangladesh Bureau of Statistics and OCHA ROAP via geoBoundaries, licensed CC BY 3.0 IGO (simplified for screen use).
            Two news lists that repeat each other word for word are counted as one source. No photos are used; each food gets designed artwork so nothing is copied or
            hot-linked. Spot a mistake? Every food page has a <em>Report a problem</em> link.
          </p>
          <details className="mt-4 rounded-2xl bg-paper-hi p-4">
            <summary className="cursor-pointer font-semibold">All sources ({Object.keys(SOURCES).length})</summary>
            <ul className="mt-3 space-y-2 text-sm">
              {Object.values(SOURCES).map((s) => (
                <li key={s.id}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-paddy underline">
                    {s.title}
                  </a>{' '}
                  <span className="text-ink-soft">— {s.publisher}</span>
                </li>
              ))}
            </ul>
          </details>
        </section>

        <section>
          <h2 className="mb-2 text-2xl font-bold">Your data</h2>
          <p>
            Browsing needs no account. The first time you mark, rate or add a food, the site creates a private guest ID in your browser so your choices can be saved.
            We don’t ask for your name, phone or email. If you clear your browser data, the guest ID — and access to that passport — is lost, unless you connected a
            Google account on the Passport page, which lets your passport follow you to other devices.
          </p>
          <p className="mt-3">
            Your ratings and recommendations are private; only totals are public. Food you add is public once approved. Shareable images are drawn on your own device
            and are never uploaded.
          </p>
          {user && <p className="mt-3 text-sm break-all text-ink-soft">Your user ID: {user.uid}</p>}
        </section>

        <section>
          <h2 className="mb-2 text-2xl font-bold">Free to run</h2>
          <p>
            The site runs entirely on free tiers (Firebase Spark, a free host). Free tiers have daily limits. If they are reached, saving pauses until the next day and
            the site tells you so; nothing is ever charged.
          </p>
        </section>

        <section className="rounded-3xl bg-paddy p-6 text-paper-hi">
          <p className="bn text-xl text-turmeric">বাংলার স্বাদ</p>
          <p className="mt-1 text-lg font-semibold">Taste of Bangladesh</p>
          <p className="mt-2 text-paper-hi/85">Developed by Imam Mehedi Hasan</p>
          <Link to="/add" className="btn mt-5 bg-turmeric text-ink">
            Add a missing food
          </Link>
        </section>
      </div>
    </div>
  );
}

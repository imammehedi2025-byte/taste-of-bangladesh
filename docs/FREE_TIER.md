# Free-tier budget and quota checklist (BDT 0)

Limits checked against the official pages on 23 October 2026. Providers change these — re-check before launch.

## Services used

| Service | Plan | Cost | Card needed? |
|---|---|---|---|
| Firebase Authentication (Anonymous, Google) | Spark | 0 | No |
| Cloud Firestore | Spark | 0 | No |
| Firebase Hosting (Option B) | Spark | 0 | No |
| Vercel (Option A) | Hobby — personal, non-commercial only | 0 | No |
| GitHub | Free | 0 | No |
| Fonts (Bricolage Grotesque, Noto Serif Bengali, Hind Siliguri) | Bundled via Fontsource, open licences | 0 | — |
| Icons (Lucide) | ISC licence | 0 | — |

Not used, on purpose: Firebase Blaze, Cloud Functions, Cloud Storage (no-cost quota needs Blaze on new projects), paid AI/image/maps/analytics/CAPTCHA APIs, custom domains.

## Firestore Spark limits (Standard edition)

| Quota | Spark limit | What uses it here |
|---|---|---|
| Stored data | 1 GiB | Progress docs, ratings, submissions — tiny (a few hundred bytes each) |
| Document reads | 50,000 / day | Each visit: ~1 query over `foodStats` (≈1 read per food that has any rating; cached 10 min) + approved submissions (≤200) + the user’s own progress/ratings when signed in |
| Document writes | 20,000 / day | Each Tried/Want = 1 write · rating = 2 · Must try = 2 · submission = 2 |
| Document deletes | 20,000 / day | Removing Must try = 1 |
| Outbound transfer | 10 GiB / month | Small JSON documents |

**Rough capacity:** a visitor who opens the site once and rates 3 foods costs about 150–350 reads and 6–10 writes. That supports on the order of **150–300 active visitors a day** before the read quota becomes the limit, once a few hundred foods have stats. This is an estimate, not a promise.

**When a quota runs out** Firestore returns `resource-exhausted`. The app shows: *"Today’s free database limit has been reached, so this wasn’t saved. Please try again later."* Browsing the 64-district guide keeps working because it is static. Quotas reset daily (Pacific time). Spark never bills — it simply stops.

## Authentication

Spark lists 50,000 monthly active users for Identity Platform features. Phone sign-in is not available on Spark and is not used.

## Hosting

| Option | Limit |
|---|---|
| Vercel Hobby | ~100 GB fast data transfer/month (fair-use guideline). **Non-commercial personal use only.** |
| Firebase Hosting Spark | 10 GB storage, 360 MB/day transfer. A first visit downloads about 220 KB of gzipped JavaScript plus the font files the page needs; later visits are cached. |

## Features that stop when a quota is exhausted

| Feature | Behaviour |
|---|---|
| Browse, search, district pages, sources | Unaffected (static) |
| Tried / Want to try | Shows the quota message with a Retry button; nothing is shown as saved |
| Ratings, Must try | Same; a chosen star rating stays visible marked "Not saved" |
| Submissions | Same; the form keeps everything typed |
| Community list, popular foods | Shows "Couldn’t load" with Retry |
| PNG cards | Unaffected (drawn on the device) |

## Before launch

- [ ] Firebase console → Usage and billing shows **Spark**
- [ ] No billing account linked to the Google Cloud project
- [ ] Rules deployed (`firebase deploy --only firestore:rules,firestore:indexes`)
- [ ] Vercel eligibility confirmed (personal/non-commercial) — otherwise use Firebase Hosting
- [ ] Optional: Firebase console → Firestore → Usage, check daily reads after the first week

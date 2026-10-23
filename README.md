# Taste of Bangladesh 🇧🇩 — বাংলার স্বাদ

A 64-district food discovery app. Find what each district is famous for, mark what you have tasted, rate and recommend foods, add missing local specialties, and share a Food Passport image.

**Developed by Imam Mehedi Hasan.** Total running cost: **BDT 0** (free tiers only).

- React 19 + TypeScript + Vite · Tailwind CSS v4 · Lucide icons
- Firebase Authentication (Anonymous + optional Google) and Cloud Firestore on the **Spark (no-cost) plan**
- Hosting: Vercel Hobby (personal, non-commercial) **or** Firebase Hosting on Spark
- PNG cards drawn in the browser with Canvas — no image APIs

| Doc | What's in it |
|---|---|
| [`docs/RESEARCH_REPORT.md`](docs/RESEARCH_REPORT.md) | Sources, method, corrections, conflicts, districts needing research |
| [`docs/VALIDATION_REPORT.md`](docs/VALIDATION_REPORT.md) | Auto-generated dataset check (64 districts, statuses, coverage) |
| [`docs/INITIAL_CANDIDATES.md`](docs/INITIAL_CANDIDATES.md) | The original candidate list, preserved |
| [`docs/FREE_TIER.md`](docs/FREE_TIER.md) | Budget and quota checklist |
| [`docs/TESTING_REPORT.md`](docs/TESTING_REPORT.md) | What was tested, what was not, and how to test the rest |

---

## 1. What works without any setup

Run it with no Firebase settings and the whole 64-district guide works: search, filters, district pages, food pages with sources, Tried / Want to try (saved **on this device only**, and the app says so), the Food Passport and its PNG. Ratings, Must try, community submissions and moderation switch on once Firebase is connected.

```bash
npm install
npm run dev          # http://localhost:5173
npm run validate:data
npm run build
```

Requires Node.js 20 or newer.

---

## 2. Connect Firebase (free Spark plan)

1. Go to <https://console.firebase.google.com> → **Add project**. Turn Google Analytics **off** (not needed). New projects start on **Spark** — do not upgrade to Blaze. No card is required.
2. **Project settings → General → Your apps → Web (`</>`)**. Register an app (Hosting checkbox optional). Copy the `firebaseConfig` values.
3. **Build → Authentication → Get started → Sign-in method**:
   - Enable **Anonymous** (lets visitors save without signing up).
   - Enable **Google** (lets people keep their passport across devices, and is how moderators sign in).
   - **Settings → Authorized domains**: add your deploy domain later (e.g. `taste-of-bangladesh.vercel.app`).
4. **Build → Firestore Database → Create database**. Choose **Standard edition**, location **asia-south1 (Mumbai)** or **asia-southeast1 (Singapore)** (closest to Bangladesh; cannot be changed later), start in **production mode**.
5. Create `.env` in the project root:

   ```bash
   cp .env.example .env
   # paste the six VITE_FIREBASE_* values, and set VITE_SITE_URL to your future site address
   ```

   These values identify your project to the browser; they are not secrets. What protects data is `firestore.rules`.

6. Deploy the security rules and the one composite index (free, no billing needed):

   ```bash
   npx firebase login
   npx firebase use --add          # pick your project
   npx firebase deploy --only firestore:rules,firestore:indexes
   ```

   Never paste "allow read, write: if true" rules into the console.

7. `npm run dev`, mark a food as Tried, rate it, add a food. Check **Firestore → Data**: you should see `userFoodProgress`, `foodRatings`, `foodStats`, `foodSubmissions`.

### Make yourself an admin (moderator)

Admins cannot be created from the app — the rules forbid it. You add yourself by hand in the console:

1. Open your site → **Admin** page (`/admin`) → **Sign in with Google**. The page shows **your user ID**.
2. Firebase console → **Firestore → Data → Start collection** → collection ID `admins` → document ID = **that user ID** → add any field (e.g. `name` = `Imam`) → Save.
3. Reload `/admin`. You can now approve or reject submissions and read reports.

Use a Google-signed-in account for admin, not a guest ID: guest IDs disappear if browser data is cleared.

---

## 3. Put it on GitHub

```bash
git init
git add .
git commit -m "Taste of Bangladesh"
# create an empty repo on github.com (Free plan), then:
git remote add origin https://github.com/<you>/taste-of-bangladesh.git
git branch -M main
git push -u origin main
```

`.env` is ignored by `.gitignore`. Confirm with `git status` that it is not listed before pushing.

---

## 4. Deploy

### Option A — Vercel Hobby (free)

**Eligibility:** Vercel's Hobby plan is for **non-commercial, personal use only** (checked 23 Oct 2026, Vercel Fair Use Guidelines). It is *not* eligible if anyone is paid to build or host the site, if it shows ads, sells anything, or is used for a company's commercial purpose (for example, as an LBS PLC campaign). Asking for donations is allowed. If your use is commercial, use Option B instead — do not upgrade silently.

1. <https://vercel.com> → sign up with GitHub (Hobby) → **Add New → Project** → import the repo.
2. Framework preset: **Vite**. Build command `npm run build`, output `dist` (auto-detected).
3. **Environment Variables**: add the six `VITE_FIREBASE_*` values and `VITE_SITE_URL` (e.g. `https://taste-of-bangladesh.vercel.app`).
4. **Deploy**. `vercel.json` already rewrites all routes to `index.html`, so refreshing `/district/bogura` works.
5. Add the `*.vercel.app` domain to Firebase **Authentication → Settings → Authorized domains**.

### Option B — Firebase Hosting on Spark (free, no commercial-use restriction in the plan terms)

```bash
npm run build
npx firebase deploy --only hosting
```

`firebase.json` is configured (SPA rewrite to `index.html`). Your site is `https://<project-id>.web.app`. Spark hosting includes 10 GB storage and 360 MB/day transfer — enough for an early launch; see `docs/FREE_TIER.md`.

No custom domain is needed for either option.

---

## 5. Test across two devices

1. Open the deployed site on a phone and on a laptop (or one normal + one private window).
2. Device 1: add a food (e.g. a local pitha for your district). Device 2: Community page — it is **not** visible yet (pending).
3. As admin on any device: `/admin` → Approve. Device 2: reload Community — it appears.
4. Device 1: rate a food 4★ and tap Must try. Device 2: reload the food page — count and average reflect it.
5. Device 1: Passport → **Keep my passport with Google**. Sign in with the same Google account on Device 2 → Passport shows the same stamps.
6. Firebase console → **Usage and billing**: plan still says **Spark**; no billing account is attached.

---

## 6. How data is stored

| Collection | Doc ID | Who can read | Who can write |
|---|---|---|---|
| `userFoodProgress` | user ID | owner | owner (≤1000 items, nickname ≤30 chars) |
| `foodRatings` | `{uid}__{foodId}` | owner | owner; value 1–5; must change `foodStats` by exactly the same amount in one transaction |
| `foodRecommendations` | `{uid}__{foodId}` | owner | owner; create/delete must move `mustTryCount` by ±1 |
| `foodStats` | food ID | everyone | only alongside a matching rating/recommendation change |
| `foodSubmissions` | `{districtId}__{normalized-name}` | approved: everyone · pending/rejected: author + admins | create as `pending` only, validated, 1/min per user · status change: admins only |
| `userLimits` | user ID | owner | owner (timestamp only) |
| `foodReports` | auto | admins | any signed-in user (validated) |
| `admins` | user ID | that user (to check own role) | nobody from the app |

The 64 districts and 161 researched foods are static TypeScript in `src/data/` — they cost no database reads.

**One rating / one recommendation per user per food** is guaranteed by the document ID. **Duplicate submissions** of the same name in the same district are blocked by the document ID too.

---

## 7. Accounts and privacy

- Browsing needs nothing. The first save creates an **anonymous Firebase user** stored in that browser.
- Clearing browser data, private windows, or a new device = a new anonymous user. The old passport can't be recovered unless it was connected to Google.
- **Keep my passport with Google** links the anonymous user to Google. If that Google account already had a passport, the two passports' Tried/Want lists are merged; ratings and Must try made under the guest ID stay attached to the old guest ID (they still count in totals).
- No names, phone numbers or emails are collected by the app. Google sign-in gives Firebase the email; the app only shows it to the user.

---

## 8. Known limitations

- **Abuse resistance is limited without a paid backend.** Rules validate every field and enforce counters and a 60-second submission cooldown, but anyone can create new anonymous users to rate a food more than once or submit more often. Moderation catches bad submissions; ratings could be inflated by a determined person. App Check (free) can be added later to make scripted abuse harder.
- `foodStats` documents could be created for made-up food IDs (format-checked only). They are ignored by the UI.
- The 60-second cooldown is per user ID, not per person.
- Community foods have no images; image uploads were left out because Firebase Storage on new projects requires Blaze.
- 84 of 161 foods are **Needs Review**; 12 districts have no Verified food yet (see the research report).
- Security rules have a full test suite (`npm run test:rules`) but it **was not run** in the build environment because the Firestore emulator download was blocked. Run it locally before going live (needs Java 11+).
- Live Firebase features (ratings, submissions, moderation, Google linking) were **not tested end-to-end** because no Firebase project was available during the build.

---

## 9. Project structure

```
src/
  data/        divisions.ts · districts.ts (64) · foods.ts (161, with sources) · sources.ts
  lib/         firebase.ts (init, auth) · api.ts (all Firestore access) · errors.ts
  hooks/       useApp.tsx (auth, progress, stats, toasts)
  features/    passport/ (Canvas cards, share sheet) · ratings/ (progress, stars, Must try)
  components/  Layout, FoodCard, FoodPlate artwork, StampGrid, DistrictPicker
  pages/       Home · Explore · FoodDetail · Districts · Community · Passport · AddFood · About · Admin
scripts/validate-dataset.ts
tests/rules/firestore.rules.test.ts
firestore.rules · firestore.indexes.json · firebase.json · vercel.json
```

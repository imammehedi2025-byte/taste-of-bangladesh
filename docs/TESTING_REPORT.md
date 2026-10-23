# Testing Report

Build environment: Linux, Node 22, Chromium 153 (Playwright), 23 October 2026.
No Firebase project was available, and the Firestore emulator download was blocked, so everything that needs a live database is marked **Not Tested** with exact steps.

## Automated — run and passed

| Check | Result |
|---|---|
| `npm run build` (TypeScript strict + Vite production build) | **Pass**, no type errors |
| `npm run validate:data` — 64 districts exactly once, correct division counts (13/11/8/10/6/4/8/4), 161 foods, unique IDs, valid district refs, Bangla names in Bangla script, every source key resolves, every `Verified` entry has a GI number or ≥2 independent source groups, every status matches its evidence level | **Pass**, 0 errors |
| UI checks at 390×844 (Playwright, `vite preview` build): | |
| Search in Bangla (রসমালাই) | Pass |
| Search by alternate spelling (Comilla → Cumilla) | Pass |
| Division + evidence filter | Pass |
| Empty search state | Pass |
| Direct deep link `/district/sherpur` | Pass |
| 404 page | Pass |
| Want to try → toast; Tried → toast with "Want to rate it?" | Pass |
| Passport counts 1 district after one Tried | Pass |
| A tried community food does **not** raise the 64-district count | Pass |
| Nickname edit and save | Pass |
| Add-food: inline errors on empty step 1 | Pass |
| Add-food: district picker accepts Bangla (কুমিল্লা), division auto-filled | Pass |
| Add-food: duplicate warning ("Rasmalai" in Cumilla) | Pass |
| Add-food: `javascript:` URL rejected | Pass |
| Add-food without Firebase: honest "not connected" error, no fake success | Pass |
| Add-food draft survives page reload | Pass |
| Districts page lists 64 districts | Pass |
| Developer credit in footer and About | Pass |
| Skip-to-content link is first in tab order | Pass |
| No uncaught page errors | Pass |
| No horizontal scroll at 390 px on Home, Explore, Passport, Add, a long-named district, a food page | Pass |
| Food Passport PNG generated in-browser (1080×1350), stamps and Bangla text render correctly | Pass (visually inspected) |
| Rating, Must try and Contribution PNG cards generated (1080×1350) | Pass (visually inspected) |

## Visual QA

Desktop (1366 px) and mobile (390 px) screenshots of Home, Explore, Food, District, Districts, Passport, Add, About and Community were reviewed. Fixes made during review: plate artwork artefact, overlapping district stamp on mobile, card locality wrapping, decorative circles spilling outside the PNG plate, featured-foods copy that overstated GI status, default sort now shows best-evidenced foods first.

## Not Tested — run these after connecting Firebase

| # | Test | How |
|---|---|---|
| 1 | Security rules suite (17 cases: rating/stat tampering, someone else's rating, out-of-range values, direct stats writes, Must try inflation, private progress, self-approval, markup injection, duplicate IDs, pending visibility, admin-only moderation, self-promotion to admin, deleting others' submissions) | Install Java 11+, then `npm run test:rules` |
| 2 | Anonymous sign-in on first save | Mark a food Tried → Firebase console → Authentication shows an anonymous user |
| 3 | Progress persists in Firestore | Reload the site → stamps remain; Firestore has `userFoodProgress/{uid}` |
| 4 | Rating saves and updates the average | Rate 4 → reload → "Community 4 from 1"; `foodStats/{foodId}` = `{ratingSum: 4, ratingCount: 1}` |
| 5 | Changing a rating doesn't add a second one | Rate 4 then 2 → `ratingCount` stays 1, `ratingSum` 2 |
| 6 | Must try on/off | Count goes 0 → 1 → 0 |
| 7 | Submission appears on another device only after approval | README §5 steps 2–3 |
| 8 | Same food + district twice is blocked | Submit "Duck curry" for Kishoreganj twice → second shows the "already been submitted" message |
| 9 | 60-second cooldown | Submit two different foods within a minute → second shows "one food per minute" and keeps the form |
| 10 | Non-admin cannot see pending items or moderate | Open `/admin` as a normal user → shows the access message; Firestore requests for pending items are denied |
| 11 | Google linking keeps progress across devices | README §5 step 5 |
| 12 | Native share sheet with image | On Android Chrome: Passport → Share → share sheet lists WhatsApp/Messenger with the PNG attached |
| 13 | Quota-exhausted message | Hard to trigger on purpose; the message path is covered by `friendlyError` for `resource-exhausted` |
| 14 | Real Android device performance | Open on a mid-range Android phone over 4G; Home should be usable within a few seconds |
| 15 | Vercel / Firebase Hosting deploy, refresh on deep links | After deploy, open `/district/bogura` directly and refresh |

# Taste of Bangladesh — Research Report

Research pass: 23 October 2026. Dataset file: `src/data/foods.ts`. Source registry: `src/data/sources.ts`.
Machine check: `npm run validate:data` (writes `docs/VALIDATION_REPORT.md`).

## 1. Method

1. Read all four starting sources in full (Daily Bangladesh, Desh TV, Ghure Dekha Bangladesh, Ghurifiri).
2. Cross-checked against the **official DPDT register of Geographical Indication goods** (64 registrations, page last updated June 2026) — the strongest available evidence that a food belongs to a district.
3. Added targeted newspaper evidence (The Daily Star, Dhaka Tribune, Prothom Alo, bdnews24, Ittefaq) where it existed.
4. Applied one status rule to every entry (enforced by the validator, not by hand):

| Evidence level | Meaning | Status |
|---|---|---|
| `gi` | Registered on the DPDT GI register (number recorded) | **Verified** |
| `multi` | Two or more *independent* sources agree | **Verified** |
| `single` | Only one independent source | **Needs Review** |
| `conflict` | Sources disagree on name, district or locality | **Needs Review** |

**Independence.** Desh TV's 2023 article reproduces the Daily Bangladesh 2019 list almost line for line, so the two are treated as **one** source (`independentGroup: db-list`). Ghure Dekha and Ghurifiri are distinct sites but are travel guides, not primary research; a food backed only by them is "Verified" in the app's sense (two independent listings agree) but is weaker than a GI registration. The app shows the evidence level on every food so users can see the difference.

Nothing in this dataset claims to be 100% verified.

## 2. Results

- 64 / 64 districts present, correct divisions (13 · 11 · 8 · 10 · 6 · 4 · 8 · 4).
- 161 foods: **77 Verified** (36 via DPDT GI, 41 via multiple independent sources) and **84 Needs Review**.
- 52 districts have at least one Verified food. **12 districts have only Needs Review entries** (listed in §6) — these need local confirmation.

## 3. Sources used

| Key | Source | Kind |
|---|---|---|
| dpdt | [DPDT — Registered GI goods](https://dpdt.gov.bd/pages/static-pages/6922dff0933eb65569e24bcf) | Government register |
| dailyBangladesh | [Daily Bangladesh — ৬৪ জেলার বিখ্যাত খাবারের তালিকা (2019)](https://www.daily-bangladesh.com/64-jelar-bikhzat-khabarer-talika/139737) | News list |
| deshTv | [Desh TV — বাংলাদেশের ৬৪ জেলার বিখ্যাত সব খাবার (2023)](https://www.desh.tv/national/14262) | News list (copy of above) |
| ghureDekha | [Ghure Dekha Bangladesh — famous food of 64 districts](https://www.ghuredekhabangladesh.com/en/bazar) | Travel guide |
| ghurifiri | [Ghurifiri — famous food and sweets by district](https://ghurifiri.bd/en/heritage/food) | Travel guide |
| dsChhanamukhi | [The Daily Star — Chhanamukhi GI](https://thedailystar.net/node/3715316) | Newspaper |
| dtBalish | [Dhaka Tribune — Balish Mishti GI](https://www.dhakatribune.com/bangladesh/nation/392855/netrokona-s-balish-mishti-earns-gi-tag) | Newspaper |
| dsJamurki | [Daily Star Bangla — Jamurki sandesh, patkhir, lotkon GI](https://bangla.thedailystar.net/news/bangladesh/news-670026) | Newspaper |
| bdnRajbari | [bdnews24 — Rajbari kheer chomchom](https://bangla.bdnews24.com/samagrabangladesh/09a7afc38f1f) | Newspaper |
| dsKotkoti | [Daily Star Bangla — Mahasthan kotkoti](https://bangla.thedailystar.net/life-living/travel/news-709961) | Newspaper |
| dsSweets | [Daily Star Bangla — Bangladesh's sweets](https://bangla.thedailystar.net/life-living/food-health/news-478986) | Newspaper |
| dsKhirpuri | [Daily Star Bangla — Madaripur khirpuri](https://bangla.thedailystar.net/life-living/food-recipe/news-668541) | Newspaper |
| ittefaqKhirmohon | [Ittefaq — Ulipur kshirmohon](https://www.ittefaq.com.bd/lifestyle/216333/উলিপুরের-ক্ষীরমোহন) | Newspaper |
| paGiPending | [Prothom Alo — GI applications for dairy sweets](https://www.prothomalo.com/opinion/column/8e7gb82xac) | Newspaper (opinion) |
| paPanchagarh | [Prothom Alo — Panchagarh travel](https://www.prothomalo.com/bangladesh/district/qcoyx14m46) | Newspaper |
| dsBiryani | [Daily Star Bangla — Food & Recipe (Haji & Hanif biryani)](https://bangla.thedailystar.net/life-living/food-recipe?page=2) | Newspaper |
| dbSreemangalTea | [Daily Bangladesh — Sreemangal multi-layer tea](https://www.daily-bangladesh.com/tourism/149401) | Newspaper travel |

## 4. Corrections and replacements to the initial candidate list

| District | Candidate | What changed | Why |
|---|---|---|---|
| Kishoreganj | Balish Mishti | **Removed**; replaced by Austagram Cheese (GI 48) and Rata Boro rice (GI 47) | Balish mishti's GI (no. 57) is registered to **Netrokona**; Dhaka Tribune confirms. Daily Bangladesh's Kishoreganj attribution is treated as an error. |
| Narsingdi | "Sagor Kola" | Renamed **Amrita Sagar Banana** (GI 27); added Lotkon (GI 32) | Registered GI name. |
| Sylhet | Seven-Layer Tea | **Moved to Moulvibazar** | It is served in Sreemangal, which is in Moulvibazar district. |
| Kurigram | Kshir Mohon | Kept but **Needs Review**, scoped to Ulipur; Kurigram Chomchom added as Verified | Daily Bangladesh and Ghurifiri both name chomchom; kshirmohon has one newspaper feature. |
| Rangpur | Pelka | **Removed** | No reviewed source mentioned it. Replaced with Ghure Dekha's bhorta/bhuna khichuri (Needs Review). |
| Noakhali | Kholaja Pitha | Standardised to **Kholajali Pitha** (alt: Kholaja) | Ghurifiri's spelling and local name. |
| Munshiganj | — | **Added Patkhir** (GI 52) | Registered GI, missing from the candidate list. |
| Magura | — | **Added Hazrapuri Lychee** (GI 35) | Registered GI. |
| Meherpur | — | **Added Mehersagar Banana** (GI 56) | Registered GI. |
| Mymensingh | — | **Added Phulbaria Lal Chini** (GI 58) | Registered GI. |
| Sherpur | — | **Added Tulshimala rice** (GI 14) | Registered GI. |
| Tangail | Tangail sweets / pitha | Replaced with **Jamurki Sandesh** (GI 54) and **Madhupur Pineapple** (GI 33) | Registered GIs. |
| Bagerhat | Coconut sweets | Replaced with **Sundarbans Honey** (GI 43, filed by Bagerhat DC) | Registered GI; no source for coconut sweets. |
| Chapainawabganj | Amsotto | Dropped | Ghure Dekha mentions it but in passing; Khirsapat (GI 3) and Kalai Ruti are better supported. |
| Lakshmipur | Narikel Naru / coconut sweets | Dropped | No source attributes these to Lakshmipur. Daily Bangladesh attributes Narikel Naru to Noakhali. |
| Gazipur | Seasonal fruits | Replaced with Gazipur Jackfruit (GI 46) | Registered GI. |
| Cox's Bazar | Mishti paan (Daily Bangladesh) | Not added | Betel leaf, not a food specialty for this app. |
| Bandarban | Hill juice, tobacco (Daily Bangladesh) | Not added | Not foods / not a dish. |
| Jhalokathi | "Ata" (Daily Bangladesh) | Not added | Ambiguous (flour or custard-apple). |
| Natore | Bonolota Sen (Daily Bangladesh) | Not added | A poem reference, not a food. |

## 5. Conflicts and uncertain associations

- **Faridpur Malaikari** — Ghurifiri's text describes a sweet, but its photo is prawn malaikari (a curry). Needs local confirmation.
- **Roshkadam** — Ghurifiri: Rajshahi; Daily Bangladesh: Meherpur.
- **Nilphamari sandesh** — Daily Bangladesh: Domar; Ghure Dekha: Saidpur.
- **Feni** — Ghure Dekha lists "khaja", others list Khandal sweets; Khandal kept.
- **Hilsa** — the GI is national ("Bangladesh Ilish", GI 2). District hilsa entries (Chandpur, Shariatpur, Bhola, Lakshmipur, Munshiganj) describe local eating traditions, not exclusive origin.
- **Bagda shrimp** (GI 11) and **Kalijira rice** (GI 6) are national registrations and are not attributed to any one district.
- **Amra** — GI is Barishal's; Pirojpur and Jhalokathi entries note this.
- **Date-palm gur** appears in many south-western districts. Only Jashore (GI 26) and Manikganj Hazari gur (GI 64) are registered.
- **Shop-specific items** (Haji Biryani, Khirpuri, Kshirmohon, Manager Store, Adi Gopal, Jalalia) describe single businesses, not district-wide dishes.

## 6. Districts with no Verified food (priority for manual research)

Narayanganj, Shariatpur, Bandarban, Khagrachhari, Lakshmipur, Rangamati, Jhalokathi, Patuakhali, Lalmonirhat, Nilphamari, Thakurgaon, Jamalpur.

Each still has 2–3 candidates shown in the app with a clear **Needs Review** badge. Indigenous hill cuisine (Bandarban, Khagrachhari, Rangamati) especially needs sources written by or with the communities themselves. The validator regenerates this list on every run.

## 7. Original candidate list (preserved)

The full initial checklist from the master prompt (Part 3, 64 districts) is preserved verbatim in `docs/INITIAL_CANDIDATES.md`.

## 8. Not done / limitations

- No field visits or interviews. Evidence is published material only.
- Travel-guide sites may themselves draw on the same older lists; independence between them cannot be fully proven.
- No food photographs are bundled. The app uses designed category artwork instead, to avoid unlicensed or unreliable hotlinked images. Ghurifiri credits several Wikimedia Commons photos (CC BY-SA) that could be added later with attribution.

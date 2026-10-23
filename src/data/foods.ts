import type { EvidenceLevel, Food, FoodCategory } from '../types';
import { DISTRICT_BY_ID } from './districts';
import type { SourceKey } from './sources';

/**
 * Research-backed launch dataset — October 2026 research pass.
 *
 * Status rule (applied automatically by `f()` below):
 *   Verified     ← evidenceLevel 'gi'    (official DPDT GI register) or
 *                  evidenceLevel 'multi' (≥2 INDEPENDENT sources agree;
 *                  Daily Bangladesh + Desh TV count as one source)
 *   Needs Review ← evidenceLevel 'single' or 'conflict'
 *
 * Descriptions are written in our own words. See docs/RESEARCH_REPORT.md
 * for the full evidence trail, corrections and unresolved questions.
 */
interface Input {
  slug: string;
  nameEn: string;
  nameBn: string;
  alt?: string[];
  description: string;
  category: FoodCategory;
  association: string;
  sources: SourceKey[];
  evidence: string;
  level: EvidenceLevel;
  gi?: number;
  locality?: string;
  season?: string;
  notes?: string;
}

function f(districtId: string, i: Input): Food {
  const district = DISTRICT_BY_ID[districtId];
  if (!district) throw new Error(`Unknown district ${districtId}`);
  return {
    id: `${districtId}--${i.slug}`,
    districtId,
    divisionId: district.divisionId,
    nameEn: i.nameEn,
    nameBn: i.nameBn,
    alt: i.alt,
    description: i.description,
    category: i.category,
    association: i.association,
    sources: i.sources,
    evidence: i.evidence,
    evidenceLevel: i.level,
    status: i.level === 'gi' || i.level === 'multi' ? 'Verified' : 'Needs Review',
    giNumber: i.gi,
    locality: i.locality,
    season: i.season,
    notes: i.notes,
  };
}

const DB_PAIR: SourceKey[] = ['dailyBangladesh', 'deshTv'];

export const FOODS: Food[] = [
  /* ───────────────────────── DHAKA DIVISION ───────────────────────── */
  f('dhaka', {
    slug: 'bakarkhani', nameEn: 'Old Dhaka Bakarkhani', nameBn: 'পুরান ঢাকার বাকরখানি', alt: ['Bakorkhani', 'Bakharkhani'],
    description: 'Crisp, many-layered baked flatbread in salty and sweet versions, traditionally dunked in afternoon tea.',
    category: 'pitha', association: 'A signature bakery item of Old Dhaka, baked in neighbourhood tandoor shops.',
    sources: [...DB_PAIR, 'ghureDekha', 'ghurifiri'], level: 'multi', locality: 'Old Dhaka',
    evidence: 'Daily Bangladesh/Desh TV list, Ghure Dekha and Ghurifiri all name bakarkhani for Dhaka.',
  }),
  f('dhaka', {
    slug: 'kacchi-biryani', nameEn: 'Dhaka Kacchi Biryani', nameBn: 'ঢাকার কাচ্চি বিরিয়ানি', alt: ['Kachchi biryani'],
    description: 'Marinated mutton layered with aromatic rice and potatoes, sealed and slow-cooked together in one pot.',
    category: 'rice', association: 'The celebratory rice dish most closely identified with Dhaka’s wedding and restaurant culture.',
    sources: [...DB_PAIR, 'ghureDekha'], level: 'multi',
    evidence: 'Ghure Dekha names kacchi biryani; Daily Bangladesh lists biryani for Dhaka.',
  }),
  f('dhaka', {
    slug: 'haji-biryani', nameEn: 'Haji Biryani', nameBn: 'হাজীর বিরিয়ানি',
    description: 'A long-running Old Dhaka biryani house whose spiced rice with meat has become a city institution.',
    category: 'rice', association: 'A named Old Dhaka establishment rather than a district-wide dish.',
    sources: ['ghureDekha', 'dsBiryani'], level: 'multi', locality: 'Old Dhaka',
    evidence: 'Named by Ghure Dekha and featured by The Daily Star Bangla as one of Dhaka’s two famous biryanis.',
  }),

  f('faridpur', {
    slug: 'khejur-gur', nameEn: 'Faridpur Date-Palm Jaggery', nameBn: 'ফরিদপুরের খেজুরের গুড়',
    description: 'Winter jaggery boiled down from fresh date-palm sap, sold as liquid gur or set patali.',
    category: 'produce', association: 'Faridpur is one of several south-western districts known for date-palm sap and gur.',
    sources: [...DB_PAIR, 'ghureDekha'], level: 'multi', season: 'Winter',
    evidence: 'Daily Bangladesh lists date-palm gur; Ghure Dekha lists Faridpur’s date-palm juice.',
    notes: 'Shared with neighbouring districts; not unique to Faridpur.',
  }),
  f('faridpur', {
    slug: 'boalmari-para-sandesh', nameEn: 'Boalmari Para Sandesh', nameBn: 'বোয়ালমারীর প্যারা সন্দেশ',
    description: 'Firm chhana-and-sugar sandesh associated with a long-standing sweet shop in Boalmari.',
    category: 'sweets', association: 'Linked by Ghurifiri to a specific Boalmari sweet shop.',
    sources: ['ghurifiri'], level: 'single', locality: 'Boalmari upazila',
    evidence: 'Only Ghurifiri documents this item. Needs a second independent source.',
  }),
  f('faridpur', {
    slug: 'malaikari', nameEn: 'Faridpur Malaikari', nameBn: 'ফরিদপুরের মালাইকারি',
    description: 'Ghurifiri describes a flattened rasgolla covered in thick cream or kheer.',
    category: 'sweets', association: 'Listed by Ghurifiri as a Faridpur sweet.',
    sources: ['ghurifiri'], level: 'conflict',
    evidence: 'Single source, and Ghurifiri’s own photo shows prawn malaikari (a curry), not a sweet.',
    notes: 'Conflict: the name “malaikari” is more widely used for a prawn-and-coconut curry. Needs local confirmation.',
  }),

  f('gazipur', {
    slug: 'jackfruit', nameEn: 'Gazipur Jackfruit', nameBn: 'গাজীপুরের কাঁঠাল',
    description: 'Jackfruit from the Bhawal-Gazipur belt, prized in the summer fruit season.',
    category: 'produce', association: 'Registered Geographical Indication for Gazipur.',
    sources: ['dpdt', ...DB_PAIR], level: 'gi', gi: 46, season: 'Summer (Jyoishtho–Asharh)',
    evidence: 'DPDT GI register no. 46; also listed by Daily Bangladesh.',
  }),
  f('gazipur', {
    slug: 'bhawal-pitha', nameEn: 'Bhawal Pitha', nameBn: 'ভাওয়ালের পিঠা',
    description: 'Rice-cake traditions of the Bhawal area of Gazipur.',
    category: 'pitha', association: 'Mentioned by Ghure Dekha alongside Gazipur jackfruit.',
    sources: ['ghureDekha'], level: 'single',
    evidence: 'Only Ghure Dekha mentions Bhawal pitha; no specific named pitha documented.',
  }),
  f('gazipur', {
    slug: 'beef-with-jackfruit', nameEn: 'Beef with Green Jackfruit', nameBn: 'কাঁচা কাঁঠাল দিয়ে গরুর মাংস',
    description: 'Beef curry cooked with unripe jackfruit — a home-style dish of jackfruit country.',
    category: 'meat', association: 'Ghurifiri connects it to Gazipur’s jackfruit growing.',
    sources: ['ghurifiri'], level: 'single',
    evidence: 'Only Ghurifiri lists this dish for Gazipur.',
  }),

  f('gopalganj', {
    slug: 'rasgolla', nameEn: 'Gopalganj Rasgolla', nameBn: 'গোপালগঞ্জের রসগোল্লা',
    description: 'Soft chhana balls cooked in light sugar syrup.',
    category: 'sweets', association: 'Registered Geographical Indication for Gopalganj.',
    sources: ['dpdt', ...DB_PAIR, 'ghurifiri'], level: 'gi', gi: 29,
    evidence: 'DPDT GI register no. 29; also named by Daily Bangladesh and Ghurifiri.',
  }),
  f('gopalganj', {
    slug: 'chhanar-jilapi', nameEn: 'Gopalganj Chhanar Jilapi', nameBn: 'গোপালগঞ্জের ছানার জিলাপি',
    description: 'Jilapi-shaped coils made from chhana, fried and soaked in syrup.',
    category: 'sweets', association: 'Listed for Gopalganj by Daily Bangladesh.',
    sources: [...DB_PAIR], level: 'single',
    evidence: 'Only the Daily Bangladesh list (repeated by Desh TV). Ghure Dekha names rasmalai and chomchom instead.',
  }),

  f('kishoreganj', {
    slug: 'austagram-cheese', nameEn: 'Austagram Cheese', nameBn: 'অষ্টগ্রামের পনির', alt: ['Ostogram ponir'],
    description: 'Traditional cheese of the Austagram haor area, made from local milk.',
    category: 'dairy', association: 'Registered Geographical Indication (applicant: Kishoreganj DC).',
    sources: ['dpdt', 'ghurifiri'], level: 'gi', gi: 48, locality: 'Austagram upazila',
    evidence: 'DPDT GI register no. 48; Ghurifiri also lists it.',
  }),
  f('kishoreganj', {
    slug: 'rata-boro-rice', nameEn: 'Kishoreganj Rata Boro Rice', nameBn: 'কিশোরগঞ্জের রাতা বোরো ধান',
    description: 'A traditional boro-season rice variety of the Kishoreganj haor.',
    category: 'rice', association: 'Registered Geographical Indication for Kishoreganj.',
    sources: ['dpdt'], level: 'gi', gi: 47,
    evidence: 'DPDT GI register no. 47.',
  }),
  f('kishoreganj', {
    slug: 'haor-fish', nameEn: 'Haor Fish & Pabda', nameBn: 'হাওরের মাছ ও পাবদা',
    description: 'Fresh freshwater fish from the haor wetlands, with pabda singled out.',
    category: 'fish', association: 'Ghure Dekha highlights Kishoreganj’s haor fish and pabda.',
    sources: ['ghureDekha'], level: 'single',
    evidence: 'Only Ghure Dekha. Haor fish are common to several north-eastern districts.',
  }),

  f('madaripur', {
    slug: 'ilish-mishti', nameEn: 'Ilish (Peti) Mishti', nameBn: 'ইলিশ মিষ্টি', alt: ['Peti mishti', 'পেটি মিষ্টি'],
    description: 'Soft sandesh pressed in moulds shaped like a hilsa belly piece.',
    category: 'sweets', association: 'A sweet from the Padma-hilsa district of Madaripur.',
    sources: ['ghurifiri', 'dsSweets'], level: 'multi',
    evidence: 'Ghurifiri and The Daily Star Bangla both attribute the hilsa-shaped sweet to Madaripur.',
  }),
  f('madaripur', {
    slug: 'khirpuri', nameEn: 'Madaripur Khirpuri', nameBn: 'মাদারীপুরের ক্ষীরপুরি',
    description: 'A lightly sweet milk-based sweet sold by a well-known local sweet shop.',
    category: 'sweets', association: 'Featured by The Daily Star Bangla as a Madaripur favourite.',
    sources: ['dsKhirpuri'], level: 'single',
    evidence: 'One newspaper feature; tied to a single shop.',
  }),
  f('madaripur', {
    slug: 'rasgolla', nameEn: 'Madaripur Rasgolla', nameBn: 'মাদারীপুরের রসগোল্লা',
    description: 'Chhana rasgolla, listed alongside date-palm gur for Madaripur.',
    category: 'sweets', association: 'Listed by Daily Bangladesh.',
    sources: [...DB_PAIR], level: 'single',
    evidence: 'Only the Daily Bangladesh list. Ghure Dekha mentions milk sweets generally.',
  }),

  f('manikganj', {
    slug: 'hazari-gur', nameEn: 'Hazari Gur of Jhitka', nameBn: 'মানিকগঞ্জের হাজারী গুড়',
    description: 'A fine date-palm jaggery made in Jhitka for around two centuries.',
    category: 'produce', association: 'Registered Geographical Indication for Manikganj.',
    sources: ['dpdt', 'ghurifiri'], level: 'gi', gi: 64, locality: 'Jhitka, Harirampur upazila', season: 'Winter',
    evidence: 'DPDT GI register no. 64; Ghurifiri adds the Jhitka/Harirampur locality.',
  }),
  f('manikganj', {
    slug: 'teroshri-sweets', nameEn: 'Teroshri Chhana Sweets', nameBn: 'তেরশ্রীর মিষ্টি',
    description: 'Chhana sweets topped with mawa from a sweet maker in Teroshri bazar.',
    category: 'sweets', association: 'Ghurifiri describes it as a traditional Manikganj sweet.',
    sources: ['ghurifiri'], level: 'single', locality: 'Teroshri, Ghior upazila',
    evidence: 'Only Ghurifiri.',
  }),
  f('manikganj', {
    slug: 'ghol', nameEn: 'Manikganj Ghol', nameBn: 'মানিকগঞ্জের ঘোল',
    description: 'Buttermilk drink churned from yoghurt.',
    category: 'drinks', association: 'Ghure Dekha lists ghol for Manikganj.',
    sources: ['ghureDekha'], level: 'single',
    evidence: 'Only Ghure Dekha.',
  }),

  f('munshiganj', {
    slug: 'patkhir', nameEn: 'Munshiganj Patkhir', nameBn: 'মুন্সীগঞ্জের পাতক্ষীর',
    description: 'Milk reduced until thick and wrapped in banana leaf — a Bikrampur heritage sweet.',
    category: 'sweets', association: 'Registered Geographical Indication for Munshiganj.',
    sources: ['dpdt', 'dsJamurki', 'ghurifiri'], level: 'gi', gi: 52,
    evidence: 'DPDT GI register no. 52; reported by The Daily Star Bangla.',
    notes: 'Added during research — not in the original candidate list.',
  }),
  f('munshiganj', {
    slug: 'bhagyakul-sweets', nameEn: 'Bhagyakul Sweets', nameBn: 'ভাগ্যকুলের মিষ্টি',
    description: 'Sweets from the Bhagyakul area.',
    category: 'sweets', association: 'Listed by Daily Bangladesh.',
    sources: [...DB_PAIR], level: 'single', locality: 'Bhagyakul',
    evidence: 'Only the Daily Bangladesh list.',
  }),
  f('munshiganj', {
    slug: 'mawa-ilish', nameEn: 'Mawa Fried Hilsa', nameBn: 'মাওয়ার ইলিশ ভাজা',
    description: 'Freshly fried Padma hilsa served at the riverside eateries of Mawa.',
    category: 'fish', association: 'Ghure Dekha names Mawa’s fried hilsa.',
    sources: ['ghureDekha'], level: 'single', locality: 'Mawa',
    evidence: 'Only Ghure Dekha.',
  }),

  f('narayanganj', {
    slug: 'rasmalai', nameEn: 'Narayanganj Rasmalai', nameBn: 'নারায়ণগঞ্জের রসমালাই',
    description: 'Small chhana balls soaked in thickened sweet milk.',
    category: 'sweets', association: 'Listed by Daily Bangladesh.',
    sources: [...DB_PAIR], level: 'single',
    evidence: 'Only the Daily Bangladesh list. Rasmalai’s GI belongs to Cumilla.',
  }),
  f('narayanganj', {
    slug: 'sonargaon-sweets', nameEn: 'Sonargaon Sweets', nameBn: 'সোনারগাঁয়ের মিষ্টি',
    description: 'Sweets associated with historic Sonargaon.',
    category: 'sweets', association: 'Ghure Dekha lists Sonargaon’s sweets.',
    sources: ['ghureDekha'], level: 'single', locality: 'Sonargaon',
    evidence: 'Only Ghure Dekha; no specific named sweet.',
  }),

  f('narsingdi', {
    slug: 'amrita-sagar-kola', nameEn: 'Amrita Sagar Banana', nameBn: 'নরসিংদীর অমৃত সাগর কলা', alt: ['Sagor kola', 'সাগর কলা'],
    description: 'A sweet, fragrant banana variety grown in Narsingdi.',
    category: 'produce', association: 'Registered Geographical Indication for Narsingdi.',
    sources: ['dpdt', ...DB_PAIR], level: 'gi', gi: 27,
    evidence: 'DPDT GI register no. 27. Daily Bangladesh lists “sagar kola”.',
    notes: 'Name corrected from “Sagor Kola” to the registered name “Amrita Sagar”.',
  }),
  f('narsingdi', {
    slug: 'lotkon', nameEn: 'Narsingdi Lotkon', nameBn: 'নরসিংদীর লটকন', alt: ['Latkan', 'Burmese grape'],
    description: 'Clusters of small, sweet-sour yellow fruit that grow straight from the trunk.',
    category: 'produce', association: 'Registered Geographical Indication for Narsingdi.',
    sources: ['dpdt', 'dsJamurki'], level: 'gi', gi: 32, season: 'Monsoon',
    evidence: 'DPDT GI register no. 32; reported by The Daily Star Bangla.',
  }),

  f('rajbari', {
    slug: 'kheer-chomchom', nameEn: 'Rajbari Kheer Chomchom', nameBn: 'রাজবাড়ীর ক্ষীর চমচম',
    description: 'Chomchom coated in a thick layer of kheer made from milk mawa.',
    category: 'sweets', association: 'The sweet traders and reporters most associate with Rajbari town.',
    sources: ['ghurifiri', 'bdnRajbari', ...DB_PAIR], level: 'multi',
    evidence: 'bdnews24 reports Rajbari is known for kheer chomchom; Ghurifiri agrees; Daily Bangladesh lists chomchom.',
  }),
  f('rajbari', {
    slug: 'goalanda-chicken', nameEn: 'Goalanda Steamer Chicken Curry', nameBn: 'গোয়ালন্দের মুরগির ঝোল',
    description: 'Red, fiery chicken curry once cooked by steamer crews at Goalanda ghat.',
    category: 'meat', association: 'A Padma steamer-era dish named after Goalanda.',
    sources: ['ghurifiri'], level: 'single', locality: 'Goalanda',
    evidence: 'Only Ghurifiri in this research pass.',
  }),
  f('rajbari', {
    slug: 'khejur-gur', nameEn: 'Rajbari Date-Palm Jaggery', nameBn: 'রাজবাড়ীর খেজুরের গুড়',
    description: 'Winter date-palm gur.',
    category: 'produce', association: 'Listed by Daily Bangladesh.',
    sources: [...DB_PAIR], level: 'single', season: 'Winter',
    evidence: 'Only the Daily Bangladesh list.',
  }),

  f('shariatpur', {
    slug: 'bibikhana-pitha', nameEn: 'Bibikhana Pitha', nameBn: 'বিবিখানা পিঠা',
    description: 'A rich baked rice-flour cake made with eggs, milk and molasses.',
    category: 'pitha', association: 'Daily Bangladesh calls it Shariatpur’s famous pitha.',
    sources: [...DB_PAIR], level: 'single',
    evidence: 'Only the Daily Bangladesh list. Bibikhana is made in many districts.',
  }),
  f('shariatpur', {
    slug: 'padma-ilish', nameEn: 'Padma Hilsa', nameBn: 'পদ্মার ইলিশ',
    description: 'Padma hilsa, steamed (bhapa) or cooked in mustard.',
    category: 'fish', association: 'Ghure Dekha lists Padma hilsa for Shariatpur.',
    sources: ['ghureDekha'], level: 'single',
    evidence: 'Only Ghure Dekha. Hilsa’s GI is national (“Bangladesh Ilish”), not district-specific.',
  }),

  f('tangail', {
    slug: 'porabari-chomchom', nameEn: 'Porabari Chomchom', nameBn: 'পোড়াবাড়ির চমচম',
    description: 'Reddish-brown, oval chomchom with a juicy centre.',
    category: 'sweets', association: 'Registered Geographical Indication for Tangail.',
    sources: ['dpdt', ...DB_PAIR, 'ghureDekha', 'ghurifiri'], level: 'gi', gi: 19, locality: 'Porabari',
    evidence: 'DPDT GI register no. 19; all four starting sources agree.',
  }),
  f('tangail', {
    slug: 'jamurki-sandesh', nameEn: 'Jamurki Sandesh', nameBn: 'জামুর্কির সন্দেশ',
    description: 'Fragrant sandesh from Jamurki village, made by the same family for generations.',
    category: 'sweets', association: 'Registered Geographical Indication for Tangail.',
    sources: ['dpdt', 'dsJamurki', 'ghurifiri'], level: 'gi', gi: 54, locality: 'Jamurki, Mirzapur upazila',
    evidence: 'DPDT GI register no. 54; reported by The Daily Star Bangla.',
  }),
  f('tangail', {
    slug: 'madhupur-pineapple', nameEn: 'Madhupur Pineapple', nameBn: 'মধুপুরের আনারস',
    description: 'Sweet pineapple from the red-soil Madhupur tract.',
    category: 'produce', association: 'Registered Geographical Indication for Tangail.',
    sources: ['dpdt'], level: 'gi', gi: 33, locality: 'Madhupur upazila', season: 'Summer',
    evidence: 'DPDT GI register no. 33.',
  }),

  /* ─────────────────────── CHATTOGRAM DIVISION ─────────────────────── */
  f('bandarban', {
    slug: 'mundi', nameEn: 'Mundi (Marma Rice Noodles)', nameBn: 'মুন্ডি',
    description: 'Rice noodles eaten with hot water, tamarind sourness and a dried-shrimp paste.',
    category: 'indigenous', association: 'A Marma favourite sold at hill-food shops in Bandarban.',
    sources: ['ghurifiri'], level: 'single',
    evidence: 'Only Ghurifiri in this pass.',
  }),
  f('bandarban', {
    slug: 'bamboo-cooked-food', nameEn: 'Bamboo-Cooked Hill Food', nameBn: 'বাঁশে রান্না পাহাড়ি খাবার',
    description: 'Rice, meat or vegetables cooked inside green bamboo tubes over fire.',
    category: 'indigenous', association: 'Ghure Dekha highlights bamboo biryani and hill bhorta.',
    sources: ['ghureDekha'], level: 'single',
    evidence: 'Only Ghure Dekha. Daily Bangladesh lists non-food items (hill juice, tobacco).',
  }),

  f('brahmanbaria', {
    slug: 'chhanamukhi', nameEn: 'Chhanamukhi', nameBn: 'ব্রাহ্মণবাড়িয়ার ছানামুখী',
    description: 'Small, firm cubes of chhana with a crust of set sugar.',
    category: 'sweets', association: 'Registered Geographical Indication for Brahmanbaria.',
    sources: ['dpdt', 'dsChhanamukhi', ...DB_PAIR, 'ghurifiri'], level: 'gi', gi: 41,
    evidence: 'DPDT GI register no. 41; confirmed by The Daily Star.',
  }),
  f('brahmanbaria', {
    slug: 'taler-bora', nameEn: 'Taler Bora', nameBn: 'তালের বড়া',
    description: 'Fritters made with ripe palmyra-palm pulp.',
    category: 'pitha', association: 'A seasonal sweet snack both lists attribute to Brahmanbaria.',
    sources: [...DB_PAIR, 'ghurifiri'], level: 'multi', season: 'Bhadra (palm season)',
    evidence: 'Daily Bangladesh and Ghurifiri.',
  }),

  f('chandpur', {
    slug: 'ilish-bhaja', nameEn: 'Chandpur Hilsa Fry', nameBn: 'চাঁদপুরের ইলিশ ভাজা',
    description: 'Hilsa fried fresh at the riverside fish market, with roe and curries.',
    category: 'fish', association: 'Chandpur’s Boro Station market sits near the Padma–Meghna confluence.',
    sources: [...DB_PAIR, 'ghureDekha', 'ghurifiri'], level: 'multi', locality: 'Boro Station, Chandpur Sadar',
    evidence: 'All starting sources name Chandpur hilsa. Note: the hilsa GI is national.',
  }),
  f('chandpur', {
    slug: 'one-minute-ice-cream', nameEn: 'One Minute Ice Cream', nameBn: 'ওয়ান মিনিট আইসক্রিম',
    description: 'A locally made ice cream that visitors try after a hilsa meal.',
    category: 'street', association: 'Ghurifiri calls it part of a Chandpur visit.',
    sources: ['ghurifiri'], level: 'single',
    evidence: 'Only Ghurifiri.',
  }),

  f('chattogram', {
    slug: 'mezbani-beef', nameEn: 'Mezbani Beef', nameBn: 'মেজবানি গরুর মাংস',
    description: 'Deeply spiced beef cooked in huge pots for the mezban community feast.',
    category: 'meat', association: 'The best-known food tradition of greater Chattogram.',
    sources: [...DB_PAIR, 'ghureDekha', 'ghurifiri'], level: 'multi',
    evidence: 'All starting sources agree.',
  }),
  f('chattogram', {
    slug: 'shutki', nameEn: 'Chattogram Shutki', nameBn: 'চট্টগ্রামের শুঁটকি',
    description: 'Sun-dried sea fish cooked as bhuna or bhorta.',
    category: 'fish', association: 'Listed for Chattogram by two independent lists.',
    sources: [...DB_PAIR, 'ghureDekha'], level: 'multi',
    evidence: 'Daily Bangladesh and Ghure Dekha.',
  }),
  f('chattogram', {
    slug: 'kala-bhuna', nameEn: 'Kala Bhuna', nameBn: 'কালা ভুনা',
    description: 'Beef or mutton slow-fried with spices until almost black.',
    category: 'meat', association: 'Ghurifiri identifies it as a Chattogram dish.',
    sources: ['ghurifiri'], level: 'single',
    evidence: 'Only Ghurifiri in this pass.',
  }),

  f('coxs-bazar', {
    slug: 'nazirartek-shutki', nameEn: 'Nazirartek Shutki', nameBn: 'নাজিরারটেকের শুঁটকি',
    description: 'Sea fish dried on bamboo racks at one of the country’s largest drying yards.',
    category: 'fish', association: 'Nazirartek, beside Cox’s Bazar town, is a major dried-fish centre.',
    sources: ['ghureDekha', 'ghurifiri'], level: 'multi', locality: 'Nazirartek', season: 'November–April',
    evidence: 'Ghure Dekha and Ghurifiri.',
  }),
  f('coxs-bazar', {
    slug: 'loitta-churi-fry', nameEn: 'Loitta & Churi Fry', nameBn: 'লইট্টা ও ছুরি মাছ ভাজা',
    description: 'Crisp-fried Bombay duck and ribbonfish.',
    category: 'fish', association: 'Ghure Dekha lists these for Cox’s Bazar.',
    sources: ['ghureDekha'], level: 'single',
    evidence: 'Only Ghure Dekha.',
  }),

  f('cumilla', {
    slug: 'rasmalai', nameEn: 'Cumilla Rasmalai', nameBn: 'কুমিল্লার রসমালাই', alt: ['Matribhandar rasmalai'],
    description: 'Tiny chhana balls in thickened, sweetened milk.',
    category: 'sweets', association: 'Registered Geographical Indication for Cumilla.',
    sources: ['dpdt', ...DB_PAIR, 'ghureDekha', 'ghurifiri'], level: 'gi', gi: 20,
    evidence: 'DPDT GI register no. 20; all starting sources agree.',
  }),
  f('cumilla', {
    slug: 'green-chilli-rasgolla', nameEn: 'Green Chilli Rasgolla', nameBn: 'কাঁচামরিচের রসগোল্লা',
    description: 'A recent sweet-and-spicy rasgolla created by a Cumilla bakery.',
    category: 'sweets', association: 'A modern local creation, not a heritage sweet.',
    sources: ['ghurifiri'], level: 'single',
    evidence: 'Only Ghurifiri.',
  }),

  f('feni', {
    slug: 'khandaler-mishti', nameEn: 'Khandaler Mishti', nameBn: 'খণ্ডলের মিষ্টি',
    description: 'A rasgolla-style sweet that originated in Khandal.',
    category: 'sweets', association: 'Known across Feni by its village name.',
    sources: [...DB_PAIR, 'ghurifiri'], level: 'multi', locality: 'Khandal, Parshuram',
    evidence: 'Daily Bangladesh and Ghurifiri.',
  }),
  f('feni', {
    slug: 'buffalo-ghee', nameEn: 'Feni Buffalo-Milk Ghee', nameBn: 'ফেনীর মহিষের দুধের ঘি',
    description: 'Ghee clarified from buffalo milk.',
    category: 'dairy', association: 'Listed by Daily Bangladesh.',
    sources: [...DB_PAIR], level: 'single',
    evidence: 'Only the Daily Bangladesh list.',
  }),
  f('feni', {
    slug: 'jalalia-singara', nameEn: 'Jalalia Singara', nameBn: 'জালালিয়ার শিঙাড়া',
    description: 'Crisp singara from a hotel opened in 1945 near Rajajhir Dighi.',
    category: 'street', association: 'A decades-old evening snack spot in Feni town.',
    sources: ['ghurifiri'], level: 'single', locality: 'Feni Sadar',
    evidence: 'Only Ghurifiri.',
  }),

  f('khagrachhari', {
    slug: 'bamboo-cooked-food', nameEn: 'Bamboo-Tube Hill Cooking', nameBn: 'বাঁশের চোঙে রান্না',
    description: 'Meat, fish or vegetables steamed inside bamboo, with Indigenous bhorta.',
    category: 'indigenous', association: 'Ghure Dekha lists hill food cooked in bamboo for Khagrachhari.',
    sources: ['ghureDekha'], level: 'single',
    evidence: 'Only Ghure Dekha. Daily Bangladesh lists turmeric.',
  }),
  f('khagrachhari', {
    slug: 'hill-turmeric', nameEn: 'Khagrachhari Turmeric', nameBn: 'খাগড়াছড়ির হলুদ',
    description: 'Hill-grown turmeric.',
    category: 'produce', association: 'Listed by Daily Bangladesh.',
    sources: [...DB_PAIR], level: 'single',
    evidence: 'Only the Daily Bangladesh list. A spice crop rather than a dish.',
  }),

  f('lakshmipur', {
    slug: 'meghna-ilish', nameEn: 'Meghna Hilsa', nameBn: 'মেঘনার ইলিশ',
    description: 'Hilsa and other river fish from the Meghna.',
    category: 'fish', association: 'Ghure Dekha lists Lakshmipur’s hilsa and Meghna fish.',
    sources: ['ghureDekha'], level: 'single',
    evidence: 'Only Ghure Dekha.',
  }),
  f('lakshmipur', {
    slug: 'coconut-supari', nameEn: 'Lakshmipur Coconut & Supari', nameBn: 'লক্ষ্মীপুরের নারিকেল ও সুপারি',
    description: 'Coconut and areca nut, two major crops of the district.',
    category: 'produce', association: 'Listed by Daily Bangladesh / Desh TV.',
    sources: [...DB_PAIR], level: 'single',
    evidence: 'Only the Daily Bangladesh list. Crops, not prepared foods.',
  }),

  f('noakhali', {
    slug: 'kholajali-pitha', nameEn: 'Kholajali Pitha', nameBn: 'খোলাজালি পিঠা', alt: ['Kholaja pitha', 'খোলাজা পিঠা'],
    description: 'Lacy rice-and-egg pancake cooked on a clay pan, eaten with curry or date-palm gur.',
    category: 'pitha', association: 'A Noakhali pitha (local name “kholajali hida”).',
    sources: [...DB_PAIR, 'ghurifiri'], level: 'multi',
    evidence: 'Daily Bangladesh and Ghurifiri.',
    notes: 'Spelling standardised to “Kholajali”; “Kholaja” kept as an alternate.',
  }),
  f('noakhali', {
    slug: 'buffalo-doi', nameEn: 'Noakhali Buffalo-Milk Doi', nameBn: 'নোয়াখালীর মহিষের দুধের দই',
    description: 'Yoghurt set from raw buffalo milk from the chars.',
    category: 'dairy', association: 'Linked to buffalo herds of Subarnachar.',
    sources: ['ghurifiri', 'paGiPending'], level: 'multi', locality: 'Subarnachar',
    evidence: 'Ghurifiri; Prothom Alo names it among GI applications in process.',
  }),
  f('noakhali', {
    slug: 'narikel-naru', nameEn: 'Narikel Naru', nameBn: 'নারকেল নাড়ু',
    description: 'Grated coconut cooked with sugar or gur and rolled into balls.',
    category: 'sweets', association: 'Listed by Daily Bangladesh.',
    sources: [...DB_PAIR], level: 'single',
    evidence: 'Only the Daily Bangladesh list. Made across Bangladesh.',
  }),

  f('rangamati', {
    slug: 'hebang', nameEn: 'Hebang (Chakma Steamed Dishes)', nameBn: 'হেবাং',
    description: 'Chakma method of steaming fish, meat or vegetables in banana leaf or bamboo.',
    category: 'indigenous', association: 'Chakma cooking associated with Rangamati.',
    sources: ['ghurifiri'], level: 'single',
    evidence: 'Only Ghurifiri.',
  }),
  f('rangamati', {
    slug: 'kaptai-fish', nameEn: 'Kaptai Lake Fish', nameBn: 'কাপ্তাই লেকের মাছ',
    description: 'Fish from Kaptai Lake.',
    category: 'fish', association: 'Ghure Dekha lists fish from Kaptai.',
    sources: ['ghureDekha'], level: 'single', locality: 'Kaptai Lake',
    evidence: 'Only Ghure Dekha.',
  }),
  f('rangamati', {
    slug: 'pineapple', nameEn: 'Rangamati Pineapple', nameBn: 'রাঙামাটির আনারস',
    description: 'Hill pineapple, along with jackfruit and banana.',
    category: 'produce', association: 'Listed by Daily Bangladesh.',
    sources: [...DB_PAIR], level: 'single',
    evidence: 'Only the Daily Bangladesh list.',
  }),

  /* ──────────────────────── RAJSHAHI DIVISION ──────────────────────── */
  f('bogura', {
    slug: 'doi', nameEn: 'Bogura Doi', nameBn: 'বগুড়ার দই',
    description: 'Thick sweet yoghurt set in clay pots (sorar doi).',
    category: 'dairy', association: 'Registered Geographical Indication for Bogura.',
    sources: ['dpdt', ...DB_PAIR, 'ghureDekha', 'ghurifiri'], level: 'gi', gi: 13,
    evidence: 'DPDT GI register no. 13; all starting sources agree.',
    notes: 'Ghurifiri traces its origin to Sherpur upazila of Bogura.',
  }),
  f('bogura', {
    slug: 'kotkoti', nameEn: 'Mahasthan Kotkoti', nameBn: 'মহাস্থানের কটকটি',
    description: 'Dry, crunchy sweet bites sold around the Mahasthangarh archaeological site.',
    category: 'sweets', association: 'A take-home sweet from Mahasthangarh.',
    sources: ['ghureDekha', 'ghurifiri', 'dsKotkoti'], level: 'multi', locality: 'Mahasthangarh, Shibganj',
    evidence: 'Ghure Dekha, Ghurifiri and The Daily Star Bangla.',
  }),

  f('chapainawabganj', {
    slug: 'khirsapat-mango', nameEn: 'Khirsapat Mango', nameBn: 'চাঁপাইনবাবগঞ্জের খিরসাপাত আম', alt: ['Himsagar (Khirsapat)'],
    description: 'Fibre-less, honey-sweet mango of the Chapai belt.',
    category: 'produce', association: 'Registered Geographical Indication for Chapainawabganj.',
    sources: ['dpdt', ...DB_PAIR, 'ghureDekha'], level: 'gi', gi: 3, season: 'June',
    evidence: 'DPDT GI register no. 3.',
    notes: 'Langra (GI 15), Ashwina (GI 16) and Fazli (GI 10, shared with Rajshahi) are also registered.',
  }),
  f('chapainawabganj', {
    slug: 'kalai-ruti', nameEn: 'Kalai Ruti', nameBn: 'কালাই রুটি',
    description: 'Thick hand-slapped flatbread of black-gram and rice flour, eaten with chilli-onion bhorta.',
    category: 'street', association: 'Originates in Chapainawabganj; now popular in Rajshahi too.',
    sources: [...DB_PAIR, 'ghurifiri'], level: 'multi', season: 'Mostly winter',
    evidence: 'Daily Bangladesh and Ghurifiri.',
  }),
  f('chapainawabganj', {
    slug: 'shibganj-chomchom', nameEn: 'Shibganj Chomchom', nameBn: 'শিবগঞ্জের চমচম',
    description: 'Chomchom made in two sizes.',
    category: 'sweets', association: 'Named for Shibganj upazila.',
    sources: [...DB_PAIR, 'ghurifiri'], level: 'multi', locality: 'Shibganj upazila',
    evidence: 'Daily Bangladesh and Ghurifiri.',
  }),

  f('joypurhat', {
    slug: 'lotiraj-kochu', nameEn: 'Lotiraj Kochu', nameBn: 'জয়পুরহাটের লতিরাজ কচু',
    description: 'A taro variety grown for its edible stolons (loti).',
    category: 'produce', association: 'Registered Geographical Indication for Joypurhat.',
    sources: ['dpdt'], level: 'gi', gi: 63,
    evidence: 'DPDT GI register no. 63.',
  }),
  f('joypurhat', {
    slug: 'chotpoti', nameEn: 'Joypurhat Chotpoti', nameBn: 'জয়পুরহাটের চটপটি',
    description: 'Tangy chickpea-and-potato street snack.',
    category: 'street', association: 'Listed by Daily Bangladesh.',
    sources: [...DB_PAIR], level: 'single',
    evidence: 'Only the Daily Bangladesh list.',
  }),
  f('joypurhat', {
    slug: 'doi', nameEn: 'Joypurhat Doi', nameBn: 'জয়পুরহাটের দই',
    description: 'Local sweet yoghurt.',
    category: 'dairy', association: 'Listed by Ghure Dekha.',
    sources: ['ghureDekha'], level: 'single',
    evidence: 'Only Ghure Dekha.',
  }),

  f('naogaon', {
    slug: 'nak-fazli-mango', nameEn: 'Nak Fazli Mango', nameBn: 'নওগাঁর নাক ফজলী আম',
    description: 'A Fazli-type mango with a pronounced “nose”.',
    category: 'produce', association: 'Registered Geographical Indication for Naogaon.',
    sources: ['dpdt'], level: 'gi', gi: 53, locality: 'Badalgachhi upazila', season: 'Summer',
    evidence: 'DPDT GI register no. 53 (applicant: Badalgachhi Nak Fazli growers’ cooperative).',
  }),
  f('naogaon', {
    slug: 'para-sandesh', nameEn: 'Naogaon Para Sandesh', nameBn: 'নওগাঁর প্যারা সন্দেশ',
    description: 'Roll-shaped sandesh hand-shaped from milk kheer.',
    category: 'sweets', association: 'A Naogaon gift sweet for guests and good news.',
    sources: ['ghurifiri', ...DB_PAIR], level: 'multi',
    evidence: 'Ghurifiri names para sandesh; Daily Bangladesh lists Naogaon sandesh.',
  }),
  f('naogaon', {
    slug: 'rice', nameEn: 'Naogaon Rice', nameBn: 'নওগাঁর চাল',
    description: 'Rice from one of the country’s major rice-milling districts.',
    category: 'rice', association: 'Both lists name Naogaon’s rice.',
    sources: [...DB_PAIR, 'ghureDekha'], level: 'multi',
    evidence: 'Daily Bangladesh and Ghure Dekha. A staple, not a named variety.',
  }),

  f('natore', {
    slug: 'kachagolla', nameEn: 'Natore Kachagolla', nameBn: 'নাটোরের কাঁচাগোল্লা',
    description: 'Soft sweet made from fresh, uncooked chhana.',
    category: 'sweets', association: 'Registered Geographical Indication for Natore.',
    sources: ['dpdt', ...DB_PAIR, 'ghureDekha', 'ghurifiri'], level: 'gi', gi: 17,
    evidence: 'DPDT GI register no. 17; all starting sources agree.',
  }),
  f('natore', {
    slug: 'doi', nameEn: 'Natore Doi', nameBn: 'নাটোরের দই',
    description: 'Local yoghurt.',
    category: 'dairy', association: 'Listed by Ghure Dekha.',
    sources: ['ghureDekha'], level: 'single',
    evidence: 'Only Ghure Dekha.',
  }),

  f('pabna', {
    slug: 'ghee', nameEn: 'Pabna Ghee', nameBn: 'পাবনার ঘি',
    description: 'Ghee from the milk-rich Bera–Santhia belt, remembered in a popular saying.',
    category: 'dairy', association: 'Pabna’s dairy belt is famed for ghee.',
    sources: [...DB_PAIR, 'ghureDekha', 'ghurifiri'], level: 'multi',
    evidence: 'Daily Bangladesh, Ghure Dekha and Ghurifiri.',
  }),
  f('pabna', {
    slug: 'doi', nameEn: 'Pabna Doi', nameBn: 'পাবনার দই',
    description: 'Local yoghurt.',
    category: 'dairy', association: 'Listed by Ghure Dekha.',
    sources: ['ghureDekha'], level: 'single',
    evidence: 'Only Ghure Dekha.',
  }),

  f('rajshahi', {
    slug: 'fazli-mango', nameEn: 'Rajshahi Fazli Mango', nameBn: 'রাজশাহীর ফজলি আম',
    description: 'Large, late-season mango.',
    category: 'produce', association: 'Registered GI shared by Rajshahi and Chapainawabganj.',
    sources: ['dpdt', ...DB_PAIR, 'ghureDekha'], level: 'gi', gi: 10, season: 'July–August',
    evidence: 'DPDT GI register no. 10.',
  }),
  f('rajshahi', {
    slug: 'roshkadam', nameEn: 'Roshkadam', nameBn: 'রসকদম',
    description: 'Mawa-and-chhana balls rolled in tiny sugar pearls, like a kadam flower.',
    category: 'sweets', association: 'Ghurifiri lists it for the Rajshahi region.',
    sources: ['ghurifiri'], level: 'conflict',
    evidence: 'Ghurifiri attributes it to Rajshahi; Daily Bangladesh lists roshkadam for Meherpur.',
    notes: 'Conflict between Rajshahi and Meherpur.',
  }),
  f('rajshahi', {
    slug: 'beef-alu-ghati', nameEn: 'Beef Alu Ghati', nameBn: 'গরুর মাংসের আলু ঘাটি',
    description: 'Beef cooked thick with mashed potato.',
    category: 'meat', association: 'Popular in Rajshahi, Bogura and Naogaon.',
    sources: ['ghurifiri'], level: 'single',
    evidence: 'Only Ghurifiri.',
  }),

  f('sirajganj', {
    slug: 'panitoa', nameEn: 'Panitoa', nameBn: 'পানিতোয়া', alt: ['Pantua', 'পানতোয়া', 'Enayetpur pantoa'],
    description: 'Chhana fried in ghee and soaked in thin syrup.',
    category: 'sweets', association: 'A century-old tradition of Enayetpur on the Jamuna.',
    sources: [...DB_PAIR, 'ghurifiri'], level: 'multi', locality: 'Enayetpur',
    evidence: 'Daily Bangladesh and Ghurifiri.',
  }),
  f('sirajganj', {
    slug: 'doi', nameEn: 'Sirajganj Doi', nameBn: 'সিরাজগঞ্জের দই',
    description: 'Local yoghurt from the Jamuna dairy belt.',
    category: 'dairy', association: 'Listed by Ghure Dekha.',
    sources: ['ghureDekha'], level: 'single',
    evidence: 'Only Ghure Dekha.',
  }),

  /* ───────────────────────── KHULNA DIVISION ───────────────────────── */
  f('bagerhat', {
    slug: 'sundarbans-honey', nameEn: 'Sundarbans Honey', nameBn: 'সুন্দরবনের মধু',
    description: 'Wild honey collected by mouals in the Sundarbans mangrove.',
    category: 'produce', association: 'Registered GI; the applicant was the Bagerhat Deputy Commissioner.',
    sources: ['dpdt'], level: 'gi', gi: 43, season: 'April–June',
    evidence: 'DPDT GI register no. 43.',
    notes: 'The Sundarbans also span Khulna and Satkhira.',
  }),
  f('bagerhat', {
    slug: 'chuijhal-meat', nameEn: 'Chuijhal Meat', nameBn: 'চুইঝাল মাংস',
    description: 'Meat cooked with chui vine stems for a warm, aromatic heat.',
    category: 'meat', association: 'Ghure Dekha lists chuijhal meat for Bagerhat.',
    sources: ['ghureDekha'], level: 'single',
    evidence: 'Only Ghure Dekha for Bagerhat (Khulna’s version is better documented).',
  }),
  f('bagerhat', {
    slug: 'dublar-char-shutki', nameEn: 'Dublar Char Shutki', nameBn: 'দুবলার চরের শুঁটকি',
    description: 'Sea fish dried by fishers on Dublar Char in winter.',
    category: 'fish', association: 'Ghurifiri lists it for Bagerhat.',
    sources: ['ghurifiri'], level: 'single', locality: 'Dublar Char', season: 'Winter',
    evidence: 'Only Ghurifiri.',
  }),

  f('chuadanga', {
    slug: 'khejur-gur', nameEn: 'Sarojganj Date-Palm Gur', nameBn: 'সরোজগঞ্জের খেজুরের গুড়',
    description: 'Date-palm jaggery traded at a large seasonal gur market.',
    category: 'produce', association: 'Ghurifiri describes Sarojganj’s large twice-weekly gur haat.',
    sources: ['ghurifiri', 'ghureDekha'], level: 'multi', locality: 'Sarojganj, Chuadanga Sadar', season: 'December–March',
    evidence: 'Ghurifiri and Ghure Dekha.',
  }),
  f('chuadanga', {
    slug: 'maize', nameEn: 'Chuadanga Maize', nameBn: 'চুয়াডাঙ্গার ভুট্টা',
    description: 'Maize, a major local crop.',
    category: 'produce', association: 'Both lists name maize for Chuadanga.',
    sources: [...DB_PAIR, 'ghureDekha'], level: 'multi',
    evidence: 'Daily Bangladesh and Ghure Dekha. A crop rather than a dish.',
  }),

  f('jashore', {
    slug: 'khejur-gur', nameEn: 'Jashore Date-Palm Gur', nameBn: 'যশোরের খেজুরের গুড়', alt: ['Nolen gur', 'Patali'],
    description: 'Winter nolen gur and patali made from fresh date-palm sap.',
    category: 'produce', association: 'Registered Geographical Indication for Jashore.',
    sources: ['dpdt', ...DB_PAIR, 'ghureDekha', 'ghurifiri'], level: 'gi', gi: 26, season: 'Poush–Magh',
    evidence: 'DPDT GI register no. 26 (applicant: UNO, Chougachha).',
  }),
  f('jashore', {
    slug: 'jamtala-sweets', nameEn: 'Jamtala Sweets', nameBn: 'জামতলার মিষ্টি',
    description: 'Sweets from Jamtala.',
    category: 'sweets', association: 'Both lists name Jamtala’s sweets.',
    sources: [...DB_PAIR, 'ghureDekha'], level: 'multi', locality: 'Jamtala',
    evidence: 'Daily Bangladesh and Ghure Dekha.',
  }),
  f('jashore', {
    slug: 'khoi', nameEn: 'Jashore Khoi', nameBn: 'যশোরের খই',
    description: 'Puffed paddy.',
    category: 'other', association: 'Listed by Daily Bangladesh.',
    sources: [...DB_PAIR], level: 'single',
    evidence: 'Only the Daily Bangladesh list.',
  }),

  f('jhenaidah', {
    slug: 'kaliganj-langcha', nameEn: 'Kaliganj Langcha', nameBn: 'কালীগঞ্জের ল্যাংচা',
    description: 'Elongated fried chhana sweet in syrup that sells out by midday.',
    category: 'sweets', association: 'Kaliganj’s signature sweet.',
    sources: ['ghurifiri', 'paGiPending'], level: 'multi', locality: 'Kaliganj upazila',
    evidence: 'Ghurifiri; Prothom Alo lists it among GI applications in process.',
  }),
  f('jhenaidah', {
    slug: 'khejur-gur', nameEn: 'Jhenaidah Date-Palm Gur', nameBn: 'ঝিনাইদহের খেজুরের গুড়',
    description: 'Winter gur and patali from Kotchandpur, Maheshpur and Kaliganj.',
    category: 'produce', association: 'Gur is produced across most upazilas.',
    sources: ['ghurifiri', 'ghureDekha'], level: 'multi', season: 'Winter',
    evidence: 'Ghurifiri and Ghure Dekha.',
  }),
  f('jhenaidah', {
    slug: 'chhanar-jilapi', nameEn: 'Jhenaidah Chhanar Jilapi', nameBn: 'ঝিনাইদহের ছানার জিলাপি',
    description: 'Chhana jilapi.',
    category: 'sweets', association: 'Listed by Ghure Dekha.',
    sources: ['ghureDekha'], level: 'single',
    evidence: 'Only Ghure Dekha.',
  }),

  f('khulna', {
    slug: 'chuijhal-mutton', nameEn: 'Chuijhal Mutton', nameBn: 'চুইঝাল খাসির মাংস',
    description: 'Mutton cooked with chui vine — hot but fragrant rather than fierce.',
    category: 'meat', association: 'Chuknagar’s roadside hotels made it nationally known.',
    sources: ['ghureDekha', 'ghurifiri'], level: 'multi', locality: 'Chuknagar, Dumuria',
    evidence: 'Ghure Dekha and Ghurifiri.',
  }),
  f('khulna', {
    slug: 'golda-chingri', nameEn: 'Khulna Golda Prawn', nameBn: 'খুলনার গলদা চিংড়ি', alt: ['Rupsha prawns'],
    description: 'Giant freshwater prawns, often cooked as malaikari.',
    category: 'fish', association: 'Khulna’s prawn farming belt.',
    sources: [...DB_PAIR, 'ghureDekha'], level: 'multi',
    evidence: 'Daily Bangladesh (golda chingri) and Ghure Dekha (Rupsha prawns).',
    notes: 'The bagda shrimp GI (no. 11) is registered nationally, not to Khulna.',
  }),

  f('kushtia', {
    slug: 'tiler-khaja', nameEn: 'Kushtia Tiler Khaja', nameBn: 'কুষ্টিয়ার তিলের খাজা',
    description: 'Crisp sesame-and-sugar sweet, a favourite at the Lalon fair.',
    category: 'sweets', association: 'Registered Geographical Indication for Kushtia.',
    sources: ['dpdt', ...DB_PAIR, 'ghureDekha', 'ghurifiri'], level: 'gi', gi: 21,
    evidence: 'DPDT GI register no. 21; all starting sources agree.',
  }),
  f('kushtia', {
    slug: 'kulfi-malai', nameEn: 'Kushtia Kulfi Malai', nameBn: 'কুষ্টিয়ার কুলফি মালাই',
    description: 'Dense milk ice cream.',
    category: 'sweets', association: 'Listed by Ghure Dekha.',
    sources: ['ghureDekha'], level: 'single',
    evidence: 'Only Ghure Dekha.',
  }),

  f('magura', {
    slug: 'hazrapuri-lychee', nameEn: 'Hazrapuri Lychee', nameBn: 'মাগুরার হাজরাপুরী লিচু',
    description: 'A lychee variety from Magura.',
    category: 'produce', association: 'Registered Geographical Indication for Magura.',
    sources: ['dpdt'], level: 'gi', gi: 35, season: 'May–June',
    evidence: 'DPDT GI register no. 35.',
    notes: 'Added during research — not in the original candidate list.',
  }),
  f('magura', {
    slug: 'kumror-bori', nameEn: 'Kumror Bori', nameBn: 'কুমড়োর বড়ি',
    description: 'Sun-dried lentil-and-pumpkin dumplings used in curries.',
    category: 'other', association: 'Listed by Ghure Dekha.',
    sources: ['ghureDekha'], level: 'single',
    evidence: 'Only Ghure Dekha.',
  }),
  f('magura', {
    slug: 'rasmalai', nameEn: 'Magura Rasmalai', nameBn: 'মাগুরার রসমালাই',
    description: 'Rasmalai.',
    category: 'sweets', association: 'Listed by Daily Bangladesh.',
    sources: [...DB_PAIR], level: 'single',
    evidence: 'Only the Daily Bangladesh list.',
  }),

  f('meherpur', {
    slug: 'sabitri', nameEn: 'Meherpur Sabitri Mishti', nameBn: 'মেহেরপুরের সাবিত্রী মিষ্টি',
    description: 'A dense, dark milk sweet that keeps for days.',
    category: 'sweets', association: 'Registered Geographical Indication for Meherpur.',
    sources: ['dpdt', ...DB_PAIR, 'ghureDekha'], level: 'gi', gi: 61,
    evidence: 'DPDT GI register no. 61.',
  }),
  f('meherpur', {
    slug: 'himsagar-mango', nameEn: 'Meherpur Himsagar Mango', nameBn: 'মেহেরপুরের হিমসাগর আম',
    description: 'Fragrant, fibre-less early-summer mango.',
    category: 'produce', association: 'Registered Geographical Indication for Meherpur.',
    sources: ['dpdt', 'ghureDekha'], level: 'gi', gi: 59, season: 'June',
    evidence: 'DPDT GI register no. 59.',
  }),
  f('meherpur', {
    slug: 'mehersagar-banana', nameEn: 'Mehersagar Banana', nameBn: 'মেহেরপুরের মেহেরসাগর কলা',
    description: 'A banana variety grown in Meherpur.',
    category: 'produce', association: 'Registered Geographical Indication for Meherpur.',
    sources: ['dpdt'], level: 'gi', gi: 56,
    evidence: 'DPDT GI register no. 56.',
  }),

  f('narail', {
    slug: 'pera-sandesh', nameEn: 'Narail Pera Sandesh', nameBn: 'নড়াইলের পেড়ো সন্দেশ', alt: ['Pyara sandesh', 'প্যাড়া সন্দেশ'],
    description: 'Fudge-like milk sandesh.',
    category: 'sweets', association: 'Named by both lists for Narail.',
    sources: [...DB_PAIR, 'ghureDekha'], level: 'multi',
    evidence: 'Daily Bangladesh and Ghure Dekha.',
  }),
  f('narail', {
    slug: 'patali', nameEn: 'Narail Date-Palm Patali', nameBn: 'নড়াইলের খেজুরের পাটালি', alt: ['Nolini patali'],
    description: 'Hard-set date-palm jaggery; the best grade is called nolini.',
    category: 'produce', association: 'Sold at winter haats around Narail.',
    sources: [...DB_PAIR, 'ghureDekha', 'ghurifiri'], level: 'multi', season: 'Winter',
    evidence: 'Daily Bangladesh, Ghure Dekha and Ghurifiri.',
  }),

  f('satkhira', {
    slug: 'sandesh', nameEn: 'Satkhira Sandesh', nameBn: 'সাতক্ষীরার সন্দেশ',
    description: 'Milk sandesh; Ghurifiri highlights a four-generation tradition in Kalaroa.',
    category: 'sweets', association: 'All three lists name Satkhira’s sandesh.',
    sources: [...DB_PAIR, 'ghureDekha', 'ghurifiri'], level: 'multi', locality: 'Kalaroa (per Ghurifiri)',
    evidence: 'Daily Bangladesh, Ghure Dekha and Ghurifiri.',
  }),
  f('satkhira', {
    slug: 'prawns', nameEn: 'Satkhira Prawns', nameBn: 'সাতক্ষীরার চিংড়ি',
    description: 'Farmed prawns from the coastal belt.',
    category: 'fish', association: 'Listed by Ghure Dekha.',
    sources: ['ghureDekha'], level: 'single',
    evidence: 'Only Ghure Dekha.',
  }),
  f('satkhira', {
    slug: 'honey', nameEn: 'Satkhira Honey', nameBn: 'সাতক্ষীরার মধু',
    description: 'Honey from the Sundarbans fringe.',
    category: 'produce', association: 'Listed by Ghure Dekha.',
    sources: ['ghureDekha'], level: 'single',
    evidence: 'Only Ghure Dekha. The Sundarbans honey GI was filed by Bagerhat.',
  }),

  /* ──────────────────────── BARISHAL DIVISION ──────────────────────── */
  f('barguna', {
    slug: 'home-pitha', nameEn: 'Barguna Home-Style Pitha', nameBn: 'বরগুনার পিঠা', alt: ['Chaba pitha', 'Chuiya pitha', 'Muitta pitha'],
    description: 'Chaba, chuiya and muitta pitha and allan from Barguna kitchens.',
    category: 'pitha', association: 'Both lists name the same set of Barguna pitha.',
    sources: [...DB_PAIR, 'ghurifiri'], level: 'multi',
    evidence: 'Daily Bangladesh and Ghurifiri.',
  }),
  f('barguna', {
    slug: 'patharghata-sea-fish', nameEn: 'Patharghata Sea Fish & Shutki', nameBn: 'পাথরঘাটার সামুদ্রিক মাছ ও শুঁটকি',
    description: 'Sea fish and dried fish landed at Patharghata.',
    category: 'fish', association: 'Listed by Ghure Dekha.',
    sources: ['ghureDekha'], level: 'single', locality: 'Patharghata',
    evidence: 'Only Ghure Dekha.',
  }),

  f('barishal', {
    slug: 'amra', nameEn: 'Barishal Amra', nameBn: 'বরিশালের আমড়া', alt: ['Hog plum'],
    description: 'Sour-sweet hog plum, eaten fresh with salt and chilli or pickled.',
    category: 'produce', association: 'Registered Geographical Indication for Barishal.',
    sources: ['dpdt', ...DB_PAIR, 'ghureDekha'], level: 'gi', gi: 49,
    evidence: 'DPDT GI register no. 49.',
  }),
  f('barishal', {
    slug: 'guthia-sandesh', nameEn: 'Guthia Sandesh', nameBn: 'গুঠিয়ার সন্দেশ',
    description: 'Sandesh sold at Guthia bandar shops.',
    category: 'sweets', association: 'Listed by Ghurifiri.',
    sources: ['ghurifiri'], level: 'single', locality: 'Guthia',
    evidence: 'Only Ghurifiri.',
  }),
  f('barishal', {
    slug: 'amitti', nameEn: 'Amitti', nameBn: 'আমিত্তি',
    description: 'Jilapi-like coiled sweet in syrup.',
    category: 'sweets', association: 'Ghurifiri says its origin is believed to be Barishal.',
    sources: ['ghurifiri'], level: 'single',
    evidence: 'Only Ghurifiri.',
  }),

  f('bhola', {
    slug: 'buffalo-doi', nameEn: 'Bhola Buffalo-Milk Doi', nameBn: 'ভোলার মহিষের দুধের কাঁচা দই',
    description: 'Sour-sweet yoghurt set from unboiled char buffalo milk in clay pots.',
    category: 'dairy', association: 'Registered Geographical Indication for Bhola.',
    sources: ['dpdt', 'ghureDekha', 'ghurifiri'], level: 'gi', gi: 34,
    evidence: 'DPDT GI register no. 34.',
  }),
  f('bhola', {
    slug: 'meghna-ilish', nameEn: 'Bhola Meghna Hilsa', nameBn: 'ভোলার মেঘনার ইলিশ',
    description: 'Hilsa from the lower Meghna.',
    category: 'fish', association: 'Listed by Ghure Dekha.',
    sources: ['ghureDekha'], level: 'single',
    evidence: 'Only Ghure Dekha.',
  }),

  f('jhalokathi', {
    slug: 'guava', nameEn: 'Jhalokathi Guava', nameBn: 'ঝালকাঠির পেয়ারা',
    description: 'Guava from the canal-side orchards of the region.',
    category: 'produce', association: 'Listed by Ghure Dekha.',
    sources: ['ghureDekha'], level: 'single',
    evidence: 'Only Ghure Dekha. Daily Bangladesh lists “ata” instead.',
  }),
  f('jhalokathi', {
    slug: 'rasgolla', nameEn: 'Jhalokathi Rasgolla', nameBn: 'ঝালকাঠির রসগোল্লা',
    description: 'A century-old rasgolla tradition remembered in folk songs.',
    category: 'sweets', association: 'Listed by Ghurifiri.',
    sources: ['ghurifiri'], level: 'single',
    evidence: 'Only Ghurifiri.',
  }),

  f('patuakhali', {
    slug: 'kuakata-crab', nameEn: 'Kuakata Crab Fry', nameBn: 'কুয়াকাটার কাঁকড়া ভাজা',
    description: 'Fried crab from the Kuakata beach stalls.',
    category: 'fish', association: 'Listed by Ghure Dekha.',
    sources: ['ghureDekha'], level: 'single', locality: 'Kuakata',
    evidence: 'Only Ghure Dekha.',
  }),
  f('patuakhali', {
    slug: 'buffalo-doi', nameEn: 'Patuakhali Buffalo-Milk Doi', nameBn: 'পটুয়াখালীর মহিষের দই',
    description: 'Buffalo-milk yoghurt.',
    category: 'dairy', association: 'Listed by Daily Bangladesh.',
    sources: [...DB_PAIR], level: 'single',
    evidence: 'Only the Daily Bangladesh list.',
  }),
  f('patuakhali', {
    slug: 'rakhine-food', nameEn: 'Rakhine Food', nameBn: 'রাখাইন খাবার',
    description: 'Food traditions of the Rakhine community around Kuakata.',
    category: 'indigenous', association: 'Listed by Ghure Dekha.',
    sources: ['ghureDekha'], level: 'single', locality: 'Kuakata area',
    evidence: 'Only Ghure Dekha; no specific dish named.',
  }),

  f('pirojpur', {
    slug: 'guava', nameEn: 'Pirojpur Guava', nameBn: 'পিরোজপুরের পেয়ারা',
    description: 'Guava from the orchards of Pirojpur.',
    category: 'produce', association: 'Named by both lists.',
    sources: [...DB_PAIR, 'ghureDekha'], level: 'multi', season: 'Monsoon',
    evidence: 'Daily Bangladesh and Ghure Dekha.',
  }),
  f('pirojpur', {
    slug: 'amra', nameEn: 'Pirojpur Amra', nameBn: 'পিরোজপুরের আমড়া',
    description: 'Hog plum.',
    category: 'produce', association: 'Named by both lists.',
    sources: [...DB_PAIR, 'ghureDekha'], level: 'multi',
    evidence: 'Daily Bangladesh and Ghure Dekha. The amra GI is registered to Barishal.',
  }),
  f('pirojpur', {
    slug: 'coconut-sweets', nameEn: 'Pirojpur Coconut Sweets', nameBn: 'পিরোজপুরের নারকেলের মিষ্টি',
    description: 'Coconut-based sweets.',
    category: 'sweets', association: 'Listed by Ghure Dekha.',
    sources: ['ghureDekha'], level: 'single',
    evidence: 'Only Ghure Dekha.',
  }),

  /* ───────────────────────── SYLHET DIVISION ───────────────────────── */
  f('habiganj', {
    slug: 'tea', nameEn: 'Habiganj Tea', nameBn: 'হবিগঞ্জের চা',
    description: 'Tea from the district’s estates.',
    category: 'drinks', association: 'Both lists name tea for Habiganj.',
    sources: [...DB_PAIR, 'ghureDekha'], level: 'multi',
    evidence: 'Daily Bangladesh and Ghure Dekha.',
  }),
  f('habiganj', {
    slug: 'shatkora', nameEn: 'Habiganj Shatkora', nameBn: 'হবিগঞ্জের সাতকড়া',
    description: 'Aromatic citrus used in meat curries.',
    category: 'produce', association: 'Listed by Ghure Dekha.',
    sources: ['ghureDekha'], level: 'single',
    evidence: 'Only Ghure Dekha; shatkora is more often tied to Sylhet.',
  }),
  f('habiganj', {
    slug: 'adi-gopal-rasgolla', nameEn: 'Adi Gopal Rasgolla', nameBn: 'আদি গোপালের রসগোল্লা',
    description: 'Rasgolla from a known Habiganj sweet shop.',
    category: 'sweets', association: 'Listed by Ghurifiri.',
    sources: ['ghurifiri'], level: 'single',
    evidence: 'Only Ghurifiri.',
  }),

  f('moulvibazar', {
    slug: 'seven-layer-tea', nameEn: 'Seven-Layer Tea', nameBn: 'সাত রঙের চা', alt: ['সাতরং চা', 'Multi-layer tea'],
    description: 'Tea poured in distinct coloured layers in one glass.',
    category: 'drinks', association: 'Invented and served in Sreemangal tea country.',
    sources: ['ghurifiri', 'ghureDekha', 'dbSreemangalTea'], level: 'multi', locality: 'Sreemangal',
    evidence: 'Ghurifiri, Ghure Dekha and a Daily Bangladesh travel piece place it in Sreemangal (Moulvibazar).',
    notes: 'Moved from Sylhet district — Sreemangal is in Moulvibazar.',
  }),
  f('moulvibazar', {
    slug: 'pineapple', nameEn: 'Moulvibazar Pineapple', nameBn: 'মৌলভীবাজারের আনারস',
    description: 'Hill pineapple.',
    category: 'produce', association: 'Listed by Ghure Dekha.',
    sources: ['ghureDekha'], level: 'single',
    evidence: 'Only Ghure Dekha. The pineapple GI belongs to Madhupur, Tangail.',
  }),
  f('moulvibazar', {
    slug: 'manager-store-rasgolla', nameEn: 'Manager Store Rasgolla', nameBn: 'ম্যানেজার স্টোরের রসগোল্লা',
    description: 'Rasgolla from a long-known local shop.',
    category: 'sweets', association: 'Listed by Daily Bangladesh.',
    sources: [...DB_PAIR], level: 'single',
    evidence: 'Only the Daily Bangladesh list.',
  }),

  f('sunamganj', {
    slug: 'haor-shutki', nameEn: 'Haor Dried Fish', nameBn: 'হাওরের শুঁটকি',
    description: 'Dried freshwater fish — puti, tengra, baim, shol — from the haors.',
    category: 'fish', association: 'Sunamganj’s haors supply fresh and dried fish.',
    sources: ['ghurifiri', 'ghureDekha'], level: 'multi', season: 'Mostly winter',
    evidence: 'Ghurifiri (dried haor fish) and Ghure Dekha (haor fish).',
  }),
  f('sunamganj', {
    slug: 'deshbandhu-mishti', nameEn: 'Deshbandhu Mishti', nameBn: 'দেশবন্ধুর মিষ্টি',
    description: 'Sweets from a well-known sweet house.',
    category: 'sweets', association: 'Listed by Daily Bangladesh.',
    sources: [...DB_PAIR], level: 'single',
    evidence: 'Only the Daily Bangladesh list.',
  }),
  f('sunamganj', {
    slug: 'doi', nameEn: 'Sunamganj Doi', nameBn: 'সুনামগঞ্জের দই',
    description: 'Local yoghurt.',
    category: 'dairy', association: 'Listed by Ghure Dekha.',
    sources: ['ghureDekha'], level: 'single',
    evidence: 'Only Ghure Dekha.',
  }),

  f('sylhet', {
    slug: 'shatkora-beef', nameEn: 'Shatkora Beef', nameBn: 'সাতকড়া দিয়ে গরুর মাংস',
    description: 'Beef cooked with pieces of the tart, fragrant shatkora citrus.',
    category: 'meat', association: 'A Sylheti classic, also popular in the diaspora.',
    sources: ['ghurifiri', 'ghureDekha', ...DB_PAIR], level: 'multi',
    evidence: 'Ghurifiri (shatkora beef), Ghure Dekha (shatkora) and Daily Bangladesh (shatkora pickle).',
  }),
  f('sylhet', {
    slug: 'akhni', nameEn: 'Sylheti Akhni', nameBn: 'সিলেটি আখনি',
    description: 'Spiced rice cooked together with meat.',
    category: 'rice', association: 'Listed by Ghure Dekha.',
    sources: ['ghureDekha'], level: 'single',
    evidence: 'Only Ghure Dekha.',
  }),
  f('sylhet', {
    slug: 'chunga-pitha', nameEn: 'Chunga Pitha', nameBn: 'চুঙ্গা পিঠা',
    description: 'Sticky rice packed in bamboo and roasted over straw fire.',
    category: 'pitha', association: 'A winter festival food of Sylhet villages.',
    sources: ['ghurifiri'], level: 'single', season: 'Agrahayan–Poush',
    evidence: 'Only Ghurifiri.',
  }),

  /* ──────────────────────── RANGPUR DIVISION ──────────────────────── */
  f('dinajpur', {
    slug: 'kataribhog', nameEn: 'Kataribhog Rice', nameBn: 'দিনাজপুরের কাটারিভোগ',
    description: 'Slender, aromatic rice used for polao and payesh.',
    category: 'rice', association: 'Registered Geographical Indication for Dinajpur.',
    sources: ['dpdt', ...DB_PAIR, 'ghureDekha'], level: 'gi', gi: 5,
    evidence: 'DPDT GI register no. 5.',
  }),
  f('dinajpur', {
    slug: 'bedana-lychee', nameEn: 'Bedana Lychee', nameBn: 'দিনাজপুরের বেদানা লিচু',
    description: 'Small-seeded, juicy lychee.',
    category: 'produce', association: 'Registered Geographical Indication for Dinajpur.',
    sources: ['dpdt', ...DB_PAIR, 'ghureDekha'], level: 'gi', gi: 51, season: 'May–June',
    evidence: 'DPDT GI register no. 51.',
  }),
  f('dinajpur', {
    slug: 'papad', nameEn: 'Dinajpur Papad', nameBn: 'দিনাজপুরের পাঁপড়',
    description: 'Crisp lentil papad rolled by women artisans.',
    category: 'other', association: 'Ghurifiri ties it to the Chawkbazar area.',
    sources: ['ghurifiri'], level: 'single', locality: 'Chawkbazar, Dinajpur town',
    evidence: 'Only Ghurifiri.',
  }),

  f('gaibandha', {
    slug: 'rasmanjari', nameEn: 'Rasmanjari', nameBn: 'রসমঞ্জরি', alt: ['Rasmanjuri', 'রসমঞ্জুরি'],
    description: 'Marble-sized chhana balls in thick kheer.',
    category: 'sweets', association: 'Gaibandha is nicknamed the town of rasmanjari.',
    sources: [...DB_PAIR, 'ghurifiri'], level: 'multi',
    evidence: 'Daily Bangladesh and Ghurifiri.',
  }),
  f('gaibandha', {
    slug: 'river-fish', nameEn: 'Gaibandha River Fish', nameBn: 'গাইবান্ধার নদীর মাছ',
    description: 'River fish.',
    category: 'fish', association: 'Listed by Ghure Dekha.',
    sources: ['ghureDekha'], level: 'single',
    evidence: 'Only Ghure Dekha.',
  }),

  f('kurigram', {
    slug: 'chomchom', nameEn: 'Kurigram Chomchom', nameBn: 'কুড়িগ্রামের চমচম',
    description: 'Chomchom, a little less sweet than Tangail’s.',
    category: 'sweets', association: 'Named by both lists.',
    sources: [...DB_PAIR, 'ghurifiri'], level: 'multi',
    evidence: 'Daily Bangladesh and Ghurifiri.',
  }),
  f('kurigram', {
    slug: 'ulipur-kshirmohon', nameEn: 'Ulipur Kshirmohon', nameBn: 'উলিপুরের ক্ষীরমোহন',
    description: 'Sweet in thick, ghee-scented kheer syrup.',
    category: 'sweets', association: 'Featured by The Daily Ittefaq.',
    sources: ['ittefaqKhirmohon'], level: 'single', locality: 'Ulipur upazila',
    evidence: 'One newspaper feature; tied to a single shop.',
  }),

  f('lalmonirhat', {
    slug: 'teesta-fish', nameEn: 'Teesta River Fish', nameBn: 'তিস্তার মাছ',
    description: 'Fish from the Teesta.',
    category: 'fish', association: 'Listed by Ghure Dekha.',
    sources: ['ghureDekha'], level: 'single',
    evidence: 'Only Ghure Dekha. Weakest-documented district.',
  }),
  f('lalmonirhat', {
    slug: 'egg-khichuri', nameEn: 'Boiled-Egg Khichuri', nameBn: 'ডিম খিচুড়ি',
    description: 'Rice-and-lentil khichuri served with boiled eggs.',
    category: 'rice', association: 'Listed by Ghure Dekha.',
    sources: ['ghureDekha'], level: 'single',
    evidence: 'Only Ghure Dekha.',
  }),

  f('nilphamari', {
    slug: 'domar-sandesh', nameEn: 'Domar Sandesh', nameBn: 'ডোমারের সন্দেশ',
    description: 'Sandesh from Domar.',
    category: 'sweets', association: 'Listed by Daily Bangladesh.',
    sources: [...DB_PAIR, 'ghureDekha'], level: 'conflict', locality: 'Domar upazila',
    evidence: 'Daily Bangladesh names Domar; Ghure Dekha names Saidpur’s sandesh instead.',
    notes: 'Conflict: Domar vs Saidpur.',
  }),
  f('nilphamari', {
    slug: 'mansuri-mithai', nameEn: 'Saidpur Mansuri Mithai', nameBn: 'সৈয়দপুরের মনসুরি মিঠাই',
    description: 'Besan and chana-dal sweet brought by Bihari confectioners after 1947.',
    category: 'sweets', association: 'Listed by Ghurifiri.',
    sources: ['ghurifiri'], level: 'single', locality: 'Saidpur',
    evidence: 'Only Ghurifiri.',
  }),

  f('panchagarh', {
    slug: 'tea', nameEn: 'Panchagarh Tea', nameBn: 'পঞ্চগড়ের চা',
    description: 'Flat-land tea from the country’s northernmost district.',
    category: 'drinks', association: 'District branding calls it a land of green tea.',
    sources: ['ghureDekha', 'paPanchagarh'], level: 'multi',
    evidence: 'Ghure Dekha and Prothom Alo.',
  }),
  f('panchagarh', {
    slug: 'dim-bhuna', nameEn: 'Panchagarh Dim Bhuna', nameBn: 'পঞ্চগড়ের ডিম ভুনা',
    description: 'Spiced egg curry.',
    category: 'other', association: 'Listed by Daily Bangladesh.',
    sources: [...DB_PAIR], level: 'single',
    evidence: 'Only the Daily Bangladesh list.',
  }),

  f('rangpur', {
    slug: 'haribhanga-mango', nameEn: 'Haribhanga Mango', nameBn: 'রংপুরের হাঁড়িভাঙ্গা আম',
    description: 'Fibre-less mango with a thin seed.',
    category: 'produce', association: 'Registered Geographical Indication for Rangpur.',
    sources: ['dpdt', 'ghureDekha'], level: 'gi', gi: 22, season: 'June–July',
    evidence: 'DPDT GI register no. 22.',
  }),
  f('rangpur', {
    slug: 'bhorta-khichuri', nameEn: 'Rangpur Bhorta & Bhuna Khichuri', nameBn: 'রংপুরের ভর্তা ও ভুনা খিচুড়ি',
    description: 'Mashed relishes and spiced khichuri.',
    category: 'rice', association: 'Listed by Ghure Dekha.',
    sources: ['ghureDekha'], level: 'single',
    evidence: 'Only Ghure Dekha. Replaces “Pelka”, which no reviewed source mentioned.',
  }),
  f('rangpur', {
    slug: 'sugarcane', nameEn: 'Rangpur Sugarcane', nameBn: 'রংপুরের আখ',
    description: 'Sugarcane.',
    category: 'produce', association: 'Listed by Daily Bangladesh.',
    sources: [...DB_PAIR], level: 'single',
    evidence: 'Only the Daily Bangladesh list.',
  }),

  f('thakurgaon', {
    slug: 'surjapuri-mango', nameEn: 'Surjapuri Mango', nameBn: 'ঠাকুরগাঁওয়ের সূর্যপুরী আম',
    description: 'A local mango variety.',
    category: 'produce', association: 'Listed by Daily Bangladesh.',
    sources: [...DB_PAIR], level: 'single',
    evidence: 'Only the Daily Bangladesh list.',
  }),
  f('thakurgaon', {
    slug: 'tea', nameEn: 'Thakurgaon Tea', nameBn: 'ঠাকুরগাঁওয়ের চা',
    description: 'Tea grown in the district.',
    category: 'drinks', association: 'Listed by Ghure Dekha.',
    sources: ['ghureDekha'], level: 'single',
    evidence: 'Only Ghure Dekha.',
  }),

  /* ─────────────────────── MYMENSINGH DIVISION ─────────────────────── */
  f('jamalpur', {
    slug: 'chhanar-polao', nameEn: 'Jamalpur Chhanar Polao', nameBn: 'জামালপুরের ছানার পোলাও',
    description: 'A sweet listed as chhana polao.',
    category: 'sweets', association: 'Listed by Daily Bangladesh.',
    sources: [...DB_PAIR], level: 'single',
    evidence: 'Only the Daily Bangladesh list.',
  }),
  f('jamalpur', {
    slug: 'milli', nameEn: 'Milli (Menda)', nameBn: 'মিল্লি / মেন্দা', alt: ['Pitheli'],
    description: 'A festive dish cooked for invitations and celebrations.',
    category: 'meat', association: 'Listed by Ghurifiri.',
    sources: ['ghurifiri'], level: 'single',
    evidence: 'Only Ghurifiri.',
  }),

  f('mymensingh', {
    slug: 'muktagachha-monda', nameEn: 'Muktagachha Monda', nameBn: 'মুক্তাগাছার মণ্ডা',
    description: 'Soft, flat milk-and-sugar sweet, said to date from the 1820s.',
    category: 'sweets', association: 'Registered Geographical Indication for Mymensingh.',
    sources: ['dpdt', ...DB_PAIR, 'ghureDekha', 'ghurifiri'], level: 'gi', gi: 25, locality: 'Muktagachha upazila',
    evidence: 'DPDT GI register no. 25.',
  }),
  f('mymensingh', {
    slug: 'phulbaria-lal-chini', nameEn: 'Phulbaria Lal Chini', nameBn: 'ফুলবাড়ীয়ার লাল চিনি',
    description: 'Hand-made fine red sugar from sugarcane juice.',
    category: 'other', association: 'Registered Geographical Indication.',
    sources: ['dpdt'], level: 'gi', gi: 58, locality: 'Phulbaria upazila',
    evidence: 'DPDT GI register no. 58.',
  }),
  f('mymensingh', {
    slug: 'puli-pitha', nameEn: 'Mymensingh Puli Pitha', nameBn: 'ময়মনসিংহের পুলি পিঠা',
    description: 'Stuffed rice-flour dumplings.',
    category: 'pitha', association: 'Listed by Ghure Dekha.',
    sources: ['ghureDekha'], level: 'single',
    evidence: 'Only Ghure Dekha.',
  }),

  f('netrokona', {
    slug: 'balish-mishti', nameEn: 'Balish Mishti', nameBn: 'নেত্রকোনার বালিশ মিষ্টি', alt: ["Gayanath's Balish"],
    description: 'A pillow-shaped sweet topped with kheer, made in sizes large enough to share.',
    category: 'sweets', association: 'Registered Geographical Indication for Netrokona.',
    sources: ['dpdt', 'dtBalish', ...DB_PAIR, 'ghureDekha', 'ghurifiri'], level: 'gi', gi: 57,
    evidence: 'DPDT GI register no. 57; Dhaka Tribune reports the recognition.',
  }),

  f('sherpur', {
    slug: 'chhanar-payesh', nameEn: 'Sherpur Chhanar Payesh', nameBn: 'শেরপুরের ছানার পায়েস',
    description: 'Tiny chhana pearls simmered in sweet milk.',
    category: 'sweets', association: 'Registered Geographical Indication for Sherpur.',
    sources: ['dpdt', ...DB_PAIR, 'ghurifiri'], level: 'gi', gi: 44,
    evidence: 'DPDT GI register no. 44.',
  }),
  f('sherpur', {
    slug: 'tulshimala-rice', nameEn: 'Tulshimala Rice', nameBn: 'শেরপুরের তুলশীমালা',
    description: 'Small-grained aromatic rice.',
    category: 'rice', association: 'Registered Geographical Indication for Sherpur.',
    sources: ['dpdt'], level: 'gi', gi: 14,
    evidence: 'DPDT GI register no. 14.',
  }),
  f('sherpur', {
    slug: 'garo-food', nameEn: 'Garo Food Traditions', nameBn: 'গারো খাবার',
    description: 'Food traditions of the Garo community in the Sherpur hills.',
    category: 'indigenous', association: 'Listed by Ghure Dekha.',
    sources: ['ghureDekha'], level: 'single',
    evidence: 'Only Ghure Dekha; no specific dish named.',
  }),
];

export const FOOD_BY_ID: Record<string, Food> = Object.fromEntries(FOODS.map((x) => [x.id, x]));

export const FOODS_BY_DISTRICT: Record<string, Food[]> = FOODS.reduce<Record<string, Food[]>>((acc, food) => {
  (acc[food.districtId] ||= []).push(food);
  return acc;
}, {});

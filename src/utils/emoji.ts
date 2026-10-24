import type { Food, FoodCategory } from '../types';

/**
 * A friendly emoji for each food. Only emoji from Unicode 12 or earlier are used,
 * so they render on older Android phones too. Rules are checked in order.
 */
const RULES: [RegExp, string][] = [
  [/^beef with/i, '🍖'],
  [/peti|mishti\b/i, '🍮'],
  [/mango/i, '🥭'],
  [/lychee/i, '🍒'],
  [/banana|kola/i, '🍌'],
  [/pineapple/i, '🍍'],
  [/jackfruit/i, '🍈'],
  [/guava/i, '🍐'],
  [/lotkon/i, '🍇'],
  [/amra|hog plum/i, '🍏'],
  [/coconut|supari|naru/i, '🥥'],
  [/honey/i, '🍯'],
  [/\bgur\b|jaggery|patali|lal chini/i, '🍯'],
  [/ice cream|kulfi/i, '🍦'],
  [/\btea\b/i, '☕'],
  [/ghol|buttermilk/i, '🥛'],
  [/doi|curd|yoghurt/i, '🥣'],
  [/ghee/i, '🧈'],
  [/cheese|ponir/i, '🧀'],
  [/crab/i, '🦀'],
  [/prawn|chingri|shrimp/i, '🦐'],
  [/hilsa|ilish|fish|shutki|loitta/i, '🐟'],
  [/egg|\bdim\b/i, '🥚'],
  [/chicken/i, '🍗'],
  [/biryani|khichuri|akhni/i, '🍛'],
  [/beef|mutton|meat|mezban|bhuna|ghati|chuijhal|menda|milli/i, '🍖'],
  [/shatkora/i, '🍋'],
  [/noodle|mundi/i, '🍜'],
  [/rice|kataribhog|tulshimala|boro/i, '🍚'],
  [/singara/i, '🥟'],
  [/chotpoti/i, '🥙'],
  [/papad/i, '🍘'],
  [/bakarkhani|ruti/i, '🥯'],
  [/pitha|bora/i, '🥞'],
  [/khaja|kotkoti|mithai/i, '🍪'],
  [/maize/i, '🌽'],
  [/sugarcane/i, '🎋'],
  [/kochu|bori/i, '🥔'],
  [/turmeric/i, '🌶️'],
  [/khoi/i, '🍿'],
];

const BY_CATEGORY: Record<FoodCategory, string> = {
  sweets: '🍮',
  dairy: '🥛',
  pitha: '🥞',
  rice: '🍚',
  fish: '🐟',
  meat: '🍖',
  street: '🥟',
  produce: '🧺',
  drinks: '☕',
  indigenous: '🍲',
  other: '🍽️',
};

export function foodEmoji(f: Pick<Food, 'nameEn' | 'category'>): string {
  for (const [re, e] of RULES) if (re.test(f.nameEn)) return e;
  return BY_CATEGORY[f.category] ?? '🍽️';
}

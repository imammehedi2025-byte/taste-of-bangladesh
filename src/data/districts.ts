import type { District } from '../types';

/** All 64 districts, grouped by division. Validated by scripts/validate-dataset.ts. */
export const DISTRICTS: District[] = [
  // Dhaka Division — 13
  { id: 'dhaka', divisionId: 'dhaka', nameEn: 'Dhaka', nameBn: 'ঢাকা' },
  { id: 'faridpur', divisionId: 'dhaka', nameEn: 'Faridpur', nameBn: 'ফরিদপুর' },
  { id: 'gazipur', divisionId: 'dhaka', nameEn: 'Gazipur', nameBn: 'গাজীপুর' },
  { id: 'gopalganj', divisionId: 'dhaka', nameEn: 'Gopalganj', nameBn: 'গোপালগঞ্জ' },
  { id: 'kishoreganj', divisionId: 'dhaka', nameEn: 'Kishoreganj', nameBn: 'কিশোরগঞ্জ' },
  { id: 'madaripur', divisionId: 'dhaka', nameEn: 'Madaripur', nameBn: 'মাদারীপুর' },
  { id: 'manikganj', divisionId: 'dhaka', nameEn: 'Manikganj', nameBn: 'মানিকগঞ্জ' },
  { id: 'munshiganj', divisionId: 'dhaka', nameEn: 'Munshiganj', nameBn: 'মুন্সীগঞ্জ', alt: ['Bikrampur'] },
  { id: 'narayanganj', divisionId: 'dhaka', nameEn: 'Narayanganj', nameBn: 'নারায়ণগঞ্জ' },
  { id: 'narsingdi', divisionId: 'dhaka', nameEn: 'Narsingdi', nameBn: 'নরসিংদী' },
  { id: 'rajbari', divisionId: 'dhaka', nameEn: 'Rajbari', nameBn: 'রাজবাড়ী' },
  { id: 'shariatpur', divisionId: 'dhaka', nameEn: 'Shariatpur', nameBn: 'শরীয়তপুর' },
  { id: 'tangail', divisionId: 'dhaka', nameEn: 'Tangail', nameBn: 'টাঙ্গাইল' },

  // Chattogram Division — 11
  { id: 'bandarban', divisionId: 'chattogram', nameEn: 'Bandarban', nameBn: 'বান্দরবান' },
  { id: 'brahmanbaria', divisionId: 'chattogram', nameEn: 'Brahmanbaria', nameBn: 'ব্রাহ্মণবাড়িয়া' },
  { id: 'chandpur', divisionId: 'chattogram', nameEn: 'Chandpur', nameBn: 'চাঁদপুর' },
  { id: 'chattogram', divisionId: 'chattogram', nameEn: 'Chattogram', nameBn: 'চট্টগ্রাম', alt: ['Chittagong', 'Ctg'] },
  { id: 'coxs-bazar', divisionId: 'chattogram', nameEn: "Cox's Bazar", nameBn: 'কক্সবাজার', alt: ['Coxs Bazar'] },
  { id: 'cumilla', divisionId: 'chattogram', nameEn: 'Cumilla', nameBn: 'কুমিল্লা', alt: ['Comilla'] },
  { id: 'feni', divisionId: 'chattogram', nameEn: 'Feni', nameBn: 'ফেনী' },
  { id: 'khagrachhari', divisionId: 'chattogram', nameEn: 'Khagrachhari', nameBn: 'খাগড়াছড়ি' },
  { id: 'lakshmipur', divisionId: 'chattogram', nameEn: 'Lakshmipur', nameBn: 'লক্ষ্মীপুর', alt: ['Laxmipur'] },
  { id: 'noakhali', divisionId: 'chattogram', nameEn: 'Noakhali', nameBn: 'নোয়াখালী' },
  { id: 'rangamati', divisionId: 'chattogram', nameEn: 'Rangamati', nameBn: 'রাঙামাটি' },

  // Rajshahi Division — 8
  { id: 'bogura', divisionId: 'rajshahi', nameEn: 'Bogura', nameBn: 'বগুড়া', alt: ['Bogra'] },
  { id: 'chapainawabganj', divisionId: 'rajshahi', nameEn: 'Chapainawabganj', nameBn: 'চাঁপাইনবাবগঞ্জ', alt: ['Chapai Nawabganj', 'Chapai'] },
  { id: 'joypurhat', divisionId: 'rajshahi', nameEn: 'Joypurhat', nameBn: 'জয়পুরহাট' },
  { id: 'naogaon', divisionId: 'rajshahi', nameEn: 'Naogaon', nameBn: 'নওগাঁ' },
  { id: 'natore', divisionId: 'rajshahi', nameEn: 'Natore', nameBn: 'নাটোর' },
  { id: 'pabna', divisionId: 'rajshahi', nameEn: 'Pabna', nameBn: 'পাবনা' },
  { id: 'rajshahi', divisionId: 'rajshahi', nameEn: 'Rajshahi', nameBn: 'রাজশাহী' },
  { id: 'sirajganj', divisionId: 'rajshahi', nameEn: 'Sirajganj', nameBn: 'সিরাজগঞ্জ' },

  // Khulna Division — 10
  { id: 'bagerhat', divisionId: 'khulna', nameEn: 'Bagerhat', nameBn: 'বাগেরহাট' },
  { id: 'chuadanga', divisionId: 'khulna', nameEn: 'Chuadanga', nameBn: 'চুয়াডাঙ্গা' },
  { id: 'jashore', divisionId: 'khulna', nameEn: 'Jashore', nameBn: 'যশোর', alt: ['Jessore'] },
  { id: 'jhenaidah', divisionId: 'khulna', nameEn: 'Jhenaidah', nameBn: 'ঝিনাইদহ' },
  { id: 'khulna', divisionId: 'khulna', nameEn: 'Khulna', nameBn: 'খুলনা' },
  { id: 'kushtia', divisionId: 'khulna', nameEn: 'Kushtia', nameBn: 'কুষ্টিয়া' },
  { id: 'magura', divisionId: 'khulna', nameEn: 'Magura', nameBn: 'মাগুরা' },
  { id: 'meherpur', divisionId: 'khulna', nameEn: 'Meherpur', nameBn: 'মেহেরপুর' },
  { id: 'narail', divisionId: 'khulna', nameEn: 'Narail', nameBn: 'নড়াইল' },
  { id: 'satkhira', divisionId: 'khulna', nameEn: 'Satkhira', nameBn: 'সাতক্ষীরা' },

  // Barishal Division — 6
  { id: 'barguna', divisionId: 'barishal', nameEn: 'Barguna', nameBn: 'বরগুনা' },
  { id: 'barishal', divisionId: 'barishal', nameEn: 'Barishal', nameBn: 'বরিশাল', alt: ['Barisal'] },
  { id: 'bhola', divisionId: 'barishal', nameEn: 'Bhola', nameBn: 'ভোলা' },
  { id: 'jhalokathi', divisionId: 'barishal', nameEn: 'Jhalokathi', nameBn: 'ঝালকাঠি', alt: ['Jhalakathi', 'Jhalokati'] },
  { id: 'patuakhali', divisionId: 'barishal', nameEn: 'Patuakhali', nameBn: 'পটুয়াখালী' },
  { id: 'pirojpur', divisionId: 'barishal', nameEn: 'Pirojpur', nameBn: 'পিরোজপুর' },

  // Sylhet Division — 4
  { id: 'habiganj', divisionId: 'sylhet', nameEn: 'Habiganj', nameBn: 'হবিগঞ্জ' },
  { id: 'moulvibazar', divisionId: 'sylhet', nameEn: 'Moulvibazar', nameBn: 'মৌলভীবাজার', alt: ['Sreemangal'] },
  { id: 'sunamganj', divisionId: 'sylhet', nameEn: 'Sunamganj', nameBn: 'সুনামগঞ্জ' },
  { id: 'sylhet', divisionId: 'sylhet', nameEn: 'Sylhet', nameBn: 'সিলেট' },

  // Rangpur Division — 8
  { id: 'dinajpur', divisionId: 'rangpur', nameEn: 'Dinajpur', nameBn: 'দিনাজপুর' },
  { id: 'gaibandha', divisionId: 'rangpur', nameEn: 'Gaibandha', nameBn: 'গাইবান্ধা' },
  { id: 'kurigram', divisionId: 'rangpur', nameEn: 'Kurigram', nameBn: 'কুড়িগ্রাম' },
  { id: 'lalmonirhat', divisionId: 'rangpur', nameEn: 'Lalmonirhat', nameBn: 'লালমনিরহাট' },
  { id: 'nilphamari', divisionId: 'rangpur', nameEn: 'Nilphamari', nameBn: 'নীলফামারী' },
  { id: 'panchagarh', divisionId: 'rangpur', nameEn: 'Panchagarh', nameBn: 'পঞ্চগড়' },
  { id: 'rangpur', divisionId: 'rangpur', nameEn: 'Rangpur', nameBn: 'রংপুর' },
  { id: 'thakurgaon', divisionId: 'rangpur', nameEn: 'Thakurgaon', nameBn: 'ঠাকুরগাঁও' },

  // Mymensingh Division — 4
  { id: 'jamalpur', divisionId: 'mymensingh', nameEn: 'Jamalpur', nameBn: 'জামালপুর' },
  { id: 'mymensingh', divisionId: 'mymensingh', nameEn: 'Mymensingh', nameBn: 'ময়মনসিংহ' },
  { id: 'netrokona', divisionId: 'mymensingh', nameEn: 'Netrokona', nameBn: 'নেত্রকোনা' },
  { id: 'sherpur', divisionId: 'mymensingh', nameEn: 'Sherpur', nameBn: 'শেরপুর' },
];

export const DISTRICT_BY_ID: Record<string, District> = Object.fromEntries(DISTRICTS.map((d) => [d.id, d]));

export type DivisionId =
  | 'dhaka'
  | 'chattogram'
  | 'rajshahi'
  | 'khulna'
  | 'barishal'
  | 'sylhet'
  | 'rangpur'
  | 'mymensingh';

export interface Division {
  id: DivisionId;
  nameEn: string;
  nameBn: string;
}

export interface District {
  id: string;
  divisionId: DivisionId;
  nameEn: string;
  nameBn: string;
  /** Other common English spellings, used by search. */
  alt?: string[];
}

export type FoodCategory =
  | 'sweets'
  | 'dairy'
  | 'pitha'
  | 'rice'
  | 'fish'
  | 'meat'
  | 'street'
  | 'produce'
  | 'drinks'
  | 'indigenous'
  | 'other';

export type VerificationStatus = 'Verified' | 'Needs Review' | 'Community Contributed';

/**
 * gi       – registered Geographical Indication on the official DPDT register
 * multi    – two or more independent sources agree (copied lists count once)
 * single   – only one independent source found so far
 * conflict – sources disagree about name, locality or district
 */
export type EvidenceLevel = 'gi' | 'multi' | 'single' | 'conflict';

export interface Source {
  id: string;
  title: string;
  publisher: string;
  url: string;
  kind: 'government' | 'newspaper' | 'news-list' | 'travel-guide';
  independentGroup: string;
  accessed: string;
}

export interface Food {
  id: string;
  districtId: string;
  divisionId: DivisionId;
  nameEn: string;
  nameBn: string;
  alt?: string[];
  description: string;
  category: FoodCategory;
  association: string;
  sources: string[];
  evidence: string;
  status: VerificationStatus;
  evidenceLevel: EvidenceLevel;
  giNumber?: number;
  locality?: string;
  season?: string;
  notes?: string;
  image?: { url: string; credit: string };
  /** true for entries that came from the Firestore community collection */
  community?: boolean;
}

export type ProgressState = 'want' | 'tried';

export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface Submission {
  id: string;
  nameEn: string;
  nameBn: string;
  districtId: string;
  divisionId: DivisionId;
  category: FoodCategory;
  description: string;
  association: string;
  sourceUrl: string;
  normalizedName: string;
  status: SubmissionStatus;
  createdBy: string;
  createdAt: Date | null;
  reviewNote?: string;
}

export interface FoodStats {
  foodId: string;
  ratingSum: number;
  ratingCount: number;
  mustTryCount: number;
}

import type { Division, DivisionId } from '../types';

export const DIVISIONS: Division[] = [
  { id: 'dhaka', nameEn: 'Dhaka', nameBn: 'ঢাকা' },
  { id: 'chattogram', nameEn: 'Chattogram', nameBn: 'চট্টগ্রাম' },
  { id: 'rajshahi', nameEn: 'Rajshahi', nameBn: 'রাজশাহী' },
  { id: 'khulna', nameEn: 'Khulna', nameBn: 'খুলনা' },
  { id: 'barishal', nameEn: 'Barishal', nameBn: 'বরিশাল' },
  { id: 'sylhet', nameEn: 'Sylhet', nameBn: 'সিলেট' },
  { id: 'rangpur', nameEn: 'Rangpur', nameBn: 'রংপুর' },
  { id: 'mymensingh', nameEn: 'Mymensingh', nameBn: 'ময়মনসিংহ' },
];

export const DIVISION_BY_ID = Object.fromEntries(DIVISIONS.map((d) => [d.id, d])) as Record<
  DivisionId,
  Division
>;

// Real repair technicians/businesses that list themselves on the Fix My
// Device page — self-serve like a marketplace listing (no heavy vetting),
// so the directory only ever shows people who actually signed up, never
// fabricated placeholder repairers.

export const REPAIR_SPECIALTIES = [
  "Screen repair",
  "Battery replacement",
  "Charging port repair",
  "Water damage",
  "Camera repair",
  "Software / unlock",
  "Motherboard repair",
  "Laptop repair",
  "Speaker / mic repair",
] as const;

export type RepairSpecialty = (typeof REPAIR_SPECIALTIES)[number];

export type RepairVendor = {
  id: string;
  userId: string;
  businessName: string;
  phone: string;
  specialties: RepairSpecialty[];
  area?: string;
  createdAt: string;
};

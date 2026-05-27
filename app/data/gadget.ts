// app/data/gadget.ts

export type DeviceCategory = "phone" | "laptop";
export type PhoneType = "iphone" | "android";
export type LaptopType = "macbook" | "windows" | "linux" | "gaming";
export type SubType = PhoneType | LaptopType;
export type SimType = "physical" | "esim-unlocked" | "locked" | "";
export type FaceIdStatus = "working" | "broken" | "";
export type ListingMode = "sell" | "swap";
export type PhoneCondition = "uk-used" | "brand-new";

export type DeviceEntry = {
  id: string;
  name: string;
  storage: string;
  baseMin: number;
  baseMax: number;
  ram?: string;
  chip?: string;
  display?: string;
};

export type FormData = {
  listingMode: ListingMode;
  category: DeviceCategory | "";
  subType: SubType | "";
  deviceId: string;
  customDeviceName: string;
  customDevicePrice: string;
  batteryHealth: string;
  batteryChanged: boolean;
  screenChanged: boolean;
  cameraChanged: boolean;
  faceIdStatus: FaceIdStatus;
  simType: SimType;
  imei: string;
  imeiValid: boolean | null;
  ramUpgraded: boolean;
  storageUpgraded: boolean;
  keyboardChanged: boolean;
  otherRepairs: string;
  mediaFiles: File[];
  wantedDevice: string;
  customWantedDevice: string;
  sellerName: string;
  sellerPhone: string;
};

export const initialForm: FormData = {
  listingMode: "sell",
  category: "",
  subType: "",
  deviceId: "",
  customDeviceName: "",
  customDevicePrice: "",
  batteryHealth: "100",
  batteryChanged: false,
  screenChanged: false,
  cameraChanged: false,
  faceIdStatus: "",
  simType: "",
  imei: "",
  imeiValid: null,
  ramUpgraded: false,
  storageUpgraded: false,
  keyboardChanged: false,
  otherRepairs: "",
  mediaFiles: [],
  wantedDevice: "",
  customWantedDevice: "",
  sellerName: "",
  sellerPhone: "",
};

// ─── Buy Page: Phone catalog ──────────────────────────────────────────────────

export type BuyPhone = {
  id: string;
  name: string;
  brand:
    | "apple"
    | "samsung"
    | "google"
    | "oneplus"
    | "xiaomi"
    | "tecno"
    | "infinix";
  image: string;
  storage: string[];
  priceUkUsed: number;
  priceBrandNew: number;
  ram?: string;
  category: "flagship" | "mid-range" | "budget";
  badge?: string;
  color?: string[];
};

export const phones: BuyPhone[] = [
  // ── iPhones ──────────────────────────────────────────────────────────────────
  {
    id: "iphone-17-pro-max",
    name: "iPhone 17 Pro Max",
    brand: "apple",
    image:
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-9inch-deserttitanium?wid=400&hei=400&fmt=jpeg&qlt=90&.v=1723766421088",
    storage: ["256GB", "512GB", "1TB"],
    priceUkUsed: 2_100_000,
    priceBrandNew: 2_800_000,
    ram: "8GB",
    category: "flagship",
    badge: "New 🆕",
  },
  {
    id: "iphone-17-pro",
    name: "iPhone 17 Pro",
    brand: "apple",
    image:
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch-blacktitanium?wid=400&hei=400&fmt=jpeg&qlt=90&.v=1723766420536",
    storage: ["128GB", "256GB", "512GB", "1TB"],
    priceUkUsed: 1_800_000,
    priceBrandNew: 2_300_000,
    ram: "8GB",
    category: "flagship",
  },
  {
    id: "iphone-17",
    name: "iPhone 17",
    brand: "apple",
    image:
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-finish-select-202409-6-1inch-black?wid=400&hei=400&fmt=jpeg&qlt=90&.v=1723695933702",
    storage: ["128GB", "256GB", "512GB"],
    priceUkUsed: 1_250_000,
    priceBrandNew: 1_650_000,
    ram: "8GB",
    category: "flagship",
    badge: "Hot 🔥",
  },
  {
    id: "iphone-16-pro-max",
    name: "iPhone 16 Pro Max",
    brand: "apple",
    image:
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-9inch-deserttitanium?wid=400&hei=400&fmt=jpeg&qlt=90&.v=1723766421088",
    storage: ["256GB", "512GB", "1TB"],
    priceUkUsed: 1_350_000,
    priceBrandNew: 1_900_000,
    ram: "8GB",
    category: "flagship",
    badge: "Hot 🔥",
    color: ["Desert Titanium", "Black Titanium", "White Titanium"],
  },
  {
    id: "iphone-16-pro",
    name: "iPhone 16 Pro",
    brand: "apple",
    image:
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch-blacktitanium?wid=400&hei=400&fmt=jpeg&qlt=90&.v=1723766420536",
    storage: ["128GB", "256GB", "512GB", "1TB"],
    priceUkUsed: 1_100_000,
    priceBrandNew: 1_550_000,
    ram: "8GB",
    category: "flagship",
    color: ["Black Titanium", "White Titanium", "Desert Titanium"],
  },
  {
    id: "iphone-16",
    name: "iPhone 16",
    brand: "apple",
    image:
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-finish-select-202409-6-1inch-black?wid=400&hei=400&fmt=jpeg&qlt=90&.v=1723695933702",
    storage: ["128GB", "256GB", "512GB"],
    priceUkUsed: 850_000,
    priceBrandNew: 1_150_000,
    ram: "8GB",
    category: "flagship",
    badge: "Best Value",
    color: ["Black", "White", "Pink", "Teal", "Ultramarine"],
  },
  {
    id: "iphone-16-plus",
    name: "iPhone 16 Plus",
    brand: "apple",
    image:
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-finish-select-202409-6-7inch-black?wid=400&hei=400&fmt=jpeg&qlt=90&.v=1723695934462",
    storage: ["128GB", "256GB", "512GB"],
    priceUkUsed: 950_000,
    priceBrandNew: 1_250_000,
    ram: "8GB",
    category: "flagship",
    color: ["Black", "White", "Pink", "Teal", "Ultramarine"],
  },
  {
    id: "iphone-15-pro-max",
    name: "iPhone 15 Pro Max",
    brand: "apple",
    image:
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-bluetitanium?wid=400&hei=400&fmt=jpeg&qlt=90&.v=1692923974654",
    storage: ["256GB", "512GB", "1TB"],
    priceUkUsed: 1_000_000,
    priceBrandNew: 1_500_000,
    ram: "8GB",
    category: "flagship",
    color: [
      "Natural Titanium",
      "Blue Titanium",
      "White Titanium",
      "Black Titanium",
    ],
  },
  {
    id: "iphone-15-pro",
    name: "iPhone 15 Pro",
    brand: "apple",
    image:
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-naturaltitanium?wid=400&hei=400&fmt=jpeg&qlt=90&.v=1692923974654",
    storage: ["128GB", "256GB", "512GB", "1TB"],
    priceUkUsed: 850_000,
    priceBrandNew: 1_200_000,
    ram: "8GB",
    category: "flagship",
    color: ["Natural Titanium", "Blue Titanium"],
  },
  {
    id: "iphone-15",
    name: "iPhone 15",
    brand: "apple",
    image:
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch-black?wid=400&hei=400&fmt=jpeg&qlt=90&.v=1692923776878",
    storage: ["128GB", "256GB", "512GB"],
    priceUkUsed: 650_000,
    priceBrandNew: 950_000,
    ram: "6GB",
    category: "flagship",
    badge: "Popular",
    color: ["Black", "Blue", "Green", "Yellow", "Pink"],
  },
  {
    id: "iphone-14-pro-max",
    name: "iPhone 14 Pro Max",
    brand: "apple",
    image:
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-pro-finish-select-202209-6-7inch-deeppurple?wid=400&hei=400&fmt=jpeg&qlt=90&.v=1663703841880",
    storage: ["128GB", "256GB", "512GB", "1TB"],
    priceUkUsed: 750_000,
    priceBrandNew: 1_100_000,
    ram: "6GB",
    category: "flagship",
    color: ["Deep Purple", "Gold", "Silver", "Space Black"],
  },
  {
    id: "iphone-14",
    name: "iPhone 14",
    brand: "apple",
    image:
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-finish-select-202209-6-1inch-midnight?wid=400&hei=400&fmt=jpeg&qlt=90&.v=1660803972054",
    storage: ["128GB", "256GB", "512GB"],
    priceUkUsed: 550_000,
    priceBrandNew: 800_000,
    ram: "6GB",
    category: "flagship",
    badge: "Best Value",
    color: ["Midnight", "Starlight", "Blue", "Purple", "Red"],
  },
  {
    id: "iphone-13",
    name: "iPhone 13",
    brand: "apple",
    image:
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-13-finish-select-202207-6-1inch-midnight?wid=400&hei=400&fmt=jpeg&qlt=90&.v=1654893619863",
    storage: ["128GB", "256GB", "512GB"],
    priceUkUsed: 380_000,
    priceBrandNew: 600_000,
    ram: "4GB",
    category: "flagship",
    color: ["Midnight", "Starlight", "Blue", "Pink", "Green"],
  },
  {
    id: "iphone-12",
    name: "iPhone 12",
    brand: "apple",
    image:
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-12-black-select-2020?wid=400&hei=400&fmt=jpeg&qlt=90",
    storage: ["64GB", "128GB", "256GB"],
    priceUkUsed: 250_000,
    priceBrandNew: 430_000,
    ram: "4GB",
    category: "flagship",
    color: ["Black", "White", "Red", "Blue", "Green", "Purple"],
  },
  {
    id: "iphone-11",
    name: "iPhone 11",
    brand: "apple",
    image:
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-11-black-select-2019?wid=400&hei=400&fmt=jpeg&qlt=90",
    storage: ["64GB", "128GB", "256GB"],
    priceUkUsed: 185_000,
    priceBrandNew: 300_000,
    ram: "4GB",
    category: "flagship",
    color: ["Black", "White", "Green", "Yellow", "Purple", "Red"],
  },

  // ── Samsung ───────────────────────────────────────────────────────────────────
  {
    id: "samsung-s25-ultra",
    name: "Samsung Galaxy S25 Ultra",
    brand: "samsung",
    image:
      "https://images.samsung.com/is/image/samsung/p6pim/global/2501/gallery/global-galaxy-s25-ultra-sm-s938-sm-s938bzkgxfe-thumb-544380624?$344_344_PNG$",
    storage: ["256GB", "512GB", "1TB"],
    priceUkUsed: 1_200_000,
    priceBrandNew: 1_750_000,
    ram: "12GB",
    category: "flagship",
    badge: "Hot 🔥",
    color: ["Titanium Black", "Titanium Gray", "Titanium Whitesilver"],
  },
  {
    id: "samsung-s25-plus",
    name: "Samsung Galaxy S25+",
    brand: "samsung",
    image:
      "https://images.samsung.com/is/image/samsung/p6pim/global/2501/gallery/global-galaxy-s25-plus-sm-s936-sm-s936bzkgxfe-thumb-544380620?$344_344_PNG$",
    storage: ["256GB", "512GB"],
    priceUkUsed: 950_000,
    priceBrandNew: 1_350_000,
    ram: "12GB",
    category: "flagship",
    color: ["Icyblue", "Mint", "Navy", "Silver Shadow"],
  },
  {
    id: "samsung-s25",
    name: "Samsung Galaxy S25",
    brand: "samsung",
    image:
      "https://images.samsung.com/is/image/samsung/p6pim/global/2501/gallery/global-galaxy-s25-sm-s931-sm-s931bzkgxfe-thumb-544380616?$344_344_PNG$",
    storage: ["128GB", "256GB"],
    priceUkUsed: 750_000,
    priceBrandNew: 1_050_000,
    ram: "12GB",
    category: "flagship",
    badge: "Popular",
    color: ["Icyblue", "Mint", "Navy", "Silver Shadow"],
  },
  {
    id: "samsung-s24-ultra",
    name: "Samsung Galaxy S24 Ultra",
    brand: "samsung",
    image:
      "https://images.samsung.com/is/image/samsung/p6pim/global/2401/gallery/global-galaxy-s24-ultra-sm-s928-sm-s928bzkgxfe-thumb-539523312?$344_344_PNG$",
    storage: ["256GB", "512GB", "1TB"],
    priceUkUsed: 900_000,
    priceBrandNew: 1_400_000,
    ram: "12GB",
    category: "flagship",
    color: [
      "Titanium Black",
      "Titanium Gray",
      "Titanium Violet",
      "Titanium Yellow",
    ],
  },
  {
    id: "samsung-s24",
    name: "Samsung Galaxy S24",
    brand: "samsung",
    image:
      "https://images.samsung.com/is/image/samsung/p6pim/global/2401/gallery/global-galaxy-s24-sm-s921-sm-s921bzkgxfe-thumb-539523307?$344_344_PNG$",
    storage: ["128GB", "256GB"],
    priceUkUsed: 550_000,
    priceBrandNew: 850_000,
    ram: "8GB",
    category: "flagship",
    badge: "Best Value",
    color: ["Cobalt Violet", "Marble Gray", "Onyx Black", "Amber Yellow"],
  },
  {
    id: "samsung-s23-ultra",
    name: "Samsung Galaxy S23 Ultra",
    brand: "samsung",
    image:
      "https://images.samsung.com/is/image/samsung/p6pim/global/2301/gallery/global-galaxy-s23-ultra-sm-s918-444340-sm-s918bzwcxfe-thumb-536842823?$344_344_PNG$",
    storage: ["256GB", "512GB"],
    priceUkUsed: 650_000,
    priceBrandNew: 950_000,
    ram: "12GB",
    category: "flagship",
    color: ["Phantom Black", "Cream", "Green", "Lavender"],
  },
  {
    id: "samsung-a55",
    name: "Samsung Galaxy A55",
    brand: "samsung",
    image:
      "https://images.samsung.com/is/image/samsung/p6pim/global/2403/gallery/global-galaxy-a55-5g-sm-a556-sm-a556elgaxfe-thumb-539697743?$344_344_PNG$",
    storage: ["128GB", "256GB"],
    priceUkUsed: 280_000,
    priceBrandNew: 420_000,
    ram: "8GB",
    category: "mid-range",
    badge: "Best Value",
    color: ["Awesome Iceblue", "Awesome Lilac", "Awesome Navy"],
  },
  {
    id: "samsung-a35",
    name: "Samsung Galaxy A35",
    brand: "samsung",
    image:
      "https://images.samsung.com/is/image/samsung/p6pim/global/2403/gallery/global-galaxy-a35-5g-sm-a356-sm-a356elgaxfe-thumb-539697741?$344_344_PNG$",
    storage: ["128GB", "256GB"],
    priceUkUsed: 200_000,
    priceBrandNew: 310_000,
    ram: "6GB",
    category: "mid-range",
    color: ["Awesome Iceblue", "Awesome Lilac", "Awesome Navy"],
  },
  {
    id: "samsung-fold-6",
    name: "Samsung Galaxy Z Fold 6",
    brand: "samsung",
    image:
      "https://images.samsung.com/is/image/samsung/p6pim/global/2407/gallery/global-galaxy-z-fold6-sm-f956-sm-f956bzkgxfe-thumb-543203148?$344_344_PNG$",
    storage: ["256GB", "512GB"],
    priceUkUsed: 1_600_000,
    priceBrandNew: 2_200_000,
    ram: "12GB",
    category: "flagship",
    badge: "Premium ✨",
    color: ["Crafted Black", "Pink", "Silver Shadow"],
  },
  {
    id: "samsung-flip-6",
    name: "Samsung Galaxy Z Flip 6",
    brand: "samsung",
    image:
      "https://images.samsung.com/is/image/samsung/p6pim/global/2407/gallery/global-galaxy-z-flip6-sm-f741-sm-f741bkgaxfe-thumb-543203037?$344_344_PNG$",
    storage: ["256GB", "512GB"],
    priceUkUsed: 900_000,
    priceBrandNew: 1_300_000,
    ram: "12GB",
    category: "flagship",
    color: ["Blue", "Craft Green", "Silver Shadow", "Yellow"],
  },

  // ── Google Pixel ───────────────────────────────────────────────────────────────
  {
    id: "pixel-9-pro-xl",
    name: "Google Pixel 9 Pro XL",
    brand: "google",
    image:
      "https://lh3.googleusercontent.com/p5FBvKNHEqQ8tlKEm_lHVIq49S4yNzVj9QnwRkDFBfLeFmAFxg9xobB7IhnNd-bCeAJdtDY6bYzVLo6EBEJBnJ7LIiUcMMEK=rw-e365-w400",
    storage: ["128GB", "256GB", "512GB", "1TB"],
    priceUkUsed: 900_000,
    priceBrandNew: 1_300_000,
    ram: "16GB",
    category: "flagship",
    badge: "Hot 🔥",
    color: ["Obsidian", "Porcelain", "Hazel", "Rose Quartz"],
  },
  {
    id: "pixel-9",
    name: "Google Pixel 9",
    brand: "google",
    image:
      "https://lh3.googleusercontent.com/Nu1Hm3Sk1LBd2B2Xd_DhFT4lA3SLzX1kLBIWRE8-UoG4lnEX0FoVnJCmX-fLExnGXG4nYpB3cC-=rw-e365-w400",
    storage: ["128GB", "256GB"],
    priceUkUsed: 650_000,
    priceBrandNew: 950_000,
    ram: "12GB",
    category: "flagship",
    badge: "Best Value",
    color: ["Obsidian", "Porcelain", "Wintergreen", "Peony"],
  },

  // ── OnePlus ────────────────────────────────────────────────────────────────────
  {
    id: "oneplus-13",
    name: "OnePlus 13",
    brand: "oneplus",
    image:
      "https://image01.oneplus.net/ebp/202501/08/1-m00-4e-77-rb8bwwabm6oaas_kaacbg8a7pwe773.png",
    storage: ["256GB", "512GB"],
    priceUkUsed: 650_000,
    priceBrandNew: 950_000,
    ram: "12GB",
    category: "flagship",
    badge: "Best Value",
    color: ["Arctic Dawn", "Midnight Ocean"],
  },

  // ── Xiaomi ─────────────────────────────────────────────────────────────────────
  {
    id: "xiaomi-15-pro",
    name: "Xiaomi 15 Pro",
    brand: "xiaomi",
    image:
      "https://i01.appmifile.com/v1/MI_18455B3E4DA706226CF7535A58E875F0/pms_1730872889.02699996.png",
    storage: ["256GB", "512GB"],
    priceUkUsed: 700_000,
    priceBrandNew: 1_050_000,
    ram: "12GB",
    category: "flagship",
    color: ["Black", "White"],
  },
  {
    id: "xiaomi-redmi-note-14-pro",
    name: "Redmi Note 14 Pro+",
    brand: "xiaomi",
    image:
      "https://i01.appmifile.com/v1/MI_18455B3E4DA706226CF7535A58E875F0/pms_1726559478.43640437.png",
    storage: ["128GB", "256GB"],
    priceUkUsed: 230_000,
    priceBrandNew: 360_000,
    ram: "8GB",
    category: "mid-range",
    badge: "Best Value",
    color: ["Aurora Purple", "Midnight Black", "Frost Blue"],
  },

  // ── Tecno ──────────────────────────────────────────────────────────────────────
  {
    id: "tecno-camon-30-pro",
    name: "Tecno Camon 30 Pro",
    brand: "tecno",
    image:
      "https://www.tecno-mobile.com/uploads/goods/2024-05-28/1716882614502.png",
    storage: ["256GB"],
    priceUkUsed: 180_000,
    priceBrandNew: 280_000,
    ram: "8GB",
    category: "mid-range",
    badge: "Popular",
    color: ["Dark Nebula", "Peach Fuzz"],
  },
  {
    id: "tecno-spark-30c",
    name: "Tecno Spark 30C",
    brand: "tecno",
    image:
      "https://www.tecno-mobile.com/uploads/goods/2024-07-10/1720602143539.png",
    storage: ["128GB"],
    priceUkUsed: 75_000,
    priceBrandNew: 120_000,
    ram: "4GB",
    category: "budget",
    badge: "Affordable",
    color: ["Silver", "Obsidian Black"],
  },

  // ── Infinix ────────────────────────────────────────────────────────────────────
  {
    id: "infinix-hot-50-pro",
    name: "Infinix Hot 50 Pro+",
    brand: "infinix",
    image:
      "https://in.infinixmobility.com/pub/media/catalog/product/h/o/hot-50-pro-plus-obsidian-black.png",
    storage: ["256GB"],
    priceUkUsed: 130_000,
    priceBrandNew: 200_000,
    ram: "8GB",
    category: "budget",
    badge: "Best Budget",
    color: ["Obsidian Black", "Shimmery Gold"],
  },
  {
    id: "infinix-zero-40",
    name: "Infinix Zero 40",
    brand: "infinix",
    image:
      "https://in.infinixmobility.com/pub/media/catalog/product/z/e/zero-40-5g-crystal-violet.png",
    storage: ["256GB"],
    priceUkUsed: 200_000,
    priceBrandNew: 310_000,
    ram: "12GB",
    category: "mid-range",
    badge: "Best Value",
    color: ["Violet", "Black"],
  },
];

export const brands = [
  { id: "all", label: "All" },
  { id: "apple", label: "iPhone" },
  { id: "samsung", label: "Samsung" },
  { id: "google", label: "Google" },
  { id: "oneplus", label: "OnePlus" },
  { id: "xiaomi", label: "Xiaomi" },
  { id: "tecno", label: "Tecno" },
  { id: "infinix", label: "Infinix" },
] as const;

export function formatPrice(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

// ─── Valuation data (existing) ────────────────────────────────────────────────

export const iphoneDevices: DeviceEntry[] = [
  {
    id: "iphone-17-pro-max-1tb",
    name: "iPhone 17 Pro Max",
    storage: "1TB",
    baseMin: 2800000,
    baseMax: 3300000,
  },
  {
    id: "iphone-17-pro-max-512",
    name: "iPhone 17 Pro Max",
    storage: "512GB",
    baseMin: 2550000,
    baseMax: 3000000,
  },
  {
    id: "iphone-17-pro-max-256",
    name: "iPhone 17 Pro Max",
    storage: "256GB",
    baseMin: 2300000,
    baseMax: 2700000,
  },
  {
    id: "iphone-17-pro-1tb",
    name: "iPhone 17 Pro",
    storage: "1TB",
    baseMin: 2500000,
    baseMax: 2950000,
  },
  {
    id: "iphone-17-pro-512",
    name: "iPhone 17 Pro",
    storage: "512GB",
    baseMin: 2250000,
    baseMax: 2650000,
  },
  {
    id: "iphone-17-pro-256",
    name: "iPhone 17 Pro",
    storage: "256GB",
    baseMin: 2000000,
    baseMax: 2400000,
  },
  {
    id: "iphone-17-pro-128",
    name: "iPhone 17 Pro",
    storage: "128GB",
    baseMin: 1800000,
    baseMax: 2150000,
  },
  {
    id: "iphone-17-air-256",
    name: "iPhone 17 Air",
    storage: "256GB",
    baseMin: 1700000,
    baseMax: 2000000,
  },
  {
    id: "iphone-17-air-128",
    name: "iPhone 17 Air",
    storage: "128GB",
    baseMin: 1500000,
    baseMax: 1800000,
  },
  {
    id: "iphone-17-512",
    name: "iPhone 17",
    storage: "512GB",
    baseMin: 1650000,
    baseMax: 1950000,
  },
  {
    id: "iphone-17-256",
    name: "iPhone 17",
    storage: "256GB",
    baseMin: 1450000,
    baseMax: 1700000,
  },
  {
    id: "iphone-17-128",
    name: "iPhone 17",
    storage: "128GB",
    baseMin: 1250000,
    baseMax: 1500000,
  },
  {
    id: "iphone-16-pro-max-1tb",
    name: "iPhone 16 Pro Max",
    storage: "1TB",
    baseMin: 2200000,
    baseMax: 2600000,
  },
  {
    id: "iphone-16-pro-max-512",
    name: "iPhone 16 Pro Max",
    storage: "512GB",
    baseMin: 2000000,
    baseMax: 2350000,
  },
  {
    id: "iphone-16-pro-max-256",
    name: "iPhone 16 Pro Max",
    storage: "256GB",
    baseMin: 1800000,
    baseMax: 2100000,
  },
  {
    id: "iphone-16-pro-1tb",
    name: "iPhone 16 Pro",
    storage: "1TB",
    baseMin: 1950000,
    baseMax: 2300000,
  },
  {
    id: "iphone-16-pro-512",
    name: "iPhone 16 Pro",
    storage: "512GB",
    baseMin: 1750000,
    baseMax: 2050000,
  },
  {
    id: "iphone-16-pro-256",
    name: "iPhone 16 Pro",
    storage: "256GB",
    baseMin: 1550000,
    baseMax: 1850000,
  },
  {
    id: "iphone-16-pro-128",
    name: "iPhone 16 Pro",
    storage: "128GB",
    baseMin: 1400000,
    baseMax: 1650000,
  },
  {
    id: "iphone-16-plus-512",
    name: "iPhone 16 Plus",
    storage: "512GB",
    baseMin: 1400000,
    baseMax: 1650000,
  },
  {
    id: "iphone-16-plus-256",
    name: "iPhone 16 Plus",
    storage: "256GB",
    baseMin: 1200000,
    baseMax: 1450000,
  },
  {
    id: "iphone-16-plus-128",
    name: "iPhone 16 Plus",
    storage: "128GB",
    baseMin: 1050000,
    baseMax: 1300000,
  },
  {
    id: "iphone-16-512",
    name: "iPhone 16",
    storage: "512GB",
    baseMin: 1250000,
    baseMax: 1500000,
  },
  {
    id: "iphone-16-256",
    name: "iPhone 16",
    storage: "256GB",
    baseMin: 1050000,
    baseMax: 1300000,
  },
  {
    id: "iphone-16-128",
    name: "iPhone 16",
    storage: "128GB",
    baseMin: 900000,
    baseMax: 1100000,
  },
  {
    id: "iphone-15-pro-max-1tb",
    name: "iPhone 15 Pro Max",
    storage: "1TB",
    baseMin: 1600000,
    baseMax: 1900000,
  },
  {
    id: "iphone-15-pro-max-512",
    name: "iPhone 15 Pro Max",
    storage: "512GB",
    baseMin: 1450000,
    baseMax: 1700000,
  },
  {
    id: "iphone-15-pro-max-256",
    name: "iPhone 15 Pro Max",
    storage: "256GB",
    baseMin: 1300000,
    baseMax: 1550000,
  },
  {
    id: "iphone-15-pro-1tb",
    name: "iPhone 15 Pro",
    storage: "1TB",
    baseMin: 1400000,
    baseMax: 1650000,
  },
  {
    id: "iphone-15-pro-512",
    name: "iPhone 15 Pro",
    storage: "512GB",
    baseMin: 1250000,
    baseMax: 1450000,
  },
  {
    id: "iphone-15-pro-256",
    name: "iPhone 15 Pro",
    storage: "256GB",
    baseMin: 1100000,
    baseMax: 1300000,
  },
  {
    id: "iphone-15-pro-128",
    name: "iPhone 15 Pro",
    storage: "128GB",
    baseMin: 950000,
    baseMax: 1150000,
  },
  {
    id: "iphone-15-plus-512",
    name: "iPhone 15 Plus",
    storage: "512GB",
    baseMin: 1000000,
    baseMax: 1250000,
  },
  {
    id: "iphone-15-plus-256",
    name: "iPhone 15 Plus",
    storage: "256GB",
    baseMin: 850000,
    baseMax: 1050000,
  },
  {
    id: "iphone-15-plus-128",
    name: "iPhone 15 Plus",
    storage: "128GB",
    baseMin: 750000,
    baseMax: 950000,
  },
  {
    id: "iphone-15-512",
    name: "iPhone 15",
    storage: "512GB",
    baseMin: 900000,
    baseMax: 1100000,
  },
  {
    id: "iphone-15-256",
    name: "iPhone 15",
    storage: "256GB",
    baseMin: 800000,
    baseMax: 1000000,
  },
  {
    id: "iphone-15-128",
    name: "iPhone 15",
    storage: "128GB",
    baseMin: 700000,
    baseMax: 900000,
  },
  {
    id: "iphone-14-pro-max-1tb",
    name: "iPhone 14 Pro Max",
    storage: "1TB",
    baseMin: 1200000,
    baseMax: 1450000,
  },
  {
    id: "iphone-14-pro-max-512",
    name: "iPhone 14 Pro Max",
    storage: "512GB",
    baseMin: 1050000,
    baseMax: 1300000,
  },
  {
    id: "iphone-14-pro-max-256",
    name: "iPhone 14 Pro Max",
    storage: "256GB",
    baseMin: 950000,
    baseMax: 1150000,
  },
  {
    id: "iphone-14-pro-max-128",
    name: "iPhone 14 Pro Max",
    storage: "128GB",
    baseMin: 850000,
    baseMax: 1050000,
  },
  {
    id: "iphone-14-pro-1tb",
    name: "iPhone 14 Pro",
    storage: "1TB",
    baseMin: 1050000,
    baseMax: 1300000,
  },
  {
    id: "iphone-14-pro-512",
    name: "iPhone 14 Pro",
    storage: "512GB",
    baseMin: 950000,
    baseMax: 1150000,
  },
  {
    id: "iphone-14-pro-256",
    name: "iPhone 14 Pro",
    storage: "256GB",
    baseMin: 850000,
    baseMax: 1050000,
  },
  {
    id: "iphone-14-pro-128",
    name: "iPhone 14 Pro",
    storage: "128GB",
    baseMin: 750000,
    baseMax: 950000,
  },
  {
    id: "iphone-14-plus-512",
    name: "iPhone 14 Plus",
    storage: "512GB",
    baseMin: 750000,
    baseMax: 950000,
  },
  {
    id: "iphone-14-plus-256",
    name: "iPhone 14 Plus",
    storage: "256GB",
    baseMin: 650000,
    baseMax: 850000,
  },
  {
    id: "iphone-14-plus-128",
    name: "iPhone 14 Plus",
    storage: "128GB",
    baseMin: 580000,
    baseMax: 750000,
  },
  {
    id: "iphone-14-512",
    name: "iPhone 14",
    storage: "512GB",
    baseMin: 700000,
    baseMax: 900000,
  },
  {
    id: "iphone-14-256",
    name: "iPhone 14",
    storage: "256GB",
    baseMin: 600000,
    baseMax: 800000,
  },
  {
    id: "iphone-14-128",
    name: "iPhone 14",
    storage: "128GB",
    baseMin: 520000,
    baseMax: 700000,
  },
  {
    id: "iphone-13-pro-max-1tb",
    name: "iPhone 13 Pro Max",
    storage: "1TB",
    baseMin: 850000,
    baseMax: 1050000,
  },
  {
    id: "iphone-13-pro-max-512",
    name: "iPhone 13 Pro Max",
    storage: "512GB",
    baseMin: 750000,
    baseMax: 950000,
  },
  {
    id: "iphone-13-pro-max-256",
    name: "iPhone 13 Pro Max",
    storage: "256GB",
    baseMin: 680000,
    baseMax: 880000,
  },
  {
    id: "iphone-13-pro-max-128",
    name: "iPhone 13 Pro Max",
    storage: "128GB",
    baseMin: 600000,
    baseMax: 800000,
  },
  {
    id: "iphone-13-pro-1tb",
    name: "iPhone 13 Pro",
    storage: "1TB",
    baseMin: 780000,
    baseMax: 980000,
  },
  {
    id: "iphone-13-pro-512",
    name: "iPhone 13 Pro",
    storage: "512GB",
    baseMin: 700000,
    baseMax: 900000,
  },
  {
    id: "iphone-13-pro-256",
    name: "iPhone 13 Pro",
    storage: "256GB",
    baseMin: 620000,
    baseMax: 820000,
  },
  {
    id: "iphone-13-pro-128",
    name: "iPhone 13 Pro",
    storage: "128GB",
    baseMin: 550000,
    baseMax: 750000,
  },
  {
    id: "iphone-13-512",
    name: "iPhone 13",
    storage: "512GB",
    baseMin: 600000,
    baseMax: 780000,
  },
  {
    id: "iphone-13-256",
    name: "iPhone 13",
    storage: "256GB",
    baseMin: 520000,
    baseMax: 680000,
  },
  {
    id: "iphone-13-128",
    name: "iPhone 13",
    storage: "128GB",
    baseMin: 450000,
    baseMax: 600000,
  },
  {
    id: "iphone-13-mini-512",
    name: "iPhone 13 Mini",
    storage: "512GB",
    baseMin: 480000,
    baseMax: 630000,
  },
  {
    id: "iphone-13-mini-256",
    name: "iPhone 13 Mini",
    storage: "256GB",
    baseMin: 400000,
    baseMax: 550000,
  },
  {
    id: "iphone-13-mini-128",
    name: "iPhone 13 Mini",
    storage: "128GB",
    baseMin: 350000,
    baseMax: 480000,
  },
  {
    id: "iphone-12-pro-max-512",
    name: "iPhone 12 Pro Max",
    storage: "512GB",
    baseMin: 480000,
    baseMax: 620000,
  },
  {
    id: "iphone-12-pro-max-256",
    name: "iPhone 12 Pro Max",
    storage: "256GB",
    baseMin: 420000,
    baseMax: 560000,
  },
  {
    id: "iphone-12-pro-max-128",
    name: "iPhone 12 Pro Max",
    storage: "128GB",
    baseMin: 380000,
    baseMax: 500000,
  },
  {
    id: "iphone-12-pro-512",
    name: "iPhone 12 Pro",
    storage: "512GB",
    baseMin: 440000,
    baseMax: 580000,
  },
  {
    id: "iphone-12-pro-256",
    name: "iPhone 12 Pro",
    storage: "256GB",
    baseMin: 390000,
    baseMax: 520000,
  },
  {
    id: "iphone-12-pro-128",
    name: "iPhone 12 Pro",
    storage: "128GB",
    baseMin: 350000,
    baseMax: 470000,
  },
  {
    id: "iphone-12-256",
    name: "iPhone 12",
    storage: "256GB",
    baseMin: 340000,
    baseMax: 460000,
  },
  {
    id: "iphone-12-128",
    name: "iPhone 12",
    storage: "128GB",
    baseMin: 300000,
    baseMax: 420000,
  },
  {
    id: "iphone-12-64",
    name: "iPhone 12",
    storage: "64GB",
    baseMin: 260000,
    baseMax: 370000,
  },
  {
    id: "iphone-12-mini-256",
    name: "iPhone 12 Mini",
    storage: "256GB",
    baseMin: 280000,
    baseMax: 390000,
  },
  {
    id: "iphone-12-mini-128",
    name: "iPhone 12 Mini",
    storage: "128GB",
    baseMin: 250000,
    baseMax: 350000,
  },
  {
    id: "iphone-12-mini-64",
    name: "iPhone 12 Mini",
    storage: "64GB",
    baseMin: 220000,
    baseMax: 310000,
  },
  {
    id: "iphone-11-pro-max-512",
    name: "iPhone 11 Pro Max",
    storage: "512GB",
    baseMin: 300000,
    baseMax: 400000,
  },
  {
    id: "iphone-11-pro-max-256",
    name: "iPhone 11 Pro Max",
    storage: "256GB",
    baseMin: 270000,
    baseMax: 360000,
  },
  {
    id: "iphone-11-pro-max-64",
    name: "iPhone 11 Pro Max",
    storage: "64GB",
    baseMin: 240000,
    baseMax: 330000,
  },
  {
    id: "iphone-11-pro-512",
    name: "iPhone 11 Pro",
    storage: "512GB",
    baseMin: 280000,
    baseMax: 380000,
  },
  {
    id: "iphone-11-pro-256",
    name: "iPhone 11 Pro",
    storage: "256GB",
    baseMin: 250000,
    baseMax: 340000,
  },
  {
    id: "iphone-11-pro-64",
    name: "iPhone 11 Pro",
    storage: "64GB",
    baseMin: 220000,
    baseMax: 310000,
  },
  {
    id: "iphone-11-256",
    name: "iPhone 11",
    storage: "256GB",
    baseMin: 240000,
    baseMax: 330000,
  },
  {
    id: "iphone-11-128",
    name: "iPhone 11",
    storage: "128GB",
    baseMin: 210000,
    baseMax: 290000,
  },
  {
    id: "iphone-11-64",
    name: "iPhone 11",
    storage: "64GB",
    baseMin: 185000,
    baseMax: 260000,
  },
  {
    id: "iphone-xs-max-512",
    name: "iPhone XS Max",
    storage: "512GB",
    baseMin: 220000,
    baseMax: 300000,
  },
  {
    id: "iphone-xs-max-256",
    name: "iPhone XS Max",
    storage: "256GB",
    baseMin: 195000,
    baseMax: 270000,
  },
  {
    id: "iphone-xs-max-64",
    name: "iPhone XS Max",
    storage: "64GB",
    baseMin: 170000,
    baseMax: 240000,
  },
  {
    id: "iphone-xs-512",
    name: "iPhone XS",
    storage: "512GB",
    baseMin: 195000,
    baseMax: 270000,
  },
  {
    id: "iphone-xs-256",
    name: "iPhone XS",
    storage: "256GB",
    baseMin: 170000,
    baseMax: 240000,
  },
  {
    id: "iphone-xs-64",
    name: "iPhone XS",
    storage: "64GB",
    baseMin: 150000,
    baseMax: 210000,
  },
  {
    id: "iphone-xr-256",
    name: "iPhone XR",
    storage: "256GB",
    baseMin: 175000,
    baseMax: 245000,
  },
  {
    id: "iphone-xr-128",
    name: "iPhone XR",
    storage: "128GB",
    baseMin: 155000,
    baseMax: 220000,
  },
  {
    id: "iphone-xr-64",
    name: "iPhone XR",
    storage: "64GB",
    baseMin: 135000,
    baseMax: 195000,
  },
  {
    id: "iphone-se-3-256",
    name: "iPhone SE (3rd Gen)",
    storage: "256GB",
    baseMin: 250000,
    baseMax: 340000,
  },
  {
    id: "iphone-se-3-128",
    name: "iPhone SE (3rd Gen)",
    storage: "128GB",
    baseMin: 210000,
    baseMax: 290000,
  },
  {
    id: "iphone-se-3-64",
    name: "iPhone SE (3rd Gen)",
    storage: "64GB",
    baseMin: 180000,
    baseMax: 250000,
  },
  {
    id: "iphone-se-2-256",
    name: "iPhone SE (2nd Gen)",
    storage: "256GB",
    baseMin: 160000,
    baseMax: 220000,
  },
  {
    id: "iphone-se-2-128",
    name: "iPhone SE (2nd Gen)",
    storage: "128GB",
    baseMin: 130000,
    baseMax: 185000,
  },
  {
    id: "iphone-se-2-64",
    name: "iPhone SE (2nd Gen)",
    storage: "64GB",
    baseMin: 110000,
    baseMax: 160000,
  },
  {
    id: "other-iphone",
    name: "Other (type manually)",
    storage: "",
    baseMin: 0,
    baseMax: 0,
  },
];

export const androidDevices: DeviceEntry[] = [
  {
    id: "s24-ultra-1tb",
    name: "Samsung S24 Ultra",
    storage: "1TB",
    baseMin: 1350000,
    baseMax: 1600000,
    ram: "12GB",
    chip: "Snapdragon 8 Gen 3",
    display: '6.8" Dynamic AMOLED',
  },
  {
    id: "s24-ultra-512",
    name: "Samsung S24 Ultra",
    storage: "512GB",
    baseMin: 1150000,
    baseMax: 1400000,
    ram: "12GB",
    chip: "Snapdragon 8 Gen 3",
    display: '6.8" Dynamic AMOLED',
  },
  {
    id: "s24-ultra-256",
    name: "Samsung S24 Ultra",
    storage: "256GB",
    baseMin: 950000,
    baseMax: 1200000,
    ram: "12GB",
    chip: "Snapdragon 8 Gen 3",
    display: '6.8" Dynamic AMOLED',
  },
  {
    id: "s24-plus-512",
    name: "Samsung S24+",
    storage: "512GB",
    baseMin: 800000,
    baseMax: 1000000,
    ram: "12GB",
    chip: "Snapdragon 8 Gen 3",
    display: '6.7" Dynamic AMOLED',
  },
  {
    id: "s24-plus-256",
    name: "Samsung S24+",
    storage: "256GB",
    baseMin: 700000,
    baseMax: 900000,
    ram: "12GB",
    chip: "Snapdragon 8 Gen 3",
    display: '6.7" Dynamic AMOLED',
  },
  {
    id: "s24-256",
    name: "Samsung S24",
    storage: "256GB",
    baseMin: 650000,
    baseMax: 850000,
    ram: "8GB",
    chip: "Snapdragon 8 Gen 3",
    display: '6.2" Dynamic AMOLED',
  },
  {
    id: "s24-128",
    name: "Samsung S24",
    storage: "128GB",
    baseMin: 550000,
    baseMax: 750000,
    ram: "8GB",
    chip: "Snapdragon 8 Gen 3",
    display: '6.2" Dynamic AMOLED',
  },
  {
    id: "s23-ultra-512",
    name: "Samsung S23 Ultra",
    storage: "512GB",
    baseMin: 750000,
    baseMax: 950000,
    ram: "12GB",
    chip: "Snapdragon 8 Gen 2",
    display: '6.8" Dynamic AMOLED',
  },
  {
    id: "s23-ultra-256",
    name: "Samsung S23 Ultra",
    storage: "256GB",
    baseMin: 650000,
    baseMax: 850000,
    ram: "12GB",
    chip: "Snapdragon 8 Gen 2",
    display: '6.8" Dynamic AMOLED',
  },
  {
    id: "s23-256",
    name: "Samsung S23",
    storage: "256GB",
    baseMin: 450000,
    baseMax: 620000,
    ram: "8GB",
    chip: "Snapdragon 8 Gen 2",
    display: '6.1" Dynamic AMOLED',
  },
  {
    id: "s23-128",
    name: "Samsung S23",
    storage: "128GB",
    baseMin: 380000,
    baseMax: 520000,
    ram: "8GB",
    chip: "Snapdragon 8 Gen 2",
    display: '6.1" Dynamic AMOLED',
  },
  {
    id: "pixel-8-pro-256",
    name: "Google Pixel 8 Pro",
    storage: "256GB",
    baseMin: 750000,
    baseMax: 950000,
    ram: "12GB",
    chip: "Google Tensor G3",
    display: '6.7" LTPO OLED',
  },
  {
    id: "pixel-8-256",
    name: "Google Pixel 8",
    storage: "256GB",
    baseMin: 600000,
    baseMax: 780000,
    ram: "8GB",
    chip: "Google Tensor G3",
    display: '6.2" OLED',
  },
  {
    id: "pixel-8-128",
    name: "Google Pixel 8",
    storage: "128GB",
    baseMin: 500000,
    baseMax: 670000,
    ram: "8GB",
    chip: "Google Tensor G3",
    display: '6.2" OLED',
  },
  {
    id: "tecno-camon-20-256",
    name: "Tecno Camon 20",
    storage: "256GB",
    baseMin: 180000,
    baseMax: 250000,
    ram: "8GB",
    chip: "Helio G85",
    display: '6.67" AMOLED',
  },
  {
    id: "tecno-camon-20-128",
    name: "Tecno Camon 20",
    storage: "128GB",
    baseMin: 150000,
    baseMax: 210000,
    ram: "8GB",
    chip: "Helio G85",
    display: '6.67" AMOLED',
  },
  {
    id: "infinix-note-40-256",
    name: "Infinix Note 40",
    storage: "256GB",
    baseMin: 160000,
    baseMax: 230000,
    ram: "8GB",
    chip: "Helio G99",
    display: '6.78" AMOLED',
  },
  {
    id: "infinix-note-40-128",
    name: "Infinix Note 40",
    storage: "128GB",
    baseMin: 130000,
    baseMax: 190000,
    ram: "8GB",
    chip: "Helio G99",
    display: '6.78" AMOLED',
  },
  {
    id: "other-android",
    name: "Other (type manually)",
    storage: "",
    baseMin: 0,
    baseMax: 0,
    ram: "",
    chip: "",
    display: "",
  },
];

export const laptopDevices: Record<LaptopType, DeviceEntry[]> = {
  macbook: [
    {
      id: "mbp-m3-2tb",
      name: "MacBook Pro M3",
      storage: "2TB",
      baseMin: 2200000,
      baseMax: 2700000,
      ram: "36GB",
      chip: "Apple M3 Max",
      display: '16" Liquid Retina XDR',
    },
    {
      id: "mbp-m3-1tb",
      name: "MacBook Pro M3",
      storage: "1TB",
      baseMin: 1800000,
      baseMax: 2200000,
      ram: "18GB",
      chip: "Apple M3 Pro",
      display: '14" / 16" Liquid Retina XDR',
    },
    {
      id: "mbp-m3-512",
      name: "MacBook Pro M3",
      storage: "512GB",
      baseMin: 1500000,
      baseMax: 1900000,
      ram: "18GB",
      chip: "Apple M3",
      display: '14" Liquid Retina XDR',
    },
    {
      id: "mbp-m2-1tb",
      name: "MacBook Pro M2",
      storage: "1TB",
      baseMin: 1600000,
      baseMax: 2000000,
      ram: "32GB",
      chip: "Apple M2 Pro",
      display: '14" / 16" Liquid Retina XDR',
    },
    {
      id: "mbp-m2-512",
      name: "MacBook Pro M2",
      storage: "512GB",
      baseMin: 1300000,
      baseMax: 1700000,
      ram: "16GB",
      chip: "Apple M2 Pro",
      display: '14" Liquid Retina XDR',
    },
    {
      id: "mba-m2-512",
      name: "MacBook Air M2",
      storage: "512GB",
      baseMin: 1100000,
      baseMax: 1450000,
      ram: "16GB",
      chip: "Apple M2",
      display: '13.6" Liquid Retina',
    },
    {
      id: "mba-m2-256",
      name: "MacBook Air M2",
      storage: "256GB",
      baseMin: 900000,
      baseMax: 1200000,
      ram: "8GB",
      chip: "Apple M2",
      display: '13.6" Liquid Retina',
    },
    {
      id: "mba-m1-512",
      name: "MacBook Air M1",
      storage: "512GB",
      baseMin: 750000,
      baseMax: 980000,
      ram: "16GB",
      chip: "Apple M1",
      display: '13.3" Retina',
    },
    {
      id: "mba-m1-256",
      name: "MacBook Air M1",
      storage: "256GB",
      baseMin: 600000,
      baseMax: 820000,
      ram: "8GB",
      chip: "Apple M1",
      display: '13.3" Retina',
    },
    {
      id: "mbp-m1-1tb",
      name: "MacBook Pro M1",
      storage: "1TB",
      baseMin: 1000000,
      baseMax: 1350000,
      ram: "16GB",
      chip: "Apple M1 Pro",
      display: '14" Liquid Retina XDR',
    },
    {
      id: "mbp-m1-512",
      name: "MacBook Pro M1",
      storage: "512GB",
      baseMin: 850000,
      baseMax: 1100000,
      ram: "16GB",
      chip: "Apple M1 Pro",
      display: '14" Liquid Retina XDR',
    },
    {
      id: "other-macbook",
      name: "Other (type manually)",
      storage: "",
      baseMin: 0,
      baseMax: 0,
      ram: "",
      chip: "",
      display: "",
    },
  ],
  windows: [
    {
      id: "dell-xps-15-2tb",
      name: "Dell XPS 15",
      storage: "2TB",
      baseMin: 1500000,
      baseMax: 1900000,
      ram: "32GB",
      chip: "Intel i9 13th Gen",
      display: '15.6" OLED',
    },
    {
      id: "dell-xps-15-1tb",
      name: "Dell XPS 15",
      storage: "1TB",
      baseMin: 1200000,
      baseMax: 1600000,
      ram: "32GB",
      chip: "Intel i7 13th Gen",
      display: '15.6" OLED/IPS',
    },
    {
      id: "dell-xps-15-512",
      name: "Dell XPS 15",
      storage: "512GB",
      baseMin: 950000,
      baseMax: 1300000,
      ram: "16GB",
      chip: "Intel i7 13th Gen",
      display: '15.6" IPS',
    },
    {
      id: "hp-spectre-1tb",
      name: "HP Spectre x360",
      storage: "1TB",
      baseMin: 1000000,
      baseMax: 1350000,
      ram: "32GB",
      chip: "Intel i7 13th Gen",
      display: '13.5" OLED',
    },
    {
      id: "hp-spectre-512",
      name: "HP Spectre x360",
      storage: "512GB",
      baseMin: 800000,
      baseMax: 1100000,
      ram: "16GB",
      chip: "Intel i7 13th Gen",
      display: '13.5" OLED',
    },
    {
      id: "lenovo-x1-1tb",
      name: "Lenovo ThinkPad X1",
      storage: "1TB",
      baseMin: 900000,
      baseMax: 1200000,
      ram: "32GB",
      chip: "Intel i7 12th Gen",
      display: '14" IPS',
    },
    {
      id: "lenovo-x1-512",
      name: "Lenovo ThinkPad X1",
      storage: "512GB",
      baseMin: 700000,
      baseMax: 950000,
      ram: "16GB",
      chip: "Intel i7 12th Gen",
      display: '14" IPS',
    },
    {
      id: "hp-elite-512",
      name: "HP EliteBook",
      storage: "512GB",
      baseMin: 550000,
      baseMax: 780000,
      ram: "16GB",
      chip: "Intel i7",
      display: '14" IPS',
    },
    {
      id: "hp-elite-256",
      name: "HP EliteBook",
      storage: "256GB",
      baseMin: 400000,
      baseMax: 600000,
      ram: "8GB",
      chip: "Intel i5",
      display: '14" IPS',
    },
    {
      id: "dell-lat-512",
      name: "Dell Latitude",
      storage: "512GB",
      baseMin: 450000,
      baseMax: 680000,
      ram: "16GB",
      chip: "Intel i7",
      display: '14" IPS',
    },
    {
      id: "dell-lat-256",
      name: "Dell Latitude",
      storage: "256GB",
      baseMin: 320000,
      baseMax: 500000,
      ram: "8GB",
      chip: "Intel i5",
      display: '14" IPS',
    },
    {
      id: "other-windows",
      name: "Other (type manually)",
      storage: "",
      baseMin: 0,
      baseMax: 0,
      ram: "",
      chip: "",
      display: "",
    },
  ],
  linux: [
    {
      id: "thinkpad-x1-1tb",
      name: "ThinkPad X1 Carbon",
      storage: "1TB",
      baseMin: 850000,
      baseMax: 1100000,
      ram: "32GB",
      chip: "Intel i7",
      display: '14" IPS',
    },
    {
      id: "thinkpad-x1-512",
      name: "ThinkPad X1 Carbon",
      storage: "512GB",
      baseMin: 650000,
      baseMax: 900000,
      ram: "16GB",
      chip: "Intel i7",
      display: '14" IPS',
    },
    {
      id: "dell-xps-dev-1tb",
      name: "Dell XPS Developer",
      storage: "1TB",
      baseMin: 1000000,
      baseMax: 1350000,
      ram: "32GB",
      chip: "Intel i7",
      display: '13.4" OLED',
    },
    {
      id: "dell-xps-dev-512",
      name: "Dell XPS Developer",
      storage: "512GB",
      baseMin: 800000,
      baseMax: 1050000,
      ram: "16GB",
      chip: "Intel i7",
      display: '13.4" OLED',
    },
    {
      id: "other-linux",
      name: "Other (type manually)",
      storage: "",
      baseMin: 0,
      baseMax: 0,
      ram: "",
      chip: "",
      display: "",
    },
  ],
  gaming: [
    {
      id: "asus-rog-2tb",
      name: "ASUS ROG Strix",
      storage: "2TB",
      baseMin: 1500000,
      baseMax: 2000000,
      ram: "32GB",
      chip: "Intel i9 + RTX 4080",
      display: '15.6" 240Hz QHD',
    },
    {
      id: "asus-rog-1tb",
      name: "ASUS ROG Strix",
      storage: "1TB",
      baseMin: 1200000,
      baseMax: 1600000,
      ram: "32GB",
      chip: "Intel i7 + RTX 4070",
      display: '15.6" 144Hz IPS',
    },
    {
      id: "asus-rog-512",
      name: "ASUS ROG Strix",
      storage: "512GB",
      baseMin: 1000000,
      baseMax: 1350000,
      ram: "16GB",
      chip: "Intel i7 + RTX 4060",
      display: '15.6" 144Hz IPS',
    },
    {
      id: "msi-raider-2tb",
      name: "MSI Raider GE78",
      storage: "2TB",
      baseMin: 1800000,
      baseMax: 2400000,
      ram: "32GB",
      chip: "Intel i9 + RTX 4090",
      display: '17" QHD 240Hz',
    },
    {
      id: "msi-raider-1tb",
      name: "MSI Raider GE78",
      storage: "1TB",
      baseMin: 1400000,
      baseMax: 1900000,
      ram: "32GB",
      chip: "Intel i9 + RTX 4080",
      display: '17" QHD 240Hz',
    },
    {
      id: "razer-blade-1tb",
      name: "Razer Blade 15",
      storage: "1TB",
      baseMin: 1400000,
      baseMax: 1900000,
      ram: "32GB",
      chip: "Intel i7 + RTX 4070",
      display: '15.6" QHD 240Hz',
    },
    {
      id: "razer-blade-512",
      name: "Razer Blade 15",
      storage: "512GB",
      baseMin: 1150000,
      baseMax: 1550000,
      ram: "16GB",
      chip: "Intel i7 + RTX 4060",
      display: '15.6" FHD 165Hz',
    },
    {
      id: "legion-1tb",
      name: "Lenovo Legion 5",
      storage: "1TB",
      baseMin: 1000000,
      baseMax: 1400000,
      ram: "32GB",
      chip: "AMD Ryzen 7 + RTX 4070",
      display: '15.6" QHD 165Hz',
    },
    {
      id: "legion-512",
      name: "Lenovo Legion 5",
      storage: "512GB",
      baseMin: 800000,
      baseMax: 1100000,
      ram: "16GB",
      chip: "AMD Ryzen 7 + RTX 4060",
      display: '15.6" FHD 144Hz',
    },
    {
      id: "hp-omen-1tb",
      name: "HP Omen 16",
      storage: "1TB",
      baseMin: 950000,
      baseMax: 1300000,
      ram: "32GB",
      chip: "Intel i7 + RTX 4070",
      display: '16.1" QHD 165Hz',
    },
    {
      id: "hp-omen-512",
      name: "HP Omen 16",
      storage: "512GB",
      baseMin: 750000,
      baseMax: 1050000,
      ram: "16GB",
      chip: "Intel i7 + RTX 4060",
      display: '16.1" FHD 144Hz',
    },
    {
      id: "other-gaming",
      name: "Other (type manually)",
      storage: "",
      baseMin: 0,
      baseMax: 0,
      ram: "",
      chip: "",
      display: "",
    },
  ],
};

export const wantedDevices: string[] = [
  "iPhone 15 Pro Max 1TB",
  "iPhone 15 Pro Max 512GB",
  "iPhone 15 Pro 256GB",
  "iPhone 15 Pro 512GB",
  "iPhone 15 128GB",
  "iPhone 14 Pro Max 256GB",
  "Samsung S24 Ultra 512GB",
  "Samsung S24 Ultra 256GB",
  "MacBook Pro M3",
  "MacBook Air M2",
  "ASUS ROG Strix",
  "Custom (type below)",
];

export function getDevices(
  category: DeviceCategory | "",
  subType: SubType | ""
): DeviceEntry[] {
  if (!category || !subType) return [];
  if (category === "phone")
    return subType === "iphone" ? iphoneDevices : androidDevices;
  return laptopDevices[subType as LaptopType] ?? [];
}

export function validateIMEI(imei: string): boolean {
  const digits = imei.replace(/\s/g, "");
  if (!/^\d{15}$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 15; i++) {
    let d = parseInt(digits[i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

export function calculateValuation(form: FormData) {
  const isOther = form.deviceId.startsWith("other-");
  const devices = getDevices(form.category, form.subType);
  const device = devices.find((d) => d.id === form.deviceId);
  if (!device && !isOther) return null;

  let basePrice: number, deviceName: string, deviceStorage: string;
  if (isOther) {
    basePrice = Number(form.customDevicePrice) || 0;
    deviceName = form.customDeviceName || "Custom Device";
    deviceStorage = "";
    if (!basePrice) return null;
  } else {
    basePrice = (device!.baseMin + device!.baseMax) / 2;
    deviceName = device!.name;
    deviceStorage = device!.storage;
  }

  let deduction = 0;
  const battery = Number(form.batteryHealth);
  if (battery < 80) deduction += 0.2;
  else if (battery < 85) deduction += 0.12;
  else if (battery < 90) deduction += 0.07;
  else if (battery < 95) deduction += 0.03;
  if (form.batteryChanged) deduction += 0.08;
  if (form.screenChanged) deduction += 0.15;
  if (form.cameraChanged) deduction += 0.1;
  if (form.faceIdStatus === "broken") deduction += 0.1;
  if (form.simType === "locked") deduction += 0.1;
  else if (form.simType === "esim-unlocked") deduction += 0.05;
  if (form.keyboardChanged) deduction += 0.08;
  if (form.ramUpgraded) deduction -= 0.05;
  if (form.storageUpgraded) deduction -= 0.05;
  if (form.otherRepairs.trim()) deduction += 0.05;
  deduction = Math.max(-0.1, Math.min(deduction, 0.55));
  const valuedPrice = Math.round(basePrice * (1 - deduction));

  return {
    device: { ...device, name: deviceName, storage: deviceStorage },
    deductionPercent: Math.round(deduction * 100),
    minVal: Math.round(valuedPrice * 0.9),
    maxVal: Math.round(valuedPrice * 1.05),
    basePrice,
  };
}

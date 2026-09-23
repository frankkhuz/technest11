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
    badge: "New",
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
    badge: "Hot",
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
    badge: "Hot",
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
    badge: "Hot",
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
    badge: "Premium",
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
    badge: "Hot",
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

// ─── Buy Page: Other gadgets (cameras, watches, styluses, keyboards, etc.) ────
// Rendered with a category icon rather than a hotlinked photo — keeps every
// card reliable (no broken-image risk) until real product photography is
// added, and keeps categories visually distinct at a glance.

export type GadgetCategoryKey =
  | "camera"
  | "watch"
  | "stylus"
  | "keyboard"
  | "audio"
  | "tablet"
  | "accessory"
  | "security"
  | "drone"
  | "power"
  | "router"
  | "mifi"
  | "laptop"
  | "console";

export type BuyGadget = {
  id: string;
  name: string;
  brand: string;
  gadgetCategory: GadgetCategoryKey;
  spec?: string;
  priceUkUsed: number;
  priceBrandNew: number;
  badge?: string;
  /** Free-text use-case keywords (e.g. "home security", "wedding", "no light") — used by the AI gadget recommender to match a plain-language request to a real catalog item. */
  tags?: string[];
};

export const gadgetCategories = [
  { id: "camera", label: "Cameras" },
  { id: "watch", label: "Smartwatches" },
  { id: "stylus", label: "Styluses" },
  { id: "keyboard", label: "Keyboards" },
  { id: "audio", label: "Audio" },
  { id: "tablet", label: "Tablets" },
  { id: "accessory", label: "Accessories" },
  { id: "security", label: "Security Cameras" },
  { id: "drone", label: "Drones & Gimbals" },
  { id: "power", label: "Power & Solar" },
  { id: "router", label: "Routers" },
  { id: "mifi", label: "MiFi & Hotspots" },
  { id: "laptop", label: "Laptops" },
  { id: "console", label: "Gaming Consoles" },
] as const;

export const gadgets: BuyGadget[] = [
  // ── Cameras ──────────────────────────────────────────────────────────────────
  {
    id: "canon-eos-r50",
    name: "Canon EOS R50",
    brand: "Canon",
    gadgetCategory: "camera",
    spec: "24MP · 4K Video",
    priceUkUsed: 620_000,
    priceBrandNew: 850_000,
    badge: "Best Value",
  },
  {
    id: "sony-a6400",
    name: "Sony Alpha a6400",
    brand: "Sony",
    gadgetCategory: "camera",
    spec: "24MP · Mirrorless",
    priceUkUsed: 720_000,
    priceBrandNew: 980_000,
  },
  {
    id: "fujifilm-xt30ii",
    name: "Fujifilm X-T30 II",
    brand: "Fujifilm",
    gadgetCategory: "camera",
    spec: "26MP · Retro Body",
    priceUkUsed: 680_000,
    priceBrandNew: 920_000,
  },
  {
    id: "gopro-hero12",
    name: "GoPro Hero 12 Black",
    brand: "GoPro",
    gadgetCategory: "camera",
    spec: "5.3K Action Cam",
    priceUkUsed: 320_000,
    priceBrandNew: 450_000,
    badge: "Hot",
  },

  // ── Smartwatches ─────────────────────────────────────────────────────────────
  {
    id: "apple-watch-series-10",
    name: "Apple Watch Series 10",
    brand: "Apple",
    gadgetCategory: "watch",
    spec: "46mm · GPS",
    priceUkUsed: 380_000,
    priceBrandNew: 520_000,
    badge: "New",
  },
  {
    id: "apple-watch-ultra-2",
    name: "Apple Watch Ultra 2",
    brand: "Apple",
    gadgetCategory: "watch",
    spec: "49mm · Titanium",
    priceUkUsed: 650_000,
    priceBrandNew: 890_000,
    badge: "Flagship",
  },
  {
    id: "samsung-galaxy-watch-6",
    name: "Samsung Galaxy Watch 6",
    brand: "Samsung",
    gadgetCategory: "watch",
    spec: "44mm · AMOLED",
    priceUkUsed: 250_000,
    priceBrandNew: 340_000,
    badge: "Best Value",
  },

  // ── Styluses ("magic pens") ──────────────────────────────────────────────────
  {
    id: "apple-pencil-pro",
    name: "Apple Pencil Pro",
    brand: "Apple",
    gadgetCategory: "stylus",
    spec: "For iPad Pro/Air",
    priceUkUsed: 95_000,
    priceBrandNew: 135_000,
    badge: "New",
  },
  {
    id: "apple-pencil-2nd-gen",
    name: "Apple Pencil (2nd Gen)",
    brand: "Apple",
    gadgetCategory: "stylus",
    spec: "Wireless Charging",
    priceUkUsed: 65_000,
    priceBrandNew: 95_000,
  },
  {
    id: "samsung-s-pen-pro",
    name: "Samsung S Pen Pro",
    brand: "Samsung",
    gadgetCategory: "stylus",
    spec: "Bluetooth · Multi-device",
    priceUkUsed: 40_000,
    priceBrandNew: 65_000,
  },

  // ── Keyboards ("magic keyboards") ────────────────────────────────────────────
  {
    id: "apple-magic-keyboard-ipad-pro",
    name: "Apple Magic Keyboard for iPad Pro",
    brand: "Apple",
    gadgetCategory: "keyboard",
    spec: "Backlit · Trackpad",
    priceUkUsed: 180_000,
    priceBrandNew: 250_000,
    badge: "Flagship",
  },
  {
    id: "apple-magic-keyboard",
    name: "Apple Magic Keyboard",
    brand: "Apple",
    gadgetCategory: "keyboard",
    spec: "Wireless · Compact",
    priceUkUsed: 55_000,
    priceBrandNew: 85_000,
  },
  {
    id: "logitech-mx-keys",
    name: "Logitech MX Keys",
    brand: "Logitech",
    gadgetCategory: "keyboard",
    spec: "Backlit · Multi-device",
    priceUkUsed: 60_000,
    priceBrandNew: 90_000,
    badge: "Best Value",
  },

  // ── Audio ────────────────────────────────────────────────────────────────────
  {
    id: "airpods-pro-2",
    name: "AirPods Pro (2nd Gen)",
    brand: "Apple",
    gadgetCategory: "audio",
    spec: "ANC · USB-C",
    priceUkUsed: 150_000,
    priceBrandNew: 210_000,
    badge: "Hot",
  },
  {
    id: "sony-wh1000xm5",
    name: "Sony WH-1000XM5",
    brand: "Sony",
    gadgetCategory: "audio",
    spec: "Over-ear · ANC",
    priceUkUsed: 220_000,
    priceBrandNew: 310_000,
  },
  {
    id: "samsung-galaxy-buds3-pro",
    name: "Samsung Galaxy Buds3 Pro",
    brand: "Samsung",
    gadgetCategory: "audio",
    spec: "ANC · In-ear",
    priceUkUsed: 130_000,
    priceBrandNew: 190_000,
  },

  // ── Tablets ──────────────────────────────────────────────────────────────────
  {
    id: "ipad-air",
    name: "iPad Air",
    brand: "Apple",
    gadgetCategory: "tablet",
    spec: "11-inch · M2 Chip",
    priceUkUsed: 480_000,
    priceBrandNew: 650_000,
    badge: "Best Value",
  },
  {
    id: "ipad-pro",
    name: "iPad Pro",
    brand: "Apple",
    gadgetCategory: "tablet",
    spec: "13-inch · M4 Chip",
    priceUkUsed: 820_000,
    priceBrandNew: 1_150_000,
    badge: "Flagship",
  },
  {
    id: "galaxy-tab-s9",
    name: "Samsung Galaxy Tab S9",
    brand: "Samsung",
    gadgetCategory: "tablet",
    spec: "11-inch · AMOLED",
    priceUkUsed: 450_000,
    priceBrandNew: 620_000,
  },

  // ── Accessories ──────────────────────────────────────────────────────────────
  {
    id: "magsafe-charger",
    name: "Apple MagSafe Charger",
    brand: "Apple",
    gadgetCategory: "accessory",
    spec: "15W Wireless",
    priceUkUsed: 22_000,
    priceBrandNew: 35_000,
    tags: ["charger", "wireless charger", "iphone accessory"],
  },
  {
    id: "anker-powerbank-20k",
    name: "Anker 20,000mAh Power Bank",
    brand: "Anker",
    gadgetCategory: "accessory",
    spec: "Fast Charging",
    priceUkUsed: 28_000,
    priceBrandNew: 42_000,
    badge: "Best Value",
    tags: ["power bank", "portable charger", "battery backup"],
  },
  {
    id: "apple-20w-charger",
    name: "Apple 20W USB-C Power Adapter",
    brand: "Apple",
    gadgetCategory: "accessory",
    spec: "20W Fast Charge Wall Adapter",
    priceUkUsed: 12_000,
    priceBrandNew: 18_000,
    badge: "Best Value",
    tags: ["charger", "wall adapter", "fast charger", "iphone charger"],
  },
  {
    id: "samsung-25w-charger",
    name: "Samsung 25W Super Fast Charger",
    brand: "Samsung",
    gadgetCategory: "accessory",
    spec: "25W Wall Adapter",
    priceUkUsed: 10_000,
    priceBrandNew: 15_000,
    tags: ["charger", "wall adapter", "fast charger", "android charger"],
  },
  {
    id: "anker-65w-gan-charger",
    name: "Anker 65W GaN Charger",
    brand: "Anker",
    gadgetCategory: "accessory",
    spec: "65W · 3-Port · Laptop + Phone",
    priceUkUsed: 25_000,
    priceBrandNew: 38_000,
    badge: "Hot",
    tags: ["charger", "laptop charger", "fast charger", "multi-port"],
  },
  {
    id: "usb-c-to-c-cable",
    name: "USB-C to USB-C Cable (1m)",
    brand: "Generic",
    gadgetCategory: "accessory",
    spec: "60W PD · Braided",
    priceUkUsed: 3_500,
    priceBrandNew: 5_500,
    badge: "Best Value",
    tags: ["usb-c cable", "type-c cable", "charging cable", "cord"],
  },
  {
    id: "usb-c-to-lightning-cable",
    name: "USB-C to Lightning Cable (1m)",
    brand: "Apple",
    gadgetCategory: "accessory",
    spec: "MFi Certified · Fast Charge",
    priceUkUsed: 8_000,
    priceBrandNew: 12_000,
    tags: ["lightning cable", "iphone cable", "charging cable", "cord"],
  },
  {
    id: "usb-a-to-c-cable",
    name: "USB-A to USB-C Cable (1m)",
    brand: "Generic",
    gadgetCategory: "accessory",
    spec: "18W · Nylon Braided",
    priceUkUsed: 2_500,
    priceBrandNew: 4_000,
    tags: ["usb cable", "type-c cable", "charging cable", "cord"],
  },
  {
    id: "usb-c-hub-multiport",
    name: "USB-C Multiport Hub",
    brand: "Ugreen",
    gadgetCategory: "accessory",
    spec: "USB-C → HDMI + USB-A + SD + PD",
    priceUkUsed: 18_000,
    priceBrandNew: 27_000,
    badge: "Best Value",
    tags: ["usb-c hub", "adapter", "hdmi adapter", "laptop accessory"],
  },
  {
    id: "hdmi-cable-2m",
    name: "HDMI Cable (2m)",
    brand: "Generic",
    gadgetCategory: "accessory",
    spec: "4K@60Hz · High Speed",
    priceUkUsed: 4_500,
    priceBrandNew: 7_000,
    tags: ["hdmi cable", "hdmi", "tv cable", "monitor cable"],
  },
  {
    id: "usb-c-to-hdmi-cable",
    name: "USB-C to HDMI Cable (2m)",
    brand: "Ugreen",
    gadgetCategory: "accessory",
    spec: "4K@60Hz · Laptop/Phone to TV",
    priceUkUsed: 7_500,
    priceBrandNew: 11_000,
    tags: ["hdmi cable", "usb-c to hdmi", "laptop accessory", "screen mirroring"],
  },
  {
    id: "wireless-mouse",
    name: "Logitech M240 Wireless Mouse",
    brand: "Logitech",
    gadgetCategory: "accessory",
    spec: "Bluetooth · Silent Click",
    priceUkUsed: 9_000,
    priceBrandNew: 14_000,
    badge: "Best Value",
    tags: ["mouse", "wireless mouse", "laptop accessory"],
  },
  {
    id: "logitech-mx-master-3s",
    name: "Logitech MX Master 3S",
    brand: "Logitech",
    gadgetCategory: "accessory",
    spec: "Wireless · Ergonomic · Multi-device",
    priceUkUsed: 45_000,
    priceBrandNew: 65_000,
    badge: "Flagship",
    tags: ["mouse", "wireless mouse", "productivity", "laptop accessory"],
  },
  {
    id: "phone-case-clear",
    name: "Clear Silicone Phone Case",
    brand: "Generic",
    gadgetCategory: "accessory",
    spec: "Shockproof · Universal Fit",
    priceUkUsed: 3_000,
    priceBrandNew: 4_500,
    tags: ["phone case", "cover", "protection"],
  },
  {
    id: "tempered-glass-screen-protector",
    name: "Tempered Glass Screen Protector (2-Pack)",
    brand: "Generic",
    gadgetCategory: "accessory",
    spec: "9H Hardness · Anti-Scratch",
    priceUkUsed: 2_500,
    priceBrandNew: 4_000,
    badge: "Best Value",
    tags: ["screen protector", "tempered glass", "protection"],
  },
  {
    id: "laptop-sleeve-15",
    name: "Laptop Sleeve (15-inch)",
    brand: "Generic",
    gadgetCategory: "accessory",
    spec: "Padded · Water-Resistant",
    priceUkUsed: 8_000,
    priceBrandNew: 12_000,
    tags: ["laptop sleeve", "bag", "protection"],
  },
  {
    id: "car-phone-holder",
    name: "Car Phone Mount Holder",
    brand: "Generic",
    gadgetCategory: "accessory",
    spec: "Dashboard/Vent Mount",
    priceUkUsed: 4_000,
    priceBrandNew: 6_500,
    tags: ["car mount", "phone holder", "accessory"],
  },
  {
    id: "sim-ejector-cleaning-kit",
    name: "SIM Ejector + Cleaning Kit",
    brand: "Generic",
    gadgetCategory: "accessory",
    spec: "SIM Pin + Cloth + Brush",
    priceUkUsed: 1_500,
    priceBrandNew: 2_500,
    tags: ["sim ejector", "cleaning kit", "accessory"],
  },

  // ── Security Cameras ─────────────────────────────────────────────────────────
  {
    id: "ezviz-4cam-kit",
    name: "Ezviz 4-Camera CCTV Kit",
    brand: "Ezviz",
    gadgetCategory: "security",
    spec: "4x 1080p · Night Vision · App Monitoring",
    priceUkUsed: 180_000,
    priceBrandNew: 250_000,
    badge: "Best Value",
    tags: ["home security", "cctv", "surveillance", "house", "compound"],
  },
  {
    id: "hikvision-nvr-kit",
    name: "Hikvision 4-Channel NVR Kit",
    brand: "Hikvision",
    gadgetCategory: "security",
    spec: "4x Outdoor Cams · 1TB DVR",
    priceUkUsed: 230_000,
    priceBrandNew: 320_000,
    badge: "Flagship",
    tags: ["home security", "cctv", "outdoor", "surveillance", "house"],
  },
  {
    id: "tplink-tapo-c220",
    name: "TP-Link Tapo C220",
    brand: "TP-Link",
    gadgetCategory: "security",
    spec: "Pan-Tilt · 2K · Indoor",
    priceUkUsed: 22_000,
    priceBrandNew: 35_000,
    badge: "Hot",
    tags: ["home security", "indoor camera", "baby monitor", "single room"],
  },

  // ── Drones & Gimbals ─────────────────────────────────────────────────────────
  {
    id: "dji-osmo-pocket-3",
    name: "DJI Osmo Pocket 3",
    brand: "DJI",
    gadgetCategory: "drone",
    spec: "4K · Gimbal Stabilized · Handheld",
    priceUkUsed: 550_000,
    priceBrandNew: 750_000,
    badge: "New",
    tags: [
      "wedding videography",
      "event coverage",
      "portable",
      "mobile",
      "vlogging",
      "handheld gimbal",
    ],
  },
  {
    id: "dji-mini-4-pro",
    name: "DJI Mini 4 Pro",
    brand: "DJI",
    gadgetCategory: "drone",
    spec: "Drone · 4K/60fps · Under 249g",
    priceUkUsed: 850_000,
    priceBrandNew: 1_100_000,
    badge: "Flagship",
    tags: ["aerial footage", "event coverage", "outdoor shoot", "drone"],
  },
  {
    id: "dji-mic-2",
    name: "DJI Mic 2",
    brand: "DJI",
    gadgetCategory: "drone",
    spec: "Wireless Lavalier Mic · For Video",
    priceUkUsed: 130_000,
    priceBrandNew: 180_000,
    tags: ["wedding videography", "event coverage", "interview audio"],
  },

  // ── Power & Solar ────────────────────────────────────────────────────────────
  {
    id: "jackery-explorer-1000",
    name: "Jackery Explorer 1000 + Solar Panel",
    brand: "Jackery",
    gadgetCategory: "power",
    spec: "1000Wh Power Station + 100W Panel",
    priceUkUsed: 900_000,
    priceBrandNew: 1_200_000,
    badge: "Flagship",
    tags: ["no light", "power backup", "solar", "off-grid", "no 24/7 light"],
  },
  {
    id: "anker-solix-c1000",
    name: "Anker SOLIX C1000",
    brand: "Anker",
    gadgetCategory: "power",
    spec: "1056Wh Portable Power Station",
    priceUkUsed: 700_000,
    priceBrandNew: 950_000,
    badge: "Best Value",
    tags: ["no light", "power backup", "off-grid", "generator alternative"],
  },
  {
    id: "renogy-100w-panel",
    name: "Renogy 100W Solar Panel",
    brand: "Renogy",
    gadgetCategory: "power",
    spec: "Foldable · For Off-grid Power",
    priceUkUsed: 100_000,
    priceBrandNew: 150_000,
    tags: ["no light", "solar", "power backup", "off-grid"],
  },

  // ── Routers ──────────────────────────────────────────────────────────────────
  {
    id: "tplink-archer-ax10",
    name: "TP-Link Archer AX10",
    brand: "TP-Link",
    gadgetCategory: "router",
    spec: "Wi-Fi 6 · Dual Band · 4 LAN Ports",
    priceUkUsed: 30_000,
    priceBrandNew: 45_000,
    badge: "Best Value",
    tags: ["home wifi", "office wifi", "router"],
  },
  {
    id: "tplink-archer-c6",
    name: "TP-Link Archer C6",
    brand: "TP-Link",
    gadgetCategory: "router",
    spec: "AC1200 · Dual Band",
    priceUkUsed: 18_000,
    priceBrandNew: 28_000,
    tags: ["home wifi", "budget router"],
  },
  {
    id: "mikrotik-hap-ac2",
    name: "MikroTik hAP ac2",
    brand: "MikroTik",
    gadgetCategory: "router",
    spec: "Wi-Fi 5 · Advanced Config · Office Grade",
    priceUkUsed: 55_000,
    priceBrandNew: 75_000,
    badge: "Flagship",
    tags: ["office wifi", "business router", "advanced"],
  },

  // ── MiFi & Hotspots ──────────────────────────────────────────────────────────
  {
    id: "mtn-mifi-4g",
    name: "MTN 4G MiFi",
    brand: "MTN",
    gadgetCategory: "mifi",
    spec: "4G LTE · Up to 10 devices",
    priceUkUsed: 18_000,
    priceBrandNew: 25_000,
    badge: "Best Value",
    tags: ["mobile internet", "travel wifi", "no fixed line"],
  },
  {
    id: "huawei-5g-mifi",
    name: "Huawei 5G MiFi E6878",
    brand: "Huawei",
    gadgetCategory: "mifi",
    spec: "5G · Up to 32 devices",
    priceUkUsed: 65_000,
    priceBrandNew: 95_000,
    badge: "Flagship",
    tags: ["mobile internet", "fast internet", "5g"],
  },
  {
    id: "glo-mifi-4g",
    name: "Glo 4G MiFi",
    brand: "Glo",
    gadgetCategory: "mifi",
    spec: "4G LTE · Up to 10 devices",
    priceUkUsed: 15_000,
    priceBrandNew: 22_000,
    tags: ["mobile internet", "travel wifi", "budget"],
  },

  // ── Laptops ──────────────────────────────────────────────────────────────────
  {
    id: "macbook-air-m2",
    name: "MacBook Air M2",
    brand: "Apple",
    gadgetCategory: "laptop",
    spec: "13-inch · 8GB/256GB",
    priceUkUsed: 850_000,
    priceBrandNew: 1_150_000,
    badge: "Best Value",
    tags: ["everyday use", "business", "portable", "content creation"],
  },
  {
    id: "macbook-pro-m3",
    name: "MacBook Pro M3",
    brand: "Apple",
    gadgetCategory: "laptop",
    spec: "14-inch · 16GB/512GB",
    priceUkUsed: 1_650_000,
    priceBrandNew: 2_200_000,
    badge: "Flagship",
    tags: ["content creation", "video editing", "professional", "heavy workload"],
  },
  {
    id: "dell-xps-13",
    name: "Dell XPS 13",
    brand: "Dell",
    gadgetCategory: "laptop",
    spec: "13-inch · i5 · 8GB/512GB",
    priceUkUsed: 480_000,
    priceBrandNew: 680_000,
    tags: ["business", "everyday use", "windows"],
  },
  {
    id: "hp-pavilion-15",
    name: "HP Pavilion 15",
    brand: "HP",
    gadgetCategory: "laptop",
    spec: "15-inch · i5 · 8GB/512GB",
    priceUkUsed: 340_000,
    priceBrandNew: 480_000,
    badge: "Best Value",
    tags: ["everyday use", "school", "budget windows laptop"],
  },
  {
    id: "asus-rog-strix",
    name: "ASUS ROG Strix G16",
    brand: "ASUS",
    gadgetCategory: "laptop",
    spec: "16-inch · RTX 4060 · 16GB/1TB",
    priceUkUsed: 1_350_000,
    priceBrandNew: 1_800_000,
    badge: "Flagship",
    tags: ["gaming", "heavy workload", "graphics"],
  },

  // ── Gaming Consoles ──────────────────────────────────────────────────────────
  {
    id: "ps5-slim",
    name: "PlayStation 5 Slim",
    brand: "Sony",
    gadgetCategory: "console",
    spec: "1TB · Disc Edition",
    priceUkUsed: 620_000,
    priceBrandNew: 780_000,
    badge: "Best Value",
    tags: ["gaming", "console"],
  },
  {
    id: "xbox-series-x",
    name: "Xbox Series X",
    brand: "Microsoft",
    gadgetCategory: "console",
    spec: "1TB · 4K Gaming",
    priceUkUsed: 580_000,
    priceBrandNew: 750_000,
    tags: ["gaming", "console"],
  },
  {
    id: "nintendo-switch-oled",
    name: "Nintendo Switch OLED",
    brand: "Nintendo",
    gadgetCategory: "console",
    spec: "OLED Screen · Handheld/Docked",
    priceUkUsed: 380_000,
    priceBrandNew: 480_000,
    badge: "Hot",
    tags: ["gaming", "portable console", "family"],
  },
];

export function formatPrice(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

// ─── Valuation data (existing) ────────────────────────────────────────────────

// Real UK-used price list (physical SIM + eSIM, unlocked — the best/reference
// condition). baseMax is the actual quoted price; baseMin is a "typical
// condition" preview floor (~78% of baseMax) shown in the device picker
// before the full condition form is filled in. The real, itemized price is
// computed by calculateValuation() below from baseMax plus the deductions
// for battery health, screen/camera/battery replacement, Face ID, lock
// status and SIM configuration — see that function for the percentages and
// where they came from.
export const iphoneDevices: DeviceEntry[] = [
  {
    id: "iphone-air-512",
    name: "iPhone Air",
    storage: "512GB",
    baseMin: 950000,
    baseMax: 1220000,
  },
  {
    id: "iphone-air-256",
    name: "iPhone Air",
    storage: "256GB",
    baseMin: 875000,
    baseMax: 1120000,
  },
  {
    id: "iphone-17-pro-max-512",
    name: "iPhone 17 Pro Max",
    storage: "512GB",
    baseMin: 1425000,
    baseMax: 1830000,
  },
  {
    id: "iphone-17-pro-max-256",
    name: "iPhone 17 Pro Max",
    storage: "256GB",
    baseMin: 1285000,
    baseMax: 1650000,
  },
  {
    id: "iphone-17-256",
    name: "iPhone 17",
    storage: "256GB",
    baseMin: 935000,
    baseMax: 1200000,
  },
  {
    id: "iphone-16-pro-max-256",
    name: "iPhone 16 Pro Max",
    storage: "256GB",
    baseMin: 975000,
    baseMax: 1250000,
  },
  {
    id: "iphone-16-pro-256",
    name: "iPhone 16 Pro",
    storage: "256GB",
    baseMin: 840000,
    baseMax: 1080000,
  },
  {
    id: "iphone-16-pro-128",
    name: "iPhone 16 Pro",
    storage: "128GB",
    baseMin: 765000,
    baseMax: 980000,
  },
  {
    id: "iphone-16-plus-256",
    name: "iPhone 16 Plus",
    storage: "256GB",
    baseMin: 775000,
    baseMax: 995000,
  },
  {
    id: "iphone-16-plus-128",
    name: "iPhone 16 Plus",
    storage: "128GB",
    baseMin: 700000,
    baseMax: 900000,
  },
  {
    id: "iphone-16e-128",
    name: "iPhone 16e",
    storage: "128GB",
    baseMin: 470000,
    baseMax: 600000,
  },
  {
    id: "iphone-16-256",
    name: "iPhone 16",
    storage: "256GB",
    baseMin: 695000,
    baseMax: 890000,
  },
  {
    id: "iphone-16-128",
    name: "iPhone 16",
    storage: "128GB",
    baseMin: 625000,
    baseMax: 800000,
  },
  {
    id: "iphone-15-pro-max-512",
    name: "iPhone 15 Pro Max",
    storage: "512GB",
    baseMin: 795000,
    baseMax: 1020000,
  },
  {
    id: "iphone-15-pro-max-256",
    name: "iPhone 15 Pro Max",
    storage: "256GB",
    baseMin: 725000,
    baseMax: 930000,
  },
  {
    id: "iphone-15-pro-256",
    name: "iPhone 15 Pro",
    storage: "256GB",
    baseMin: 685000,
    baseMax: 880000,
  },
  {
    id: "iphone-15-pro-128",
    name: "iPhone 15 Pro",
    storage: "128GB",
    baseMin: 640000,
    baseMax: 820000,
  },
  {
    id: "iphone-15-plus-512",
    name: "iPhone 15 Plus",
    storage: "512GB",
    baseMin: 600000,
    baseMax: 770000,
  },
  {
    id: "iphone-15-plus-128",
    name: "iPhone 15 Plus",
    storage: "128GB",
    baseMin: 510000,
    baseMax: 655000,
  },
  {
    id: "iphone-15-256",
    name: "iPhone 15",
    storage: "256GB",
    baseMin: 505000,
    baseMax: 650000,
  },
  {
    id: "iphone-15-128",
    name: "iPhone 15",
    storage: "128GB",
    baseMin: 450000,
    baseMax: 580000,
  },
  {
    id: "iphone-14-pro-max-1tb",
    name: "iPhone 14 Pro Max",
    storage: "1TB",
    baseMin: 680000,
    baseMax: 870000,
  },
  {
    id: "iphone-14-pro-max-512",
    name: "iPhone 14 Pro Max",
    storage: "512GB",
    baseMin: 645000,
    baseMax: 830000,
  },
  {
    id: "iphone-14-pro-max-256",
    name: "iPhone 14 Pro Max",
    storage: "256GB",
    baseMin: 625000,
    baseMax: 800000,
  },
  {
    id: "iphone-14-pro-max-128",
    name: "iPhone 14 Pro Max",
    storage: "128GB",
    baseMin: 570000,
    baseMax: 730000,
  },
  {
    id: "iphone-14-pro-1tb",
    name: "iPhone 14 Pro",
    storage: "1TB",
    baseMin: 575000,
    baseMax: 740000,
  },
  {
    id: "iphone-14-pro-256",
    name: "iPhone 14 Pro",
    storage: "256GB",
    baseMin: 530000,
    baseMax: 680000,
  },
  {
    id: "iphone-14-pro-128",
    name: "iPhone 14 Pro",
    storage: "128GB",
    baseMin: 490000,
    baseMax: 630000,
  },
  {
    id: "iphone-14-plus-256",
    name: "iPhone 14 Plus",
    storage: "256GB",
    baseMin: 405000,
    baseMax: 520000,
  },
  {
    id: "iphone-14-plus-128",
    name: "iPhone 14 Plus",
    storage: "128GB",
    baseMin: 375000,
    baseMax: 480000,
  },
  {
    id: "iphone-14-256",
    name: "iPhone 14",
    storage: "256GB",
    baseMin: 380000,
    baseMax: 490000,
  },
  {
    id: "iphone-14-128",
    name: "iPhone 14",
    storage: "128GB",
    baseMin: 320000,
    baseMax: 410000,
  },
  {
    id: "iphone-13-pro-max-128",
    name: "iPhone 13 Pro Max",
    storage: "128GB",
    baseMin: 405000,
    baseMax: 520000,
  },
  {
    id: "iphone-13-pro-256",
    name: "iPhone 13 Pro",
    storage: "256GB",
    baseMin: 390000,
    baseMax: 500000,
  },
  {
    id: "iphone-13-pro-128",
    name: "iPhone 13 Pro",
    storage: "128GB",
    baseMin: 360000,
    baseMax: 460000,
  },
  {
    id: "iphone-13-512",
    name: "iPhone 13",
    storage: "512GB",
    baseMin: 325000,
    baseMax: 415000,
  },
  {
    id: "iphone-13-256",
    name: "iPhone 13",
    storage: "256GB",
    baseMin: 300000,
    baseMax: 385000,
  },
  {
    id: "iphone-13-128",
    name: "iPhone 13",
    storage: "128GB",
    baseMin: 275000,
    baseMax: 350000,
  },
  {
    id: "iphone-12-pro-max-512",
    name: "iPhone 12 Pro Max",
    storage: "512GB",
    baseMin: 365000,
    baseMax: 470000,
  },
  {
    id: "iphone-12-pro-max-256",
    name: "iPhone 12 Pro Max",
    storage: "256GB",
    baseMin: 355000,
    baseMax: 455000,
  },
  {
    id: "iphone-12-pro-max-128",
    name: "iPhone 12 Pro Max",
    storage: "128GB",
    baseMin: 330000,
    baseMax: 420000,
  },
  {
    id: "iphone-12-pro-256",
    name: "iPhone 12 Pro",
    storage: "256GB",
    baseMin: 285000,
    baseMax: 365000,
  },
  {
    id: "iphone-12-pro-128",
    name: "iPhone 12 Pro",
    storage: "128GB",
    baseMin: 270000,
    baseMax: 345000,
  },
  {
    id: "iphone-12-256",
    name: "iPhone 12",
    storage: "256GB",
    baseMin: 235000,
    baseMax: 300000,
  },
  {
    id: "iphone-12-128",
    name: "iPhone 12",
    storage: "128GB",
    baseMin: 220000,
    baseMax: 280000,
  },
  {
    id: "iphone-12-64",
    name: "iPhone 12",
    storage: "64GB",
    baseMin: 185000,
    baseMax: 240000,
  },
  {
    id: "iphone-11-pro-max-512",
    name: "iPhone 11 Pro Max",
    storage: "512GB",
    baseMin: 265000,
    baseMax: 340000,
  },
  {
    id: "iphone-11-pro-max-256",
    name: "iPhone 11 Pro Max",
    storage: "256GB",
    baseMin: 250000,
    baseMax: 320000,
  },
  {
    id: "iphone-11-pro-max-64",
    name: "iPhone 11 Pro Max",
    storage: "64GB",
    baseMin: 220000,
    baseMax: 285000,
  },
  {
    id: "iphone-11-pro-512",
    name: "iPhone 11 Pro",
    storage: "512GB",
    baseMin: 240000,
    baseMax: 310000,
  },
  {
    id: "iphone-11-pro-256",
    name: "iPhone 11 Pro",
    storage: "256GB",
    baseMin: 235000,
    baseMax: 300000,
  },
  {
    id: "iphone-11-pro-64",
    name: "iPhone 11 Pro",
    storage: "64GB",
    baseMin: 205000,
    baseMax: 265000,
  },
  {
    id: "iphone-11-256",
    name: "iPhone 11",
    storage: "256GB",
    baseMin: 205000,
    baseMax: 265000,
  },
  {
    id: "iphone-11-128",
    name: "iPhone 11",
    storage: "128GB",
    baseMin: 195000,
    baseMax: 250000,
  },
  {
    id: "iphone-11-64",
    name: "iPhone 11",
    storage: "64GB",
    baseMin: 170000,
    baseMax: 215000,
  },
  {
    id: "iphone-xs-512",
    name: "iPhone XS",
    storage: "512GB",
    baseMin: 180000,
    baseMax: 230000,
  },
  {
    id: "iphone-xs-256",
    name: "iPhone XS",
    storage: "256GB",
    baseMin: 155000,
    baseMax: 200000,
  },
  {
    id: "iphone-xr-256",
    name: "iPhone XR",
    storage: "256GB",
    baseMin: 170000,
    baseMax: 220000,
  },
  {
    id: "iphone-xr-128",
    name: "iPhone XR",
    storage: "128GB",
    baseMin: 160000,
    baseMax: 208000,
  },
  {
    id: "iphone-xr-64",
    name: "iPhone XR",
    storage: "64GB",
    baseMin: 145000,
    baseMax: 185000,
  },
  {
    id: "iphone-se-3-128",
    name: "iPhone SE (3rd Gen)",
    storage: "128GB",
    baseMin: 155000,
    baseMax: 200000,
  },
  {
    id: "iphone-se-3-64",
    name: "iPhone SE (3rd Gen)",
    storage: "64GB",
    baseMin: 140000,
    baseMax: 180000,
  },
  {
    id: "iphone-se-2-256",
    name: "iPhone SE (2nd Gen)",
    storage: "256GB",
    baseMin: 155000,
    baseMax: 200000,
  },
  {
    id: "iphone-se-2-128",
    name: "iPhone SE (2nd Gen)",
    storage: "128GB",
    baseMin: 140000,
    baseMax: 180000,
  },
  {
    id: "iphone-se-2-64",
    name: "iPhone SE (2nd Gen)",
    storage: "64GB",
    baseMin: 125000,
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

export type ValuationLineItem = {
  label: string;
  /** Positive = credit (adds value), negative = deduction. As a fraction, e.g. -0.12 = -12%. */
  percent: number;
};

/**
 * Condition-based pricing engine.
 *
 * The starting point (basePrice) is the device's real UK-used, physical-SIM
 * + eSIM, unlocked price — the best condition a listing can be in. Every
 * condition factor the seller reports is then applied as its own
 * transparent, itemized percentage against that price, so both buyer and
 * seller can see exactly why the final number is what it is (not a black
 * box). The percentages themselves come from two places:
 *
 * 1. Lock status (-20%) and the general shape of the deduction list were
 *    given directly by the business.
 * 2. Battery-health tiers, and the eSIM-only vs. physical+eSIM gap (-10%),
 *    were cross-checked against the actual price list: multiple models list
 *    both variants explicitly (e.g. iPhone 14 Pro 128GB physical+eSIM
 *    ₦680,000 vs eSIM-only ₦620,000 — a consistent ~90% ratio across half a
 *    dozen models), and a separate real condition-grade price sheet
 *    (Excellent/Very Good/Good, Locked/Unlocked) for older models gave the
 *    same ballpark for a locked-phone discount (~20-30%) and showed
 *    Good-condition phones trading at roughly 70-80% of Excellent — which
 *    is what the battery/screen/repair tiers below add up to for a
 *    similarly worn device. This keeps the numbers grounded in how this
 *    exact market actually prices used iPhones, not a generic guess.
 */
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
    // baseMax is the real quoted "best condition" price — see the data
    // table's header comment. Averaging with baseMin here would silently
    // apply an extra ~11% haircut before any condition deductions even run.
    basePrice = device!.baseMax;
    deviceName = device!.name;
    deviceStorage = device!.storage;
  }

  const breakdown: ValuationLineItem[] = [];

  // Battery health — Apple itself flags <80% as "service recommended", so
  // that's the steepest step; above 95% is treated as effectively new.
  const battery = Number(form.batteryHealth);
  if (battery < 80) breakdown.push({ label: "Battery health below 80%", percent: -0.2 });
  else if (battery < 85) breakdown.push({ label: "Battery health 80–84%", percent: -0.12 });
  else if (battery < 90) breakdown.push({ label: "Battery health 85–89%", percent: -0.07 });
  else if (battery < 95) breakdown.push({ label: "Battery health 90–94%", percent: -0.03 });

  if (form.batteryChanged)
    breakdown.push({ label: "Battery replaced (non-original)", percent: -0.05 });
  if (form.screenChanged)
    breakdown.push({ label: "Screen replaced", percent: -0.12 });
  if (form.cameraChanged)
    breakdown.push({ label: "Camera replaced/repaired", percent: -0.08 });
  if (form.faceIdStatus === "broken")
    breakdown.push({ label: "Face ID not working", percent: -0.15 });

  // SIM configuration / lock status — physical SIM + eSIM, unlocked is the
  // baseline the base price already represents, so it adds nothing here.
  if (form.simType === "locked")
    breakdown.push({ label: "Carrier locked", percent: -0.2 });
  else if (form.simType === "esim-unlocked")
    breakdown.push({ label: "eSIM only (no physical SIM)", percent: -0.1 });

  if (form.keyboardChanged)
    breakdown.push({ label: "Keyboard replaced", percent: -0.08 });
  if (form.ramUpgraded)
    breakdown.push({ label: "RAM upgraded", percent: 0.05 });
  if (form.storageUpgraded)
    breakdown.push({ label: "Storage upgraded", percent: 0.05 });
  if (form.otherRepairs.trim())
    breakdown.push({ label: "Other repairs noted", percent: -0.05 });

  const rawDeduction = breakdown.reduce((sum, item) => sum - item.percent, 0);
  const deduction = Math.max(-0.1, Math.min(rawDeduction, 0.65));
  const valuedPrice = Math.round(basePrice * (1 - deduction));

  return {
    device: { ...device, name: deviceName, storage: deviceStorage },
    deductionPercent: Math.round(deduction * 100),
    breakdown,
    minVal: Math.round(valuedPrice * 0.97),
    maxVal: Math.round(valuedPrice * 1.03),
    basePrice,
  };
}

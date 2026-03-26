import { Gadget } from "../types";

export const gadgets: Gadget[] = [
  // ======================
  // 🍎 APPLE - IPHONES
  // ======================

  {
    id: "iphone-15-pro-256",
    name: "iPhone 15 Pro",
    brand: "Apple",
    category: "Phone",
    image: "https://via.placeholder.com/150",
    minPrice: 1100000,
    maxPrice: 1400000,
    condition: "New",
    rating: 4.9,
    storage: "256GB",
    sim: {
      physicalSim: false,
      esim: true,
      esimOnly: true,
      unlocked: true,
    },
    bestDeal: true,
  },

  {
    id: "iphone-14-pro-128",
    name: "iPhone 14 Pro",
    brand: "Apple",
    category: "Phone",
    image: "https://via.placeholder.com/150",
    minPrice: 900000,
    maxPrice: 1100000,
    condition: "UK Used",
    rating: 4.8,
    storage: "128GB",
    sim: {
      physicalSim: false,
      esim: true,
      esimOnly: true,
      unlocked: true,
    },
  },

  {
    id: "iphone-13-128",
    name: "iPhone 13",
    brand: "Apple",
    category: "Phone",
    image: "https://via.placeholder.com/150",
    minPrice: 550000,
    maxPrice: 700000,
    condition: "UK Used",
    rating: 4.7,
    storage: "128GB",
    sim: {
      physicalSim: true,
      esim: true,
      esimOnly: false,
      unlocked: true,
    },
  },

  {
    id: "iphone-11-64",
    name: "iPhone 11",
    brand: "Apple",
    category: "Phone",
    image: "https://via.placeholder.com/150",
    minPrice: 300000,
    maxPrice: 420000,
    condition: "UK Used",
    rating: 4.5,
    storage: "64GB",
    sim: {
      physicalSim: true,
      esim: false,
      esimOnly: false,
      unlocked: true,
    },
  },

  // ======================
  // 🤖 SAMSUNG
  // ======================

  {
    id: "samsung-s24-ultra",
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    category: "Phone",
    image: "https://via.placeholder.com/150",
    minPrice: 1200000,
    maxPrice: 1500000,
    condition: "New",
    rating: 4.9,
    storage: "256GB",
  },

  {
    id: "samsung-s21",
    name: "Samsung Galaxy S21",
    brand: "Samsung",
    category: "Phone",
    image: "https://via.placeholder.com/150",
    minPrice: 400000,
    maxPrice: 550000,
    condition: "UK Used",
    rating: 4.5,
    storage: "128GB",
  },

  // ======================
  // 🔵 TECNO / INFINIX
  // ======================

  {
    id: "tecno-camon-20",
    name: "Tecno Camon 20",
    brand: "Tecno",
    category: "Phone",
    image: "https://via.placeholder.com/150",
    minPrice: 180000,
    maxPrice: 250000,
    condition: "New",
    rating: 4.2,
    storage: "128GB",
  },

  {
    id: "infinix-zero-30",
    name: "Infinix Zero 30",
    brand: "Infinix",
    category: "Phone",
    image: "https://via.placeholder.com/150",
    minPrice: 250000,
    maxPrice: 320000,
    condition: "New",
    rating: 4.3,
    storage: "256GB",
  },

  // ======================
  // 💻 APPLE - MACBOOKS
  // ======================

  {
    id: "macbook-m1",
    name: "MacBook Air M1",
    brand: "Apple",
    category: "Laptop",
    image: "https://via.placeholder.com/150",
    minPrice: 650000,
    maxPrice: 900000,
    condition: "UK Used",
    rating: 4.8,
    os: "macOS",
    type: "Ultrabook",
  },

  {
    id: "macbook-m2",
    name: "MacBook Air M2",
    brand: "Apple",
    category: "Laptop",
    image: "https://via.placeholder.com/150",
    minPrice: 900000,
    maxPrice: 1200000,
    condition: "New",
    rating: 4.9,
    os: "macOS",
    type: "Ultrabook",
  },

  // ======================
  // 💻 WINDOWS LAPTOPS
  // ======================

  {
    id: "hp-pavilion",
    name: "HP Pavilion 15",
    brand: "HP",
    category: "Laptop",
    image: "https://via.placeholder.com/150",
    minPrice: 400000,
    maxPrice: 600000,
    condition: "UK Used",
    rating: 4.4,
    os: "Windows",
    type: "Business",
  },

  {
    id: "dell-xps-13",
    name: "Dell XPS 13",
    brand: "Dell",
    category: "Laptop",
    image: "https://via.placeholder.com/150",
    minPrice: 800000,
    maxPrice: 1100000,
    condition: "UK Used",
    rating: 4.7,
    os: "Windows",
    type: "Ultrabook",
  },

  // ======================
  // 🎮 GAMING LAPTOPS
  // ======================

  {
    id: "asus-rog",
    name: "ASUS ROG Strix",
    brand: "Asus",
    category: "Laptop",
    image: "https://via.placeholder.com/150",
    minPrice: 900000,
    maxPrice: 1500000,
    condition: "New",
    rating: 4.8,
    os: "Windows",
    type: "Gaming",
    bestDeal: true,
  },

  {
    id: "msi-gf63",
    name: "MSI GF63",
    brand: "MSI",
    category: "Laptop",
    image: "https://via.placeholder.com/150",
    minPrice: 700000,
    maxPrice: 1000000,
    condition: "New",
    rating: 4.6,
    os: "Windows",
    type: "Gaming",
  },

  // ======================
  // 🐧 LINUX LAPTOPS
  // ======================

  {
    id: "system76",
    name: "System76 Lemur Pro",
    brand: "System76",
    category: "Laptop",
    image: "https://via.placeholder.com/150",
    minPrice: 900000,
    maxPrice: 1300000,
    condition: "New",
    rating: 4.5,
    os: "Linux",
    type: "Ultrabook",
  },
];

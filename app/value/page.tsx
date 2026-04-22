"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, Suspense } from "react";
import { formatPrice } from "../lib/helpers";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

// Every iPhone model × storage combination as its own entry
const iphoneDevices = [
  // iPhone 15 series
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
  // iPhone 14 series
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
  // iPhone 13 series
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
  // iPhone 12 series
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
  // iPhone 11 series
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
  // iPhone XS / XR
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
  // iPhone SE
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
  // Other
  {
    id: "other-iphone",
    name: "Other (type manually)",
    storage: "",
    baseMin: 0,
    baseMax: 0,
  },
];

const androidDevices = [
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
    id: "xiaomi-14-512",
    name: "Xiaomi 14",
    storage: "512GB",
    baseMin: 680000,
    baseMax: 880000,
    ram: "12GB",
    chip: "Snapdragon 8 Gen 3",
    display: '6.36" OLED',
  },
  {
    id: "xiaomi-14-256",
    name: "Xiaomi 14",
    storage: "256GB",
    baseMin: 580000,
    baseMax: 760000,
    ram: "12GB",
    chip: "Snapdragon 8 Gen 3",
    display: '6.36" OLED',
  },
  {
    id: "oneplus-12-512",
    name: "OnePlus 12",
    storage: "512GB",
    baseMin: 650000,
    baseMax: 850000,
    ram: "16GB",
    chip: "Snapdragon 8 Gen 3",
    display: '6.82" LTPO AMOLED',
  },
  {
    id: "oneplus-12-256",
    name: "OnePlus 12",
    storage: "256GB",
    baseMin: 550000,
    baseMax: 730000,
    ram: "12GB",
    chip: "Snapdragon 8 Gen 3",
    display: '6.82" LTPO AMOLED',
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

const laptopDevices = {
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
      id: "surface-pro-1tb",
      name: "Microsoft Surface Pro",
      storage: "1TB",
      baseMin: 1100000,
      baseMax: 1500000,
      ram: "32GB",
      chip: "Intel i7",
      display: '13" PixelSense',
    },
    {
      id: "surface-pro-512",
      name: "Microsoft Surface Pro",
      storage: "512GB",
      baseMin: 850000,
      baseMax: 1150000,
      ram: "16GB",
      chip: "Intel i7",
      display: '13" PixelSense',
    },
    {
      id: "surface-pro-256",
      name: "Microsoft Surface Pro",
      storage: "256GB",
      baseMin: 650000,
      baseMax: 900000,
      ram: "8GB",
      chip: "Intel i5",
      display: '13" PixelSense',
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

const wantedDevices = [
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

type DeviceCategory = "phone" | "laptop";
type PhoneType = "iphone" | "android";
type LaptopType = "macbook" | "windows" | "linux" | "gaming";
type SubType = PhoneType | LaptopType;
type SimType = "physical" | "esim-unlocked" | "locked" | "";
type FaceIdStatus = "working" | "broken" | "";
type ListingMode = "sell" | "swap";

type DeviceEntry = {
  id: string;
  name: string;
  storage: string;
  baseMin: number;
  baseMax: number;
  ram?: string;
  chip?: string;
  display?: string;
};

type FormData = {
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

const initialForm: FormData = {
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

function getDevices(
  category: DeviceCategory | "",
  subType: SubType | ""
): DeviceEntry[] {
  if (!category || !subType) return [];
  if (category === "phone") {
    return subType === "iphone" ? iphoneDevices : androidDevices;
  }
  return (
    (laptopDevices[subType as keyof typeof laptopDevices] as DeviceEntry[]) ||
    []
  );
}

function validateIMEI(imei: string): boolean {
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

function calculateValuation(form: FormData) {
  const isOther = form.deviceId.startsWith("other-");
  const devices = getDevices(form.category, form.subType);
  const device = devices.find((d) => d.id === form.deviceId);
  if (!device && !isOther) return null;

  let basePrice: number;
  let deviceName: string;
  let deviceStorage: string;

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

function ValueContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultMode = (searchParams.get("type") as ListingMode) || "sell";
  const [form, setForm] = useState<FormData>({
    ...initialForm,
    listingMode: defaultMode,
  });
  const [result, setResult] =
    useState<ReturnType<typeof calculateValuation>>(null);
  const [step, setStep] = useState<"form" | "result" | "publish">("form");
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [snack, setSnack] = useState<{
    open: boolean;
    msg: string;
    severity: "success" | "error" | "info";
  }>({ open: false, msg: "", severity: "info" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── NEW state ──────────────────────────────────────────────
  const [stolenAlert, setStolenAlert] = useState(false);
  const [imeiChecking, setImeiChecking] = useState(false);
  const [imeiReport, setImeiReport] = useState<string | null>(null);
  // ──────────────────────────────────────────────────────────

  const isPhone = form.category === "phone";
  const isLaptop = form.category === "laptop";
  const isIphone = form.subType === "iphone";
  const isOther = form.deviceId.startsWith("other-");
  const devices = getDevices(form.category, form.subType);
  const selectedDevice = devices.find((d) => d.id === form.deviceId);
  const battery = Number(form.batteryHealth);
  const batteryDeduct =
    battery < 80
      ? 20
      : battery < 85
      ? 12
      : battery < 90
      ? 7
      : battery < 95
      ? 3
      : 0;

  const showSnack = (msg: string, severity: "success" | "error" | "info") =>
    setSnack({ open: true, msg, severity });

  const set = <K extends keyof FormData>(field: K, val: FormData[K]) =>
    setForm((p) => ({ ...p, [field]: val }));

  const toggle = (
    field:
      | "batteryChanged"
      | "screenChanged"
      | "cameraChanged"
      | "ramUpgraded"
      | "storageUpgraded"
      | "keyboardChanged"
  ) => setForm((p) => ({ ...p, [field]: !p[field] }));

  // ── UPDATED handleIMEI with AI verification ────────────────
  const handleIMEI = async (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 15);
    const luhnValid = cleaned.length === 15 ? validateIMEI(cleaned) : null;
    setForm((p) => ({ ...p, imei: cleaned, imeiValid: luhnValid }));
    setImeiReport(null);

    if (cleaned.length === 15 && luhnValid) {
      setImeiChecking(true);
      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 300,
            messages: [
              {
                role: "user",
                content: `You are an IMEI verification assistant for a Nigerian gadget marketplace called TechNest. The user has entered IMEI: ${cleaned}.

Based on this IMEI, extract what you can from the TAC (first 8 digits: ${cleaned.slice(
                  0,
                  8
                )}) to identify the device manufacturer and model family. Then assess if this looks like a suspicious or potentially stolen device IMEI.

Respond in this exact JSON format only, no markdown, no extra text:
{"manufacturer":"...","model":"...","status":"clean" or "flagged","report":"one sentence about the device and its verification status","flagged":true or false}

If you cannot determine the device details from the TAC, still provide a status assessment. Only flag it if the TAC is completely unknown, invalid, or suspicious. Most valid Luhn-passing IMEIs should be clean.`,
              },
            ],
          }),
        });
        const data = await response.json();
        const text = data.content?.[0]?.text || "";
        try {
          const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
          if (parsed.flagged) {
            setStolenAlert(true);
            setForm((p) => ({ ...p, imeiValid: false }));
          } else {
            setImeiReport(
              parsed.report ||
                `Device appears to be ${parsed.manufacturer} ${parsed.model} — status: clean.`
            );
          }
        } catch {
          setImeiReport("IMEI format valid — device report unavailable.");
        }
      } catch {
        setImeiReport("IMEI format valid — AI check temporarily unavailable.");
      } finally {
        setImeiChecking(false);
      }
    }
  };
  // ──────────────────────────────────────────────────────────

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newFiles = [...form.mediaFiles, ...files].slice(0, 10);
    setForm((p) => ({ ...p, mediaFiles: newFiles }));
    setMediaPreviews(
      newFiles.map((f) =>
        f.type.startsWith("image/") ? URL.createObjectURL(f) : "video"
      )
    );
    showSnack(`${newFiles.length} file(s) uploaded`, "success");
  };

  const removeMedia = (i: number) => {
    const newFiles = form.mediaFiles.filter((_, idx) => idx !== i);
    setForm((p) => ({ ...p, mediaFiles: newFiles }));
    setMediaPreviews(
      newFiles.map((f) =>
        f.type.startsWith("image/") ? URL.createObjectURL(f) : "video"
      )
    );
  };

  // ── UPDATED handleCalculate — IMEI required for iPhones ───
  const handleCalculate = () => {
    if (!form.deviceId) {
      showSnack("Please select a device", "error");
      return;
    }
    if (isOther && (!form.customDeviceName || !form.customDevicePrice)) {
      showSnack("Enter device name and estimated price", "error");
      return;
    }
    if (isIphone && (!form.imei || !form.imeiValid)) {
      showSnack("A valid IMEI is required to proceed", "error");
      return;
    }
    const res = calculateValuation(form);
    if (!res) {
      showSnack("Could not calculate valuation. Check your inputs.", "error");
      return;
    }
    setResult(res);
    setStep("result");
    showSnack("Valuation calculated!", "success");
  };
  // ──────────────────────────────────────────────────────────

  const handlePublish = async () => {
    if (!result || !form.sellerName || !form.sellerPhone) {
      showSnack("Fill in your name and WhatsApp number", "error");
      return;
    }
    setPublishing(true);
    try {
      const repairs: string[] = [];
      if (form.batteryChanged) repairs.push("Battery replaced");
      if (form.screenChanged) repairs.push("Screen replaced");
      if (form.cameraChanged) repairs.push("Camera replaced");
      if (form.faceIdStatus === "broken") repairs.push("Face ID broken");
      if (form.keyboardChanged) repairs.push("Keyboard replaced");
      if (form.otherRepairs.trim()) repairs.push(form.otherRepairs.trim());

      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: form.sellerName,
          userPhone: form.sellerPhone,
          deviceName: result.device.name,
          deviceCategory: form.category,
          subType: form.subType,
          storage: result.device.storage || null,
          batteryHealth: form.batteryHealth,
          simType: form.simType || null,
          faceIdStatus: form.faceIdStatus || null,
          repairs,
          mediaCount: form.mediaFiles.length,
          imeiVerified: form.imeiValid === true,
          estimatedMin: result.minVal,
          estimatedMax: result.maxVal,
          listingType: form.listingMode,
          wantedDevice:
            form.listingMode === "swap"
              ? form.wantedDevice === "Custom (type below)"
                ? form.customWantedDevice
                : form.wantedDevice
              : null,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      showSnack("Listing published! Redirecting...", "success");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch {
      showSnack("Failed to publish. Please try again.", "error");
    } finally {
      setPublishing(false);
    }
  };

  const inp =
    "w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors bg-white";
  const inpS = { borderColor: "rgba(2,0,68,0.2)", color: "#020044" };
  const lbl = (txt: string) => (
    <p className="text-sm font-medium mb-2" style={{ color: "#020044" }}>
      {txt}
    </p>
  );

  const choiceBtn = (
    active: boolean,
    onClick: () => void,
    icon: string,
    title: string,
    desc?: string
  ) => (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 py-4 px-3 rounded-xl border-2 text-center transition-all w-full"
      style={{
        borderColor: active ? "#020044" : "rgba(2,0,68,0.12)",
        background: active ? "rgba(2,0,68,0.05)" : "#fff",
      }}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-sm font-semibold" style={{ color: "#020044" }}>
        {title}
      </span>
      {desc && (
        <span className="text-xs" style={{ color: "#6B6B8A" }}>
          {desc}
        </span>
      )}
    </button>
  );

  const toggleBtn = (
    field:
      | "batteryChanged"
      | "screenChanged"
      | "cameraChanged"
      | "ramUpgraded"
      | "storageUpgraded"
      | "keyboardChanged",
    label: string,
    desc: string,
    positive = false
  ) => (
    <button
      onClick={() => toggle(field)}
      className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 text-left transition-all"
      style={{
        borderColor: form[field] ? "#020044" : "rgba(2,0,68,0.12)",
        background: form[field] ? "rgba(2,0,68,0.05)" : "#fff",
      }}
    >
      <span className="text-sm" style={{ color: "#020044" }}>
        {label}
      </span>
      <div className="flex items-center gap-2">
        <span
          className="text-xs font-semibold"
          style={{ color: positive ? "#16a34a" : "#EF3F23" }}
        >
          {desc}
        </span>
        <div
          className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
          style={{
            borderColor: form[field] ? "#020044" : "rgba(2,0,68,0.25)",
            background: form[field] ? "#020044" : "transparent",
          }}
        >
          {form[field] && (
            <span className="text-white text-xs font-bold">✓</span>
          )}
        </div>
      </div>
    </button>
  );

  const regularDevices = devices.filter((d) => !d.id.startsWith("other-"));
  const otherDevice = devices.find((d) => d.id.startsWith("other-"));

  return (
    <div className="min-h-screen" style={{ background: "#F8F8FC" }}>
      {/* ── STOLEN PHONE MODAL ─────────────────────────────── */}
      {stolenAlert && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.55)" }}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm"
            style={{ border: "2px solid #EF3F23" }}
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-3xl"
                style={{ background: "rgba(239,63,35,0.1)" }}
              >
                🚨
              </div>
              <h3
                className="text-lg font-bold"
                style={{
                  color: "#020044",
                  fontFamily: "Space Grotesk, sans-serif",
                }}
              >
                Warning — Stolen Device Alert
              </h3>
              <p className="text-sm" style={{ color: "#6B6B8A" }}>
                This IMEI has been flagged as suspicious. Listing or selling a
                stolen device is a criminal offence.{" "}
                <strong style={{ color: "#EF3F23" }}>
                  Stolen phones will be reported to the Nigerian Police Force
                  (NPF).
                </strong>
              </p>
              <div
                className="w-full rounded-xl p-3 text-sm text-left"
                style={{
                  background: "rgba(239,63,35,0.06)",
                  border: "1px solid rgba(239,63,35,0.2)",
                  color: "#EF3F23",
                }}
              >
                📄 We strongly advise you to keep a{" "}
                <strong>receipt or proof of purchase</strong> for your gadget at
                all times to avoid issues with authorities.
              </div>
              <button
                onClick={() => setStolenAlert(false)}
                className="w-full py-3 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: "#EF3F23" }}
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ───────────────────────────────────────────────────── */}

      <nav
        style={{ background: "#020044" }}
        className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between"
      >
        <button
          onClick={() => router.push("/")}
          className="text-xl font-bold text-white"
          style={{ fontFamily: "Space Grotesk, sans-serif" }}
        >
          Tech<span style={{ color: "#EF3F23" }}>Nest</span>
        </button>
        <span className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
          🇳🇬 Nigerian Market
        </span>
      </nav>

      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 text-xs font-medium"
            style={{
              background: "rgba(239,63,35,0.08)",
              color: "#EF3F23",
              border: "1px solid rgba(239,63,35,0.2)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#EF3F23" }}
            />
            Free Valuation
          </div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{
              color: "#020044",
              fontFamily: "Space Grotesk, sans-serif",
            }}
          >
            Value My Device
          </h1>
          <p className="text-sm" style={{ color: "#6B6B8A" }}>
            Get a fair Nigerian market price instantly
          </p>
        </div>

        {step === "form" && (
          <div
            className="bg-white rounded-2xl p-6 border space-y-6"
            style={{ border: "1px solid rgba(2,0,68,0.08)" }}
          >
            {/* What to do */}
            <div>
              {lbl("What do you want to do?")}
              <div className="grid grid-cols-2 gap-3">
                {choiceBtn(
                  form.listingMode === "sell",
                  () => set("listingMode", "sell"),
                  "💰",
                  "Sell for Cash",
                  "Get paid in naira"
                )}
                {choiceBtn(
                  form.listingMode === "swap",
                  () => set("listingMode", "swap"),
                  "🔄",
                  "Swap Device",
                  "Trade for another model"
                )}
              </div>
            </div>

            {/* Device type */}
            <div>
              {lbl("What type of device?")}
              <div className="grid grid-cols-2 gap-3">
                {choiceBtn(
                  form.category === "phone",
                  () =>
                    setForm((p) => ({
                      ...p,
                      category: "phone",
                      subType: "",
                      deviceId: "",
                      customDeviceName: "",
                      customDevicePrice: "",
                    })),
                  "📱",
                  "Phone"
                )}
                {choiceBtn(
                  form.category === "laptop",
                  () =>
                    setForm((p) => ({
                      ...p,
                      category: "laptop",
                      subType: "",
                      deviceId: "",
                      customDeviceName: "",
                      customDevicePrice: "",
                    })),
                  "💻",
                  "Laptop"
                )}
              </div>
            </div>

            {/* Phone sub type */}
            {form.category === "phone" && (
              <div>
                {lbl("iPhone or Android?")}
                <div className="flex gap-3">
                  {["iphone", "android"].map((v) => (
                    <button
                      key={v}
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          subType: v as PhoneType,
                          deviceId: "",
                          customDeviceName: "",
                          customDevicePrice: "",
                        }))
                      }
                      className="flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all"
                      style={{
                        borderColor:
                          form.subType === v ? "#020044" : "rgba(2,0,68,0.12)",
                        background:
                          form.subType === v ? "rgba(2,0,68,0.05)" : "#fff",
                        color: "#020044",
                      }}
                    >
                      {v === "iphone" ? "🍎 iPhone" : "🤖 Android"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Laptop sub type */}
            {form.category === "laptop" && (
              <div>
                {lbl("What type of laptop?")}
                <div className="flex gap-2 flex-wrap">
                  {[
                    ["macbook", "🍎 MacBook"],
                    ["windows", "🪟 Windows"],
                    ["linux", "🐧 Linux"],
                    ["gaming", "🎮 Gaming"],
                  ].map(([v, label]) => (
                    <button
                      key={v}
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          subType: v as LaptopType,
                          deviceId: "",
                          customDeviceName: "",
                          customDevicePrice: "",
                        }))
                      }
                      className="px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all"
                      style={{
                        borderColor:
                          form.subType === v ? "#020044" : "rgba(2,0,68,0.12)",
                        background:
                          form.subType === v ? "rgba(2,0,68,0.05)" : "#fff",
                        color: "#020044",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Model select */}
            {form.subType && (
              <div>
                {lbl("Select your exact model & storage")}
                <select
                  className={inp}
                  style={inpS}
                  value={form.deviceId}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      deviceId: e.target.value,
                      customDeviceName: "",
                      customDevicePrice: "",
                    }))
                  }
                >
                  <option value="">Choose a device...</option>
                  {regularDevices.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                      {d.storage ? ` ${d.storage}` : ""} —{" "}
                      {formatPrice(d.baseMin)} to {formatPrice(d.baseMax)}
                    </option>
                  ))}
                  {otherDevice && (
                    <>
                      <option disabled>──────────────</option>
                      <option value={otherDevice.id}>
                        Other (type manually)
                      </option>
                    </>
                  )}
                </select>
              </div>
            )}

            {/* Other custom inputs */}
            {isOther && (
              <div
                className="rounded-xl p-4 space-y-3"
                style={{
                  background: "rgba(2,0,68,0.03)",
                  border: "1px solid rgba(2,0,68,0.1)",
                }}
              >
                <p
                  className="text-sm font-semibold"
                  style={{ color: "#020044" }}
                >
                  Enter your device details
                </p>
                <div>
                  <label
                    className="text-xs font-medium block mb-1"
                    style={{ color: "#6B6B8A" }}
                  >
                    Device Name & Storage
                  </label>
                  <input
                    className={inp}
                    style={inpS}
                    placeholder="e.g. iPhone 13 Pro Max 256GB"
                    value={form.customDeviceName}
                    onChange={(e) => set("customDeviceName", e.target.value)}
                  />
                </div>
                <div>
                  <label
                    className="text-xs font-medium block mb-1"
                    style={{ color: "#6B6B8A" }}
                  >
                    Estimated Market Price (₦)
                  </label>
                  <input
                    className={inp}
                    style={inpS}
                    type="number"
                    placeholder="e.g. 650000"
                    value={form.customDevicePrice}
                    onChange={(e) => set("customDevicePrice", e.target.value)}
                  />
                </div>
                {form.customDeviceName && form.customDevicePrice && (
                  <div
                    className="rounded-xl p-3 flex items-center gap-2"
                    style={{
                      background: "rgba(22,163,74,0.06)",
                      border: "1px solid rgba(22,163,74,0.2)",
                    }}
                  >
                    <span style={{ color: "#16a34a" }}>✓</span>
                    <p className="text-xs" style={{ color: "#16a34a" }}>
                      Details entered — scroll down to continue valuation
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Device specs card */}
            {selectedDevice &&
              !isOther &&
              (selectedDevice.ram ||
                selectedDevice.chip ||
                selectedDevice.display) && (
                <div
                  className="rounded-xl p-4"
                  style={{
                    background: "rgba(2,0,68,0.03)",
                    border: "1px solid rgba(2,0,68,0.08)",
                  }}
                >
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-3"
                    style={{ color: "#6B6B8A" }}
                  >
                    Device Specs
                  </p>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                    {selectedDevice.chip && (
                      <div>
                        <p className="text-xs" style={{ color: "#6B6B8A" }}>
                          Chip
                        </p>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "#020044" }}
                        >
                          {selectedDevice.chip}
                        </p>
                      </div>
                    )}
                    {selectedDevice.ram && (
                      <div>
                        <p className="text-xs" style={{ color: "#6B6B8A" }}>
                          RAM
                        </p>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "#020044" }}
                        >
                          {selectedDevice.ram}
                        </p>
                      </div>
                    )}
                    {selectedDevice.display && (
                      <div className="col-span-2">
                        <p className="text-xs" style={{ color: "#6B6B8A" }}>
                          Display
                        </p>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "#020044" }}
                        >
                          {selectedDevice.display}
                        </p>
                      </div>
                    )}
                    {selectedDevice.storage && (
                      <div className="col-span-2">
                        <p className="text-xs" style={{ color: "#6B6B8A" }}>
                          Storage
                        </p>
                        <span
                          className="inline-block text-xs px-2.5 py-0.5 rounded-full font-semibold mt-0.5"
                          style={{
                            background: "rgba(2,0,68,0.08)",
                            color: "#020044",
                          }}
                        >
                          {selectedDevice.storage}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

            {/* Rest of form */}
            {form.deviceId &&
              (isOther
                ? form.customDeviceName && form.customDevicePrice
                : true) && (
                <>
                  {/* Battery */}
                  <div>
                    {lbl(`Battery Health: ${form.batteryHealth}%`)}
                    <input
                      type="range"
                      min={50}
                      max={100}
                      value={form.batteryHealth}
                      onChange={(e) => set("batteryHealth", e.target.value)}
                      className="w-full cursor-pointer"
                      style={{ accentColor: "#020044" }}
                    />
                    <div
                      className="flex justify-between text-xs mt-1"
                      style={{ color: "#6B6B8A" }}
                    >
                      <span>50% Poor</span>
                      <span>75% Average</span>
                      <span>100% Perfect</span>
                    </div>
                    {batteryDeduct > 0 && (
                      <p className="text-xs mt-1" style={{ color: "#EF3F23" }}>
                        -{batteryDeduct}% for battery health
                      </p>
                    )}
                  </div>

                  {/* Phone specific */}
                  {isPhone && (
                    <>
                      {/* SIM status */}
                      <div>
                        {lbl("SIM / Lock Status")}
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            {
                              val: "physical" as SimType,
                              lbl: "Physical SIM",
                              desc: "No deduction",
                              color: "#16a34a",
                            },
                            {
                              val: "esim-unlocked" as SimType,
                              lbl: "eSIM Unlocked",
                              desc: "-5%",
                              color: "#d97706",
                            },
                            {
                              val: "locked" as SimType,
                              lbl: "Locked SIM",
                              desc: "-10%",
                              color: "#EF3F23",
                            },
                          ].map(({ val, lbl, desc, color }) => (
                            <button
                              key={val}
                              onClick={() => set("simType", val)}
                              className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 text-center transition-all"
                              style={{
                                borderColor:
                                  form.simType === val
                                    ? "#020044"
                                    : "rgba(2,0,68,0.12)",
                                background:
                                  form.simType === val
                                    ? "rgba(2,0,68,0.05)"
                                    : "#fff",
                              }}
                            >
                              <span
                                className="text-xs font-semibold"
                                style={{ color: "#020044" }}
                              >
                                {lbl}
                              </span>
                              <span
                                className="text-xs font-medium"
                                style={{ color }}
                              >
                                {desc}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* iPhone only */}
                      {isIphone && (
                        <>
                          {/* ── UPDATED IMEI SECTION ──────────────────────── */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <p
                                className="text-sm font-medium"
                                style={{ color: "#020044" }}
                              >
                                IMEI Number
                              </p>
                              <span
                                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                style={{
                                  background: "rgba(239,63,35,0.08)",
                                  color: "#EF3F23",
                                }}
                              >
                                Required
                              </span>
                            </div>
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="15-digit IMEI (dial *#06#)"
                                className={inp}
                                style={{
                                  ...inpS,
                                  borderColor:
                                    form.imei.length === 15 && !form.imeiValid
                                      ? "#EF3F23"
                                      : form.imeiValid
                                      ? "#16a34a"
                                      : "rgba(2,0,68,0.2)",
                                }}
                                value={form.imei}
                                onChange={(e) => handleIMEI(e.target.value)}
                                maxLength={15}
                              />
                              {imeiChecking && (
                                <span
                                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs"
                                  style={{ color: "#6B6B8A" }}
                                >
                                  Checking...
                                </span>
                              )}
                              {!imeiChecking && form.imei.length === 15 && (
                                <span
                                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold"
                                  style={{
                                    color: form.imeiValid
                                      ? "#16a34a"
                                      : "#EF3F23",
                                  }}
                                >
                                  {form.imeiValid ? "✓ Valid" : "✗ Invalid"}
                                </span>
                              )}
                            </div>

                            {/* AI verification result */}
                            {form.imei.length === 15 &&
                              form.imeiValid &&
                              imeiReport && (
                                <div
                                  className="mt-2 rounded-xl p-3 text-xs space-y-1"
                                  style={{
                                    background: "rgba(22,163,74,0.06)",
                                    border: "1px solid rgba(22,163,74,0.2)",
                                  }}
                                >
                                  <p
                                    className="font-semibold"
                                    style={{ color: "#16a34a" }}
                                  >
                                    ✓ IMEI Verified — Device Report
                                  </p>
                                  <p style={{ color: "#6B6B8A" }}>
                                    {imeiReport}
                                  </p>
                                </div>
                              )}

                            <p
                              className="text-xs mt-1.5"
                              style={{ color: "#6B6B8A" }}
                            >
                              Dial <strong>*#06#</strong> to get your IMEI. This
                              is required to proceed.
                            </p>
                            <p
                              className="text-xs mt-1 font-medium"
                              style={{ color: "#EF3F23" }}
                            >
                              ⚠️ “Devices flagged as stolen or blacklisted may
                              be reported and removed from the platform.”.
                            </p>
                          </div>
                          {/* ─────────────────────────────────────────────── */}

                          <div>
                            {lbl("Face ID Status")}
                            <div className="grid grid-cols-2 gap-3">
                              {[
                                {
                                  val: "working" as FaceIdStatus,
                                  icon: "🔐",
                                  lbl: "Face ID Works",
                                  desc: "No deduction",
                                  color: "#16a34a",
                                },
                                {
                                  val: "broken" as FaceIdStatus,
                                  icon: "🔓",
                                  lbl: "Face ID Broken",
                                  desc: "-10%",
                                  color: "#EF3F23",
                                },
                              ].map(({ val, icon, lbl, desc, color }) => (
                                <button
                                  key={val}
                                  onClick={() => set("faceIdStatus", val)}
                                  className="relative flex flex-col items-center gap-2 py-5 rounded-xl border-2 text-center transition-all"
                                  style={{
                                    borderColor:
                                      form.faceIdStatus === val
                                        ? "#020044"
                                        : "rgba(2,0,68,0.12)",
                                    background:
                                      form.faceIdStatus === val
                                        ? "rgba(2,0,68,0.05)"
                                        : "#fff",
                                  }}
                                >
                                  {form.faceIdStatus === val && (
                                    <div
                                      className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                                      style={{ background: "#020044" }}
                                    >
                                      <span className="text-white text-xs font-bold">
                                        ✓
                                      </span>
                                    </div>
                                  )}
                                  <span className="text-2xl">{icon}</span>
                                  <span
                                    className="text-xs font-semibold"
                                    style={{ color: "#020044" }}
                                  >
                                    {lbl}
                                  </span>
                                  <span
                                    className="text-xs font-medium"
                                    style={{ color }}
                                  >
                                    {desc}
                                  </span>
                                </button>
                              ))}
                            </div>
                            {form.faceIdStatus === "broken" && (
                              <p
                                className="text-xs mt-2 p-2.5 rounded-lg"
                                style={{
                                  background: "rgba(239,63,35,0.06)",
                                  color: "#EF3F23",
                                }}
                              >
                                Face ID issues significantly reduce iPhone
                                resale value
                              </p>
                            )}
                          </div>
                        </>
                      )}

                      {/* Repairs */}
                      <div>
                        {lbl("Repairs & Replacements")}
                        <div className="space-y-2">
                          {toggleBtn(
                            "batteryChanged",
                            "🔋 Battery replaced",
                            "-10%"
                          )}
                          {toggleBtn(
                            "screenChanged",
                            "📱 Screen replaced",
                            "-10%"
                          )}
                          {toggleBtn(
                            "cameraChanged",
                            "📷 Camera replaced",
                            "-10%"
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Laptop specific */}
                  {isLaptop && (
                    <div>
                      {lbl("Repairs, Replacements & Upgrades")}
                      <div className="space-y-2">
                        {toggleBtn(
                          "screenChanged",
                          "🖥️ Screen replaced",
                          "-15%"
                        )}
                        {toggleBtn(
                          "batteryChanged",
                          "🔋 Battery replaced",
                          "-8%"
                        )}
                        {toggleBtn(
                          "keyboardChanged",
                          "⌨️ Keyboard replaced",
                          "-8%"
                        )}
                        {toggleBtn(
                          "ramUpgraded",
                          "⚡ RAM upgraded",
                          "+5%",
                          true
                        )}
                        {toggleBtn(
                          "storageUpgraded",
                          "💾 Storage upgraded",
                          "+5%",
                          true
                        )}
                      </div>
                    </div>
                  )}

                  {/* Swap target */}
                  {form.listingMode === "swap" && (
                    <div>
                      {lbl("What device do you want?")}
                      <select
                        className={inp}
                        style={inpS}
                        value={form.wantedDevice}
                        onChange={(e) => set("wantedDevice", e.target.value)}
                      >
                        <option value="">Select target device...</option>
                        {wantedDevices.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                      {form.wantedDevice === "Custom (type below)" && (
                        <input
                          className={`${inp} mt-2`}
                          style={inpS}
                          placeholder="Type exact device name and storage"
                          value={form.customWantedDevice}
                          onChange={(e) =>
                            set("customWantedDevice", e.target.value)
                          }
                        />
                      )}
                    </div>
                  )}

                  {/* Other issues */}
                  <div>
                    {lbl("Other Issues (optional)")}
                    <textarea
                      rows={2}
                      className={`${inp} resize-none`}
                      style={inpS}
                      placeholder={
                        isLaptop
                          ? "e.g. hinge loose, fan noisy..."
                          : "e.g. back glass cracked..."
                      }
                      value={form.otherRepairs}
                      onChange={(e) => set("otherRepairs", e.target.value)}
                    />
                    {form.otherRepairs.trim() && (
                      <p className="text-xs mt-1" style={{ color: "#EF3F23" }}>
                        -10% for additional repairs
                      </p>
                    )}
                  </div>

                  {/* ── UPDATED MEDIA UPLOAD SECTION ─────────────── */}
                  <div>
                    {lbl("Photos & Videos (optional)")}

                    {/* Parts & Services note — shown only for iPhones */}
                    {isIphone && (
                      <div
                        className="rounded-xl p-3 mb-3 flex items-start gap-2.5"
                        style={{
                          background: "rgba(2,0,68,0.04)",
                          border: "1px solid rgba(2,0,68,0.12)",
                        }}
                      >
                        <span className="text-lg mt-0.5 flex-shrink-0">📋</span>
                        <div>
                          <p
                            className="text-xs font-semibold mb-0.5"
                            style={{ color: "#020044" }}
                          >
                            Parts &amp; Services screenshot required
                          </p>
                          <p
                            className="text-xs leading-relaxed"
                            style={{ color: "#6B6B8A" }}
                          >
                            Go to{" "}
                            <strong style={{ color: "#020044" }}>
                              Settings → General → About → Parts and Services
                            </strong>{" "}
                            and include a screenshot in your uploads below.
                          </p>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-8 rounded-xl border-2 border-dashed flex flex-col items-center gap-2 transition-colors hover:opacity-80"
                      style={{ borderColor: "rgba(2,0,68,0.15)" }}
                    >
                      <span className="text-2xl">📷</span>
                      <span className="text-sm" style={{ color: "#6B6B8A" }}>
                        Tap to upload photos or videos
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: "rgba(2,0,68,0.35)" }}
                      >
                        Max 10 files
                        {isIphone
                          ? " · include Parts & Services screenshot"
                          : ""}
                      </span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                      onChange={handleMediaUpload}
                    />

                    {mediaPreviews.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mt-3">
                        {mediaPreviews.map((src, i) => (
                          <div
                            key={i}
                            className="relative aspect-square rounded-lg overflow-hidden"
                            style={{ background: "rgba(2,0,68,0.06)" }}
                          >
                            {src === "video" ? (
                              <div className="w-full h-full flex items-center justify-center text-xl">
                                🎥
                              </div>
                            ) : (
                              <img
                                src={src}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            )}
                            <button
                              onClick={() => removeMedia(i)}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                              style={{ background: "#EF3F23" }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* ─────────────────────────────────────────────── */}

                  <button
                    onClick={handleCalculate}
                    style={{ background: "#020044" }}
                    className="w-full text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-opacity text-sm"
                  >
                    Calculate My Device Value →
                  </button>
                </>
              )}
          </div>
        )}

        {/* RESULT */}
        {step === "result" && result && (
          <div className="space-y-4">
            <div
              className="bg-white rounded-2xl p-6 border"
              style={{ border: "1px solid rgba(2,0,68,0.08)" }}
            >
              <p
                className="text-sm text-center mb-1"
                style={{ color: "#6B6B8A" }}
              >
                Your {result.device.name}
                {result.device.storage ? ` (${result.device.storage})` : ""} is
                worth
              </p>
              <h2
                className="text-3xl font-bold text-center mb-1"
                style={{
                  color: "#020044",
                  fontFamily: "Space Grotesk, sans-serif",
                }}
              >
                {formatPrice(result.minVal)} – {formatPrice(result.maxVal)}
              </h2>
              <p
                className="text-xs text-center mb-5"
                style={{ color: "#6B6B8A" }}
              >
                {result.deductionPercent > 0
                  ? `${result.deductionPercent}% deducted for condition`
                  : "No deductions — excellent condition!"}
              </p>

              <div className="mb-5">
                <div
                  className="flex justify-between text-xs mb-1"
                  style={{ color: "#6B6B8A" }}
                >
                  <span>Condition Score</span>
                  <span className="font-semibold" style={{ color: "#020044" }}>
                    {100 - result.deductionPercent}%
                  </span>
                </div>
                <div
                  className="h-2 rounded-full"
                  style={{ background: "rgba(2,0,68,0.08)" }}
                >
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.max(5, 100 - result.deductionPercent)}%`,
                      background: "#020044",
                    }}
                  />
                </div>
              </div>

              <div
                className="space-y-2 pt-4"
                style={{ borderTop: "1px solid rgba(2,0,68,0.08)" }}
              >
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-3"
                  style={{ color: "#6B6B8A" }}
                >
                  Price Breakdown
                </p>
                <Row
                  label="Base market price"
                  val={formatPrice(result.basePrice)}
                />
                {result.device.storage && (
                  <Row
                    label="Storage"
                    val={result.device.storage}
                    valColor="#774499"
                  />
                )}
                {batteryDeduct > 0 && (
                  <Row
                    label={`Battery (${form.batteryHealth}%)`}
                    val={`-${batteryDeduct}%`}
                    valColor="#EF3F23"
                  />
                )}
                {form.faceIdStatus === "broken" && (
                  <Row label="Face ID broken" val="-10%" valColor="#EF3F23" />
                )}
                {form.faceIdStatus === "working" && (
                  <Row label="Face ID" val="Working ✓" valColor="#16a34a" />
                )}
                {form.simType === "locked" && (
                  <Row label="Locked SIM" val="-10%" valColor="#EF3F23" />
                )}
                {form.simType === "esim-unlocked" && (
                  <Row label="eSIM Unlocked" val="-5%" valColor="#d97706" />
                )}
                {form.simType === "physical" && (
                  <Row
                    label="Physical SIM"
                    val="No deduction"
                    valColor="#16a34a"
                  />
                )}
                {form.batteryChanged && (
                  <Row label="Battery replaced" val="-8%" valColor="#EF3F23" />
                )}
                {form.screenChanged && (
                  <Row label="Screen replaced" val="-15%" valColor="#EF3F23" />
                )}
                {form.cameraChanged && (
                  <Row label="Camera replaced" val="-10%" valColor="#EF3F23" />
                )}
                {form.keyboardChanged && (
                  <Row label="Keyboard replaced" val="-8%" valColor="#EF3F23" />
                )}
                {form.ramUpgraded && (
                  <Row label="RAM upgraded" val="+5%" valColor="#16a34a" />
                )}
                {form.storageUpgraded && (
                  <Row label="Storage upgraded" val="+5%" valColor="#16a34a" />
                )}
                {form.otherRepairs.trim() && (
                  <Row label="Other repairs" val="-5%" valColor="#EF3F23" />
                )}
                {form.imeiValid && (
                  <Row
                    label="IMEI verified"
                    val="Boosts trust ✓"
                    valColor="#16a34a"
                  />
                )}
                <div
                  className="flex justify-between pt-2 font-semibold"
                  style={{ borderTop: "1px solid rgba(2,0,68,0.08)" }}
                >
                  <span style={{ color: "#020044" }}>Your valuation</span>
                  <span style={{ color: "#020044" }}>
                    {formatPrice(result.minVal)} – {formatPrice(result.maxVal)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("form")}
                className="flex-1 border text-sm font-medium py-3 rounded-xl"
                style={{ borderColor: "rgba(2,0,68,0.2)", color: "#020044" }}
              >
                ← Adjust
              </button>
              <button
                onClick={() => setStep("publish")}
                style={{ background: "#020044" }}
                className="flex-1 text-white text-sm font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity"
              >
                {form.listingMode === "swap"
                  ? "Post Swap Request →"
                  : "List for Sale →"}
              </button>
            </div>

            <a
              href={`https://wa.me/2349133172761?text=Hi, I want to sell my ${
                result.device.name
              }${
                result.device.storage ? ` (${result.device.storage})` : ""
              }. Valued at ${formatPrice(result.minVal)} – ${formatPrice(
                result.maxVal
              )}.`}
              target="_blank"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white text-sm font-semibold no-underline"
              style={{ background: "#25d366" }}
            >
              💬 WhatsApp to Sell Directly
            </a>
          </div>
        )}

        {/* PUBLISH */}
        {step === "publish" && result && (
          <div
            className="bg-white rounded-2xl p-6 border space-y-5"
            style={{ border: "1px solid rgba(2,0,68,0.08)" }}
          >
            <div>
              <h2
                className="text-xl font-bold mb-1"
                style={{
                  color: "#020044",
                  fontFamily: "Space Grotesk, sans-serif",
                }}
              >
                {form.listingMode === "swap"
                  ? "Post Swap Request"
                  : "List Your Device"}
              </h2>
              <p className="text-sm" style={{ color: "#6B6B8A" }}>
                {form.listingMode === "swap"
                  ? "Vendors will see your swap request and contact you"
                  : "Your listing goes live — vendors and buyers will be notified"}
              </p>
            </div>

            <div
              className="rounded-xl p-4"
              style={{
                background: "rgba(2,0,68,0.03)",
                border: "1px solid rgba(2,0,68,0.08)",
              }}
            >
              <p
                className="text-sm font-semibold mb-1"
                style={{ color: "#020044" }}
              >
                {result.device.name}
                {result.device.storage ? ` (${result.device.storage})` : ""}
              </p>
              <p className="font-bold" style={{ color: "#020044" }}>
                {formatPrice(result.minVal)} – {formatPrice(result.maxVal)}
              </p>
              {form.listingMode === "swap" && form.wantedDevice && (
                <p className="text-xs mt-1" style={{ color: "#774499" }}>
                  Wants:{" "}
                  {form.wantedDevice === "Custom (type below)"
                    ? form.customWantedDevice
                    : form.wantedDevice}
                </p>
              )}
            </div>

            <div>
              <label
                className="text-sm font-medium block mb-1.5"
                style={{ color: "#020044" }}
              >
                Your Name *
              </label>
              <input
                className={inp}
                style={inpS}
                placeholder="John Doe"
                value={form.sellerName}
                onChange={(e) => set("sellerName", e.target.value)}
              />
            </div>
            <div>
              <label
                className="text-sm font-medium block mb-1.5"
                style={{ color: "#020044" }}
              >
                WhatsApp Number *
              </label>
              <input
                className={inp}
                style={inpS}
                type="tel"
                placeholder="08012345678"
                value={form.sellerPhone}
                onChange={(e) => set("sellerPhone", e.target.value)}
              />
              <p className="text-xs mt-1" style={{ color: "#6B6B8A" }}>
                Vendors will contact you on WhatsApp
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("result")}
                className="flex-1 border text-sm font-medium py-3 rounded-xl"
                style={{ borderColor: "rgba(2,0,68,0.2)", color: "#020044" }}
              >
                ← Back
              </button>
              <button
                onClick={handlePublish}
                disabled={publishing || !form.sellerName || !form.sellerPhone}
                style={{ background: "#020044" }}
                className="flex-1 text-white text-sm font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                {publishing
                  ? "Publishing..."
                  : form.listingMode === "swap"
                  ? "Post Swap Request"
                  : "Publish Listing"}
              </button>
            </div>
          </div>
        )}
      </div>

      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </div>
  );
}

function Row({
  label,
  val,
  valColor,
}: {
  label: string;
  val: string;
  valColor?: string;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span style={{ color: "#6B6B8A" }}>{label}</span>
      <span className="font-medium" style={{ color: valColor || "#020044" }}>
        {val}
      </span>
    </div>
  );
}

export default function ValuePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen" style={{ background: "#F8F8FC" }} />
      }
    >
      <ValueContent />
    </Suspense>
  );
}

import { Gadget } from "../types";

// Mock API — replace with real API later
export const fetchLivePrices = async (): Promise<Gadget[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([]);
    }, 1000);
  });
};

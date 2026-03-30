const KEY = "technest_watchlist";

export const getWatchlist = (): string[] => {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(KEY) || "[]");
};

export const toggleWatchlist = (id: string): boolean => {
  const list = getWatchlist();
  if (list.includes(id)) {
    localStorage.setItem(KEY, JSON.stringify(list.filter((i) => i !== id)));
    return false;
  } else {
    localStorage.setItem(KEY, JSON.stringify([...list, id]));
    return true;
  }
};

export const isInWatchlist = (id: string): boolean => {
  return getWatchlist().includes(id);
};

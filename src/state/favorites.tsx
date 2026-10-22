import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { discoverFeed } from "@/data/products";

type FavoritesContextValue = {
  isFavorite: (productId: string) => boolean;
  toggle: (productId: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

// Seeded from the design (the Peugeot's heart is blue in Figma).
const INITIAL = new Set(discoverFeed.filter((entry) => entry.liked).map((entry) => entry.productId));

/** Liked products, per product id. In memory only: resets when the app restarts. */
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<ReadonlySet<string>>(INITIAL);

  const toggle = useCallback((productId: string) => {
    setIds((current) => {
      const next = new Set(current);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }, []);

  const value = useMemo<FavoritesContextValue>(
    () => ({ isFavorite: (productId) => ids.has(productId), toggle }),
    [ids, toggle],
  );
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const favorites = useContext(FavoritesContext);
  if (!favorites) throw new Error("useFavorites must be used inside <FavoritesProvider>");
  return favorites;
}

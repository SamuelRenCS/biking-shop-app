import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";

export type CartLine = { productId: string; quantity: number };

type Action =
  | { type: "add"; productId: string }
  | { type: "setQuantity"; productId: string; quantity: number };

/** The cart opens with the three items shown in the Shopping Cart design. */
const INITIAL_LINES: CartLine[] = [
  { productId: "peugeot-lr01", quantity: 1 },
  { productId: "pilot-chromoly-520", quantity: 1 },
  { productId: "smith-trade", quantity: 1 },
];

function reducer(lines: CartLine[], action: Action): CartLine[] {
  switch (action.type) {
    case "add": {
      const existing = lines.find((l) => l.productId === action.productId);
      if (!existing) return [...lines, { productId: action.productId, quantity: 1 }];
      return lines.map((l) => (l === existing ? { ...l, quantity: l.quantity + 1 } : l));
    }
    case "setQuantity":
      // Setting a quantity to 0 removes the line.
      if (action.quantity <= 0) return lines.filter((l) => l.productId !== action.productId);
      return lines.map((l) => (l.productId === action.productId ? { ...l, quantity: action.quantity } : l));
  }
}

type CartContextValue = {
  lines: CartLine[];
  add: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

/** In-memory cart for the session. No persistence: the brief only needs it to work in-app. */
export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, dispatch] = useReducer(reducer, INITIAL_LINES);
  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      add: (productId) => dispatch({ type: "add", productId }),
      setQuantity: (productId, quantity) => dispatch({ type: "setQuantity", productId, quantity }),
    }),
    [lines],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) throw new Error("useCart must be used inside <CartProvider>");
  return cart;
}

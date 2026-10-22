import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";

import { isValidPromo } from "./pricing";

export type CartLine = { productId: string; quantity: number };

/** `promoCode` is kept as typed (pricing compares case-insensitively). */
type CartState = { lines: CartLine[]; promoCode: string | null };

type Action =
  | { type: "add"; productId: string }
  | { type: "setQuantity"; productId: string; quantity: number }
  | { type: "setPromo"; code: string | null };

/** The cart opens as the Shopping Cart design shows it: three items with "Bike30" applied. */
const INITIAL_STATE: CartState = {
  lines: [
    { productId: "peugeot-lr01", quantity: 1 },
    { productId: "pilot-chromoly-520", quantity: 1 },
    { productId: "smith-trade", quantity: 1 },
  ],
  promoCode: "Bike30",
};

function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case "add": {
      const { lines } = state;
      const existing = lines.find((l) => l.productId === action.productId);
      return {
        ...state,
        lines: existing
          ? lines.map((l) => (l === existing ? { ...l, quantity: l.quantity + 1 } : l))
          : [...lines, { productId: action.productId, quantity: 1 }],
      };
    }
    case "setQuantity":
      return {
        ...state,
        // Setting a quantity to 0 removes the line.
        lines:
          action.quantity <= 0
            ? state.lines.filter((l) => l.productId !== action.productId)
            : state.lines.map((l) => (l.productId === action.productId ? { ...l, quantity: action.quantity } : l)),
      };
    case "setPromo":
      return { ...state, promoCode: action.code };
  }
}

type CartContextValue = CartState & {
  add: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  /** Applies the code if valid (an empty code clears it). Returns false for an invalid code. */
  applyPromo: (code: string) => boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

/** In-memory cart for the session. No persistence: the brief only needs it to work in-app. */
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const value = useMemo<CartContextValue>(
    () => ({
      ...state,
      add: (productId) => dispatch({ type: "add", productId }),
      setQuantity: (productId, quantity) => dispatch({ type: "setQuantity", productId, quantity }),
      applyPromo: (code) => {
        if (!code.trim()) {
          dispatch({ type: "setPromo", code: null });
          return true;
        }
        const valid = isValidPromo(code);
        // An invalid code also drops any earlier one, so the field and the totals always agree.
        dispatch({ type: "setPromo", code: valid ? code.trim() : null });
        return valid;
      },
    }),
    [state],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) throw new Error("useCart must be used inside <CartProvider>");
  return cart;
}

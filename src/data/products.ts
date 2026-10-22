export type ProductKind = "bike" | "accessory";

export type Product = {
  id: string;
  kind: ProductKind;
  category: string;
  name: string;
  /** Shorter name for the Discover grid where the full name doesn't fit (Figma uses both). */
  shortName?: string;
  price: number;
  /** Bundled asset (the module id `require()` returns). */
  image: number;
  description: string;
};

const images = {
  peugeot: require("@assets/images/products/peugeot-lr01.png"),
  smith: require("@assets/images/products/smith-trade.png"),
  heroEbike: require("@assets/images/products/hero-ebike.png"),
};

export const products: Record<string, Product> = {
  "peugeot-lr01": {
    id: "peugeot-lr01",
    kind: "bike",
    category: "Road Bike",
    name: "PEUGEOT - LR01",
    price: 1999.99,
    image: images.peugeot,
    description:
      "The LR01 uses the same design as the most iconic bikes from PEUGEOT Cycles' 130-year history and combines it with agile, dynamic performance that's perfectly suited to navigating today's cities. As well as a lugged steel frame and iconic PEUGEOT black-and-white chequer design, this city bike also features a 16-speed Shimano Claris drivetrain.",
  },
  "pilot-chromoly-520": {
    id: "pilot-chromoly-520",
    kind: "bike",
    category: "Mountain Bike",
    name: "PILOT - CHROMOLY 520",
    shortName: "PILOT - Chromoly",
    // Discover shows $1,999.99 (a copy-paste in Figma); the cart's $3,999.99 is what the totals use.
    price: 3999.99,
    // TODO(assets): the black Pilot bike photo isn't in the repo yet; Figma itself uses the
    // Peugeot photo for one of the Pilot cards, so it stands in until the export arrives.
    image: images.peugeot,
    description: "",
  },
  "smith-trade": {
    id: "smith-trade",
    kind: "accessory",
    category: "Road Helmet",
    name: "SMITH - Trade",
    price: 120,
    // TODO(assets): matted from the @2x Discover render; replace with the original transparent PNG.
    image: images.smith,
    description: "",
  },
};

export const heroPromo = {
  image: images.heroEbike,
  label: "30% Off",
};

/**
 * Discover grid, in Figma's order. The grid fills left/right columns alternately, so these are
 * left, right, left, right, ... Figma repeats the three products; the heart state is static
 * mock data (favourites are out of scope).
 */
export const discoverFeed: { productId: string; liked: boolean }[] = [
  { productId: "peugeot-lr01", liked: true },
  { productId: "smith-trade", liked: false },
  { productId: "smith-trade", liked: true },
  { productId: "pilot-chromoly-520", liked: false },
  { productId: "pilot-chromoly-520", liked: false },
  { productId: "smith-trade", liked: false },
];

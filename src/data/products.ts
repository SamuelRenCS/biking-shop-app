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
  pilot: require("@assets/images/products/black_pilot.png"),
  helmet: require("@assets/images/products/helmet.png"),
  carbonE1: require("@assets/images/products/carbon-e1.png"), // trimmed to the bike
  heroEbike: require("@assets/images/products/hero-ebike.png"), // Figma's hero framing
};

export const products: Record<string, Product> = {
  // The hero's 30%-off bike. Figma gives it no name, price or copy, so these are placeholders.
  "carbon-e1": {
    id: "carbon-e1",
    kind: "bike",
    category: "Electric Bike",
    name: "CARBON - E1",
    price: 2799.99, // 30% off 3,999.99
    image: images.carbonE1,
    description:
      "The E1 hides its motor and battery inside a one-piece carbon frame, so it rides and looks like a lightweight road bike until you need the boost. Up to 90 km of assist, a belt drive that never needs oil, and integrated lights make it an effortless daily commuter.",
  },
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
    image: images.pilot,
    // Not in the design: placeholder copy in the same voice as the Peugeot description.
    description:
      "The Chromoly 520 pairs a lightweight, double-butted chromoly steel frame with a carbon fork for a ride that is stiff where it counts and forgiving on rough tarmac. Deep-section rims, internal cable routing and a 22-speed groupset make it equally at home on fast group rides and long solo climbs.",
  },
  "smith-trade": {
    id: "smith-trade",
    kind: "accessory",
    category: "Road Helmet",
    name: "SMITH - Trade",
    price: 120,
    image: images.helmet,
    // Not in the design: placeholder copy in the same voice as the Peugeot description.
    description:
      "The Trade is a road helmet built around comfort on long days in the saddle. Wide vents keep air moving at any speed, the in-mould shell keeps weight down, and a dial-adjust fit system with a removable, washable liner holds it securely in place without pressure points.",
  },
};

/** The promoted product in the Discover hero card. */
export const heroPromo = {
  productId: "carbon-e1",
  image: images.heroEbike,
  label: "30% Off",
};

/**
 * Discover grid. Each product appears once (Figma repeats cards to fill the frame). The grid
 * fills left/right columns alternately, so these are left, right, left, right. The first two
 * match the design's first viewport. `liked` seeds the in-memory favourites (state/favorites).
 */
export const discoverFeed: { productId: string; liked: boolean }[] = [
  { productId: "peugeot-lr01", liked: true },
  { productId: "smith-trade", liked: false },
  { productId: "carbon-e1", liked: false },
  { productId: "pilot-chromoly-520", liked: false },
];

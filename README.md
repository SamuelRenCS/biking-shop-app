# Biking Shop

A three-screen biking shop (Discover, Product Detail, Shopping Cart) built from the Figma mockup in Expo React Native. Checked on the iPhone 13 mini and iPhone 17 Pro Max simulators.

**Stack:** Expo SDK 58 (React Native 0.88, New Architecture), TypeScript, Expo Router, NativeWind 4 (Tailwind 3), Reanimated 4, Gesture Handler 3, React Native Skia, react-native-svg.

## Running it

Requirements: macOS with Xcode and an iOS simulator runtime, CocoaPods, and Node. It was built and tested with Xcode 27.1, CocoaPods 1.16 and Node 24.

```bash
npm install
npx expo run:ios --device "iPhone 13 mini"   # builds the native app, installs it, starts Metro
```

- To run on the other device, pass `--device "iPhone 17 Pro Max"`. If a simulator is missing, add it in Xcode under Window → Devices and Simulators.
- The first build compiles the native modules (Skia, Reanimated) and takes a few minutes. After that, `npx expo start` is enough.
- The app runs as a development build rather than in Expo Go, because native modules are versioned to the exact SDK.
- `npm run typecheck` runs TypeScript.

## Project layout

```
src/
  app/                 routes (Expo Router): (tabs)/ Discover + placeholder tabs, product/[id], cart
  components/
    ui/                shared pieces: AccentButton, SkeuoButton, SkewedSurface, Well, HeartButton, ...
    discover/ detail/ cart/   screen-specific components and each screen's layout maths
    navigation/        custom tab bar
  navigation/          SlideStack, the Reanimated stack navigator
  theme/               tokens.ts (from the Figma CSS) plus helpers for RN styles and Skia
  state/               cart, pricing rules, favourites (in memory)
  api/ hooks/          Open-Meteo client and data hook
  data/                mock products
docs/                  Figma CSS export and motion spec
```

## How it's built

- **Theme:** colors, gradients, shadows, radii and type come from `docs/figma-export.css` and live in `src/theme/tokens.ts`. Tailwind, RN styles and Skia all read from that one file.
- **Slanted shapes:** the hero, product cards, tab bar and active tab tile are drawn with Skia, because RN's `borderRadius` only works on rectangles. The CSS export drops the slant, so the geometry comes from the shape SVGs in `assets/shapes/`. Rectangular buttons use RN 0.88's native `backgroundImage: linear-gradient(...)` and multi-layer `boxShadow`.
- **Motion:** everything in the motion spec uses Reanimated:
  - **Screen transitions:** a custom stack navigator. New screens slide in from the right, and you can swipe back from the left edge.
  - **Accent buttons:** shrink on press.
  - **Skeuomorphic buttons:** crossfade smoothly between raised and pressed-in.
  - **Checkout:** a left-to-right slide that reveals "Done!" behind the knob as it moves.
  - **Extras added during review:** the tab bar tile glides between tabs, and hearts pop when toggled.
- **Screen sizes:** the designs are 390 × 844 pt. Each screen computes its layout from the screen width and safe area, so artwork (hero, cards, backdrop) scales with width while text keeps its size.
  - On the 13 mini, the Detail photo shrinks to fit above the bottom sheet, and the Cart's vertical gaps tighten so all three items still fit.
  - On the 17 Pro Max, artwork scales up and the extra height goes to the content area.

## Assumptions

### Design and assets

- The product photos came from two places. The Peugeot and the hero e-bike are extracted from the PNGs embedded in the Figma shape SVGs, cropped the way Figma frames them. The helmet and the black Pilot bike were supplied separately as transparent PNGs.
- The hero's 30%-off bike is treated as a product. Figma gives it no name, price or copy, so **"CARBON - E1"**, **$2,799.99** (30% off $3,999.99) and its description are placeholders. The descriptions for the Pilot and the helmet are placeholders too; only the Peugeot has copy in the design.
- The Pilot bike appears as "PILOT - Chromoly" at $1,999.99 on Discover and "PILOT - CHROMOLY 520" at $3,999.99 in the cart. I used the cart's name and price, and the shorter name on the Discover card.
- Discover shows each product once. Figma repeats cards to fill the frame.
- Figma's product cards vary slightly in height and padding, so I standardized on the two cards in the first viewport: bike cards 240 pt, accessory cards 219 pt.
- The blue diagonal backdrop's position and angle aren't in the CSS. I adjusted them to match the design as close as possible visually.
- Cards and chips switch to Figma's translucent "glass" style when they sit over the blue backdrop, which reproduces the design on every screen width.
- Line heights use Figma's exact 150% (for example 22.5 pt for 15 pt text). The CSS export rounds them, which made long text drift.
- The cart dividers use the color Figma actually renders, a faint `#2D374A` line. The CSS says 0.5 px of 50% white, which is much brighter.
- The Detail tabs keep fixed widths. Figma sizes each pill to its label, which shifts the row by a few points when the selection changes.
- The red for the promo-code error isn't in the design.

### Behavior

- **Category chips** change their selected state only; they don't filter.
- **Favourites** are kept in memory per product and reset when the app restarts. The Peugeot starts as liked, as in the design.
- **Tabs:** Map, Profile and Documents are placeholders. The Cart tab opens the cart as a pushed screen with a back button, as designed.
- **Add to Cart** adds one of the product. Since the design has no added state, the button briefly reads "Added to Cart".
- **FREE DATA panel:** current riding conditions from [Open-Meteo](https://open-meteo.com) (no API key) for a fixed location, **Amsterdam**.
  - It shows temperature, conditions, wind, feels-like, rain chance over the next 3 hours and sunset.
  - It adds a simple "good to ride" verdict based on rain, wind and temperature.
  - Results are cached for 10 minutes. Loading shows a skeleton, and errors (including a 10 s timeout) show a retry button.
- **Cart:**
  - It opens as the design shows it: the three items, with "Bike30" already applied.
  - Setting a quantity to 0 removes the item.
  - **Free shipping from a $500 subtotal** (before discounts), so any bike order ships free. Smaller orders pay a **$15** delivery fee, and the message changes to "Add $X more for free shipping".
  - Promo codes are case-insensitive. **"Bike30"** takes 30% off the subtotal (not the delivery fee). Any other code shows "Invalid code" and removes the discount.
  - Totals are computed from the items in whole cents. The design's subtotal reads $6,119.99, but the items add up to **$6,119.98**. The total still matches the design's $4,283.99.
  - Amounts use thousands separators throughout. The design mixes "$6119.99" and "$4,283.99".
- **Checkout** has no order flow or backend. Completing the slide shows "Done!", then the slider resets and the cart is left as it is.

### Tooling notes

- NativeWind 4.2.7 officially documents SDK 57; it works on SDK 58 here.
  - `inlineRem` is set to 16 so Tailwind spacing matches Figma points (NativeWind defaults to 14).
  - The "ImageBackground is deprecated" warning that NativeWind triggers on RN 0.88 is silenced in `src/ignore-logs.ts`.
- On iOS a view's inset shadow is drawn above its children, so pressed-in surfaces are drawn on their own layer behind their content (`Well`, `SkeuoButton`).

# Biking Shop

A three-screen biking shop (Discover, Product Detail, Shopping Cart) built from the Figma mockup in Expo React Native. Checked on the iPhone 13 mini and iPhone 17 Pro Max simulators.

**Stack:** Expo SDK 58 (React Native 0.88, New Architecture), TypeScript, Expo Router, NativeWind 4 (Tailwind 3), Reanimated 4, Gesture Handler 3, React Native Skia, react-native-svg.

## Running it

Requirements: macOS with Xcode and an iOS simulator runtime, CocoaPods, and Node. It was built and tested with Xcode 27.1, CocoaPods 1.16 and Node 24.

```bash
npm install
npx expo run:ios --device "iPhone 13 mini"   # builds the native app, installs it, starts Metro
```

- To run on the other device, pass `--device "iPhone 17 Pro Max"`.
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

- **Placeholder content.** Figma gives the hero e-bike no name, price or copy, so "CARBON - E1", $2,799.99 (30% off $3,999.99) and its description are placeholders. The descriptions for the Pilot and the helmet are placeholders too; only the Peugeot has copy in the design.
- **Pilot name and price.** Discover says "PILOT - Chromoly" at $1,999.99 and the cart says "PILOT - CHROMOLY 520" at $3,999.99. I used the cart's price and name, with the shorter name on the Discover card.
- **Where Figma and its CSS disagreed,** I followed what the design renders: card heights, line heights, the cart divider color and the Detail tab widths. The blue backdrop's position and angle aren't in the CSS, so I matched them visually.

### Behavior

- **Category chips** change their selected state only; they don't filter.
- **Favourites** are kept in memory and reset when the app restarts. The Peugeot starts as liked, as in the design.
- **Tabs:** Map, Profile and Documents are placeholders. The Cart tab opens the cart as a pushed screen.
- **FREE DATA panel:** current riding conditions from Open-Meteo (no API key) for a fixed location, Amsterdam, with a simple "good to ride" verdict. Results are cached for 10 minutes. Loading shows a skeleton, and errors show a retry button.
- **Cart:**
  - It opens as designed: three items, with "Bike30" already applied.
  - Free shipping from a $500 subtotal; smaller orders pay $15. Promo codes are case-insensitive, "Bike30" takes 30% off the subtotal, and anything else shows "Invalid code".
  - Totals are computed from the items. The design's subtotal reads $6,119.99, but the items add up to $6,119.98. The total still matches the design's $4,283.99.
- **Checkout** has no order flow or backend. Completing the slide shows "Done!", then the slider resets.
- **Checkout "Done!" label.** In the mockup the text sits on the left of the track. I centred it to match the "Checkout" label, so the text stays in the same place before and after the slide.

### Video Demo

A video demo of my implementation can be found at the root of the repository as `video_demo.mp4`.

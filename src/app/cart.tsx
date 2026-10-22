import { PlaceholderScreen } from "@/components/ui/PlaceholderScreen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";

// Stub so the Reanimated screen transition can be checked now. Built out in the Cart step.
export default function CartScreen() {
  return (
    <PlaceholderScreen
      header={<ScreenHeader title="My Shopping Cart" />}
      title="Shopping cart"
      note="Next step. Swipe from the left edge or tap back to test the transition."
    />
  );
}

import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { RIDING_LOCATION, rideVerdict, type RideVerdict, type RidingConditions } from "@/api/openMeteo";
import { AccentButton } from "@/components/ui/AccentButton";
import { Well } from "@/components/ui/Well";
import { useRidingConditions } from "@/hooks/useRidingConditions";
import { colors, cssShadow, radii, shadows } from "@/theme";

/**
 * FREE DATA: live riding conditions from Open-Meteo, in the Specification tab.
 * Fills the 335 × 218 slot from Figma, built from the page's own pieces: a pressed-in well (like
 * the idle tab), raised tiles (like the selected tab), and the price blue for the headline number.
 */

const VERDICT: Record<RideVerdict, { label: string; color: string }> = {
  great: { label: "Great for riding", color: colors.accentText },
  fair: { label: "Ride with care", color: colors.textHigh },
  poor: { label: "Better stay in", color: colors.textMuted },
};

const well = { backgroundColor: colors.surface200, boxShadow: cssShadow(shadows.neuPressed), borderRadius: radii.lg };
const tile = { backgroundColor: colors.surface300, boxShadow: cssShadow(shadows.neuRaised), borderRadius: radii.md };

export function RidingConditionsPanel() {
  const { state, retry } = useRidingConditions();

  return (
    <Well className="mx-[27px] p-4" style={{ height: 218 }} surface={well}>
      {state.status === "success" && <Conditions data={state.data} />}
      {state.status === "loading" && <Loading />}
      {state.status === "error" && <ErrorState onRetry={retry} />}
    </Well>
  );
}

function Conditions({ data }: { data: RidingConditions }) {
  const verdict = VERDICT[rideVerdict(data)];
  return (
    <View className="flex-1 justify-between">
      <View>
        <View className="flex-row items-center justify-between">
          <Text className="font-poppins-medium text-caption text-text-muted">{RIDING_LOCATION.name} · Now</Text>
          <Text className="font-poppins-semibold text-caption" style={{ color: verdict.color }}>
            {verdict.label}
          </Text>
        </View>
        <View className="flex-row items-baseline" style={{ gap: 10 }}>
          <Text className="font-poppins text-price" style={{ color: colors.accentText }}>
            {Math.round(data.temperature)}°
          </Text>
          <Text className="font-poppins-medium text-body text-white" numberOfLines={1}>
            {data.condition}
          </Text>
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <View className="flex-row" style={{ gap: 8 }}>
          <Metric label="Wind" value={`${Math.round(data.windSpeed)} km/h ${data.windFrom}`} />
          <Metric label="Feels like" value={`${Math.round(data.feelsLike)}°`} />
        </View>
        <View className="flex-row" style={{ gap: 8 }}>
          <Metric label="Rain, 3h" value={`${data.rainChance}%`} />
          <Metric label="Sunset" value={data.sunset} />
        </View>
      </View>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View className="h-11 flex-1 flex-row items-center justify-between px-3" style={tile}>
      <Text className="font-poppins text-caption text-text-muted">{label}</Text>
      <Text className="font-poppins-bold text-caption text-white">{value}</Text>
    </View>
  );
}

/** Static placeholders in the shape of the loaded panel (no animation: not in the motion spec). */
function Loading() {
  const bar = (width: number, height: number) => (
    <View style={{ width, height, borderRadius: 6, backgroundColor: colors.surface300, opacity: 0.6 }} />
  );
  return (
    <View
      className="flex-1 justify-between"
      accessible
      accessibilityLabel="Loading riding conditions"
      accessibilityState={{ busy: true }}
    >
      <View style={{ gap: 12 }}>
        {bar(140, 14)}
        {bar(110, 28)}
      </View>
      <View style={{ gap: 8 }}>
        <TileRow>
          <View className="h-11 flex-1" style={[tile, { opacity: 0.5 }]} />
          <View className="h-11 flex-1" style={[tile, { opacity: 0.5 }]} />
        </TileRow>
        <TileRow>
          <View className="h-11 flex-1" style={[tile, { opacity: 0.5 }]} />
          <View className="h-11 flex-1" style={[tile, { opacity: 0.5 }]} />
        </TileRow>
      </View>
    </View>
  );
}

function TileRow({ children }: { children: ReactNode }) {
  return (
    <View className="flex-row" style={{ gap: 8 }}>
      {children}
    </View>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View className="flex-1 items-center justify-center" style={{ gap: 6 }}>
      <Text className="font-poppins-bold text-heading text-white">No riding forecast</Text>
      <Text className="text-center font-poppins text-caption text-text-muted">
        We couldn't reach the weather service. Check your connection and try again.
      </Text>
      <AccentButton width={120} height={36} shadow={shadows.ctaButton} onPress={onRetry} style={{ marginTop: 8 }}>
        <Text className="font-poppins-medium text-caption text-white">Try again</Text>
      </AccentButton>
    </View>
  );
}

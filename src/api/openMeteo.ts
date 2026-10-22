/**
 * Riding conditions from Open-Meteo (https://open-meteo.com): free, no API key.
 * One request gets current weather, rain probability for the next three hours and today's sunset.
 */

/** Fixed location for the FREE DATA panel. Amsterdam, a fitting city for a bike shop. */
export const RIDING_LOCATION = { name: "Amsterdam", latitude: 52.3676, longitude: 4.9041 } as const;

const TIMEOUT_MS = 10_000;

export type RidingConditions = {
  temperature: number; // °C
  feelsLike: number; // °C
  windSpeed: number; // km/h
  windFrom: string; // compass point the wind blows from
  rainChance: number; // %, highest over the next 3 hours
  sunset: string; // "HH:MM", local time at the location
  condition: string; // human-readable WMO weather code
  weatherCode: number;
  precipitation: number; // mm in the current interval
};

type ForecastResponse = {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    precipitation: number;
  };
  hourly: { precipitation_probability: (number | null)[] };
  daily: { sunset: string[] };
};

export async function fetchRidingConditions(signal?: AbortSignal): Promise<RidingConditions> {
  const params = new URLSearchParams({
    latitude: String(RIDING_LOCATION.latitude),
    longitude: String(RIDING_LOCATION.longitude),
    current:
      "temperature_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,precipitation",
    hourly: "precipitation_probability",
    forecast_hours: "3",
    daily: "sunset",
    forecast_days: "1",
    timezone: "auto",
    wind_speed_unit: "kmh",
  });

  // RN's AbortController polyfill has no AbortSignal.timeout/any, so link the signals by hand.
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, TIMEOUT_MS);
  signal?.addEventListener("abort", () => controller.abort());

  let data: ForecastResponse;
  try {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Open-Meteo responded ${response.status}`);
    data = (await response.json()) as ForecastResponse;
  } catch (error) {
    if (timedOut) throw new Error("The weather service took too long to respond");
    throw error;
  } finally {
    clearTimeout(timer);
  }

  const { current } = data;
  const chances = data.hourly.precipitation_probability.filter((p): p is number => p !== null);
  return {
    temperature: current.temperature_2m,
    feelsLike: current.apparent_temperature,
    windSpeed: current.wind_speed_10m,
    windFrom: compassPoint(current.wind_direction_10m),
    rainChance: chances.length ? Math.max(...chances) : 0,
    sunset: data.daily.sunset[0]?.slice(11, 16) ?? "–",
    condition: describeWeatherCode(current.weather_code),
    weatherCode: current.weather_code,
    precipitation: current.precipitation,
  };
}

function compassPoint(degrees: number) {
  const points = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return points[Math.round(degrees / 45) % 8];
}

/** WMO weather interpretation codes, as listed in the Open-Meteo docs. */
function describeWeatherCode(code: number) {
  if (code === 0) return "Clear sky";
  if (code === 1) return "Mainly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Fog";
  if (code >= 51 && code <= 57) return "Drizzle";
  if (code >= 61 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Rain showers";
  if (code === 85 || code === 86) return "Snow showers";
  if (code >= 95) return "Thunderstorm";
  return "Unknown";
}

export type RideVerdict = "great" | "fair" | "poor";

/** A simple, explainable rule of thumb for whether it's a good time to ride. */
export function rideVerdict(c: RidingConditions): RideVerdict {
  const wet = c.precipitation > 0.1 || c.weatherCode >= 51;
  if (wet || c.rainChance >= 60 || c.windSpeed > 35 || c.feelsLike < 0 || c.feelsLike > 35) return "poor";
  if (c.rainChance >= 30 || c.windSpeed > 20 || c.feelsLike < 8 || c.feelsLike > 30) return "fair";
  return "great";
}

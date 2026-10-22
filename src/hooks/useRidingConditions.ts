import { useCallback, useEffect, useState } from "react";

import { fetchRidingConditions, type RidingConditions } from "@/api/openMeteo";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: RidingConditions };

// Conditions don't change between opening two product pages a minute apart.
const CACHE_MS = 10 * 60 * 1000;
let cache: { data: RidingConditions; at: number } | null = null;

export function useRidingConditions() {
  const fresh = cache && Date.now() - cache.at < CACHE_MS ? cache.data : null;
  const [state, setState] = useState<State>(fresh ? { status: "success", data: fresh } : { status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (cache && Date.now() - cache.at < CACHE_MS) return;
    const controller = new AbortController();
    setState({ status: "loading" });
    fetchRidingConditions(controller.signal)
      .then((data) => {
        cache = { data, at: Date.now() };
        setState({ status: "success", data });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({ status: "error", message: error instanceof Error ? error.message : String(error) });
      });
    return () => controller.abort();
  }, [attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { state, retry };
}

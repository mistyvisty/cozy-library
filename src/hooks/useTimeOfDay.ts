import { useEffect, useState } from "react";

export type TimeOfDay = "sunrise" | "day" | "sunset" | "night";
export type Season = "spring" | "summer" | "autumn" | "winter";

function bucketHour(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 7) return "sunrise";
  if (hour >= 7 && hour < 17) return "day";
  if (hour >= 17 && hour < 20) return "sunset";
  return "night";
}

function bucketMonth(month: number): Season {
  if (month === 11 || month <= 1) return "winter";
  if (month <= 4) return "spring";
  if (month <= 7) return "summer";
  return "autumn";
}

// The room's lighting only needs to notice which multi-hour bucket we're in,
// not the exact minute — a 5-minute recheck is plenty and far cheaper than a
// per-second clock.
const RECHECK_MS = 5 * 60 * 1000;

export function useTimeOfDay() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), RECHECK_MS);
    return () => clearInterval(id);
  }, []);

  return {
    timeOfDay: bucketHour(now.getHours()),
    season: bucketMonth(now.getMonth()),
  };
}

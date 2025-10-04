import { Activity, Gauge, Timer, Flame } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  computeWeeklyMetrics,
  formatDuration,
  formatPace,
  getFastestRunByPace,
  getLastRun,
  safeDistanceKm,
} from "../lib/activityMetrics";

const parseActivities = (payload) => {
  if (Array.isArray(payload?.activities)) return payload.activities;
  if (Array.isArray(payload)) return payload;
  return [];
};

export const HighlightsSection = () => {
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/data/activities.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (alive) setActivities(parseActivities(json));
      } catch (err) {
        if (alive) setError(err.message || "Failed to load activities");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const weekly = useMemo(() => computeWeeklyMetrics(activities), [activities]);
  const lastRun = useMemo(() => getLastRun(activities), [activities]);
  const bestRun = useMemo(() => getFastestRunByPace(activities), [activities]);

  const lastRunStats = useMemo(() => {
    if (!lastRun) return null;
    const distanceKm = safeDistanceKm(lastRun);
    const movingTime = Number(lastRun?.moving_time ?? lastRun?.elapsed_time ?? 0);
    const pace = distanceKm > 0 && movingTime > 0 ? formatPace(movingTime / distanceKm) : "–";
    const when = lastRun.start_date_local || lastRun.start_date;
    return {
      distanceKm,
      movingTime,
      pace,
      name: lastRun.name || "Run",
      date: when ? new Date(when).toLocaleString() : null,
    };
  }, [lastRun]);

  const bestRunStats = useMemo(() => {
    if (!bestRun) return null;
    return {
      pace: formatPace(bestRun.paceSecPerKm),
      distanceKm: bestRun.distanceKm,
      movingTime: formatDuration(bestRun.movingTimeSec),
      date: bestRun.when?.toLocaleDateString?.() ?? null,
      name: bestRun.activity?.name || "Personal best",
    };
  }, [bestRun]);

  return (
    <section id="highlight" className="relative overflow-hidden py-24 horizon-section horizon-section--highlights">
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent" aria-hidden="true" />
      <div className="container relative z-10 mx-auto max-w-6xl px-4 text-white">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-white/60">Weekly story</p>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold leading-tight">Three pulses that define your training</h2>
          <p className="mt-4 text-base text-white/70">
            Monitor progress at a glance: weekly volume, your freshest effort, and the run where everything clicked.
          </p>
        </div>

        {error && (
          <div className="mx-auto max-w-xl rounded-2xl border border-white/20 bg-white/10 p-6 text-center text-sm text-orange-200">
            {error}
          </div>
        )}

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="flex h-full flex-col justify-between rounded-3xl border border-white/20 bg-white/10 p-8 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm uppercase tracking-[0.3em] text-white/60">Mileage</span>
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <div className="mt-8 space-y-4">
              <p className="text-4xl font-bold tabular-nums">{weekly.kmThisWeek.toFixed(1)} km</p>
              <div className="flex items-center justify-between text-sm text-white/70">
                <span>Avg HR</span>
                <span className="flex items-center gap-2 font-medium"><Gauge className="h-4 w-4 text-primary" /> {Math.round(weekly.avgHrThisWeek) || "–"} bpm</span>
              </div>
              <div className="flex items-center justify-between text-sm text-white/70">
                <span>Load vs last week</span>
                <span className="flex items-center gap-2 font-medium"><Flame className="h-4 w-4 text-primary" />
                  {`${weekly.loadPct >= 0 ? "+" : ""}${Math.round(weekly.loadPct)}%`}
                </span>
              </div>
            </div>
            <p className="mt-8 text-xs uppercase tracking-[0.3em] text-white/50">{weekly.activityCount} runs this week</p>
          </div>

          <div className="flex h-full flex-col justify-between rounded-3xl border border-white/20 bg-white/10 p-8 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm uppercase tracking-[0.3em] text-white/60">Last run</span>
              <Timer className="h-6 w-6 text-primary" />
            </div>
            {lastRunStats ? (
              <div className="mt-8 space-y-4">
                <p className="text-4xl font-bold tabular-nums">{lastRunStats.distanceKm.toFixed(2)} km</p>
                <div className="flex items-center justify-between text-sm text-white/70">
                  <span>Moving time</span>
                  <span className="font-medium">{formatDuration(lastRunStats.movingTime)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-white/70">
                  <span>Pace</span>
                  <span className="font-medium">{lastRunStats.pace}</span>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/5 p-4 text-xs text-white/70">
                  <p className="font-semibold text-white/90">{lastRunStats.name}</p>
                  {lastRunStats.date && <p className="mt-1 text-white/60">{lastRunStats.date}</p>}
                </div>
              </div>
            ) : (
              <div className="mt-8 flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 text-center text-sm text-white/60">
                Sync your Strava export to reveal your most recent effort.
              </div>
            )}
          </div>

          <div className="flex h-full flex-col justify-between rounded-3xl border border-white/20 bg-white/10 p-8 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm uppercase tracking-[0.3em] text-white/60">Personal rhythm</span>
              <Flame className="h-6 w-6 text-primary" />
            </div>
            {bestRunStats ? (
              <div className="mt-8 space-y-4">
                <p className="text-4xl font-bold tabular-nums">{bestRunStats.pace}</p>
                <div className="flex items-center justify-between text-sm text-white/70">
                  <span>Distance</span>
                  <span className="font-medium">{bestRunStats.distanceKm.toFixed(1)} km</span>
                </div>
                <div className="flex items-center justify-between text-sm text-white/70">
                  <span>Moving time</span>
                  <span className="font-medium">{bestRunStats.movingTime}</span>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/5 p-4 text-xs text-white/70">
                  <p className="font-semibold text-white/90">{bestRunStats.name}</p>
                  {bestRunStats.date && <p className="mt-1 text-white/60">{bestRunStats.date}</p>}
                </div>
              </div>
            ) : (
              <div className="mt-8 flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 text-center text-sm text-white/60">
                Keep logging distance above 5 km to surface your fastest session.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

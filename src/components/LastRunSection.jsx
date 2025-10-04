import { Activity, HeartPulse, Mountain, Flame, Gauge, Map } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ScrollDropIn } from "./ScrollDropIn";

// Helper formatters
const fmtTime = (sec = 0) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return [h ? String(h) : null, String(m).padStart(2, "0"), String(s).padStart(2, "0")]
    .filter(Boolean)
    .join(":");
};
const fmtPace = (movingSec = 0, distanceMeters = 0) => {
  const km = distanceMeters / 1000;
  if (!km) return "–";
  const spk = movingSec / km;
  const m = Math.floor(spk / 60);
  const s = Math.round(spk % 60);
  return `${m}:${String(s).padStart(2, "0")} /km`;
};

export const LastRunSection = () => {
  const [lastRun, setLastRun] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // Expect file in public folder: /public/data/activities.json
        const res = await fetch("/data/activities.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const acts = Array.isArray(json?.activities) ? json.activities : [];
        const runs = acts.filter((a) => (a?.type === "Run" || a?.sport_type === "Run") && a?.start_date);
        runs.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
        const latest = runs[0] || null;
        if (alive) setLastRun(latest);
      } catch (e) {
        if (alive) setError(e.message || "failed to load");
      }
    })();
    return () => { alive = false; };
  }, []);

  const cards = useMemo(() => {
    if (!lastRun) return null;
    const d = lastRun;
    const distanceKm = (d.distance ?? 0) / 1000;
    const movingTimeSec = d.moving_time ?? 0;
    const avgPace = fmtPace(movingTimeSec, d.distance ?? 0);
    const hrAvg = d.average_heartrate ? Math.round(d.average_heartrate) : null;
    const hrMax = d.max_heartrate ? Math.round(d.max_heartrate) : null;
    const elevGain = d.total_elevation_gain ?? d.elevation_gain ?? null;
    const kilojoules = d.kilojoules ?? null; // may be present; if so, we show as kcal approx
    const maxSpeed = d.max_speed ?? null;

    return {
      distanceKm,
      movingTimeSec,
      avgPace,
      hrAvg,
      hrMax,
      elevGain,
      kilojoules,
      maxSpeed,
      startDate: d.start_date,
      name: d.name,
      polyline: d.map?.summary_polyline || null,
    };
  }, [lastRun]);

  return (
    <section id="lastrun" className="py-24 px-4 horizon-section horizon-section--lastrun">
      <div className="container">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-10 text-center">
          Last <span className="text-primary">Run</span>
        </h2>

        {!lastRun && !error && (
          <div className="text-center opacity-80">Chargement du dernier run…</div>
        )}
        {error && (
          <div className="text-center text-red-400">Erreur de chargement: {error}</div>
        )}

        {cards && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Summary */}

            <div className="p-8 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-xl shadow-xl card-hover sm:col-span-2 lg:col-span-3">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Summary</h3>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-extrabold">{cards.distanceKm.toFixed(2)}</div>
                  <div className="text-sm opacity-70">km</div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold">{fmtTime(cards.movingTimeSec)}</div>
                  <div className="text-sm opacity-70">moving time</div>
                </div>
                <div>
               <div className="text-3xl font-extrabold">{cards.avgPace}</div>
                  <div className="text-sm opacity-70">avg pace</div>
                </div>
              </div>
              <div className="mt-4 text-sm opacity-75">
                {cards.name} • {new Date(cards.startDate).toLocaleString()}
              </div>
            </div>


            {/* Heart rate */}
            {(cards.hrAvg || cards.hrMax) && (
              <ScrollDropIn className="lg:col-span-2" delay={80}>
              <div className="p-8 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-xl shadow-xl card-hover">
                <div className="flex items-center gap-3 mb-2">
                  <HeartPulse className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Heart rate</h3>
                </div>
                <div className="flex items-center justify-center gap-6 flex-1">
                  {cards.hrAvg && (
                    <div className="text-2xl font-bold">{cards.hrAvg}<span className="text-sm opacity-70"> bpm avg</span></div>
                  )}
                  {cards.hrMax && (
                    <div className="text-2xl font-bold">{cards.hrMax}<span className="text-sm opacity-70"> max</span></div>
                  )}
                </div>
              </div>
              </ScrollDropIn>
            )}

            {/* Elevation */}
            {typeof cards.elevGain === "number" && (
              <ScrollDropIn className="lg:col-span-1" delay={120}>
              <div className="p-8 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-xl shadow-xl card-hover">
                <div className="flex items-center gap-3 mb-2"><Mountain className="h-5 w-5 text-primary" /><h3 className="font-semibold">Elevation</h3></div>
                <div className="flex justify-center">
                  <div className="text-2xl font-bold">{Math.round(cards.elevGain)} m</div>
                </div>
              </div>
              </ScrollDropIn>
            )}

            {/* Calories (approx from kJ if present) */}
            {typeof cards.kilojoules === "number" && (
              <ScrollDropIn className="lg:col-span-1" delay={160}>
              <div className="p-8 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-xl shadow-xl card-hover">
                <div className="flex items-center gap-3 mb-2"><Flame className="h-5 w-5 text-primary" /><h3 className="font-semibold">Energy</h3></div>
                <div className="text-2xl font-bold">{Math.round(cards.kilojoules)} kJ</div>
                <div className="text-xs opacity-70">≈ {(cards.kilojoules * 0.239).toFixed(0)} kcal</div>
              </div>
              </ScrollDropIn>
            )}

            {/* Max speed (if present) */}
            {typeof cards.maxSpeed === "number" && (
              <ScrollDropIn className="lg:col-span-1" delay={200}>
              <div className="p-8 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-xl shadow-xl card-hover">
                <div className="flex items-center gap-3 mb-2"><Gauge className="h-5 w-5 text-primary" /><h3 className="font-semibold">Max speed</h3></div>
                <div className="text-2xl font-bold">{cards.maxSpeed.toFixed(2)} m/s</div>
              </div>
              </ScrollDropIn>
            )}

            {/* Route placeholder if we have a polyline (render later) */}
            {cards.polyline && (
              <ScrollDropIn className="lg:col-span-6" delay={240}>
              <div className="p-8 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-xl shadow-xl card-hover">
                <div className="flex items-center gap-3 mb-3"><Map className="h-5 w-5 text-primary" /><h3 className="font-semibold">Route</h3></div>
                <div className="h-48 rounded-2xl border border-white/20 bg-gradient-to-br from-white/5 to-white/0 grid place-items-center text-sm opacity-80">
                  Polyline ready – map render coming next
                </div>
              </div>
              </ScrollDropIn>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

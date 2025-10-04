import { Trophy, Timer, Gauge } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ScrollDropIn } from "./ScrollDropIn";

// Helpers
const fmtTime = (sec = 0) => {
  if (!Number.isFinite(sec) || sec <= 0) return "–";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return [h ? String(h) : null, String(m).padStart(2, "0"), String(s).padStart(2, "0")] // hh:mm:ss or mm:ss
    .filter(Boolean)
    .join(":");
};
const fmtPace = (secPerKm) => {
  if (!Number.isFinite(secPerKm) || secPerKm <= 0) return "–";
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}:${String(s).padStart(2, "0")} /km`;
};

// PR distances we care about
const TARGETS = [
  { key: "d1k", label: "1 km", meters: 1000 },
  { key: "d5k", label: "5 km", meters: 5000 },
  { key: "d10k", label: "10 km", meters: 10000 },
  { key: "half", label: "Half Marathon", meters: 21097 },
  { key: "d30k", label: "30 km", meters: 30000 },
  { key: "mar", label: "Marathon", meters: 42195 },
];

// Compute normalized PRs using activity-average pace
// Rule: must have run at least the target distance in one activity to qualify.
function computePRs(activities) {
  const runs = (Array.isArray(activities) ? activities : []).filter(
    (a) => a && (a.type === "Run" || a.sport_type === "Run")
  );
  const results = {};
  for (const t of TARGETS) {
    results[t.key] = null;
  }
  for (const a of runs) {
    const dist = Number(a?.distance ?? 0); // meters
    const mov = Number(a?.moving_time ?? 0); // seconds
    if (!(dist > 0 && mov > 0)) continue;
    for (const t of TARGETS) {
      if (dist >= t.meters) {
        const normalized = (mov * t.meters) / dist; // time scaled to exact target
        const prev = results[t.key];
        if (!prev || normalized < prev.timeSec) {
          results[t.key] = {
            timeSec: normalized,
            paceSecPerKm: (mov / (dist / 1000)),
            activityName: a.name,
            startDate: a.start_date || a.start_date_local,
          };
        }
      }
    }
  }
  return results;
}

export const PersonalBestSection = () => {
  const [prs, setPrs] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/data/activities.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const acts = Array.isArray(json?.activities) ? json.activities : Array.isArray(json) ? json : [];
        const r = computePRs(acts);
        if (alive) setPrs(r);
      } catch (e) {
        if (alive) setError(e.message || "failed to load");
      }
    })();
    return () => { alive = false; };
  }, []);

  const cards = useMemo(() => {
    if (!prs) return null;
    return TARGETS.map((t, i) => {
      const rec = prs[t.key];
      return { ...t, rec };
    });
  }, [prs]);

  return (
    <section id="best" className="py-24 px-4 horizon-section horizon-section--personal">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-10 text-center">
          Personal <span className="text-primary">Records</span>
        </h2>

        {!prs && !error && (
          <div className="text-center opacity-80">Calculating your carnival of PRs…</div>
        )}
        {error && (
          <div className="text-center text-red-400">Erreur de chargement: {error}</div>
        )}

        {cards && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-7">
            {cards.map((c, idx) => (
              <ScrollDropIn key={c.key} delay={idx * 60}>
                <div
                  className={
                    `relative p-8 md:p-10 rounded-[28px] border overflow-hidden ` +
                    `${c.rec ? "bg-white/12 border-white/20 backdrop-blur-2xl" : "bg-white/6 border-white/10 backdrop-blur-xl opacity-75 saturate-[.85]"} ` +
                    `shadow-[0_10px_40px_rgba(0,0,0,0.25)] card-hover min-h-[240px]`
                  }
                >
                  {/* gradient removed for achieved items */}

                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <Trophy className="h-6 w-6 text-primary" />
                      <h3 className="text-lg md:text-xl font-semibold tracking-wide">{c.label}</h3>
                    </div>
                    {c.rec && (
                      <span className="text-[10px] md:text-xs px-2 py-1 rounded-full bg-primary/20 border border-white/30">
                        PB
                      </span>
                    )}
                  </div>

                  {!c.rec ? (
                    <div className="h-32 grid place-items-center rounded-2xl border border-dashed border-white/20 bg-white/5 grayscale-[.2]">
                      <div className="text-center">
                        <div className="text-xl font-semibold">No data yet</div>
                        <div className="text-xs opacity-70">Run at least {Math.round(c.meters/1000)} km</div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-5 items-center text-center">
                      <div className="col-span-3">
                        <div className="text-4xl md:text-5xl font-extrabold tabular-nums flex items-center justify-center gap-3">
                          <Timer className="h-6 w-6 opacity-80" /> {fmtTime(c.rec.timeSec)}
                        </div>
                        <div className="text-sm opacity-75 mt-2">Projected over {c.label.toLowerCase()}</div>
                      </div>
                      <div className="col-span-3 mt-3 flex items-center justify-center gap-2">
                        <Gauge className="h-4 w-4 opacity-80" />
                        <span className="text-base">{fmtPace(c.rec.paceSecPerKm)}</span>
                        <span className="text-xs opacity-60">avg pace</span>
                      </div>
                      <div className="col-span-3 mt-1 text-xs opacity-70">
                        {c.rec.activityName ? c.rec.activityName : "Run"} • {c.rec.startDate ? new Date(c.rec.startDate).toLocaleDateString() : "–"}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollDropIn>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

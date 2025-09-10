import { ArrowDown, Activity, Gauge, Flame } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

// Simple count-up hook for nice number animations
function useCountUp(targetValue, { duration = 800 } = {}) {
  const [value, setValue] = useState(0);
  const startRef = useRef(null);
  const fromRef = useRef(0);
  const targetRef = useRef(targetValue ?? 0);

  useEffect(() => {
    fromRef.current = value;
    targetRef.current = Number.isFinite(targetValue) ? targetValue : 0;
    startRef.current = null;

    let raf;
    const tick = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const p = Math.min(1, (ts - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      const next = fromRef.current + (targetRef.current - fromRef.current) * eased;
      setValue(next);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [targetValue, duration]);

  return value;
}

// Monday-based (ISO) week start in local time
function startOfISOWeekLocal(d) {
  const dt = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = dt.getDay(); // 0 Sun .. 6 Sat
  const diff = (day === 0 ? -6 : 1) - day; // move to Monday
  dt.setDate(dt.getDate() + diff);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function inRange(date, start, end) {
  return date >= start && date < end;
}

function computeWeeklyMetrics(activities, opts = {}) {
  if (!Array.isArray(activities)) return { kmThisWeek: 0, avgHrThisWeek: 0, loadPct: 0 };
  const now = opts.anchorDate ? new Date(opts.anchorDate) : new Date();
  const thisWeekStart = startOfISOWeekLocal(now);
  const nextWeekStart = addDays(thisWeekStart, 7);
  const prevWeekStart = addDays(thisWeekStart, -7);

  const isRun = (a) => a?.sport_type === "Run" || a?.type === "Run";
  const toLocalDate = (a) => {
    const raw = a?.start_date_local ?? a?.start_date;
    if (!raw) return new Date(NaN);
    if (typeof raw === "string" && a?.start_date_local && raw.endsWith("Z")) {
      // Treat start_date_local as true local by stripping trailing Z
      return new Date(raw.slice(0, -1));
    }
    return new Date(raw);
  };

  let distThis = 0, hrSumThis = 0, hrCountThis = 0;
  let distPrev = 0;

  for (const a of activities) {
    if (!isRun(a)) continue;
    const d = toLocalDate(a);
    const distKm = Number.isFinite(a?.distance_km)
      ? Number(a.distance_km)
      : (() => {
          const raw = Number(a?.distance ?? 0);
          return raw >= 500 ? raw / 1000 : raw; // meters → km, else assume already km
        })();
    if (inRange(d, thisWeekStart, nextWeekStart)) {
      distThis += distKm;
      if (a.has_heartrate && Number.isFinite(a.average_heartrate)) {
        hrSumThis += a.average_heartrate;
        hrCountThis += 1;
      }
    } else if (inRange(d, prevWeekStart, thisWeekStart)) {
      distPrev += distKm;
    }
  }

  const kmThisWeek = distThis;
  const avgHrThisWeek = hrCountThis ? hrSumThis / hrCountThis : 0;
  const loadPct = distPrev > 0 ? ((kmThisWeek - distPrev) / distPrev) * 100 : 0;
  return { kmThisWeek, avgHrThisWeek, loadPct };
}

export const HeroSection = () => {
  const [metrics, setMetrics] = useState({ kmThisWeek: 0, avgHrThisWeek: 0, loadPct: 0 });
  const [revealed, setRevealed] = useState(false);
  const kpiRef = useRef(null);

  useEffect(() => {
    // Load Strava-like data from /data/activities.json (place this file under your public folder)
    fetch("../data/activities.json")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => {
        const activities = Array.isArray(json) ? json : json?.activities ?? [];
        const anchorDate = Array.isArray(json) ? undefined : json?.exported_at;
        setMetrics(computeWeeklyMetrics(activities, { anchorDate }));
      })
      .catch((err) => {
        console.error("Failed to load activities.json", err);
      });
  }, []);

  useEffect(() => {
    const el = kpiRef.current;
    if (!el) return;

    let timeoutId;
    const onAnimEnd = () => setRevealed(true);

    // If element is in view, we'll also reveal after animation end or fallback timeout
    const io = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry && entry.isIntersecting) {
        // Fallback in case animationend doesn't fire (reduced motion, class removed, etc.)
        timeoutId = window.setTimeout(() => setRevealed(true), 1500);
      }
    }, { threshold: 0.2 });

    io.observe(el);
    el.addEventListener('animationend', onAnimEnd, { once: true });

    return () => {
      io.disconnect();
      el.removeEventListener('animationend', onAnimEnd);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const kmAnimated = useCountUp(revealed ? metrics.kmThisWeek : 0);
  const hrAnimated = useCountUp(revealed ? metrics.avgHrThisWeek : 0);
  const loadAnimated = useCountUp(revealed ? metrics.loadPct : 0);

  const kmText = useMemo(() => `${kmAnimated.toFixed(1)} km`, [kmAnimated]);
  const hrText = useMemo(() => `${Math.round(hrAnimated)} bpm`, [hrAnimated]);
  const loadText = useMemo(() => {
    const v = Math.round(loadAnimated);
    return `${v > 0 ? "+" : ""}${v}%`;
  }, [loadAnimated]);

  const handleFetchData = async () => {
    try {
      await fetch("/api/run-export", { method: "POST" });
    } catch (err) {
      console.error("Failed to trigger export", err);
    } finally {
      window.location.reload();
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      {/* soft gradient background */}


      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            <span className="block opacity-0 animate-fade-in">Welcome to</span>
            <span className="block mt-2 opacity-0 animate-fade-in-delay-1">your
              <span className="mx-2 font-black" style={{ color: "#E97451" }}>Strava Dashboard</span>
            </span>
          </h1>

          <p className="mt-6 text-base md:text-lg text-muted-foreground opacity-0 animate-fade-in-delay-2">
            One place for your weekly mileage, effort and recovery. Explore trends, surface insights, and turn training data into actions.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 opacity-0 animate-fade-in-delay-3">

            <button onClick={handleFetchData} className="cosmic-button">
              Fetch your data !
            </button>
          </div>
        </div>

        {/* KPI strip */}
        <div ref={kpiRef} className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto opacity-0 animate-fade-in-delay-4">
          <div className="rounded-xl border bg-card border-border p-5 flex items-center justify-between card-hover">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">This week</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{kmText}</p>
            </div>
            <Activity className="h-6 w-6" style={{ color: "hsl(var(--primary))" }} />
          </div>
          <div className="rounded-xl border bg-card border-border p-5 flex items-center justify-between card-hover">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Avg HR</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{hrText}</p>
            </div>
            <Gauge className="h-6 w-6" style={{ color: "hsl(var(--primary))" }} />
          </div>
          <div className="rounded-xl border bg-card border-border p-5 flex items-center justify-between card-hover">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Load</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{loadText}</p>
            </div>
            <Flame className="h-6 w-6" style={{ color: "hsl(var(--primary))" }} />
          </div>
        </div>
      </div>

    </section>
  );
};
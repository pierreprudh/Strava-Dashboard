const isRunActivity = (activity) => {
  if (!activity) return false;
  const type = activity.sport_type || activity.type;
  return type === "Run";
};

const toLocalDate = (activity) => {
  const raw = activity?.start_date_local ?? activity?.start_date;
  if (!raw) return new Date(NaN);
  if (typeof raw === "string" && activity?.start_date_local && raw.endsWith("Z")) {
    // Treat start_date_local as local time by stripping trailing Z
    return new Date(raw.slice(0, -1));
  }
  return new Date(raw);
};

const startOfISOWeekLocal = (date) => {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = copy.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const inRange = (date, start, end) => date >= start && date < end;

const toDistanceKm = (activity) => {
  if (Number.isFinite(activity?.distance_km)) {
    return Number(activity.distance_km);
  }
  const raw = Number(activity?.distance ?? 0);
  return raw >= 500 ? raw / 1000 : raw;
};

export const computeWeeklyMetrics = (activities, { anchorDate } = {}) => {
  if (!Array.isArray(activities)) {
    return { kmThisWeek: 0, avgHrThisWeek: 0, loadPct: 0, activityCount: 0, activityCountAllTime: 0 };
  }

  const now = anchorDate ? new Date(anchorDate) : new Date();
  const thisWeekStart = startOfISOWeekLocal(now);
  const nextWeekStart = addDays(thisWeekStart, 7);
  const prevWeekStart = addDays(thisWeekStart, -7);

  let distThis = 0;
  let distPrev = 0;
  let hrSumThis = 0;
  let hrCountThis = 0;
  let activityCount = 0;

  for (const activity of activities) {
    if (!isRunActivity(activity)) continue;
    const when = toLocalDate(activity);
    const distKm = toDistanceKm(activity);

    if (inRange(when, thisWeekStart, nextWeekStart)) {
      distThis += distKm;
      activityCount += 1;
      if (activity.has_heartrate && Number.isFinite(activity.average_heartrate)) {
        hrSumThis += activity.average_heartrate;
        hrCountThis += 1;
      }
    } else if (inRange(when, prevWeekStart, thisWeekStart)) {
      distPrev += distKm;
    }
  }

  const kmThisWeek = distThis;
  const avgHrThisWeek = hrCountThis ? hrSumThis / hrCountThis : 0;
  const loadPct = distPrev > 0 ? ((kmThisWeek - distPrev) / distPrev) * 100 : 0;
  return {
    kmThisWeek,
    avgHrThisWeek,
    loadPct,
    activityCount,
    activityCountAllTime: activities.filter(isRunActivity).length,
  };
};

export const getLastRun = (activities) => {
  if (!Array.isArray(activities)) return null;
  const runs = activities
    .filter(isRunActivity)
    .map((activity) => ({ ...activity, __date: toLocalDate(activity) }))
    .filter((activity) => !Number.isNaN(activity.__date));
  runs.sort((a, b) => b.__date - a.__date);
  return runs[0] ?? null;
};

export const getFastestRunByPace = (activities, { minDistanceKm = 5 } = {}) => {
  if (!Array.isArray(activities)) return null;
  let best = null;

  for (const activity of activities) {
    if (!isRunActivity(activity)) continue;
    const distKm = toDistanceKm(activity);
    const movingSec = Number(activity?.moving_time ?? 0);
    if (!(distKm >= minDistanceKm && movingSec > 0)) continue;

    const paceSecPerKm = movingSec / distKm;
    if (!best || paceSecPerKm < best.paceSecPerKm) {
      best = {
        activity,
        paceSecPerKm,
        distanceKm: distKm,
        movingTimeSec: movingSec,
        when: toLocalDate(activity),
      };
    }
  }

  return best;
};

export const formatDuration = (seconds = 0) => {
  if (!Number.isFinite(seconds) || seconds <= 0) return "–";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts = [];
  if (h) parts.push(String(h));
  parts.push(String(m).padStart(2, "0"));
  parts.push(String(s).padStart(2, "0"));
  return parts.join(":");
};

export const formatPace = (secPerKm = 0) => {
  if (!Number.isFinite(secPerKm) || secPerKm <= 0) return "–";
  const minutes = Math.floor(secPerKm / 60);
  const seconds = Math.round(secPerKm % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")} /km`;
};

export const safeDistanceKm = toDistanceKm;

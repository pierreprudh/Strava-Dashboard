import json
import pandas as pd
import streamlit as st
import plotly.express as px
from pathlib import Path

import calendar
import pytz

import sys, subprocess

MONTHS_EN = {i: calendar.month_name[i] for i in range(1, 13)}

# Timezone → Country auto from pytz database
TZ_TO_COUNTRY = {}
for country_code, tz_list in pytz.country_timezones.items():
    for tz in tz_list:
        TZ_TO_COUNTRY[tz] = pytz.country_names.get(country_code, country_code)

st.set_page_config(page_title="Strava Dashboard", layout="wide")

st.title("📊 Strava Dashboard")
st.caption("🏃Showing your Strava statistics")

# Light CSS polish
st.markdown(
    """
    <style>
      /* tighten top padding */
      .block-container {padding-top: 1.2rem;}
      /* nicer dataframe fonts */
      .stDataFrame {font-size: 0.95rem}
      /* hide default Streamlit menu/footer for a cleaner look */
      #MainMenu {visibility: hidden;} footer {visibility: hidden;}
    </style>
    """,
    unsafe_allow_html=True,
)

# Plotly theme
px.defaults.template = "plotly_white"

# ---- Load ----
path = Path("data/activities.json")
if not path.exists():
    st.warning(
        "Data file not found at 'data/activities.json'.\n\n"
        "Export your Strava data first, for example:\n"
        "`python export_data.py --out data/activities.json --per-page 200`"
    )
    st.stop()

try:
    raw = path.read_text(encoding="utf-8")
    payload = json.loads(raw)
except Exception as e:
    st.error(f"Failed to read or parse '{path}': {e}")
    st.stop()

if isinstance(payload, dict) and "activities" in payload:
    acts = payload["activities"]
elif isinstance(payload, list):
    acts = payload
else:
    st.error("Invalid JSON format. Expected a list or an object with an 'activities' key.")
    st.stop()

df = pd.json_normalize(acts)
if df.empty:
    st.info(
        "No activities found in the dataset.\n\n"
        "Try exporting with a wider date range:\n"
        "`python export_data.py --out data/activities.json --after 2024-01-01`"
    )
    st.stop()
if "start_date_local" not in df.columns:
    st.error("Missing 'start_date_local' in data. Make sure you exported Strava activities JSON, not CSV.")
    st.stop()

# ---- Normalize ----
df["start_dt"] = pd.to_datetime(df["start_date_local"], utc=True, errors="coerce").dt.tz_convert("Europe/Paris")
df["date"] = df["start_dt"].dt.date
df["week"] = df["start_dt"].dt.isocalendar().week
df["year"] = df["start_dt"].dt.isocalendar().year
df["distance_km"] = df["distance"] / 1000.0
df["moving_time_h"] = df["moving_time"] / 3600.0
df["sport"] = df.get("sport_type", pd.Series(["Run"]*len(df)))
df["month"] = df["start_dt"].dt.month
# Label English month name (used only for display if needed)
df["month_en"] = df["month"].map(MONTHS_EN)


def _extract_tz_name(val):
    if pd.isna(val):
        return None
    s = str(val)
    # Handle formats like "(GMT+01:00) Europe/Prague" or just "Europe/Paris"
    if ") " in s:
        s = s.split(") ", 1)[1]
    return s.strip()

if "timezone" in df.columns:
    df["tz_name"] = df["timezone"].apply(_extract_tz_name)
    df["country_from_tz"] = df["tz_name"].map(TZ_TO_COUNTRY)
    # Backfill location_country if missing
    if "location_country" not in df.columns:
        df["location_country"] = df["country_from_tz"]
    else:
        df["location_country"] = df["location_country"].fillna(df["country_from_tz"])
else:
    df["tz_name"] = None
    df["country_from_tz"] = None

# ---- Sidebar ----

st.sidebar.title("Personal filters", )
## ---- Filters ----
years = sorted(df["year"].unique())
year = st.sidebar.selectbox("Year", years, index=len(years)-1)

# months available for the selected year, ordered 1..12 but filtered to present data
months_available = sorted(df.loc[df["year"] == year, "month"].unique().tolist())
month_options = [f"{m:02d} - {MONTHS_EN[m]}" for m in months_available]
selected_label = st.sidebar.selectbox("Month", month_options, index=len(month_options)-1)
month = int(selected_label.split(" - ")[0])

sports = sorted(df["sport"].dropna().unique())
sport = st.sidebar.multiselect("Sport", sports, default=sports)

# apply filters
dff = df[(df["year"] == year) & (df["month"] == month) & (df["sport"].isin(sport))].copy()

with st.sidebar:
    st.divider()
    st.caption("Data")
    if st.button("Refresh data from Strava"):
        repo_dir = Path(__file__).resolve().parent
        cmd = [sys.executable, "export_data.py", "--out", "data/activities.json", "--per-page", "200"]

        with st.spinner("Exporting activities…"):
            try:
                result = subprocess.run(
                    cmd,
                    cwd=repo_dir,              # run from project root
                    capture_output=True,
                    text=True,
                    check=False
                )
            except Exception as e:
                st.error(f"Failed to run export: {e}")
            else:
                if result.returncode == 0:
                    st.success("Export complete ✓")
                    if result.stdout:
                        st.code(result.stdout[-2000:])  # show tail of logs
                    st.rerun()  # reload with fresh data
                else:
                    st.error(f"Export failed (code {result.returncode})")
                    if result.stderr or result.stdout:
                        st.code((result.stderr or result.stdout)[-2000:])

# ---- KPIs ----
col1, col2, col3, col4 = st.columns(4)
col1.metric("Activities", int(dff.shape[0]))
col2.metric("Distance (km)", f"{dff['distance_km'].sum():.1f}")
col3.metric("Time (h)", f"{dff['moving_time_h'].sum():.1f}")
col4.metric("Elevation Gain (m)", f"{dff['total_elevation_gain'].sum():.0f}")

# ---- Latest activity deep dive ----
st.subheader("Latest Activity")

if dff.empty:
    st.info("No activities match the current filters.")
else:
    last = dff.sort_values("start_dt", ascending=False).iloc[0]

    def secs_to_hms(x):
        try:
            x = int(x)
            h = x // 3600
            m = (x % 3600) // 60
            s = x % 60
            return f"{h:d}:{m:02d}:{s:02d}"
        except Exception:
            return "-"

    distance_km = float(last.get("distance_km", 0.0))
    moving_time_s = int(last.get("moving_time", 0))
    elapsed_time_s = int(last.get("elapsed_time", moving_time_s))
    elev_gain = float(last.get("total_elevation_gain", 0.0))
    avg_hr = last.get("average_heartrate", None)
    max_hr = last.get("max_heartrate", None)
    avg_speed = last.get("average_speed", None)  # m/s
    max_speed = last.get("max_speed", None)      # m/s
    sport_name = str(last.get("sport", last.get("sport_type", "Unknown")))
    name = str(last.get("name", "Untitled"))
    start_time = last.get("start_dt")
    act_id = last.get("id", None)

    # Derived metrics
    pace_min_km = None
    speed_kmh = None
    try:
        dist_ok = distance_km is not None and float(distance_km) > 0
    except Exception:
        dist_ok = False
    if dist_ok:
        # average_speed is in m/s in Strava export
        try:
            if avg_speed is not None and float(avg_speed) > 0:
                speed_kmh = float(avg_speed) * 3.6
        except Exception:
            speed_kmh = None
        try:
            if moving_time_s is not None and int(moving_time_s) > 0:
                pace_min_km = (int(moving_time_s) / float(distance_km)) / 60.0
        except Exception:
            pace_min_km = None

    # Header with country (from location_country or timezone inference)
    country_label = last.get("location_country") or last.get("country_from_tz")
    try:
        start_str = start_time.strftime('%Y-%m-%d %H:%M') if hasattr(start_time, 'strftime') else str(start_time)
    except Exception:
        start_str = str(start_time)
    subtitle = f"{start_str}"
    if country_label:
        subtitle = f"{start_str} — {country_label}"
    st.markdown(f"**{name}** — {sport_name}  \n{subtitle}")

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Distance (km)", f"{distance_km:.2f}")
    c2.metric("Moving time", secs_to_hms(moving_time_s))
    if sport_name.lower().startswith("run"):
        c3.metric("Avg pace (min/km)", f"{pace_min_km:.2f}" if pace_min_km else "-")
    else:
        c3.metric("Avg speed (km/h)", f"{speed_kmh:.1f}" if speed_kmh else "-")
    c4.metric("Elevation Gain (m)", f"{elev_gain:.0f}")

    c5, c6, c7, c8 = st.columns(4)
    if avg_hr is not None:
        c5.metric("Avg HR", f"{avg_hr:.0f} bpm")
    if max_hr is not None:
        c6.metric("Max HR", f"{max_hr:.0f} bpm")
    if max_speed is not None:
        c7.metric("Max speed (km/h)", f"{max_speed * 3.6:.1f}")
    c8.metric("Elapsed time", secs_to_hms(elapsed_time_s))

    if act_id is not None:
        st.markdown(f"[Open on Strava](https://www.strava.com/activities/{act_id})")

# ---- Weekly totals ----
dff["week_start"] = dff["start_dt"].dt.to_period("W-MON").apply(lambda r: r.start_time.date())
wk = dff.groupby(["year","week","week_start"], as_index=False).agg(
    distance_km=("distance_km","sum"),
    moving_time_h=("moving_time_h","sum"),
    elev_m=("total_elevation_gain","sum"),
)
st.subheader("Weekly Volume")
fig_wk = px.bar(
    wk, x="week_start", y="distance_km",
    title=f"Distance per week — {year}",
    labels={"week_start": "Week start (Mon)", "distance_km": "Distance (km)"},
    color_discrete_sequence=["#E97451"],
)
fig_wk.update_layout(margin=dict(l=20, r=20, t=60, b=20))
st.plotly_chart(fig_wk, width='stretch')

# ---- Daily line ----
daily = dff.groupby("date", as_index=False).agg(distance_km=("distance_km","sum"))
st.subheader("Daily Distance")
fig_daily = px.line(
    daily, x="date", y="distance_km", markers=True,
    labels={"date": "Date", "distance_km": "Distance (km)"},
    color_discrete_sequence=["#E97451"],
)
fig_daily.update_layout(margin=dict(l=20, r=20, t=20, b=20))
st.plotly_chart(fig_daily, width='stretch')

# ---- Distance distribution ----
# ---- Distance distribution ----
st.subheader("Activities by Distance")

if not dff.empty:
    # Binning au pas de 0.2 km sans modifier dff
    distance_bins = (dff["distance_km"] / 0.2).round() * 0.2

    dist_counts = (
        distance_bins.value_counts()
        .rename_axis("distance_bin")
        .reset_index(name="count")
        .sort_values("distance_bin")
    )

    fig_dist = px.bar(
        dist_counts,
        x="distance_bin",
        y="count",
        labels={"distance_bin": "Distance (km)", "count": "Number of activities"},
        color_discrete_sequence=["#E97451"],
    )
    fig_dist.update_layout(margin=dict(l=20, r=20, t=40, b=20))
    st.plotly_chart(fig_dist, width='stretch')
else:
    st.info("No activities to display for distance distribution.")


# ---- Table ----
st.subheader("Activities")
styled = (
    dff[[
        "start_dt", "name", "sport", "distance_km", "moving_time_h",
        "total_elevation_gain", "average_heartrate", "kudos_count"
    ]]
    .sort_values("start_dt", ascending=False)
    .rename(columns={
        "start_dt": "Date",
        "name": "Activity",
        "sport": "Sport",
        "distance_km": "Distance (km)",
        "moving_time_h": "Time (h)",
        "total_elevation_gain": "Elevation Gain (m)",
        "average_heartrate": "Avg HR",
        "kudos_count": "Kudos",
    })
)
st.dataframe(
    styled.style.format({"Distance (km)": "{:.2f}", "Time (h)": "{:.2f}", "Elevation Gain (m)": "{:.0f}"}),
    width='stretch',
)

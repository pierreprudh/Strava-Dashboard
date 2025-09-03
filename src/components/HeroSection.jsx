import { ArrowDown, Activity, Gauge, Flame } from "lucide-react";

export const HeroSection = () => {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      {/* soft gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-72 w-72 rounded-full blur-3xl opacity-30" style={{ background: "radial-gradient(40% 40% at 50% 50%, #E97451 0%, transparent 70%)" }} />
        <div className="absolute top-10 right-0 h-80 w-80 rounded-full blur-3xl opacity-20" style={{ background: "radial-gradient(40% 40% at 50% 50%, #6EE7B7 0%, transparent 70%)" }} />
      </div>

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
            <a
              href="#insights"
              className="inline-flex items-center justify-center rounded-md px-5 py-3 text-sm font-semibold shadow-sm border transition-colors bg-card text-foreground border-border card-hover"
            >
              View insights
            </a>
            <a
              href="#connect"
              className="cosmic-button"
            >
              Connect Strava
            </a>
          </div>
        </div>

        {/* KPI strip */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto opacity-0 animate-fade-in-delay-4">
          <div className="rounded-xl border bg-card border-border p-5 flex items-center justify-between card-hover">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">This week</p>
              <p className="mt-1 text-2xl font-bold">72.4 km</p>
            </div>
            <Activity className="h-6 w-6" />
          </div>
          <div className="rounded-xl border bg-card border-border p-5 flex items-center justify-between card-hover">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Avg HR</p>
              <p className="mt-1 text-2xl font-bold">148 bpm</p>
            </div>
            <Gauge className="h-6 w-6" />
          </div>
          <div className="rounded-xl border bg-card border-border p-5 flex items-center justify-between card-hover">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Load</p>
              <p className="mt-1 text-2xl font-bold">+12%</p>
            </div>
            <Flame className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce">
        <span className="text-xs text-muted-foreground mb-2">Scroll</span>
        <ArrowDown className="h-5 w-5" style={{ color: "#E97451" }} />
      </div>
    </section>
  );
};
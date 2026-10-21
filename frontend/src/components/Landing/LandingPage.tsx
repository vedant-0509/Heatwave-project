import React, { useState } from 'react';
import { useRouter } from '../../router/RouterContext';
import { MumbaiHeatVisual } from './MumbaiHeatVisual';
import { DemoBadge } from '../Common/DemoBadge';
import { ScienceModal } from '../Educational/ScienceModal';
import { 
  Flame, 
  ArrowRight, 
  Thermometer, 
  Satellite, 
  MapPin, 
  BookOpen, 
  Sparkles, 
  Info, 
  ShieldAlert, 
  Globe, 
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { navigate } = useRouter();
  const [isScienceOpen, setIsScienceOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-rose-500 selection:text-white overflow-x-hidden relative">
      
      {/* Dynamic Background Lighting Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-amber-500/5 rounded-full blur-[160px]" />
        <div className="absolute bottom-10 left-1/3 w-[600px] h-[600px] bg-sky-500/5 rounded-full blur-[180px]" />
      </div>

      {/* Top Glass Header Navigation */}
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/10 px-4 md:px-8 py-3.5 flex items-center justify-between backdrop-blur-xl">
        {/* Brand Logo */}
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 via-rose-500 to-red-600 flex items-center justify-center shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform shrink-0">
            <Flame className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-100 tracking-tight leading-none">
                Urban<span className="text-rose-500">Heat</span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full uppercase">
                Mumbai
              </span>
              <DemoBadge size="sm" label="DEMO LAYERS" />
            </div>
          </div>
        </div>

        {/* Minimal Navigation Bar Items */}
        <nav className="flex items-center gap-2 sm:gap-6 text-xs font-medium text-slate-300">
          <button 
            onClick={() => scrollToSection('how-it-works')}
            className="hover:text-white transition-colors cursor-pointer px-2 py-1"
          >
            About
          </button>
          
          <button 
            onClick={() => setIsScienceOpen(true)}
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1 px-2 py-1 text-sky-300 hover:text-sky-200"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Methodology</span>
          </button>

          <button
            onClick={() => navigate('/explore')}
            className="bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-semibold px-4 py-2 rounded-lg shadow-md shadow-rose-500/20 transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Explore</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </nav>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 z-10">
        <section className="relative px-4 md:px-8 py-12 md:py-20 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          
          {/* Left Column: Headline, Brand & CTA */}
          <div className="flex-1 space-y-6 text-left">
            
            {/* Platform Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono font-medium backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>URBAN HEAT INTELLIGENCE PLATFORM</span>
            </div>

            {/* Subtitle & Brand Tagline */}
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-widest font-mono text-sky-400 font-semibold">
                Urban Heat Intelligence for Mumbai
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-100 tracking-tight leading-[1.1]">
                See how your <br />
                <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-red-500 bg-clip-text text-transparent">
                  city heats up.
                </span>
              </h1>
            </div>

            {/* Supporting Text */}
            <p className="text-sm md:text-base text-slate-300 max-w-xl leading-relaxed font-normal">
              UrbanHeat combines Open-Meteo weather-model data with ward-level demonstration indicators to explore heat-risk patterns across Greater Mumbai. The environmental demo values are not verified satellite observations.
            </p>

            {/* Prototype Data Disclosure Callout */}
            <div className="glass-card p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 max-w-xl text-xs text-amber-200/90 leading-relaxed flex items-start gap-3">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-300 block mb-0.5">Scientific Prototype & Demo Data Status</span>
                Surface-temperature, NDVI and NDBI fields are bundled demonstration data or unvalidated estimates; a satellite-processing pipeline is not implemented. Open-Meteo weather-model data are shown only when the provider request succeeds.
              </div>
            </div>

            {/* Primary Action Button CTA */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={() => navigate('/explore')}
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold text-sm sm:text-base shadow-xl shadow-rose-600/30 hover:shadow-rose-500/40 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>LET'S EXPLORE</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setIsScienceOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-sky-400" />
                <span>Explore the Science</span>
              </button>
            </div>

            {/* Telemetry Feature Badges */}
            <div className="pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>24 Wards Cataloged</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Open-Meteo Weather</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>MapLibre GL Engine</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>HVI Vulnerability</span>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Visual Graphic */}
          <div className="flex-1 w-full max-w-lg lg:max-w-none">
            <MumbaiHeatVisual />
          </div>

        </section>

        {/* Section 7: "How UrbanHeat works" Explanation Section */}
        <section id="how-it-works" className="relative px-4 md:px-8 py-16 md:py-24 max-w-7xl mx-auto border-t border-slate-800/80">
          
          {/* Section Title Header */}
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs font-mono">
              <Info className="w-3.5 h-3.5 text-sky-400" />
              <span>PLATFORM ARCHITECTURE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
              How UrbanHeat works
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Three connected components combine provider-backed atmospheric weather when available, bundled environmental demo indicators, and ward-level risk visualization.
            </p>
          </div>

          {/* Three Concise Component Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            
            {/* Card 1: Atmospheric Conditions */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all group flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <Thermometer className="w-6 h-6" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-100">1. Atmospheric Conditions</h3>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      API WHEN AVAILABLE
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Current atmospheric weather such as air temperature, apparent temperature, humidity and wind.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between font-mono">
                <span>Source: Open-Meteo</span>
                <span className="text-amber-400 font-semibold">Weather model data</span>
              </div>
            </div>

            {/* Card 2: Earth Observation */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-sky-500/40 transition-all group flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                  <Satellite className="w-6 h-6" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-100">2. Earth Observation</h3>
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                      PROTOTYPE DATA
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Demonstration surface-temperature, NDVI and NDBI indicators; verified satellite products are not yet processed.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between font-mono">
                <span>Indices: LST • NDVI • NDBI</span>
                <span className="text-amber-400">Demo Dataset</span>
              </div>
            </div>

            {/* Card 3: Spatial Intelligence */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-rose-500/40 transition-all group flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-100">3. Spatial Intelligence</h3>
                    <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                      24 MCGM WARDS
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Ward-level visualization and heat-risk analysis across Greater Mumbai.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between font-mono">
                <span>Metrics: HVI Score</span>
                <span className="text-rose-400 font-semibold">Risk Classification</span>
              </div>
            </div>

          </div>

          {/* Compact Methodology / Science Banner */}
          <div className="mt-12 glass-panel p-6 rounded-2xl border border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100">Interested in the underlying heat vulnerability formulas?</h4>
                <p className="text-xs text-slate-400">Review normalized indicators, spectral index equations, and disaggregation methodology.</p>
              </div>
            </div>
            <button
              onClick={() => setIsScienceOpen(true)}
              className="px-4 py-2 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 hover:text-white rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Read Science Documentation</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </section>

        {/* CTA Banner Section */}
        <section className="relative px-4 md:px-8 py-12 max-w-5xl mx-auto text-center">
          <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-rose-500/20 bg-gradient-to-b from-rose-500/5 via-slate-900/80 to-slate-950 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-12 -left-12 w-40 h-40 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              Ready to explore Greater Mumbai's microclimate data?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              Interact with ward heat vulnerability indices, spatial layer filters, and live weather conditions in the vector map interface.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate('/explore')}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold text-sm sm:text-base shadow-xl shadow-rose-600/30 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>LET'S EXPLORE →</span>
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* Minimal Footer */}
      <footer className="z-10 w-full border-t border-slate-800/80 glass-panel py-6 px-4 md:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-500" />
            <span className="font-semibold text-slate-300">UrbanHeat Mumbai</span>
            <span className="text-[10px] text-slate-400 font-mono">| Phase 2.5 Active</span>
          </div>

          <div className="text-[11px] text-slate-400 text-center sm:text-right">
            Atmospheric: <strong className="text-slate-300">Open-Meteo API</strong> • Spatial: <strong className="text-slate-300">MCGM Wards</strong> • Satellite: <strong className="text-amber-400">Demo Prototype</strong>
          </div>
        </div>
      </footer>

      {/* Science Educational Modal */}
      <ScienceModal
        isOpen={isScienceOpen}
        onClose={() => setIsScienceOpen(false)}
      />

    </div>
  );
};

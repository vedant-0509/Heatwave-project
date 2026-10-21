import React from 'react';
import { Flame, ShieldAlert, Radio, Layers, Activity } from 'lucide-react';

export const MumbaiHeatVisual: React.FC = () => {
  return (
    <div className="relative w-full aspect-[4/3] max-w-2xl mx-auto flex items-center justify-center p-2 sm:p-4 select-none">
      {/* Outer Glow Container */}
      <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/10 via-amber-500/5 to-transparent rounded-3xl blur-2xl pointer-events-none" />

      {/* Main Glass Framework Card */}
      <div className="relative w-full h-full glass-panel rounded-2xl border border-slate-700/60 overflow-hidden shadow-2xl flex flex-col justify-between p-4 sm:p-6">
        
        {/* Top Geospatial Status Header */}
        <div className="flex items-center justify-between z-10 text-[11px] font-mono text-slate-400 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span className="text-slate-300 font-semibold tracking-wider uppercase">GEOSPATIAL THERMAL MODEL</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800 text-slate-400">
              19.0760° N, 72.8777° E
            </span>
            <span className="text-amber-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              DEMO DATA
            </span>
          </div>
        </div>

        {/* SVG Mumbai Map Visual Container */}
        <div className="relative flex-1 w-full my-2 flex items-center justify-center overflow-hidden">
          
          {/* Spatial Grid Overlay Background */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '24px 24px'
            }}
          />

          {/* Abstract SVG Graphic of Greater Mumbai Peninsula & Heat Nodes */}
          <svg 
            viewBox="0 0 500 600" 
            className="w-full h-full max-h-[380px] drop-shadow-[0_0_25px_rgba(244,63,94,0.15)]"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Radial Thermal Gradients */}
              <radialGradient id="heat-extreme" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#fb923c" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="heat-high" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fb923c" stopOpacity="0.8" />
                <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="cool-zone" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.7" />
                <stop offset="70%" stopColor="#0284c7" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
              </radialGradient>

              <linearGradient id="mumbai-land-fill" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
              </linearGradient>

              <linearGradient id="radar-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Ocean / Bay Context Lines */}
            <path 
              d="M 40,50 Q 80,150 110,280 T 150,480 T 190,580" 
              fill="none" 
              stroke="#0ea5e9" 
              strokeWidth="1" 
              strokeDasharray="4 4" 
              opacity="0.3" 
            />
            <text x="50" y="320" fill="#38bdf8" fontSize="10" fontFamily="monospace" opacity="0.4">
              Arabian Sea
            </text>
            <text x="370" y="240" fill="#38bdf8" fontSize="10" fontFamily="monospace" opacity="0.4">
              Thane Creek
            </text>

            {/* Stylized Mumbai Peninsula Coastline Mesh */}
            <g stroke="#334155" strokeWidth="1.5" fill="url(#mumbai-land-fill)">
              {/* South Mumbai (Colaba to Dadar) */}
              <path d="M 180,560 C 170,520 175,470 190,430 C 205,390 220,380 235,380 C 250,380 260,420 255,470 C 245,520 210,570 180,560 Z" className="transition-all hover:stroke-rose-500/80 cursor-pointer" />
              
              {/* Central Mumbai & Bandra (Ward G/N, H/W, L) */}
              <path d="M 190,430 C 185,380 200,340 225,310 C 260,310 290,340 280,380 C 265,410 235,420 190,430 Z" className="transition-all hover:stroke-rose-500/80 cursor-pointer" />
              
              {/* Western Suburbs (Andheri, Malad, Borivali) */}
              <path d="M 225,310 C 215,250 210,180 235,100 C 275,100 295,160 285,250 C 275,290 250,310 225,310 Z" className="transition-all hover:stroke-rose-500/80 cursor-pointer" />

              {/* Eastern Suburbs (Ghatkopar, Bhandup, Mulund, Powai) */}
              <path d="M 280,380 C 290,340 285,250 295,160 C 345,150 365,220 355,300 C 345,350 320,380 280,380 Z" className="transition-all hover:stroke-rose-500/80 cursor-pointer" />
            </g>

            {/* Inner Ward Subdivision Grid Lines */}
            <path d="M 215,500 L 240,490 M 205,450 L 250,440 M 200,390 L 270,380 M 235,340 L 330,340 M 240,280 L 335,280 M 245,210 L 340,200 M 250,150 L 330,150" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

            {/* Thermal Hotspots (Glowing Radial Elements) */}

            {/* Dharavi / Dadar High Heat Island (Ward G/N) */}
            <circle cx="230" cy="400" r="45" fill="url(#heat-extreme)" className="animate-heat-pulse" />
            <circle cx="230" cy="400" r="5" fill="#f43f5e" />

            {/* Kurla Industrial Thermal Cluster (Ward L) */}
            <circle cx="270" cy="360" r="38" fill="url(#heat-extreme)" className="animate-heat-pulse" style={{ animationDelay: '1s' }} />
            <circle cx="270" cy="360" r="4" fill="#f43f5e" />

            {/* Andheri East Heat Hotspot (Ward K/E) */}
            <circle cx="260" cy="270" r="32" fill="url(#heat-high)" className="animate-heat-pulse" style={{ animationDelay: '0.5s' }} />
            <circle cx="260" cy="270" r="4" fill="#fb923c" />

            {/* Malad / Goregaon Urban Corridor (Ward P/S) */}
            <circle cx="250" cy="190" r="28" fill="url(#heat-high)" className="animate-heat-pulse" style={{ animationDelay: '1.8s' }} />
            <circle cx="250" cy="190" r="3.5" fill="#fb923c" />

            {/* South Mumbai Urban Node (Ward A/B) */}
            <circle cx="205" cy="510" r="26" fill="url(#heat-high)" className="animate-heat-pulse" style={{ animationDelay: '2.2s' }} />
            <circle cx="205" cy="510" r="3" fill="#fb923c" />

            {/* Powai / Sanjay Gandhi Park Cool Thermal Sink (Ward S) */}
            <circle cx="310" cy="220" r="35" fill="url(#cool-zone)" />
            <circle cx="310" cy="220" r="4" fill="#38bdf8" />

            {/* Observatory Radar Radar Sweep Ring */}
            <g transform="translate(250, 310)">
              <circle r="90" fill="none" stroke="#f43f5e" strokeWidth="0.75" strokeDasharray="4 4" opacity="0.3" />
              <circle r="160" fill="none" stroke="#38bdf8" strokeWidth="0.5" opacity="0.2" />
            </g>

            {/* Floating Atmospheric Heat Particles */}
            <circle cx="220" cy="390" r="2" fill="#fda4af" className="animate-particle-1" />
            <circle cx="280" cy="350" r="2.5" fill="#fde047" className="animate-particle-2" />
            <circle cx="255" cy="265" r="2" fill="#fda4af" className="animate-particle-3" />
            <circle cx="200" cy="490" r="1.8" fill="#fde047" className="animate-particle-1" />

            {/* Coordinate Marker Labels */}
            <g fill="#94a3b8" fontSize="9" fontFamily="monospace">
              <text x="360" y="160">19.22° N</text>
              <text x="360" y="270">19.12° N</text>
              <text x="360" y="380">19.02° N</text>
              <text x="360" y="490">18.92° N</text>
            </g>
          </svg>

          {/* Floating High-Tech Telemetry Chips */}

          {/* Top Left: Ward G/North Heat Island Chip */}
          <div className="absolute top-3 left-3 glass-card px-3 py-1.5 rounded-lg border border-rose-500/30 flex items-center gap-2 shadow-lg backdrop-blur-md">
            <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <div>
              <div className="text-[10px] text-slate-400 font-mono">HIGH RISK NODE</div>
              <div className="text-xs font-bold text-rose-300">Dharavi (Ward G/N) • 39.8°C LST</div>
            </div>
          </div>

          {/* Bottom Right: Powai Canopy Sink Chip */}
          <div className="absolute bottom-4 right-3 glass-card px-3 py-1.5 rounded-lg border border-sky-500/30 flex items-center gap-2 shadow-lg backdrop-blur-md">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <div>
              <div className="text-[10px] text-slate-400 font-mono">COOL SINK</div>
              <div className="text-xs font-bold text-sky-300">Powai (Ward S) • High Vegetation</div>
            </div>
          </div>

          {/* Central Left Indicator */}
          <div className="absolute top-1/2 -translate-y-1/2 left-3 hidden sm:flex items-center gap-2 glass-card px-2.5 py-1 rounded border border-slate-700 text-[10px] font-mono text-slate-300">
            <Activity className="w-3 h-3 text-amber-400" />
            <span>24 WARDS LOADED</span>
          </div>

        </div>

        {/* Bottom Legend & Metadata Row */}
        <div className="z-10 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-medium">Thermal Gradient:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              <span className="text-[10px] text-slate-300">Cool</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-[10px] text-slate-300">Moderate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-[10px] text-rose-300 font-semibold">Extreme Heat</span>
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-amber-400" />
            <span>Prototype Spatial Mesh</span>
          </div>
        </div>

      </div>
    </div>
  );
};

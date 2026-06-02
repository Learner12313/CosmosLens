import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Cell
} from "recharts";

// ─── Design tokens ───────────────────────────────────────────
const T = {
  void:    "#020408",
  deep:    "#050d1a",
  nebula:  "#0a1628",
  panel:   "#071022",
  star:    "#e8f4ff",
  dim:     "#5a7a9a",
  dimHi:   "#7a9bbf",
  accent:  "#00d4ff",
  gold:    "#ffc843",
  fire:    "#ff6b35",
  green:   "#00ff88",
  purple:  "#b06aff",
  pink:    "#ff6ab0",
  red:     "#ff4444",
  border:  "rgba(0,212,255,0.12)",
  borderHi:"rgba(0,212,255,0.28)",
};

// ─── Global styles injected once ────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=DM+Mono:ital,wght@0,300;0,400;0,500&family=Syne:wght@400;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --void: #020408; --deep: #050d1a; --nebula: #0a1628;
    --panel: #071022; --star: #e8f4ff; --dim: #5a7a9a;
    --accent: #00d4ff; --gold: #ffc843; --fire: #ff6b35;
    --green: #00ff88; --purple: #b06aff; --pink: #ff6ab0;
    --border: rgba(0,212,255,0.12);
  }

  body { background: var(--void); color: var(--star); font-family: 'DM Mono', monospace; }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--void); }
  ::-webkit-scrollbar-thumb { background: rgba(0,212,255,0.3); border-radius: 2px; }

  @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
  @keyframes fadeUp   { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes blink    { 50%{opacity:0} }
  @keyframes spin     { to{transform:rotate(360deg)} }
  @keyframes glow     { 0%,100%{box-shadow:0 0 4px #00d4ff40} 50%{box-shadow:0 0 16px #00d4ff80} }
  @keyframes ticker   { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  @keyframes slideIn  { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }

  .cl-app {
    min-height: 100vh;
    background:
      radial-gradient(ellipse 80vw 60vh at 15% 20%, rgba(0,60,120,0.18) 0%, transparent 70%),
      radial-gradient(ellipse 60vw 80vh at 85% 75%, rgba(0,30,80,0.14) 0%, transparent 70%),
      var(--void);
    display: flex; flex-direction: column;
  }

  /* Starfield */
  .cl-app::before {
    content: '';
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image:
      radial-gradient(1px 1px at 8%  15%, rgba(255,255,255,.8) 0%, transparent 100%),
      radial-gradient(1px 1px at 22% 72%, rgba(255,255,255,.6) 0%, transparent 100%),
      radial-gradient(1.5px 1.5px at 47% 38%, rgba(255,255,255,.9) 0%, transparent 100%),
      radial-gradient(1px 1px at 68% 12%, rgba(255,255,255,.7) 0%, transparent 100%),
      radial-gradient(1px 1px at 83% 58%, rgba(255,255,255,.5) 0%, transparent 100%),
      radial-gradient(1px 1px at 19% 88%, rgba(255,255,255,.6) 0%, transparent 100%),
      radial-gradient(1px 1px at 58% 82%, rgba(255,255,255,.4) 0%, transparent 100%),
      radial-gradient(1.5px 1.5px at 91% 28%, rgba(255,255,255,.8) 0%, transparent 100%),
      radial-gradient(1px 1px at 43% 53%, rgba(200,220,255,.5) 0%, transparent 100%),
      radial-gradient(1px 1px at 74% 74%, rgba(255,255,255,.3) 0%, transparent 100%),
      radial-gradient(1px 1px at 33% 33%, rgba(255,255,255,.5) 0%, transparent 100%),
      radial-gradient(1px 1px at 77% 44%, rgba(200,230,255,.4) 0%, transparent 100%);
  }

  /* ── Topbar ── */
  .cl-topbar {
    position: sticky; top: 0; z-index: 100;
    display: flex; align-items: center; gap: 1.5rem;
    padding: .6rem 1.5rem;
    background: rgba(5,13,26,.92);
    border-bottom: 1px solid var(--border);
    backdrop-filter: blur(12px);
    flex-wrap: wrap;
  }
  .cl-logo {
    font-family: 'Orbitron', monospace; font-weight: 900; font-size: .9rem;
    letter-spacing: .15em; color: var(--accent);
    white-space: nowrap;
  }
  .cl-logo span { color: var(--star); }

  .cl-ticker-wrap { flex: 1; overflow: hidden; min-width: 0; }
  .cl-ticker {
    display: flex; gap: 3rem; white-space: nowrap;
    animation: ticker 28s linear infinite;
    font-size: .62rem; letter-spacing: .08em; color: var(--dim);
  }
  .cl-ticker b { color: var(--accent); font-weight: 400; }

  .cl-live-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--fire); flex-shrink: 0;
    animation: pulse 1.4s ease-in-out infinite;
    box-shadow: 0 0 8px var(--fire);
  }
  .cl-topbar-time {
    font-family: 'Orbitron', monospace; font-size: .62rem;
    color: var(--dimHi); letter-spacing: .1em; white-space: nowrap;
  }

  /* ── Nav tabs ── */
  .cl-nav {
    display: flex; gap: 2px; padding: .5rem 1.5rem;
    background: rgba(5,13,26,.6);
    border-bottom: 1px solid var(--border);
    overflow-x: auto; z-index: 10; position: relative;
  }
  .cl-nav::-webkit-scrollbar { height: 0; }
  .cl-nav-btn {
    font-family: 'Orbitron', monospace; font-size: .55rem;
    letter-spacing: .12em; text-transform: uppercase;
    padding: .45rem 1rem; cursor: pointer;
    border: 1px solid transparent;
    background: transparent; color: var(--dim);
    transition: all .2s; white-space: nowrap;
  }
  .cl-nav-btn:hover { color: var(--star); border-color: var(--border); }
  .cl-nav-btn.active {
    color: var(--accent); border-color: rgba(0,212,255,.4);
    background: rgba(0,212,255,.06);
  }
  .cl-nav-btn .dot {
    display: inline-block; width: 5px; height: 5px; border-radius: 50%;
    margin-right: .4rem; vertical-align: middle;
  }

  /* ── Main layout ── */
  .cl-main {
    flex: 1; display: grid;
    grid-template-columns: 280px 1fr;
    gap: 0; position: relative; z-index: 1;
  }
  @media (max-width: 900px) {
    .cl-main { grid-template-columns: 1fr; }
    .cl-sidebar { display: none; }
  }

  /* ── Sidebar ── */
  .cl-sidebar {
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column; gap: 0;
    background: rgba(5,13,26,.5);
    overflow-y: auto; max-height: calc(100vh - 88px);
  }
  .cl-sidebar-section {
    border-bottom: 1px solid var(--border);
    padding: 1.2rem 1.2rem;
  }
  .cl-section-label {
    font-family: 'Orbitron', monospace; font-size: .5rem;
    letter-spacing: .3em; color: var(--accent); text-transform: uppercase;
    margin-bottom: .8rem; opacity: .7;
  }

  /* ── Layer toggles ── */
  .cl-layer-row {
    display: flex; align-items: center; gap: .7rem;
    padding: .4rem .5rem; cursor: pointer;
    border-radius: 2px; transition: background .15s;
    margin-bottom: 2px;
  }
  .cl-layer-row:hover { background: rgba(255,255,255,.04); }
  .cl-layer-toggle {
    width: 28px; height: 14px; border-radius: 7px;
    border: 1px solid; position: relative; flex-shrink: 0;
    transition: all .2s;
  }
  .cl-layer-toggle::after {
    content: ''; position: absolute; top: 2px; left: 2px;
    width: 8px; height: 8px; border-radius: 50%;
    transition: all .2s;
  }
  .cl-layer-toggle.on::after { left: calc(100% - 10px); }
  .cl-layer-name {
    font-size: .7rem; color: var(--dimHi); flex: 1;
    transition: color .2s;
  }
  .cl-layer-row:hover .cl-layer-name { color: var(--star); }
  .cl-layer-count {
    font-family: 'Orbitron', monospace; font-size: .55rem;
    color: var(--dim);
  }

  /* ── Stat cards ── */
  .cl-stat-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 6px;
  }
  .cl-stat-card {
    background: var(--deep); border: 1px solid var(--border);
    padding: .7rem; display: flex; flex-direction: column; gap: .3rem;
  }
  .cl-stat-val {
    font-family: 'Orbitron', monospace; font-size: 1.1rem;
    font-weight: 700;
  }
  .cl-stat-lbl {
    font-size: .55rem; letter-spacing: .12em;
    color: var(--dim); text-transform: uppercase;
  }

  /* ── Content area ── */
  .cl-content {
    padding: 1.5rem;
    display: flex; flex-direction: column; gap: 1.5rem;
    overflow-y: auto; max-height: calc(100vh - 88px);
    animation: fadeUp .35s ease both;
  }

  /* ── Panel ── */
  .cl-panel {
    background: rgba(5,13,26,.7);
    border: 1px solid var(--border);
    padding: 1.25rem;
    position: relative; overflow: hidden;
  }
  .cl-panel::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0;
    height: 2px; opacity: .6;
  }
  .cl-panel.fire::before   { background: linear-gradient(90deg, var(--fire), transparent); }
  .cl-panel.quake::before  { background: linear-gradient(90deg, var(--accent), transparent); }
  .cl-panel.iss::before    { background: linear-gradient(90deg, var(--gold), transparent); }
  .cl-panel.solar::before  { background: linear-gradient(90deg, var(--green), transparent); }
  .cl-panel.neo::before    { background: linear-gradient(90deg, var(--purple), transparent); }
  .cl-panel.imagery::before{ background: linear-gradient(90deg, var(--pink), transparent); }

  .cl-panel-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 1.2rem; flex-wrap: wrap; gap: .5rem;
  }
  .cl-panel-title {
    font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700;
    display: flex; align-items: center; gap: .6rem;
  }
  .cl-panel-sub {
    font-size: .65rem; color: var(--dim); letter-spacing: .08em;
  }
  .cl-badge {
    font-family: 'Orbitron', monospace; font-size: .48rem;
    letter-spacing: .15em; padding: .25rem .6rem;
    border: 1px solid; text-transform: uppercase;
  }
  .cl-badge.live {
    color: var(--fire); border-color: var(--fire);
    animation: pulse 1.4s ease-in-out infinite;
  }
  .cl-badge.ws  { color: var(--gold); border-color: var(--gold); }
  .cl-badge.ml  { color: var(--green); border-color: var(--green); }
  .cl-badge.api { color: var(--accent); border-color: var(--accent); }

  /* ── Chart grids ── */
  .cl-chart-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
  }
  @media (max-width: 700px) { .cl-chart-grid { grid-template-columns: 1fr; } }

  .cl-chart-title {
    font-size: .58rem; letter-spacing: .15em; color: var(--dim);
    text-transform: uppercase; margin-bottom: .6rem;
  }

  /* ── ISS HUD ── */
  .cl-hud-grid {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px;
    background: var(--border); border: 1px solid var(--border);
    margin-bottom: 1.2rem;
  }
  @media (max-width: 700px) { .cl-hud-grid { grid-template-columns: repeat(2, 1fr); } }

  .cl-hud-cell {
    background: var(--deep); padding: 1rem .8rem;
    display: flex; flex-direction: column; gap: .4rem;
    align-items: center; text-align: center;
    animation: glow 3s ease-in-out infinite;
  }
  .cl-hud-val {
    font-family: 'Orbitron', monospace; font-size: 1.4rem;
    font-weight: 700; color: var(--gold); letter-spacing: .05em;
    line-height: 1;
  }
  .cl-hud-unit {
    font-size: .5rem; color: var(--dim); letter-spacing: .2em;
    text-transform: uppercase; margin-top: .1rem;
  }
  .cl-hud-lbl {
    font-size: .52rem; color: var(--dimHi); letter-spacing: .15em;
    text-transform: uppercase;
  }

  .cl-iss-track {
    height: 80px; background: var(--deep); border: 1px solid var(--border);
    position: relative; overflow: hidden; margin-top: .6rem;
  }
  .cl-iss-track-line {
    position: absolute; top: 50%; left: 0; right: 0;
    height: 1px; background: rgba(0,212,255,.15);
  }
  .cl-iss-dot {
    position: absolute; width: 10px; height: 10px;
    background: var(--gold); border-radius: 50%;
    transform: translate(-50%, -50%); top: 50%;
    box-shadow: 0 0 14px var(--gold), 0 0 4px #fff;
    transition: left .9s linear;
  }
  .cl-iss-trail {
    position: absolute; top: 50%; height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold));
    transform: translateY(-50%);
    transition: left .9s linear, width .9s linear;
  }

  /* ── Asteroid risk table ── */
  .cl-neo-table { width: 100%; border-collapse: collapse; }
  .cl-neo-table th {
    font-family: 'Orbitron', monospace; font-size: .5rem;
    letter-spacing: .15em; color: var(--dim); text-transform: uppercase;
    padding: .5rem .6rem; border-bottom: 1px solid var(--border);
    text-align: left; white-space: nowrap;
  }
  .cl-neo-table td {
    padding: .6rem .6rem; border-bottom: 1px solid rgba(0,212,255,.05);
    font-size: .7rem; color: var(--dimHi); vertical-align: middle;
  }
  .cl-neo-table tr:hover td { background: rgba(255,255,255,.03); }
  .cl-neo-name { color: var(--star); font-size: .72rem; }
  .cl-risk-bar-wrap {
    width: 80px; height: 6px;
    background: rgba(255,255,255,.07); border-radius: 3px; overflow: hidden;
  }
  .cl-risk-bar {
    height: 100%; border-radius: 3px;
    transition: width .5s ease;
  }
  .cl-risk-label {
    font-family: 'Orbitron', monospace; font-size: .48rem;
    letter-spacing: .1em; margin-left: .5rem;
  }

  /* ── Aurora strip ── */
  .cl-aurora-strip {
    height: 44px; border-radius: 2px; position: relative;
    overflow: hidden; border: 1px solid var(--border);
    margin-top: .8rem;
  }
  .cl-aurora-gradient {
    position: absolute; inset: 0;
  }
  .cl-aurora-labels {
    position: absolute; bottom: 4px; left: 0; right: 0;
    display: flex; justify-content: space-between;
    padding: 0 .5rem;
    font-size: .48rem; color: rgba(255,255,255,.5); letter-spacing: .1em;
  }
  .cl-aurora-pointer {
    position: absolute; top: 0; bottom: 0; width: 2px;
    background: rgba(255,255,255,.8);
    box-shadow: 0 0 6px #fff;
    transition: left .8s ease;
  }
  .cl-aurora-pointer::after {
    content: attr(data-pct);
    position: absolute; bottom: -18px; left: 50%;
    transform: translateX(-50%);
    font-size: .48rem; color: var(--green); white-space: nowrap;
    font-family: 'Orbitron', monospace;
  }

  /* ── Before/After slider ── */
  .cl-slider-wrap {
    position: relative; user-select: none; overflow: hidden;
    border: 1px solid var(--border);
  }
  .cl-slider-img {
    width: 100%; height: 260px; display: block; object-fit: cover;
  }
  .cl-slider-overlay {
    position: absolute; inset: 0; overflow: hidden;
  }
  .cl-slider-handle {
    position: absolute; top: 0; bottom: 0; width: 2px;
    background: #fff; cursor: ew-resize; z-index: 5;
    box-shadow: 0 0 12px rgba(255,255,255,.6);
  }
  .cl-slider-handle::before {
    content: '◀ ▶';
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(5,13,26,.9); border: 1px solid rgba(255,255,255,.3);
    padding: .3rem .5rem; font-size: .7rem; color: #fff; white-space: nowrap;
    letter-spacing: .1em;
  }
  .cl-slider-labels {
    position: absolute; bottom: .6rem;
    left: 0; right: 0; display: flex; justify-content: space-between;
    padding: 0 .8rem; pointer-events: none; z-index: 4;
  }
  .cl-slider-tag {
    font-family: 'Orbitron', monospace; font-size: .5rem;
    letter-spacing: .12em; padding: .25rem .5rem;
    background: rgba(5,13,26,.8); border: 1px solid rgba(255,255,255,.2);
    color: var(--star);
  }
  .cl-slider-selector {
    display: flex; gap: 8px; margin-bottom: 1rem; flex-wrap: wrap;
  }
  .cl-slider-sel-btn {
    font-family: 'Orbitron', monospace; font-size: .52rem;
    letter-spacing: .1em; padding: .35rem .8rem;
    border: 1px solid var(--border); background: transparent;
    color: var(--dim); cursor: pointer; transition: all .2s;
    text-transform: uppercase;
  }
  .cl-slider-sel-btn:hover { border-color: var(--pink); color: var(--pink); }
  .cl-slider-sel-btn.active { border-color: var(--pink); color: var(--pink); background: rgba(255,106,176,.08); }

  /* ── Detail popup ── */
  .cl-popup-overlay {
    position: fixed; inset: 0; background: rgba(2,4,8,.7);
    z-index: 200; display: flex; align-items: center; justify-content: center;
    padding: 1rem; backdrop-filter: blur(4px);
    animation: fadeUp .2s ease;
  }
  .cl-popup {
    background: var(--deep); border: 1px solid var(--borderHi);
    width: 100%; max-width: 640px; max-height: 85vh; overflow-y: auto;
    position: relative; animation: slideIn .25s ease;
  }
  .cl-popup-header {
    padding: 1.2rem 1.5rem; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; background: var(--deep); z-index: 5;
  }
  .cl-popup-title {
    font-family: 'Syne', sans-serif; font-size: 1.1rem; font-weight: 700;
  }
  .cl-popup-close {
    font-size: 1.2rem; color: var(--dim); cursor: pointer;
    background: none; border: none; padding: .2rem .5rem;
    transition: color .2s;
  }
  .cl-popup-close:hover { color: var(--star); }
  .cl-popup-body { padding: 1.5rem; }

  /* ── Meta row ── */
  .cl-meta-row {
    display: flex; gap: 1.5rem; flex-wrap: wrap; margin-bottom: 1.2rem;
  }
  .cl-meta-item { display: flex; flex-direction: column; gap: .2rem; }
  .cl-meta-val { font-family: 'Orbitron', monospace; font-size: .9rem; font-weight: 600; }
  .cl-meta-lbl { font-size: .52rem; color: var(--dim); letter-spacing: .1em; text-transform: uppercase; }

  /* ── Tooltip ── */
  .cl-tooltip {
    background: rgba(5,13,26,.95); border: 1px solid rgba(0,212,255,.3);
    padding: .6rem .9rem; font-size: .68rem; color: var(--star);
    font-family: 'DM Mono', monospace;
  }
  .cl-tooltip-label { color: var(--accent); font-size: .58rem; letter-spacing: .1em; margin-bottom: .3rem; }

  /* ── Globe placeholder ── */
  .cl-globe-placeholder {
    background: var(--deep); border: 1px solid var(--border);
    height: 280px; display: flex; align-items: center; justify-content: center;
    position: relative; overflow: hidden;
  }
  .cl-globe-ring {
    width: 200px; height: 200px; border-radius: 50%;
    border: 1px solid rgba(0,212,255,.2);
    position: absolute;
    animation: spin 20s linear infinite;
  }
  .cl-globe-ring:nth-child(2) { width: 240px; height: 240px; border-color: rgba(0,212,255,.1); animation-duration: 30s; animation-direction: reverse; }
  .cl-globe-ring:nth-child(3) { width: 160px; height: 160px; border-color: rgba(255,200,67,.15); animation-duration: 15s; }
  .cl-globe-center {
    width: 120px; height: 120px; border-radius: 50%;
    background: radial-gradient(circle at 35% 35%, rgba(0,100,200,.6), rgba(0,30,80,.9));
    border: 1px solid rgba(0,212,255,.3);
    box-shadow: 0 0 40px rgba(0,212,255,.15);
    z-index: 2; display: flex; align-items: center; justify-content: center;
    font-size: 2.5rem;
  }
  .cl-globe-label {
    position: absolute; bottom: 1rem; left: 1rem;
    font-family: 'Orbitron', monospace; font-size: .52rem;
    color: var(--dim); letter-spacing: .15em;
  }
  .cl-globe-event-dots {
    position: absolute; inset: 0;
  }
  .cl-globe-dot {
    position: absolute; width: 6px; height: 6px; border-radius: 50%;
    cursor: pointer; transform: translate(-50%, -50%);
    transition: transform .2s;
  }
  .cl-globe-dot:hover { transform: translate(-50%, -50%) scale(1.8); }
  .cl-globe-dot::after {
    content: ''; position: absolute; inset: -4px; border-radius: 50%;
    border: 1px solid currentColor; opacity: .4;
    animation: pulse 1.5s ease-in-out infinite;
  }

  /* ── Endpoint reference ── */
  .cl-endpoint-list { display: flex; flex-direction: column; gap: 4px; }
  .cl-endpoint {
    display: flex; align-items: center; gap: .6rem;
    padding: .4rem .6rem; background: var(--deep);
    border: 1px solid var(--border); font-size: .65rem;
  }
  .cl-endpoint-method {
    font-family: 'Orbitron', monospace; font-size: .48rem;
    color: var(--green); letter-spacing: .1em; flex-shrink: 0;
  }
  .cl-endpoint-path { color: var(--accent); flex: 1; font-size: .63rem; }
  .cl-endpoint-desc { color: var(--dim); font-size: .6rem; }
`;

// ─── Mock data generators ─────────────────────────────────────
const mkFireData = () => Array.from({ length: 18 }, (_, i) => ({
  time: `${String(i).padStart(2,"0")}:00`,
  frp: Math.round(20 + Math.random() * 180 + (i > 8 ? Math.sin(i/2)*60 : 0)),
  area: Math.round(800 + i * 120 + Math.random() * 400),
  temp: Math.round(320 + Math.random() * 80),
}));

const mkQuakeData = () => ({
  mag: [
    {range:"M2-3", count: 42 + Math.floor(Math.random()*20)},
    {range:"M3-4", count: 18 + Math.floor(Math.random()*12)},
    {range:"M4-5", count:  8 + Math.floor(Math.random()*8)},
    {range:"M5-6", count:  3 + Math.floor(Math.random()*4)},
    {range:"M6+",  count:  1 + Math.floor(Math.random()*2)},
  ],
  scatter: Array.from({ length: 30 }, () => ({
    mag: +(2 + Math.random() * 5).toFixed(1),
    depth: Math.round(5 + Math.random() * 300),
    size: Math.round(20 + Math.random() * 60),
  })),
});

const mkSolarData = () => ({
  kp: Array.from({ length: 24 }, (_, i) => ({
    h: `${String(i).padStart(2,"0")}:00`,
    kp: +(Math.max(0, 2 + Math.sin(i/3)*3 + Math.random()*2)).toFixed(1),
  })),
  flares: [
    {cls:"A", count:14},{cls:"B", count:28},{cls:"C", count:9},
    {cls:"M", count:3},{cls:"X", count:1},
  ],
  auroraPct: Math.round(30 + Math.random() * 55),
});

const mkAsteroidData = () => [
  { name:"2024 KF7", dist:1.2, size:140, vel:22.4, risk:0.72, hazardous:true },
  { name:"2025 BQ3", dist:3.8, size:48,  vel:14.1, risk:0.31, hazardous:false },
  { name:"2025 CP1", dist:5.1, size:220, vel:31.2, risk:0.61, hazardous:true },
  { name:"2024 LM9", dist:6.3, size:31,  vel:9.7,  risk:0.12, hazardous:false },
  { name:"2025 DX4", dist:7.1, size:85,  vel:18.6, risk:0.28, hazardous:false },
];

const IMAGERY_SCENES = [
  { id:"glacier",  label:"Glacier Retreat",    lat:"68.3°N", lon:"18.5°E", before:"2014", after:"2024",
    beforeColor:"#4a90c4", afterColor:"#8a7a60", beforeEmoji:"🧊", afterEmoji:"⛰️" },
  { id:"forest",   label:"Deforestation",      lat:"3.1°S",  lon:"60.0°W", before:"2014", after:"2024",
    beforeColor:"#2d7a3a", afterColor:"#c4a460", beforeEmoji:"🌳", afterEmoji:"🏜️" },
  { id:"urban",    label:"Urban Growth",        lat:"23.1°N", lon:"113.3°E",before:"2014", after:"2024",
    beforeColor:"#5a7a5a", afterColor:"#8a8a9a", beforeEmoji:"🌿", afterEmoji:"🏙️" },
  { id:"coast",    label:"Coastline Erosion",   lat:"27.5°N", lon:"90.3°E", before:"2014", after:"2024",
    beforeColor:"#4a80b4", afterColor:"#6a90c4", beforeEmoji:"🏖️", afterEmoji:"🌊" },
];

const GLOBE_EVENTS = [
  { id:1, type:"fire",  lat:38, lng:-122, label:"Wildfire CA" },
  { id:2, type:"fire",  lat:55, lng:82,   label:"Wildfire SB" },
  { id:3, type:"quake", lat:35, lng:139,  label:"M5.2 Tokyo" },
  { id:4, type:"quake", lat:-33,lng:-71,  label:"M4.8 Chile" },
  { id:5, type:"neo",   lat:20, lng:45,   label:"2025 CP1" },
];

const LAYERS = [
  { id:"fires",    label:"Wildfire Watch",      color:T.fire,   count:247, on:true },
  { id:"quakes",   label:"Seismic & Disaster",  color:T.accent, count:83,  on:true },
  { id:"iss",      label:"ISS Tracker",         color:T.gold,   count:1,   on:true },
  { id:"solar",    label:"Solar & Space Weather",color:T.green,  count:12,  on:false},
  { id:"neo",      label:"Near-Earth Objects",  color:T.purple, count:6,   on:true },
  { id:"imagery",  label:"Earth Change Detection",color:T.pink,  count:null,on:false},
];

const ENDPOINTS = [
  { method:"GET", path:"/api/fires",            desc:"Active wildfire locations" },
  { method:"GET", path:"/api/fires/{id}",       desc:"Fire detail + intensity" },
  { method:"GET", path:"/api/earthquakes",      desc:"Real-time earthquake feed" },
  { method:"GET", path:"/api/earthquakes/{id}", desc:"Quake detail + aftershock" },
  { method:"WS",  path:"/ws/iss",              desc:"Live ISS position stream" },
  { method:"GET", path:"/api/iss/track",        desc:"90-min ground track" },
  { method:"GET", path:"/api/solar/storms",     desc:"Kp-index + CME data" },
  { method:"GET", path:"/api/solar/aurora",     desc:"Aurora probability by lat" },
  { method:"GET", path:"/api/asteroids",        desc:"NEO approach list" },
  { method:"GET", path:"/api/imagery/before-after","desc":"Satellite imagery tiles" },
];

// ─── Hooks ───────────────────────────────────────────────────

// Task 2: useLiveISS — WebSocket consumer (mocked with setInterval)
function useLiveISS() {
  const [iss, setIss] = useState({ lat:51.5, lng:0.0, alt:408.3, vel:27580 });
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    setConnected(true);
    // Simulate WS: ws://localhost:8000/ws/iss
    const id = setInterval(() => {
      setIss(prev => ({
        lat: +(prev.lat + (Math.random() - 0.45) * 1.2).toFixed(4),
        lng: +((prev.lng + 0.8 + (Math.random()-0.5)*0.2) % 360 - 180).toFixed(4),
        alt: +(408 + Math.random() * 2 - 1).toFixed(1),
        vel: +(27580 + Math.floor(Math.random() * 20 - 10)),
      }));
    }, 1000);
    return () => { clearInterval(id); setConnected(false); };
  }, []);

  return { iss, connected };
}

// Task 3: useLayerData — REST fetch hook (mocked)
function useLayerData(endpoint) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    setLoading(true);
    // Mock: simulate fetch from http://localhost:8000{endpoint}
    const t = setTimeout(() => {
      try {
        if (endpoint.startsWith("/api/fires"))      setData(mkFireData());
        else if (endpoint.startsWith("/api/earthquakes")) setData(mkQuakeData());
        else if (endpoint.startsWith("/api/solar"))  setData(mkSolarData());
        else if (endpoint.startsWith("/api/asteroids")) setData(mkAsteroidData());
        else setData([]);
        setLoading(false);
      } catch (e) { setError(e.message); setLoading(false); }
    }, 340 + Math.random() * 300);
    return () => clearTimeout(t);
  }, [endpoint]);

  return { data, loading, error };
}

// ─── Custom Tooltip ──────────────────────────────────────────
function CTooltip({ active, payload, label, unit="" }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="cl-tooltip">
      <div className="cl-tooltip-label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || T.star }}>
          {p.name}: <b>{typeof p.value === "number" ? p.value.toLocaleString() : p.value}{unit}</b>
        </div>
      ))}
    </div>
  );
}

// ─── Task 4: WildfireChart ────────────────────────────────────
function WildfireChart({ inPopup }) {
  const { data, loading } = useLayerData("/api/fires");
  if (loading) return <Loader color={T.fire} />;

  return (
    <div className={`cl-panel fire${inPopup ? "" : ""}`}>
      <div className="cl-panel-header">
        <div className="cl-panel-title">
          <span style={{ color: T.fire }}>🔥</span> Wildfire Watch
          <span style={{ color: T.dim, fontSize: ".62rem" }}>— Live telemetry</span>
        </div>
        <div style={{ display:"flex", gap:".5rem" }}>
          <span className="cl-badge live">LIVE</span>
          <span className="cl-badge api">NASA FIRMS</span>
        </div>
      </div>

      <div className="cl-meta-row">
        {[
          { val:`${data?.[data.length-1]?.frp ?? 247} MW`, lbl:"Fire Radiative Power", col:T.fire },
          { val:`${data?.[data.length-1]?.area?.toLocaleString() ?? "3,840"} km²`, lbl:"Affected Area", col:T.gold },
          { val:`${data?.[data.length-1]?.temp ?? 387}°C`, lbl:"Brightness Temp", col:T.star },
        ].map(m => (
          <div className="cl-meta-item" key={m.lbl}>
            <div className="cl-meta-val" style={{ color: m.col }}>{m.val}</div>
            <div className="cl-meta-lbl">{m.lbl}</div>
          </div>
        ))}
      </div>

      <div className="cl-chart-grid">
        <div>
          <div className="cl-chart-title">Fire Radiative Power (MW) — 18hr</div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={data} margin={{ top:4, right:4, bottom:0, left:-20 }}>
              <defs>
                <linearGradient id="fireGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={T.fire} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={T.fire} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,.04)" strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize:9, fill:T.dim }} interval={3} />
              <YAxis tick={{ fontSize:9, fill:T.dim }} />
              <Tooltip content={<CTooltip unit=" MW" />} />
              <Area type="monotone" dataKey="frp" name="FRP" stroke={T.fire}
                fill="url(#fireGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div>
          <div className="cl-chart-title">Burn Area (km²) — 18hr</div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={data} margin={{ top:4, right:4, bottom:0, left:-10 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={T.gold} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={T.gold} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,.04)" strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize:9, fill:T.dim }} interval={3} />
              <YAxis tick={{ fontSize:9, fill:T.dim }} />
              <Tooltip content={<CTooltip unit=" km²" />} />
              <Area type="monotone" dataKey="area" name="Area" stroke={T.gold}
                fill="url(#areaGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── Task 5: EarthquakeChart ──────────────────────────────────
function EarthquakeChart({ inPopup }) {
  const { data, loading } = useLayerData("/api/earthquakes");
  if (loading) return <Loader color={T.accent} />;

  const MAG_COLORS = { "M2-3":T.green, "M3-4":T.accent, "M4-5":T.gold, "M5-6":T.fire, "M6+":T.red };

  return (
    <div className="cl-panel quake">
      <div className="cl-panel-header">
        <div className="cl-panel-title">
          <span style={{ color: T.accent }}>🌊</span> Seismic & Disaster
          <span style={{ color: T.dim, fontSize: ".62rem" }}>— USGS feed</span>
        </div>
        <div style={{ display:"flex", gap:".5rem" }}>
          <span className="cl-badge live">LIVE</span>
          <span className="cl-badge api">USGS</span>
        </div>
      </div>

      <div className="cl-meta-row">
        {[
          { val:String(data?.mag?.reduce((s,m)=>s+m.count,0) ?? 72), lbl:"Last 24h Events", col:T.accent },
          { val:"M5.2", lbl:"Largest Today",   col:T.gold },
          { val:"134 km", lbl:"Max Depth",     col:T.star },
        ].map(m => (
          <div className="cl-meta-item" key={m.lbl}>
            <div className="cl-meta-val" style={{ color: m.col }}>{m.val}</div>
            <div className="cl-meta-lbl">{m.lbl}</div>
          </div>
        ))}
      </div>

      <div className="cl-chart-grid">
        <div>
          <div className="cl-chart-title">Magnitude Distribution</div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={data?.mag} margin={{ top:4, right:4, bottom:0, left:-20 }}>
              <CartesianGrid stroke="rgba(255,255,255,.04)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="range" tick={{ fontSize:9, fill:T.dim }} />
              <YAxis tick={{ fontSize:9, fill:T.dim }} />
              <Tooltip content={<CTooltip unit=" events" />} />
              <Bar dataKey="count" name="Events" radius={[2,2,0,0]}>
                {data?.mag?.map((m, i) => (
                  <Cell key={i} fill={MAG_COLORS[m.range] || T.accent} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <div className="cl-chart-title">Depth vs. Magnitude</div>
          <ResponsiveContainer width="100%" height={140}>
            <ScatterChart margin={{ top:4, right:4, bottom:0, left:-20 }}>
              <CartesianGrid stroke="rgba(255,255,255,.04)" strokeDasharray="3 3" />
              <XAxis dataKey="mag" name="Magnitude" type="number" domain={[2,8]}
                tick={{ fontSize:9, fill:T.dim }} label={{ value:"Mag", position:"insideBottom", offset:-2, fill:T.dim, fontSize:9 }} />
              <YAxis dataKey="depth" name="Depth (km)" type="number"
                tick={{ fontSize:9, fill:T.dim }} reversed />
              <Tooltip cursor={{ stroke:T.dim, strokeDasharray:"3 3" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0]?.payload;
                  return (
                    <div className="cl-tooltip">
                      <div className="cl-tooltip-label">Earthquake</div>
                      <div>Magnitude: <b style={{ color:T.gold }}>M{d?.mag}</b></div>
                      <div>Depth: <b style={{ color:T.accent }}>{d?.depth} km</b></div>
                    </div>
                  );
                }} />
              <Scatter data={data?.scatter} fill={T.accent} fillOpacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── Task 6: ISSPanel ─────────────────────────────────────────
function ISSPanel() {
  const { iss, connected } = useLiveISS();
  const { data: track, loading } = useLayerData("/api/iss/track");

  // Normalize lng to 0–100% for track display
  const trackPct = ((iss.lng + 180) / 360 * 100).toFixed(1);

  return (
    <div className="cl-panel iss">
      <div className="cl-panel-header">
        <div className="cl-panel-title">
          <span style={{ color: T.gold }}>🛸</span> ISS Live Telemetry
        </div>
        <div style={{ display:"flex", gap:".5rem", alignItems:"center" }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background: connected ? T.green : T.red,
            animation: connected ? "pulse 1s infinite" : "none",
            boxShadow: connected ? `0 0 8px ${T.green}` : "none" }} />
          <span style={{ fontSize:".58rem", color: connected ? T.green : T.red, letterSpacing:".1em" }}>
            {connected ? "WS CONNECTED" : "DISCONNECTED"}
          </span>
          <span className="cl-badge ws">Open Notify</span>
        </div>
      </div>

      <div className="cl-hud-grid">
        {[
          { val: iss.lat.toFixed(4)+"°", unit:"LAT", lbl:"Latitude" },
          { val: iss.lng.toFixed(4)+"°", unit:"LNG", lbl:"Longitude" },
          { val: iss.alt.toFixed(1),     unit:"KM",  lbl:"Altitude" },
          { val: (iss.vel/1000).toFixed(2), unit:"km/s", lbl:"Velocity" },
        ].map(h => (
          <div className="cl-hud-cell" key={h.lbl}>
            <div className="cl-hud-lbl">{h.lbl}</div>
            <div className="cl-hud-val">{h.val}</div>
            <div className="cl-hud-unit">{h.unit}</div>
          </div>
        ))}
      </div>

      <div className="cl-chart-title">Ground Track — Longitude position (live)</div>
      <div className="cl-iss-track">
        <div className="cl-iss-track-line" />
        {[20,40,60,80].map(p => (
          <div key={p} style={{
            position:"absolute", left:`${p}%`, top:0, bottom:0,
            borderLeft:"1px solid rgba(0,212,255,.08)",
          }}/>
        ))}
        <div className="cl-iss-trail" style={{
          left: `${Math.max(0, parseFloat(trackPct)-8)}%`,
          width: "8%",
        }} />
        <div className="cl-iss-dot" style={{ left:`${trackPct}%` }} />
        {[-180,-90,0,90,180].map((lng,i) => (
          <div key={i} style={{
            position:"absolute", bottom:4,
            left:`${(lng+180)/360*100}%`,
            transform:"translateX(-50%)",
            fontSize:".45rem", color:"rgba(0,212,255,.3)",
            fontFamily:"'Orbitron', monospace",
          }}>{lng}°</div>
        ))}
      </div>

      <div style={{ marginTop:".8rem", display:"flex", gap:".8rem", flexWrap:"wrap" }}>
        {[
          { lbl:"Orbital Period", val:"92.9 min" },
          { lbl:"Inclination",    val:"51.6°" },
          { lbl:"Revolutions/day",val:"15.49" },
          { lbl:"Visibility Window", val:"~6 min" },
        ].map(m => (
          <div key={m.lbl} style={{ display:"flex", flexDirection:"column", gap:".2rem" }}>
            <div style={{ fontFamily:"'Orbitron'", fontSize:".78rem", color:T.gold }}>{m.val}</div>
            <div style={{ fontSize:".5rem", color:T.dim, letterSpacing:".1em", textTransform:"uppercase" }}>{m.lbl}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Task 7: SolarChart ───────────────────────────────────────
function SolarChart() {
  const { data, loading } = useLayerData("/api/solar/storms");
  if (loading) return <Loader color={T.green} />;

  const kpColor = kp => kp >= 7 ? T.red : kp >= 5 ? T.fire : kp >= 3 ? T.gold : T.green;
  const auroraLat = 90 - (data?.auroraPct ?? 55);  // rough: higher pct → lower lat visible
  const auroraStripPct = data?.auroraPct ?? 55;

  return (
    <div className="cl-panel solar">
      <div className="cl-panel-header">
        <div className="cl-panel-title">
          <span style={{ color: T.green }}>☀️</span> Solar & Space Weather
        </div>
        <div style={{ display:"flex", gap:".5rem" }}>
          <span className="cl-badge api">NASA DONKI</span>
        </div>
      </div>

      <div className="cl-meta-row">
        {[
          { val:`Kp ${data?.kp?.[data.kp.length-1]?.kp ?? 3.2}`, lbl:"Current Kp Index", col:T.green },
          { val:`${auroraStripPct}%`,  lbl:"Aurora Probability", col:T.purple },
          { val:`${auroraLat}°N+`,     lbl:"Visible Below Lat",  col:T.star },
        ].map(m => (
          <div className="cl-meta-item" key={m.lbl}>
            <div className="cl-meta-val" style={{ color: m.col }}>{m.val}</div>
            <div className="cl-meta-lbl">{m.lbl}</div>
          </div>
        ))}
      </div>

      <div className="cl-chart-grid">
        <div>
          <div className="cl-chart-title">Kp-Index — 24hr Geomagnetic Activity</div>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={data?.kp} margin={{ top:4, right:4, bottom:0, left:-28 }}>
              <CartesianGrid stroke="rgba(255,255,255,.04)" strokeDasharray="3 3" />
              <XAxis dataKey="h" tick={{ fontSize:8, fill:T.dim }} interval={4} />
              <YAxis domain={[0, 9]} tick={{ fontSize:9, fill:T.dim }} />
              <Tooltip content={<CTooltip />} />
              <ReferenceLine y={5} stroke={T.fire} strokeDasharray="3 3" strokeOpacity={.5}
                label={{ value:"Storm", fill:T.fire, fontSize:8 }} />
              <ReferenceLine y={7} stroke={T.red} strokeDasharray="3 3" strokeOpacity={.5}
                label={{ value:"Severe", fill:T.red, fontSize:8 }} />
              <Line type="monotone" dataKey="kp" name="Kp" stroke={T.green}
                strokeWidth={2} dot={{ r:2, fill:T.green }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <div className="cl-chart-title">Solar Flare Frequency by Class</div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={data?.flares} margin={{ top:4, right:4, bottom:0, left:-20 }}>
              <CartesianGrid stroke="rgba(255,255,255,.04)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="cls" tick={{ fontSize:9, fill:T.dim }} />
              <YAxis tick={{ fontSize:9, fill:T.dim }} />
              <Tooltip content={<CTooltip unit=" flares" />} />
              <Bar dataKey="count" name="Flares" radius={[2,2,0,0]}>
                {data?.flares?.map((f, i) => {
                  const cols = [T.green, T.accent, T.gold, T.fire, T.red];
                  return <Cell key={i} fill={cols[i]} fillOpacity={.85} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Aurora probability strip */}
      <div style={{ marginTop:".8rem" }}>
        <div className="cl-chart-title">Aurora Borealis Probability — by Latitude Band</div>
        <div className="cl-aurora-strip">
          <div className="cl-aurora-gradient" style={{
            background: `linear-gradient(90deg,
              rgba(0,255,136,0) 0%,
              rgba(0,255,136,.15) 20%,
              rgba(176,106,255,.5) 45%,
              rgba(0,212,255,.7) ${auroraStripPct}%,
              rgba(0,212,255,.1) ${auroraStripPct+5}%,
              rgba(0,0,0,0) 100%
            )`,
          }} />
          <div className="cl-aurora-pointer"
            style={{ left:`${auroraStripPct}%` }}
            data-pct={`${auroraStripPct}%`} />
          <div className="cl-aurora-labels">
            <span>90°N</span><span>60°N</span><span>45°N</span><span>30°N</span><span>0°</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Task 8: AsteroidChart ────────────────────────────────────
function AsteroidChart() {
  const { data, loading } = useLayerData("/api/asteroids");
  if (loading) return <Loader color={T.purple} />;

  const riskColor = r => r > 0.6 ? T.red : r > 0.3 ? T.fire : T.green;
  const riskLabel = r => r > 0.6 ? "HIGH" : r > 0.3 ? "MED" : "LOW";

  return (
    <div className="cl-panel neo">
      <div className="cl-panel-header">
        <div className="cl-panel-title">
          <span style={{ color: T.purple }}>☄️</span> Near-Earth Objects
        </div>
        <div style={{ display:"flex", gap:".5rem" }}>
          <span className="cl-badge ml">ML SCORED</span>
          <span className="cl-badge api">NASA NeoWs</span>
        </div>
      </div>

      <div className="cl-meta-row">
        {[
          { val:"6", lbl:"NEOs This Week", col:T.purple },
          { val:"1.2M km", lbl:"Closest Approach", col:T.red },
          { val:"220 m", lbl:"Largest Diameter", col:T.gold },
        ].map(m => (
          <div className="cl-meta-item" key={m.lbl}>
            <div className="cl-meta-val" style={{ color: m.col }}>{m.val}</div>
            <div className="cl-meta-lbl">{m.lbl}</div>
          </div>
        ))}
      </div>

      <table className="cl-neo-table">
        <thead>
          <tr>
            <th>Designation</th>
            <th>Dist (Mkm)</th>
            <th>Diameter</th>
            <th>Velocity</th>
            <th>ML Risk Score</th>
            <th>Level</th>
          </tr>
        </thead>
        <tbody>
          {data?.map(a => (
            <tr key={a.name}>
              <td>
                <span className="cl-neo-name">{a.name}</span>
                {a.hazardous && (
                  <span style={{ marginLeft:".4rem", fontSize:".5rem",
                    color:T.red, fontFamily:"'Orbitron', monospace" }}>⚠ PHA</span>
                )}
              </td>
              <td style={{ color: a.dist < 2 ? T.red : T.dimHi }}>{a.dist}</td>
              <td>{a.size} m</td>
              <td>{a.vel} km/s</td>
              <td>
                <div style={{ display:"flex", alignItems:"center" }}>
                  <div className="cl-risk-bar-wrap">
                    <div className="cl-risk-bar" style={{
                      width:`${a.risk * 100}%`,
                      background:`linear-gradient(90deg, ${T.green}, ${riskColor(a.risk)})`,
                    }} />
                  </div>
                  <span style={{ marginLeft:".5rem", fontSize:".65rem", color:T.dimHi }}>
                    {(a.risk * 100).toFixed(0)}%
                  </span>
                </div>
              </td>
              <td>
                <span className="cl-risk-label" style={{ color: riskColor(a.risk) }}>
                  {riskLabel(a.risk)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop:"1rem" }}>
        <div className="cl-chart-title">Approach Distance vs Size</div>
        <ResponsiveContainer width="100%" height={110}>
          <ScatterChart margin={{ top:4, right:16, bottom:0, left:-20 }}>
            <CartesianGrid stroke="rgba(255,255,255,.04)" strokeDasharray="3 3" />
            <XAxis dataKey="dist" name="Distance (Mkm)" type="number"
              tick={{ fontSize:9, fill:T.dim }}
              label={{ value:"Distance (Mkm)", position:"insideBottom", offset:-2, fill:T.dim, fontSize:9 }} />
            <YAxis dataKey="size" name="Diameter (m)" type="number"
              tick={{ fontSize:9, fill:T.dim }} />
            <Tooltip cursor={{ strokeDasharray:"3 3" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload;
                return (
                  <div className="cl-tooltip">
                    <div className="cl-tooltip-label">{d?.name}</div>
                    <div>Distance: <b style={{ color:T.accent }}>{d?.dist} Mkm</b></div>
                    <div>Size: <b style={{ color:T.gold }}>{d?.size} m</b></div>
                    <div>Risk: <b style={{ color: riskColor(d?.risk ?? 0) }}>{((d?.risk??0)*100).toFixed(0)}%</b></div>
                  </div>
                );
              }} />
            <Scatter data={data} fill={T.purple} fillOpacity={0.8} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Task 9: BeforeAfterSlider ────────────────────────────────
function BeforeAfterSlider() {
  const [scene,    setScene]    = useState(IMAGERY_SCENES[0]);
  const [splitPct, setSplitPct] = useState(50);
  const [dragging, setDragging] = useState(false);
  const wrapRef = useRef(null);

  const onMouseDown = e => { e.preventDefault(); setDragging(true); };
  const onTouchStart = e => { setDragging(true); };

  const updateSplit = useCallback(clientX => {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    setSplitPct(pct);
  }, []);

  useEffect(() => {
    const onMove = e => { if (dragging) updateSplit(e.touches ? e.touches[0].clientX : e.clientX); };
    const onUp   = ()  => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
    window.addEventListener("touchmove", onMove, { passive:true });
    window.addEventListener("touchend",  onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend",  onUp);
    };
  }, [dragging, updateSplit]);

  // Generate SVG-based "imagery" for demo (no external images)
  const makeSvgDataUrl = (color, emoji, label, isAfter) => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="260">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="0.5"/>
          </pattern>
        </defs>
        <rect width="800" height="260" fill="${color}"/>
        <rect width="800" height="260" fill="url(#grid)"/>
        ${isAfter
          ? `<rect x="200" y="60" width="180" height="140" rx="4" fill="rgba(0,0,0,0.3)"/>
             <rect x="420" y="80" width="120" height="100" rx="2" fill="rgba(0,0,0,0.25)"/>
             <rect x="560" y="70" width="80" height="80" rx="2" fill="rgba(0,0,0,0.2)"/>`
          : `<circle cx="250" cy="130" r="60" fill="rgba(255,255,255,0.06)"/>
             <circle cx="450" cy="110" r="40" fill="rgba(255,255,255,0.05)"/>
             <circle cx="600" cy="140" r="30" fill="rgba(255,255,255,0.04)"/>`
        }
        <text x="400" y="105" text-anchor="middle" font-size="48" font-family="monospace">${emoji}</text>
        <text x="400" y="155" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-size="14" font-family="monospace" letter-spacing="2">${label}</text>
        <text x="400" y="175" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-size="11" font-family="monospace">${scene.lat} / ${scene.lon}</text>
      </svg>
    `;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  };

  const beforeSrc = makeSvgDataUrl(scene.beforeColor, scene.beforeEmoji, scene.before + " (BEFORE)", false);
  const afterSrc  = makeSvgDataUrl(scene.afterColor,  scene.afterEmoji,  scene.after  + " (AFTER)",  true);

  return (
    <div className="cl-panel imagery">
      <div className="cl-panel-header">
        <div className="cl-panel-title">
          <span style={{ color:T.pink }}>🌍</span> Earth Change Detection
        </div>
        <div style={{ display:"flex", gap:".5rem" }}>
          <span className="cl-badge api">NASA GIBS</span>
        </div>
      </div>

      <div className="cl-slider-selector">
        {IMAGERY_SCENES.map(s => (
          <button key={s.id} className={`cl-slider-sel-btn${scene.id === s.id ? " active" : ""}`}
            onClick={() => { setScene(s); setSplitPct(50); }}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="cl-slider-wrap" ref={wrapRef}
        style={{ cursor: dragging ? "ew-resize" : "col-resize" }}
        onMouseDown={onMouseDown} onTouchStart={onTouchStart}>

        {/* BASE: after image (right side) */}
        <img src={afterSrc} className="cl-slider-img" alt="after" draggable={false} />

        {/* OVERLAY: before image clipped to left portion */}
        <div className="cl-slider-overlay" style={{ clipPath:`inset(0 ${100 - splitPct}% 0 0)` }}>
          <img src={beforeSrc} className="cl-slider-img" alt="before" draggable={false} />
        </div>

        {/* Drag handle */}
        <div className="cl-slider-handle" style={{ left:`${splitPct}%` }}
          onMouseDown={onMouseDown} onTouchStart={onTouchStart} />

        {/* Labels */}
        <div className="cl-slider-labels">
          <span className="cl-slider-tag">{scene.before} BEFORE</span>
          <span className="cl-slider-tag">{scene.after} AFTER</span>
        </div>
      </div>

      <div style={{ marginTop:".8rem", display:"flex", gap:"1.5rem", flexWrap:"wrap" }}>
        {[
          { lbl:"Location", val:`${scene.lat}, ${scene.lon}` },
          { lbl:"Time Span", val:`${scene.before}–${scene.after}` },
          { lbl:"Source", val:"NASA GIBS / Copernicus" },
          { lbl:"Resolution", val:"250m / px" },
        ].map(m => (
          <div key={m.lbl} style={{ display:"flex", flexDirection:"column", gap:".2rem" }}>
            <div style={{ fontFamily:"'Orbitron'", fontSize:".72rem", color:T.pink }}>{m.val}</div>
            <div style={{ fontSize:".5rem", color:T.dim, letterSpacing:".1em", textTransform:"uppercase" }}>{m.lbl}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Task 10: DetailPopup ─────────────────────────────────────
function DetailPopup({ event, onClose }) {
  if (!event) return null;

  const configs = {
    fire:  { color:T.fire,   icon:"🔥", title:"Wildfire Event",     badge:"NASA FIRMS",  component:<WildfireChart inPopup /> },
    quake: { color:T.accent, icon:"🌊", title:"Seismic Event",       badge:"USGS Feed",   component:<EarthquakeChart inPopup /> },
    neo:   { color:T.purple, icon:"☄️", title:"Near-Earth Object",   badge:"NASA NeoWs",  component:<AsteroidChart /> },
    iss:   { color:T.gold,   icon:"🛸", title:"ISS Position",         badge:"Open Notify", component:<ISSPanel /> },
    solar: { color:T.green,  icon:"☀️", title:"Solar Event",          badge:"DONKI",       component:<SolarChart /> },
  };
  const cfg = configs[event.type] || configs.fire;

  return (
    <div className="cl-popup-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="cl-popup" style={{ borderColor: cfg.color+"66" }}>
        <div className="cl-popup-header" style={{ borderColor: cfg.color+"33" }}>
          <div className="cl-panel-title">
            {cfg.icon} {cfg.title}
            <span style={{ fontSize:".62rem", color:T.dim, fontWeight:400 }}>— {event.label}</span>
          </div>
          <button className="cl-popup-close" onClick={onClose}>✕</button>
        </div>
        <div className="cl-popup-body">
          <div className="cl-meta-row" style={{ marginBottom:"1rem" }}>
            {[
              { lbl:"Event ID", val:`EVT-${event.id}`, col:T.dim },
              { lbl:"Type",     val:event.type.toUpperCase(), col:cfg.color },
              { lbl:"Source",   val:cfg.badge, col:T.star },
              { lbl:"Status",   val:"ACTIVE", col:T.green },
            ].map(m => (
              <div className="cl-meta-item" key={m.lbl}>
                <div className="cl-meta-val" style={{ color:m.col, fontSize:".8rem" }}>{m.val}</div>
                <div className="cl-meta-lbl">{m.lbl}</div>
              </div>
            ))}
          </div>
          {cfg.component}
        </div>
      </div>
    </div>
  );
}

// ─── Loader ───────────────────────────────────────────────────
function Loader({ color = T.accent }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
      height:120, gap:".8rem", color:T.dim, fontSize:".65rem", letterSpacing:".12em" }}>
      <div style={{
        width:16, height:16, borderRadius:"50%",
        border:`2px solid ${color}40`,
        borderTop:`2px solid ${color}`,
        animation:"spin .8s linear infinite",
      }} />
      LOADING DATA...
    </div>
  );
}

// ─── Globe Placeholder ────────────────────────────────────────
function GlobeView({ layers, onEventClick }) {
  // Compute approximate pixel coords from lat/lng for the placeholder
  const toPos = (lat, lng) => ({
    top:  `${(90 - lat) / 180 * 100}%`,
    left: `${(lng + 180) / 360 * 100}%`,
  });

  const dotColor = { fire:T.fire, quake:T.accent, neo:T.purple, iss:T.gold };

  return (
    <div className="cl-globe-placeholder">
      <div className="cl-globe-ring" />
      <div className="cl-globe-ring" />
      <div className="cl-globe-ring" />
      <div className="cl-globe-center">🌍</div>
      <div className="cl-globe-event-dots">
        {GLOBE_EVENTS
          .filter(ev => layers.find(l => l.id === (ev.type === "fire" ? "fires" : ev.type === "quake" ? "quakes" : ev.type) && l.on))
          .map(ev => (
            <div key={ev.id} className="cl-globe-dot"
              title={ev.label}
              style={{
                ...toPos(ev.lat, ev.lng),
                background: dotColor[ev.type] || T.accent,
                color: dotColor[ev.type] || T.accent,
                boxShadow:`0 0 8px ${dotColor[ev.type]}`,
              }}
              onClick={() => onEventClick(ev)}
            />
          ))
        }
      </div>
      <div className="cl-globe-label">CESIUMJS / LEAFLET — 6 DATA LAYERS</div>
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────
function Sidebar({ layers, setLayers, onLayerClick }) {
  const toggle = id => setLayers(ls => ls.map(l => l.id === id ? {...l, on:!l.on} : l));

  const now = new Date();
  const systemStats = [
    { val: layers.filter(l=>l.on).length + "/6", lbl:"Active Layers", col:T.accent },
    { val:"15m", lbl:"Poll Interval",  col:T.gold },
    { val:"247", lbl:"Active Fires",   col:T.fire },
    { val:"83",  lbl:"Quakes / 24h",   col:T.accent },
  ];

  return (
    <div className="cl-sidebar">
      <div className="cl-sidebar-section">
        <div className="cl-section-label">// Data Layers</div>
        {layers.map(l => (
          <div key={l.id} className="cl-layer-row" onClick={() => toggle(l.id)}>
            <div className="cl-layer-toggle" style={{
              borderColor: l.on ? l.color : T.dim,
              background: l.on ? l.color+"22" : "transparent",
            }}>
              <div style={{
                position:"absolute", top:2,
                left: l.on ? "calc(100% - 10px)" : 2,
                width:8, height:8, borderRadius:"50%",
                background: l.on ? l.color : T.dim,
                transition:"all .2s",
                boxShadow: l.on ? `0 0 6px ${l.color}` : "none",
              }} />
            </div>
            <span className="cl-layer-name" style={{ color: l.on ? T.star : T.dim }}>
              {l.label}
            </span>
            {l.count && (
              <span className="cl-layer-count" style={{ color: l.on ? l.color : T.dim }}>
                {l.count}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="cl-sidebar-section">
        <div className="cl-section-label">// System Stats</div>
        <div className="cl-stat-grid">
          {systemStats.map(s => (
            <div className="cl-stat-card" key={s.lbl}>
              <div className="cl-stat-val" style={{ color:s.col }}>{s.val}</div>
              <div className="cl-stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="cl-sidebar-section">
        <div className="cl-section-label">// API Endpoints</div>
        <div className="cl-endpoint-list">
          {ENDPOINTS.slice(0,6).map(e => (
            <div className="cl-endpoint" key={e.path}>
              <span className="cl-endpoint-method">{e.method}</span>
              <span className="cl-endpoint-path">{e.path}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="cl-sidebar-section">
        <div className="cl-section-label">// Non-Negotiables</div>
        {[
          "Never call NASA APIs from frontend",
          "Always hit Redis cache first",
          "Use PostGIS for geo queries",
          "Never push to main directly",
        ].map(r => (
          <div key={r} style={{ fontSize:".58rem", color:T.dim, lineHeight:1.7,
            borderLeft:`2px solid ${T.border}`, paddingLeft:".5rem", marginBottom:".3rem" }}>
            → {r}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Ticker content ───────────────────────────────────────────
const TICKER = [
  ["FIRES", "247 active"], ["KP-INDEX", "3.2 (QUIET)"],
  ["ISS ALT", "408.3 km"],  ["NEOs THIS WEEK", "6"],
  ["EARTHQUAKES", "83 / 24h"], ["AURORA LAT", "55°N+"],
  ["LARGEST FIRE", "3,840 km²"], ["CLOSEST NEO", "1.2M km"],
  ["CME STATUS", "WATCH"], ["SOLAR WIND", "520 km/s"],
].map(([k, v]) => ({ k, v }));

// ─── Clock ────────────────────────────────────────────────────
function Clock() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setT(new Date()), 1000); return () => clearInterval(id); }, []);
  return (
    <span className="cl-topbar-time">
      UTC {t.toUTCString().split(" ")[4]}
    </span>
  );
}

// ─── TABS definition ─────────────────────────────────────────
const TABS = [
  { id:"overview",  label:"Overview",       dot:T.accent },
  { id:"fires",     label:"Wildfire",       dot:T.fire   },
  { id:"quakes",    label:"Seismic",        dot:T.accent },
  { id:"iss",       label:"ISS Telemetry",  dot:T.gold   },
  { id:"solar",     label:"Solar Weather",  dot:T.green  },
  { id:"neo",       label:"Asteroids",      dot:T.purple },
  { id:"imagery",   label:"Earth Change",   dot:T.pink   },
  { id:"endpoints", label:"API Reference",  dot:T.dim    },
];

// ─── Main App ─────────────────────────────────────────────────
export default function CosmosLensApp() {
  const [tab,     setTab]     = useState("overview");
  const [layers,  setLayers]  = useState(LAYERS);
  const [popup,   setPopup]   = useState(null);

  // Inject global CSS once
  useEffect(() => {
    const id = "cl-global-style";
    if (!document.getElementById(id)) {
      const el = document.createElement("style");
      el.id = id; el.textContent = GLOBAL_CSS;
      document.head.appendChild(el);
    }
  }, []);

  const renderContent = () => {
    switch (tab) {
      case "overview": return (
        <>
          <GlobeView layers={layers} onEventClick={setPopup} />
          <ISSPanel />
          <div className="cl-chart-grid">
            <WildfireChart />
            <EarthquakeChart />
          </div>
        </>
      );
      case "fires":     return <WildfireChart />;
      case "quakes":    return <EarthquakeChart />;
      case "iss":       return <ISSPanel />;
      case "solar":     return <SolarChart />;
      case "neo":       return <AsteroidChart />;
      case "imagery":   return <BeforeAfterSlider />;
      case "endpoints": return (
        <div className="cl-panel">
          <div className="cl-panel-header">
            <div className="cl-panel-title">API Endpoint Reference</div>
            <span className="cl-badge api">FastAPI Backend</span>
          </div>
          <div style={{ color:T.dim, fontSize:".65rem", marginBottom:"1rem" }}>
            Base URL: <span style={{ color:T.accent }}>http://localhost:8000</span>
            &nbsp;·&nbsp; Frontend NEVER calls NASA APIs directly.
          </div>
          <div className="cl-endpoint-list">
            {ENDPOINTS.map(e => (
              <div className="cl-endpoint" key={e.path}
                style={{ borderColor: e.method === "WS" ? T.gold+"44" : T.border }}>
                <span className="cl-endpoint-method"
                  style={{ color: e.method === "WS" ? T.gold : T.green }}>
                  {e.method}
                </span>
                <span className="cl-endpoint-path">{e.path}</span>
                <span className="cl-endpoint-desc">{e.desc}</span>
              </div>
            ))}
          </div>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="cl-app">
      {/* Topbar */}
      <div className="cl-topbar">
        <div className="cl-logo"><span>COSMOS</span>LENS</div>
        <div className="cl-live-dot" />
        <div className="cl-ticker-wrap">
          <div className="cl-ticker">
            {[...TICKER, ...TICKER].map((item, i) => (
              <span key={i}><b>{item.k}</b>&nbsp;{item.v}</span>
            ))}
          </div>
        </div>
        <Clock />
      </div>

      {/* Nav */}
      <div className="cl-nav">
        {TABS.map(t => (
          <button key={t.id} className={`cl-nav-btn${tab === t.id ? " active" : ""}`}
            onClick={() => setTab(t.id)}>
            <span className="dot" style={{ background: t.dot }} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="cl-main">
        <Sidebar layers={layers} setLayers={setLayers} onLayerClick={setPopup} />
        <div className="cl-content" key={tab}>
          {renderContent()}
        </div>
      </div>

      {/* Task 10: Detail Popup */}
      {popup && <DetailPopup event={popup} onClose={() => setPopup(null)} />}
    </div>
  );
}


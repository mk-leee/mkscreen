import { useState, useRef, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Noto+Sans+KR:wght@300;400;500;700;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }

  :root {
    --ink:        #0f1a13;
    --ink-2:      #2a3d2e;
    --turf:       #1e4d2b;
    --turf-2:     #2d6b3e;
    --turf-3:     #3d8a52;
    --flag:       #e8c547;
    --flag-2:     #f5d96b;
    --sand:       #d4b896;
    --rough:      #f0ebe1;
    --white:      #fafaf7;
    --danger:     #d64545;
    --sky:        #4a90d9;
    --r:          14px;
    --r-sm:       8px;
    --r-lg:       20px;
  }

  body { font-family: 'Noto Sans KR', sans-serif; background: var(--ink); }

  .app-shell {
    position: relative;
    width: 390px;
    min-height: 844px;
    max-height: 844px;
    overflow: hidden;
    background: var(--rough);
    border-radius: 40px;
    box-shadow: 0 40px 100px rgba(0,0,0,.7), inset 0 0 0 1px rgba(255,255,255,.1);
    display: flex;
    flex-direction: column;
  }

  /* STATUS BAR */
  .status-bar {
    height: 44px;
    background: var(--turf);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    flex-shrink: 0;
  }
  .status-time {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 17px;
    color: var(--flag);
    letter-spacing: 1px;
  }
  .status-icons { display: flex; gap: 6px; align-items: center; }
  .status-icons svg { width: 14px; height: 14px; fill: rgba(255,255,255,.7); }

  /* SCREEN CONTAINER */
  .screen-wrap {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
  }
  .screen-wrap::-webkit-scrollbar { display: none; }

  /* ── SCREEN 1: MAIN ── */
  .main-screen { min-height: 100%; display: flex; flex-direction: column; }

  .main-header {
    background: linear-gradient(160deg, var(--turf) 0%, var(--ink-2) 100%);
    padding: 20px 24px 32px;
    position: relative;
    overflow: hidden;
  }
  .main-header::before {
    content: '⛳';
    position: absolute;
    right: -10px;
    top: -20px;
    font-size: 120px;
    opacity: .06;
  }
  .main-header-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .app-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 28px;
    color: var(--flag);
    letter-spacing: 2px;
    line-height: 1;
  }
  .app-subtitle { font-size: 11px; color: rgba(255,255,255,.5); margin-top: 2px; letter-spacing: .5px; }

  .stats-row { display: flex; gap: 12px; }
  .stat-pill {
    flex: 1;
    background: rgba(255,255,255,.08);
    border: 1px solid rgba(255,255,255,.12);
    border-radius: 12px;
    padding: 10px 12px;
  }
  .stat-val { font-family: 'Bebas Neue', sans-serif; font-size: 22px; color: var(--flag); letter-spacing: 1px; }
  .stat-lbl { font-size: 10px; color: rgba(255,255,255,.5); text-transform: uppercase; letter-spacing: .5px; }

  .new-match-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 44px; height: 44px;
    background: var(--flag);
    border: none;
    border-radius: 12px;
    cursor: pointer;
    font-size: 20px;
    transition: transform .15s, box-shadow .15s;
    box-shadow: 0 4px 12px rgba(232,197,71,.4);
  }
  .new-match-btn:active { transform: scale(.93); }

  .match-list { flex: 1; padding: 16px; display: flex; flex-direction: column; gap: 10px; }

  .match-card {
    background: var(--white);
    border-radius: var(--r-lg);
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0,0,0,.06);
    cursor: pointer;
    transition: transform .15s, box-shadow .15s;
    border: 1.5px solid rgba(0,0,0,.05);
  }
  .match-card:active { transform: scale(.98); box-shadow: 0 4px 24px rgba(0,0,0,.12); }

  .match-card-stripe {
    height: 5px;
    background: linear-gradient(90deg, var(--turf-2), var(--turf-3));
  }
  .match-card-stripe.done { background: linear-gradient(90deg, #aaa, #ccc); }

  .match-card-body { padding: 14px 16px; }
  .match-card-row1 { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
  .match-course { font-weight: 900; font-size: 17px; color: var(--ink); }
  .match-date { font-size: 11px; color: #999; margin-top: 2px; }
  .match-badge {
    font-size: 10px;
    font-weight: 700;
    padding: 3px 9px;
    border-radius: 20px;
    letter-spacing: .3px;
  }
  .badge-live { background: rgba(61,138,82,.15); color: var(--turf-2); border: 1px solid rgba(61,138,82,.3); }
  .badge-done { background: #f0f0f0; color: #999; }

  .match-players { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
  .avatar-chip {
    display: flex; align-items: center; gap: 5px;
    padding: 4px 10px 4px 5px;
    border-radius: 20px;
    font-size: 12px; font-weight: 500;
  }
  .avatar-dot { width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: white; }

  .progress-row { display: flex; align-items: center; gap: 8px; }
  .progress-track { flex: 1; height: 4px; background: #eee; border-radius: 2px; overflow: hidden; }
  .progress-fill { height: 100%; background: linear-gradient(90deg, var(--turf-2), var(--turf-3)); border-radius: 2px; transition: width .4s; }
  .progress-txt { font-size: 11px; color: #aaa; white-space: nowrap; }

  /* ── SCREEN 2: CREATE MATCH ── */
  .create-screen { min-height: 100%; background: var(--rough); }

  .nav-header {
    background: var(--white);
    padding: 12px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid rgba(0,0,0,.06);
    position: sticky; top: 0; z-index: 10;
  }
  .back-btn {
    width: 36px; height: 36px;
    background: var(--rough);
    border: none; border-radius: 10px;
    cursor: pointer; font-size: 18px;
    display: flex; align-items: center; justify-content: center;
    transition: background .15s;
  }
  .back-btn:active { background: #ddd; }
  .nav-title { font-weight: 900; font-size: 17px; color: var(--ink); }

  .form-section { padding: 20px; display: flex; flex-direction: column; gap: 20px; }

  .field-group { display: flex; flex-direction: column; gap: 6px; }
  .field-label { font-size: 11px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: .6px; }

  .text-input {
    width: 100%;
    padding: 14px 16px;
    background: var(--white);
    border: 2px solid transparent;
    border-radius: var(--r);
    font-family: 'Noto Sans KR', sans-serif;
    font-size: 16px; font-weight: 500;
    color: var(--ink);
    outline: none;
    transition: border-color .2s;
    -webkit-appearance: none;
  }
  .text-input:focus { border-color: var(--turf-2); }
  .text-input::placeholder { color: #ccc; }

  .seg-control { display: flex; background: var(--white); border-radius: var(--r); padding: 3px; gap: 3px; }
  .seg-btn {
    flex: 1; padding: 10px 4px;
    background: transparent;
    border: none; border-radius: 10px;
    font-family: 'Noto Sans KR', sans-serif;
    font-size: 13px; font-weight: 600;
    color: #aaa; cursor: pointer;
    transition: all .2s;
  }
  .seg-btn.active { background: var(--turf); color: var(--flag); box-shadow: 0 2px 8px rgba(30,77,43,.3); }

  .amount-row { display: flex; gap: 6px; }
  .amount-preset {
    flex: 1; padding: 10px 4px;
    background: var(--white);
    border: 2px solid transparent;
    border-radius: var(--r-sm);
    font-family: 'Noto Sans KR', sans-serif;
    font-size: 13px; font-weight: 700;
    color: #aaa; cursor: pointer;
    text-align: center;
    transition: all .15s;
  }
  .amount-preset.active { border-color: var(--turf-2); color: var(--turf-2); background: rgba(45,107,62,.08); }

  .player-grid { display: flex; flex-direction: column; gap: 8px; }
  .player-select-row {
    display: flex; align-items: center; gap: 12px;
    background: var(--white);
    border: 2px solid transparent;
    border-radius: var(--r);
    padding: 12px 14px;
    cursor: pointer;
    transition: all .15s;
  }
  .player-select-row.selected { border-color: var(--turf-2); background: rgba(45,107,62,.06); }
  .player-select-avatar { width: 38px; height: 38px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 900; color: white; flex-shrink: 0; }
  .player-select-name { flex: 1; font-size: 15px; font-weight: 700; color: var(--ink); }
  .player-select-hc { font-size: 11px; color: #aaa; }
  .check-icon { width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; transition: all .2s; }
  .check-icon.on { background: var(--turf-2); color: white; }
  .check-icon.off { background: #eee; color: transparent; }

  .start-btn {
    width: 100%;
    padding: 16px;
    background: linear-gradient(135deg, var(--turf), var(--turf-2));
    border: none; border-radius: var(--r-lg);
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px; letter-spacing: 2px;
    color: var(--flag);
    cursor: pointer;
    box-shadow: 0 6px 20px rgba(30,77,43,.35);
    transition: transform .15s, box-shadow .15s;
  }
  .start-btn:active { transform: scale(.97); box-shadow: 0 3px 10px rgba(30,77,43,.2); }
  .start-btn:disabled { opacity: .4; pointer-events: none; }

  /* ── SCREEN 3: SCORECARD ── */
  .score-screen { min-height: 100%; display: flex; flex-direction: column; background: var(--rough); }

  .score-header {
    background: linear-gradient(160deg, var(--turf) 0%, var(--ink-2) 100%);
    padding: 16px 20px 20px;
  }
  .score-header-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .score-course { font-family: 'Bebas Neue', sans-serif; font-size: 22px; color: var(--flag); letter-spacing: 1.5px; }
  .score-meta { font-size: 11px; color: rgba(255,255,255,.5); }

  .hole-nav { display: flex; align-items: center; gap: 8px; }
  .hole-dots { display: flex; gap: 4px; flex: 1; }
  .hole-dot {
    flex: 1; height: 4px; border-radius: 2px;
    background: rgba(255,255,255,.2);
    transition: background .3s;
  }
  .hole-dot.done { background: var(--flag); }
  .hole-dot.current { background: white; }
  .hole-nav-btn {
    width: 36px; height: 36px;
    background: rgba(255,255,255,.12);
    border: none; border-radius: 10px;
    color: white; font-size: 16px;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: background .15s;
    flex-shrink: 0;
  }
  .hole-nav-btn:active { background: rgba(255,255,255,.25); }
  .hole-nav-btn:disabled { opacity: .3; pointer-events: none; }

  .hole-info-bar {
    background: var(--white);
    display: flex; align-items: center;
    padding: 10px 20px; gap: 12px;
    border-bottom: 1px solid rgba(0,0,0,.06);
  }
  .hole-number { font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: var(--turf); letter-spacing: 1px; line-height: 1; }
  .hole-par-badge {
    background: var(--turf);
    color: var(--flag);
    font-family: 'Bebas Neue', sans-serif;
    font-size: 14px; letter-spacing: 1px;
    padding: 4px 10px; border-radius: 8px;
  }
  .hole-carry {
    margin-left: auto;
    background: rgba(232,197,71,.15);
    color: #9a7a00;
    font-size: 12px; font-weight: 700;
    padding: 4px 10px; border-radius: 8px;
    border: 1px solid rgba(232,197,71,.3);
  }

  .score-entries { flex: 1; padding: 12px 16px; display: flex; flex-direction: column; gap: 8px; }

  .score-row {
    background: var(--white);
    border-radius: var(--r-lg);
    padding: 14px 16px;
    display: flex; align-items: center; gap: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,.05);
    transition: transform .1s;
    position: relative;
    overflow: hidden;
  }
  .score-row::before {
    content: '';
    position: absolute; left: 0; top: 0; bottom: 0;
    width: 4px;
  }
  .score-row.winner::before { background: var(--flag); }
  .score-row.losing::before { background: #f0e0e0; }

  .score-player-info { flex: 1; min-width: 0; }
  .score-player-name { font-weight: 900; font-size: 15px; color: var(--ink); }
  .score-delta {
    font-size: 12px; font-weight: 700; margin-top: 1px;
  }
  .delta-win { color: #2a7a3d; }
  .delta-lose { color: var(--danger); }
  .delta-tie { color: #999; }

  .score-stepper { display: flex; align-items: center; gap: 0; }
  .step-btn {
    width: 40px; height: 40px;
    border: none; border-radius: 12px;
    font-size: 20px; font-weight: 300;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all .12s;
    line-height: 1;
  }
  .step-btn.minus { background: #fef0f0; color: var(--danger); }
  .step-btn.plus  { background: rgba(45,107,62,.1); color: var(--turf-2); }
  .step-btn:active { transform: scale(.88); }
  .step-val {
    width: 52px; height: 40px;
    background: var(--rough);
    border: none; border-radius: 8px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 26px; letter-spacing: 1px;
    color: var(--ink);
    text-align: center;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    margin: 0 4px;
    transition: background .1s;
    user-select: none;
  }
  .step-val.editing { background: rgba(45,107,62,.12); color: var(--turf); }

  .hole-action-row { padding: 12px 16px 16px; display: flex; gap: 8px; }
  .btn-next {
    flex: 1; padding: 15px;
    background: linear-gradient(135deg, var(--turf), var(--turf-2));
    border: none; border-radius: var(--r-lg);
    font-family: 'Bebas Neue', sans-serif;
    font-size: 20px; letter-spacing: 1.5px;
    color: var(--flag); cursor: pointer;
    box-shadow: 0 4px 16px rgba(30,77,43,.3);
    transition: transform .15s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .btn-next:active { transform: scale(.97); }
  .btn-summary {
    padding: 15px 18px;
    background: rgba(232,197,71,.15);
    border: 2px solid rgba(232,197,71,.4);
    border-radius: var(--r-lg);
    font-family: 'Bebas Neue', sans-serif;
    font-size: 14px; letter-spacing: 1px;
    color: #9a7a00; cursor: pointer;
    transition: all .15s;
    white-space: nowrap;
  }
  .btn-summary:active { background: rgba(232,197,71,.25); }

  /* ── SCREEN 4: RESULTS ── */
  .result-screen { min-height: 100%; background: var(--ink); }

  .result-hero {
    background: linear-gradient(160deg, var(--turf) 0%, var(--ink) 60%);
    padding: 20px 24px 40px;
    position: relative;
    overflow: hidden;
  }
  .result-hero::after {
    content: '';
    position: absolute; bottom: 0; left: 0; right: 0; height: 40px;
    background: linear-gradient(0deg, var(--rough) 0%, transparent 100%);
  }
  .result-header-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .result-title { font-family: 'Bebas Neue', sans-serif; font-size: 26px; color: var(--flag); letter-spacing: 2px; }

  .winner-spotlight {
    text-align: center;
    padding: 8px 0;
  }
  .winner-crown { font-size: 32px; animation: float 2s ease-in-out infinite; }
  @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
  .winner-avatar-lg {
    width: 72px; height: 72px;
    border-radius: 22px;
    display: flex; align-items: center; justify-content: center;
    font-size: 28px; font-weight: 900; color: white;
    margin: 8px auto;
    border: 3px solid var(--flag);
    box-shadow: 0 0 0 6px rgba(232,197,71,.2);
  }
  .winner-name { font-family: 'Bebas Neue', sans-serif; font-size: 24px; color: white; letter-spacing: 1px; }
  .winner-amount { font-family: 'Bebas Neue', sans-serif; font-size: 36px; color: var(--flag); letter-spacing: 1px; line-height: 1.1; }
  .winner-strokes { font-size: 12px; color: rgba(255,255,255,.5); margin-top: 2px; }

  .result-body { background: var(--rough); padding: 16px; display: flex; flex-direction: column; gap: 10px; }

  .result-card {
    background: var(--white);
    border-radius: var(--r-lg);
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0,0,0,.06);
  }
  .result-card-header {
    padding: 12px 16px 8px;
    font-size: 11px; font-weight: 700;
    color: #888; text-transform: uppercase; letter-spacing: .6px;
    border-bottom: 1px solid rgba(0,0,0,.05);
  }

  .ranking-row {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(0,0,0,.04);
    transition: background .1s;
  }
  .ranking-row:last-child { border-bottom: none; }
  .rank-num {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px; letter-spacing: .5px;
    width: 28px; text-align: center; flex-shrink: 0;
  }
  .rank-1 { color: var(--flag); }
  .rank-2 { color: #aaa; }
  .rank-3 { color: #cd7f32; }
  .rank-4 { color: #ddd; }
  .rank-avatar { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 900; color: white; flex-shrink: 0; }
  .rank-info { flex: 1; min-width: 0; }
  .rank-name { font-weight: 900; font-size: 15px; color: var(--ink); }
  .rank-detail { font-size: 11px; color: #aaa; margin-top: 1px; }
  .rank-amount { text-align: right; }
  .rank-money { font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: .5px; }
  .rank-money.plus { color: #2a7a3d; }
  .rank-money.minus { color: var(--danger); }
  .rank-money.zero { color: #ccc; }
  .rank-wins { font-size: 10px; color: #aaa; text-align: right; margin-top: 1px; }

  .hole-timeline { display: flex; flex-direction: column; }
  .hole-timeline-row {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 16px;
    border-bottom: 1px solid rgba(0,0,0,.04);
  }
  .hole-timeline-row:last-child { border-bottom: none; }
  .ht-num {
    width: 28px; height: 28px;
    background: var(--turf);
    color: white; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700; flex-shrink: 0;
  }
  .ht-num.tie { background: #ddd; color: #888; }
  .ht-winner { font-weight: 700; font-size: 13px; color: var(--ink); flex: 1; }
  .ht-scores { display: flex; gap: 4px; }
  .ht-score-badge { font-size: 11px; padding: 2px 7px; border-radius: 6px; font-weight: 600; }

  .share-row { padding: 12px 16px 16px; }
  .share-btn {
    width: 100%;
    padding: 15px;
    background: var(--ink);
    border: none; border-radius: var(--r-lg);
    font-family: 'Bebas Neue', sans-serif;
    font-size: 20px; letter-spacing: 2px;
    color: var(--flag); cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: opacity .15s;
  }
  .share-btn:active { opacity: .8; }

  /* ── QUICK-SCORE SHEET (modal) ── */
  .quick-sheet-overlay {
    position: absolute; inset: 0;
    background: rgba(0,0,0,.5);
    backdrop-filter: blur(4px);
    z-index: 50;
    display: flex; align-items: flex-end;
  }
  .quick-sheet {
    background: var(--white);
    border-radius: 24px 24px 0 0;
    padding: 16px 20px 28px;
    width: 100%;
    animation: sheetUp .25s cubic-bezier(.34,1.56,.64,1);
  }
  @keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
  .quick-sheet-handle { width: 36px; height: 4px; background: #ddd; border-radius: 2px; margin: 0 auto 14px; }
  .quick-sheet-title { font-size: 12px; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 12px; }
  .numpad { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; }
  .numpad-key {
    padding: 16px;
    background: var(--rough);
    border: none; border-radius: var(--r);
    font-family: 'Bebas Neue', sans-serif;
    font-size: 26px; color: var(--ink);
    cursor: pointer; text-align: center;
    transition: transform .1s, background .1s;
  }
  .numpad-key:active { transform: scale(.93); background: var(--sand); }
  .numpad-key.action { background: var(--turf); color: var(--flag); }
  .numpad-key.del { background: #fee; color: var(--danger); }

  /* ── COMPONENT LABELS (annotation overlay) ── */
  .comp-label {
    position: absolute;
    background: rgba(232,197,71,.9);
    color: var(--ink);
    font-size: 9px; font-weight: 900;
    padding: 2px 6px;
    border-radius: 4px;
    letter-spacing: .3px;
    text-transform: uppercase;
    pointer-events: none;
    z-index: 20;
    white-space: nowrap;
  }

  /* ── SCREEN SELECTOR TABS (demo only) ── */
  .demo-tabs {
    display: flex; gap: 1px;
    background: rgba(0,0,0,.3);
    border-radius: 0 0 40px 40px;
    overflow: hidden;
  }
  .demo-tab {
    flex: 1; padding: 12px 6px;
    background: rgba(20,40,25,.8);
    border: none;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 12px; letter-spacing: 1px;
    color: rgba(255,255,255,.5);
    cursor: pointer; text-align: center;
    transition: all .15s;
  }
  .demo-tab.active { background: var(--turf-2); color: var(--flag); }
  .demo-tab:first-child { border-radius: 0 0 0 40px; }
  .demo-tab:last-child { border-radius: 0 0 40px 0; }
`;

// ─────────────────────────────────────────────
// DATA & HELPERS
// ─────────────────────────────────────────────
const COLORS = ["#2d6b3e", "#4a90d9", "#d64545", "#9b59b6"];

const SAMPLE_PLAYERS = [
  { id: "p1", name: "김민준", hc: 5 },
  { id: "p2", name: "이서연", hc: null },
  { id: "p3", name: "박도윤", hc: 12 },
  { id: "p4", name: "최하은", hc: 8 },
];

const SAMPLE_SCORES = {
  p1: [4,3,5,4,4,3,5,4,4,4,3,5,4,4,3,5,4,4],
  p2: [5,4,4,5,3,4,4,5,5,5,4,4,5,3,4,4,5,5],
  p3: [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
  p4: [3,4,5,4,5,3,5,3,4,3,3,5,4,5,3,5,3,4],
};

const PAR = [4,4,3,4,5,3,4,5,4,4,4,3,5,4,4,3,5,4];

const SAMPLE_MATCHES = [
  { id: "m1", course: "파인밸리 CC", date: "2025-06-12", players: SAMPLE_PLAYERS, scores: SAMPLE_SCORES, mode: "diff", amount: 1000, done: true },
  { id: "m2", course: "블루원 리조트", date: "2025-06-19", players: SAMPLE_PLAYERS.slice(0,3), scores: {}, mode: "skin", amount: 2000, done: false, progress: 11 },
];

function calcResults(players, scores, mode, amount) {
  const earnings = Object.fromEntries(players.map(p => [p.id, 0]));
  const wins = Object.fromEntries(players.map(p => [p.id, 0]));
  const holeResults = [];

  if (mode === "skin") {
    // ── 스킨 방식: 단독 최저타 시 적립 팟 전체 획득, 타이 시 이월 ──
    let pot = 0;
    for (let h = 0; h < 18; h++) {
      const hScores = players.map(p => ({ id: p.id, s: scores[p.id]?.[h] || 0 })).filter(x => x.s > 0);
      if (hScores.length < 2) { holeResults.push(null); continue; }

      // 각 참여자가 기본금액씩 팟에 적립
      pot += amount * hScores.length;
      const min = Math.min(...hScores.map(x => x.s));
      const winners = hScores.filter(x => x.s === min);

      if (winners.length === 1) {
        const w = winners[0];
        wins[w.id]++;
        const share = pot / hScores.length; // 1인당 기여분
        hScores.forEach(x => {
          earnings[x.id] += x.id === w.id ? pot - share : -share;
        });
        holeResults.push({ winnerId: w.id, pot, scores: hScores });
        pot = 0;
      } else {
        // 타이: 다음 홀로 이월
        holeResults.push({ tie: true, pot, scores: hScores });
      }
    }
  } else {
    // ── 타수차 방식: 최저타 대비 차이 × 기본금액 정산 ──
    for (let h = 0; h < 18; h++) {
      const hScores = players.map(p => ({ id: p.id, s: scores[p.id]?.[h] || 0 })).filter(x => x.s > 0);
      if (hScores.length < 2) { holeResults.push(null); continue; }
      const min = Math.min(...hScores.map(x => x.s));
      const winners = hScores.filter(x => x.s === min);
      if (winners.length > 1) { holeResults.push({ tie: true, scores: hScores }); continue; }
      const w = winners[0];
      wins[w.id]++;
      let pay = 0;
      hScores.forEach(x => {
        if (x.id !== w.id) { const d = (x.s - min) * amount; earnings[x.id] -= d; pay += d; }
      });
      earnings[w.id] += pay;
      holeResults.push({ winnerId: w.id, scores: hScores });
    }
  }

  const totalStrokes = Object.fromEntries(players.map(p => [p.id, (scores[p.id] || []).reduce((a,b)=>a+b,0)]));
  const summary = players.map(p => ({ ...p, earnings: Math.round(earnings[p.id]), wins: wins[p.id], strokes: totalStrokes[p.id] })).sort((a,b) => b.earnings - a.earnings);
  return { summary, holeResults };
}

// 최소 거래로 정산: 채권자-채무자 매칭
function calcSettlements(players, summary) {
  const bal = players.map(p => {
    const s = summary.find(x => x.id === p.id);
    return { p, amt: s ? s.earnings : 0 };
  });
  const txns = [];
  for (let i = 0; i < 50; i++) {
    const debtors   = bal.filter(b => b.amt < -1).sort((a,b) => a.amt - b.amt);
    const creditors = bal.filter(b => b.amt >  1).sort((a,b) => b.amt - a.amt);
    if (!debtors.length || !creditors.length) break;
    const d = debtors[0], c = creditors[0];
    const amt = Math.min(Math.abs(d.amt), c.amt);
    txns.push({ from: d.p, to: c.p, amt: Math.round(amt) });
    d.amt += amt;
    c.amt -= amt;
  }
  return txns;
}

function fmt(n) { return (n > 0 ? "+" : "") + n.toLocaleString() + "원"; }

// pid를 players 배열 인덱스로 찾아 색상 반환 — SAMPLE_PLAYERS 의존성 제거
function colorForIdx(idx) { return COLORS[((idx % COLORS.length) + COLORS.length) % COLORS.length]; }

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────

function StatusBar() {
  const now = new Date();
  const t = `${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`;
  return (
    <div className="status-bar">
      <span className="status-time">{t}</span>
      <div className="status-icons">
        <svg viewBox="0 0 24 24"><path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.56 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" stroke="rgba(255,255,255,.6)" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>
        <svg viewBox="0 0 24 24"><path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" stroke="rgba(255,255,255,.8)" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>
        <svg viewBox="0 0 24 24"><rect x="2" y="7" width="18" height="11" rx="2" stroke="rgba(255,255,255,.8)" strokeWidth="2" fill="none"/><path d="M22 11v3" stroke="rgba(255,255,255,.8)" strokeWidth="2" strokeLinecap="round"/><rect x="4" y="9" width="10" height="7" rx="1" fill="rgba(255,255,255,.8)"/></svg>
      </div>
    </div>
  );
}

function AvatarChip({ player, idx }) {
  const c = colorForIdx(idx);
  return (
    <span className="avatar-chip" style={{ background: c + "18" }}>
      <span className="avatar-dot" style={{ background: c }}>{player.name[0]}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: c }}>{player.name}</span>
    </span>
  );
}

// ─────────────────────────────────────────────
// SCREEN 1 — MAIN (Match List)
// ─────────────────────────────────────────────
function Screen1Main({ onNew, onSelect }) {
  // 실제 샘플 데이터 기반 통계 계산
  const now = new Date();
  const monthMatches = SAMPLE_MATCHES.filter(m => {
    const d = new Date(m.date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
  const allEarnings = SAMPLE_MATCHES.filter(m => m.done && m.scores).reduce((sum, m) => {
    const { summary } = calcResults(m.players, m.scores, m.mode, m.amount);
    const me = summary.find(p => p.id === "p1");
    return sum + (me?.earnings || 0);
  }, 0);
  const teammates = new Set(SAMPLE_MATCHES.flatMap(m => m.players.map(p => p.id).filter(id => id !== "p1"))).size;

  return (
    <div className="main-screen">
      {/* ① AppHeader */}
      <div className="main-header">
        <div className="main-header-top">
          <div>
            <div className="app-title">⛳ 타당정산</div>
            <div className="app-subtitle">SCREEN GOLF · BET MANAGER</div>
          </div>
          <button className="new-match-btn" onClick={onNew}>＋</button>
        </div>
        {/* ② StatsRow */}
        <div className="stats-row">
          {[
            [String(monthMatches.length), "이번 달 경기"],
            [fmt(allEarnings), "누적 수익"],
            [String(teammates), "함께한 동료"],
          ].map(([v,l]) => (
            <div className="stat-pill" key={l}>
              <div className="stat-val">{v}</div>
              <div className="stat-lbl">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ③ MatchList */}
      <div className="match-list">
        <div style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 4 }}>최근 경기</div>
        {SAMPLE_MATCHES.map(m => (
          <div className="match-card" key={m.id} onClick={() => onSelect(m)}>
            <div className={`match-card-stripe ${m.done ? "done" : ""}`} />
            <div className="match-card-body">
              <div className="match-card-row1">
                <div>
                  {/* ④ MatchTitle */}
                  <div className="match-course">{m.course}</div>
                  <div className="match-date">{m.date} · {m.mode === "skin" ? "스킨스" : "타수차"} · {m.amount.toLocaleString()}원</div>
                </div>
                <div className={`match-badge ${m.done ? "badge-done" : "badge-live"}`}>
                  {m.done ? "완료" : `${m.progress || 0}/18H`}
                </div>
              </div>
              {/* ⑤ PlayerChips */}
              <div className="match-players">
                {m.players.map((p, i) => <AvatarChip key={p.id} player={p} idx={i} />)}
              </div>
              {/* ⑥ ProgressBar */}
              <div className="progress-row">
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: m.done ? "100%" : `${(m.progress||0)/18*100}%` }} />
                </div>
                <span className="progress-txt">{m.done ? "18/18H" : `${m.progress||0}/18H`}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SCREEN 2 — CREATE MATCH
// ─────────────────────────────────────────────
function Screen2Create({ onBack, onStart }) {
  const [course, setCourse] = useState("");
  const [mode, setMode] = useState("diff");
  const [amount, setAmount] = useState(1000);
  const [selected, setSelected] = useState([]);

  const toggle = (id) => setSelected(s => s.includes(id) ? s.filter(x=>x!==id) : s.length < 4 ? [...s, id] : s);
  const canStart = course.trim() && selected.length >= 2;

  return (
    <div className="create-screen">
      {/* ① NavHeader */}
      <div className="nav-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <div className="nav-title">새 경기 만들기</div>
      </div>

      <div className="form-section">
        {/* ② CourseInput */}
        <div className="field-group">
          <label className="field-label">⛳ 코스명</label>
          <input className="text-input" placeholder="파인밸리 CC" value={course} onChange={e=>setCourse(e.target.value)} />
        </div>

        {/* ③ BetModeSegment */}
        <div className="field-group">
          <label className="field-label">🎯 내기 방식</label>
          <div className="seg-control">
            {[["diff","⚡ 타수차 방식"],["skin","🎯 스킨스 방식"]].map(([v,l]) => (
              <button key={v} className={`seg-btn ${mode===v?"active":""}`} onClick={()=>setMode(v)}>{l}</button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: "#aaa", marginTop: 4, paddingLeft: 4 }}>
            {mode === "diff" ? "타수 차이만큼 × 기본금액 정산" : "단독 최저타 시 팟 획득, 타이 시 이월"}
          </div>
        </div>

        {/* ④ AmountPicker */}
        <div className="field-group">
          <label className="field-label">💰 홀당 기본 금액</label>
          <div className="amount-row">
            {[500,1000,2000,5000].map(v => (
              <button key={v} className={`amount-preset ${amount===v?"active":""}`} onClick={()=>setAmount(v)}>
                {v >= 1000 ? `${v/1000}천` : `${v}`}
              </button>
            ))}
          </div>
        </div>

        {/* ⑤ PlayerSelector */}
        <div className="field-group">
          <label className="field-label">👥 참가자 선택 ({selected.length}/4)</label>
          <div className="player-grid">
            {SAMPLE_PLAYERS.map((p, i) => {
              const on = selected.includes(p.id);
              return (
                <div key={p.id} className={`player-select-row ${on?"selected":""}`} onClick={()=>toggle(p.id)}>
                  <div className="player-select-avatar" style={{ background: COLORS[i] }}>{p.name[0]}</div>
                  <div className="player-select-info" style={{ flex:1 }}>
                    <div className="player-select-name">{p.name}</div>
                    <div className="player-select-hc">{p.hc ? `핸디 ${p.hc}타` : "핸디 없음"}</div>
                  </div>
                  <div className={`check-icon ${on?"on":"off"}`}>{on?"✓":""}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ⑥ StartButton */}
        <button className="start-btn" disabled={!canStart} onClick={() => onStart({ course, mode, amount, players: SAMPLE_PLAYERS.filter(p=>selected.includes(p.id)) })}>
          ⛳ 경기 시작
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SCREEN 3 — SCORECARD
// ─────────────────────────────────────────────
function Screen3Score({ match, scores, onScoreChange, onBack, onFinish }) {
  const players = match?.players || SAMPLE_PLAYERS;
  const [hole, setHole] = useState(0); // 0-indexed
  const [quickTarget, setQuickTarget] = useState(null);

  // scores는 App 레벨에서 관리 (prop으로 수신)
  const setScore = useCallback((pid, val) => {
    onScoreChange(prev => {
      const arr = [...(prev[pid] || new Array(18).fill(0))];
      // val===0은 "미입력" 초기화, 그 외 1~20 클램프
      arr[hole] = val === 0 ? 0 : Math.max(1, Math.min(20, val));
      return { ...prev, [pid]: arr };
    });
  }, [hole, onScoreChange]);

  // Min score this hole for delta display (0은 미입력이므로 제외)
  const holeVals = players.map(p => scores[p.id]?.[hole] || 0).filter(v => v > 0);
  const minScore = holeVals.length ? Math.min(...holeVals) : null;

  const allFilled = players.every(p => (scores[p.id]?.[hole] || 0) > 0);
  const completedHoles = Array.from({ length: 18 }, (_, hi) =>
    players.every(p => (scores[p.id]?.[hi] || 0) > 0)
  ).filter(Boolean).length;

  // 스킨 모드 실제 적립 팟 계산
  const skinPot = (() => {
    if (match?.mode !== "skin") return 0;
    let pot = 0;
    for (let h = 0; h < hole; h++) {
      const hVals = players.map(p => scores[p.id]?.[h] || 0).filter(v => v > 0);
      if (hVals.length < 2) continue;
      const min = Math.min(...hVals);
      const winners = hVals.filter(v => v === min);
      pot += (match?.amount || 1000) * hVals.length;
      if (winners.length === 1) pot = 0; // 단독 승자가 팟 수거
    }
    return pot;
  })();

  return (
    <div className="score-screen">
      {/* ① ScoreHeader */}
      <div className="score-header">
        <div className="score-header-top">
          <div>
            <div className="score-course">{match?.course || "파인밸리 CC"}</div>
            <div className="score-meta">{players.length}명 · {match?.mode==="skin"?"스킨스":"타수차"} · {(match?.amount||1000).toLocaleString()}원</div>
          </div>
          <button className="back-btn" style={{ background: "rgba(255,255,255,.12)", color: "white" }} onClick={onBack}>←</button>
        </div>
        {/* ② HoleDots + Nav */}
        <div className="hole-nav">
          <button className="hole-nav-btn" disabled={hole===0} onClick={()=>setHole(h=>h-1)}>‹</button>
          <div className="hole-dots">
            {Array.from({length:18},(_,i) => (
              <div key={i} className={`hole-dot ${i<hole?"done":i===hole?"current":""}`} onClick={()=>setHole(i)} style={{cursor:"pointer"}} />
            ))}
          </div>
          <button className="hole-nav-btn" disabled={hole===17} onClick={()=>setHole(h=>h+1)}>›</button>
        </div>
      </div>

      {/* ③ HoleInfoBar */}
      <div className="hole-info-bar">
        <div className="hole-number">HOLE {hole+1}</div>
        <div className="hole-par-badge">PAR {PAR[hole]}</div>
        {completedHoles > 0 && <div style={{ fontSize: 11, color: "#aaa", marginLeft: 4 }}>{completedHoles}/18 완료</div>}
        {match?.mode === "skin" && skinPot > 0 && (
          <div className="hole-carry">팟 ₩{skinPot.toLocaleString()} 이월</div>
        )}
      </div>

      {/* ④ ScoreRows */}
      <div className="score-entries">
        {players.map((p, i) => {
          const v = scores[p.id]?.[hole] || 0;
          const isMin = v > 0 && minScore !== null && v === minScore;
          const isWinner = isMin && holeVals.filter(x=>x===minScore).length === 1;
          const delta = v > 0 && minScore ? v - minScore : null;
          return (
            <div key={p.id} className={`score-row ${isWinner?"winner":v>0&&!isMin?"losing":""}`}>
              {/* PlayerInfo */}
              <div className="score-player-info">
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:34, height:34, borderRadius:10, background:COLORS[i], display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:900, fontSize:14 }}>{p.name[0]}</div>
                  <div>
                    <div className="score-player-name">{p.name}</div>
                    {/* DeltaBadge */}
                    <div className={`score-delta ${isWinner?"delta-win":delta>0?"delta-lose":"delta-tie"}`}>
                      {isWinner ? "🏆 이번홀 승" : delta > 0 ? `+${delta}타 · -${(delta*(match?.amount||1000)).toLocaleString()}원` : v > 0 ? "⚖️ 타이" : "미입력"}
                    </div>
                  </div>
                </div>
              </div>
              {/* ⑤ ScoreStepper */}
              <div className="score-stepper">
                <button className="step-btn minus" onClick={()=>setScore(p.id, v > 1 ? v-1 : 0)}>−</button>
                <div className="step-val" style={v>0?{color:colorForIdx(i)}:{}} onClick={()=>setQuickTarget(p.id)}>
                  {v || "·"}
                </div>
                <button className="step-btn plus" onClick={()=>setScore(p.id, v > 0 ? v+1 : PAR[hole])}>+</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ⑥ ActionRow */}
      <div className="hole-action-row">
        {hole < 17 ? (
          <button className="btn-next" onClick={()=>setHole(h=>h+1)}>
            다음 홀 <span style={{fontSize:18}}>→</span>
          </button>
        ) : (
          <button className="btn-next" style={{background:"linear-gradient(135deg,#9a7000,var(--flag))"}} onClick={onFinish}>
            🏆 경기 종료
          </button>
        )}
        <button className="btn-summary" onClick={onFinish}>결과보기</button>
      </div>

      {/* ⑦ QuickNumpad Sheet */}
      {quickTarget && (
        <div className="quick-sheet-overlay" onClick={()=>setQuickTarget(null)}>
          <div className="quick-sheet" onClick={e=>e.stopPropagation()}>
            <div className="quick-sheet-handle"/>
            <div className="quick-sheet-title">
              {players.find(p=>p.id===quickTarget)?.name} — HOLE {hole+1} 타수
            </div>
            <div className="numpad">
              {[1,2,3,4,5,6,7,8,9].map(n => (
                <button key={n} className="numpad-key" onClick={()=>{setScore(quickTarget,n);setQuickTarget(null);}}>
                  {n}
                </button>
              ))}
              {/* 삭제: setScore(0)으로 미입력 상태로 복원 (Math.max 클램프 우회) */}
              <button className="numpad-key del" onClick={()=>{
                onScoreChange(prev => {
                  const arr = [...(prev[quickTarget] || new Array(18).fill(0))];
                  arr[hole] = 0;
                  return { ...prev, [quickTarget]: arr };
                });
                setQuickTarget(null);
              }}>⌫</button>
              <button className="numpad-key" onClick={()=>{setScore(quickTarget,10);setQuickTarget(null);}}>10</button>
              <button className="numpad-key action" onClick={()=>setQuickTarget(null)}>✓</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// SCREEN 4 — RESULTS
// ─────────────────────────────────────────────
function Screen4Results({ match, scores, onBack, onNewMatch }) {
  const m = match || SAMPLE_MATCHES[0];
  const players = m.players;
  // 실제 입력 스코어 우선, 없으면 match.scores, 그것도 없으면 샘플
  const effectiveScores = (scores && Object.keys(scores).length > 0) ? scores : (m.scores || SAMPLE_SCORES);
  const { summary, holeResults } = calcResults(players, effectiveScores, m.mode, m.amount);

  // players 배열에서 인덱스 기반으로 색상 결정 (SAMPLE_PLAYERS 의존성 제거)
  const playerColorMap = Object.fromEntries(players.map((p, i) => [p.id, colorForIdx(i)]));

  const winner = summary[0];
  const rankColors = ["rank-1","rank-2","rank-3","rank-4"];
  const rankEmoji = ["🥇","🥈","🥉","4"];
  // 최소 거래 정산 계산
  const settlements = calcSettlements(players, summary);
  // 전체 홀 파 합계 (PAR 배열 기준)
  const parTotal = PAR.reduce((a,b)=>a+b,0);

  return (
    <div className="result-screen">
      {/* ① ResultHero */}
      <div className="result-hero">
        <div className="result-header-top">
          <button className="back-btn" style={{ background:"rgba(255,255,255,.1)", color:"white" }} onClick={onBack}>←</button>
          <div className="result-title">경기 결과</div>
          <div style={{ width:36 }}/>
        </div>
        {/* ② WinnerSpotlight */}
        <div className="winner-spotlight">
          <div className="winner-crown">👑</div>
          <div className="winner-avatar-lg" style={{ background: playerColorMap[winner.id] }}>{winner.name[0]}</div>
          <div className="winner-name">{winner.name}</div>
          <div className="winner-amount">{fmt(winner.earnings)}</div>
          <div className="winner-strokes">총 {winner.strokes}타 · {winner.wins}홀 승리</div>
        </div>
      </div>

      <div className="result-body">
        {/* ③ RankingCard */}
        <div className="result-card">
          <div className="result-card-header">📊 전체 순위</div>
          {summary.map((p, i) => {
            const overPar = p.strokes - parTotal;
            return (
              <div className="ranking-row" key={p.id}>
                <div className={`rank-num ${rankColors[i] || "rank-4"}`}>{rankEmoji[i] || i+1}</div>
                <div className="rank-avatar" style={{ background: playerColorMap[p.id] }}>{p.name[0]}</div>
                <div className="rank-info">
                  <div className="rank-name">{p.name}{p.hc ? <span style={{fontSize:11,color:"#aaa",fontWeight:400,marginLeft:4}}>H{p.hc}</span> : null}</div>
                  <div className="rank-detail">{p.strokes}타 · {overPar >= 0 ? "+" : ""}{overPar} 오버</div>
                </div>
                <div className="rank-amount">
                  <div className={`rank-money ${p.earnings>0?"plus":p.earnings<0?"minus":"zero"}`}>{fmt(p.earnings)}</div>
                  <div className="rank-wins">{p.wins}홀 승</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ④ HoleTimeline — 전체 18홀 표시 */}
        <div className="result-card">
          <div className="result-card-header">⛳ 홀별 결과 (전체 18홀)</div>
          <div className="hole-timeline">
            {holeResults.map((hr, i) => {
              if (!hr) return null;
              const winP = hr.winnerId ? players.find(p=>p.id===hr.winnerId) : null;
              const winColor = winP ? playerColorMap[winP.id] : "#ccc";
              return (
                <div className="hole-timeline-row" key={i}>
                  <div className={`ht-num ${hr.tie?"tie":""}`}>{i+1}</div>
                  <div className="ht-winner" style={{ color: hr.tie ? "#999" : winColor }}>
                    {hr.tie ? "⚖️ 타이" : `🏆 ${winP?.name}`}
                  </div>
                  <div className="ht-scores">
                    {hr.scores.map(s => {
                      const pp = players.find(p=>p.id===s.id);
                      const c = playerColorMap[s.id] || "#aaa";
                      return (
                        <span key={s.id} className="ht-score-badge" style={{ background:c+"18", color:c }}>
                          {pp?.name[0]}{s.s}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ⑤ PaymentSummary — 최소 거래 정산 알고리즘 */}
        <div className="result-card">
          <div className="result-card-header">💸 정산 요약</div>
          <div style={{ padding:"12px 16px", display:"flex", flexDirection:"column", gap:8 }}>
            {settlements.length === 0 ? (
              <div style={{ fontSize:13, color:"#aaa", textAlign:"center" }}>정산 없음 (모두 동점)</div>
            ) : settlements.map((tx, idx) => {
              const fromColor = playerColorMap[tx.from.id] || COLORS[0];
              const toColor   = playerColorMap[tx.to.id]   || COLORS[1];
              return (
                <div key={idx} style={{ display:"flex", alignItems:"center", gap:8, fontSize:13 }}>
                  <span style={{ fontWeight:700, color: fromColor }}>{tx.from.name}</span>
                  <span style={{ color:"#ccc" }}>→</span>
                  <span style={{ fontWeight:700, color: toColor }}>{tx.to.name}</span>
                  <span style={{ marginLeft:"auto", fontWeight:900, color:toColor, fontFamily:"'Bebas Neue'" }}>
                    {tx.amt.toLocaleString()}원
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ⑥ ActionRow */}
        <div style={{ display:"flex", gap:8, paddingBottom:8 }}>
          <button className="share-btn" style={{ flex:1, fontSize:16 }}>📤 결과 공유</button>
          <button className="share-btn" style={{ flex:1, fontSize:16, background:"linear-gradient(135deg,var(--turf),var(--turf-2))" }} onClick={onNewMatch}>
            ⛳ 새 경기
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────
const LS_KEY = "taDangJeongsan_scores";

function loadScoresFromLS(matchId) {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const all = JSON.parse(raw);
    return all[matchId] || null;
  } catch { return null; }
}

function saveScoresToLS(matchId, scores) {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const all = raw ? JSON.parse(raw) : {};
    all[matchId] = scores;
    localStorage.setItem(LS_KEY, JSON.stringify(all));
  } catch { /* 저장 실패 (용량 초과 등) 무시 */ }
}

export default function App() {
  const [screen, setScreen] = useState("main");
  const [activeMatch, setActiveMatch] = useState(null);
  // scores를 App 레벨에서 관리하여 Screen3 ↔ Screen4 간 공유
  const [matchScores, setMatchScores] = useState({});

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // matchScores 변경 시 localStorage 자동 저장
  useEffect(() => {
    if (activeMatch && Object.keys(matchScores).length > 0) {
      saveScoresToLS(activeMatch.id, matchScores);
    }
  }, [matchScores, activeMatch]);

  const handleSelectMatch = (m) => {
    setActiveMatch(m);
    // localStorage에 저장된 스코어 복원 시도
    const saved = loadScoresFromLS(m.id);
    if (saved) {
      setMatchScores(saved);
    } else if (m.scores && Object.keys(m.scores).length > 0) {
      setMatchScores(m.scores);
    } else {
      // 새 빈 스코어 초기화
      setMatchScores(
        Object.fromEntries((m.players || SAMPLE_PLAYERS).map(p => [p.id, new Array(18).fill(0)]))
      );
    }
    setScreen(m.done ? "results" : "score");
  };

  const handleStartMatch = (m) => {
    setActiveMatch(m);
    // 새 경기는 모두 0(미입력)으로 초기화
    setMatchScores(
      Object.fromEntries(m.players.map(p => [p.id, new Array(18).fill(0)]))
    );
    setScreen("score");
  };

  const TAB_LABELS = { main:"메인", create:"경기생성", score:"스코어", results:"결과" };

  return (
    <div style={{ minHeight:"100vh", background:"#0a1a0e", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"20px 0 60px", gap:0 }}>
      <div className="app-shell">
        <StatusBar />
        <div className="screen-wrap">
          {screen === "main" && (
            <Screen1Main onNew={() => setScreen("create")} onSelect={handleSelectMatch} />
          )}
          {screen === "create" && (
            <Screen2Create onBack={() => setScreen("main")} onStart={handleStartMatch} />
          )}
          {screen === "score" && (
            <Screen3Score
              match={activeMatch}
              scores={matchScores}
              onScoreChange={setMatchScores}
              onBack={() => setScreen("main")}
              onFinish={() => setScreen("results")}
            />
          )}
          {screen === "results" && (
            <Screen4Results
              match={activeMatch}
              scores={matchScores}
              onBack={() => setScreen("main")}
              onNewMatch={() => setScreen("create")}
            />
          )}
        </div>
      </div>

      {/* Demo Tab Nav */}
      <div style={{ width:390, display:"flex", gap:1, background:"rgba(0,0,0,.4)", borderRadius:"0 0 40px 40px", overflow:"hidden" }}>
        {Object.entries(TAB_LABELS).map(([key, label]) => (
          <button key={key} className={`demo-tab ${screen===key?"active":""}`} onClick={() => setScreen(key)} style={{ flex:1, padding:"12px 4px", background: screen===key ? "#2d6b3e" : "rgba(20,40,25,.8)", border:"none", fontFamily:"'Bebas Neue',sans-serif", fontSize:12, letterSpacing:1, color: screen===key ? "#e8c547" : "rgba(255,255,255,.4)", cursor:"pointer" }}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

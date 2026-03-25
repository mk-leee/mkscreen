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

  const totalStrokes = Object.fromEntries(players.map(p => [p.id, (scores[p.id] || []).reduce((a,b)=>a+b,0)]));
  const summary = players.map(p => ({ ...p, earnings: Math.round(earnings[p.id]), wins: wins[p.id], strokes: totalStrokes[p.id] })).sort((a,b) => b.earnings - a.earnings);
  return { summary, holeResults };
}

function fmt(n) { return (n > 0 ? "+" : "") + n.toLocaleString() + "원"; }
function colorFor(pid) { const idx = SAMPLE_PLAYERS.findIndex(p => p.id === pid); return COLORS[idx % COLORS.length]; }

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
  return (
    <span className="avatar-chip" style={{ background: COLORS[idx % 4] + "18" }}>
      <span className="avatar-dot" style={{ background: COLORS[idx % 4] }}>{player.name[0]}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: COLORS[idx % 4] }}>{player.name}</span>
    </span>
  );
}

// ─────────────────────────────────────────────
// SCREEN 1 — MAIN (Match List)
// ─────────────────────────────────────────────
function Screen1Main({ onNew, onSelect }) {
  const totalEarnings = 18500;
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
          {[["2", "이번 달 경기"], ["+₩18,500", "누적 수익"], ["4", "함께한 동료"]].map(([v,l]) => (
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
function Screen3Score({ match, onBack, onFinish }) {
  const players = match?.players || SAMPLE_PLAYERS;
  const [hole, setHole] = useState(0); // 0-indexed
  const [scores, setScores] = useState(() => Object.fromEntries(players.map(p => [p.id, new Array(18).fill(0)])));
  const [quickTarget, setQuickTarget] = useState(null);

  const setScore = (pid, val) => {
    setScores(prev => {
      const next = { ...prev, [pid]: [...prev[pid]] };
      next[pid][hole] = Math.max(1, Math.min(15, val));
      return next;
    });
  };

  // Min score this hole for delta display
  const holeVals = players.map(p => scores[p.id][hole]).filter(v => v > 0);
  const minScore = holeVals.length ? Math.min(...holeVals) : null;

  const allFilled = players.every(p => scores[p.id][hole] > 0);
  const donePct = players.reduce((sum,p) => sum + p.id === "p1" ? 1 : 0, 0);
  const completedHoles = Math.min(...players.map(p => p.id === "p1" ? hole : hole));

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
        {hole > 0 && <div style={{ fontSize: 11, color: "#aaa", marginLeft: 4 }}>{hole}/18 완료</div>}
        {match?.mode === "skin" && hole > 2 && (
          <div className="hole-carry">팟 ₩{(2000*(hole+1)).toLocaleString()} 이월</div>
        )}
      </div>

      {/* ④ ScoreRows */}
      <div className="score-entries">
        {players.map((p, i) => {
          const v = scores[p.id][hole];
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
                <button className="step-btn minus" onClick={()=>setScore(p.id,v-1)}>−</button>
                <div className="step-val" style={v>0?{color:COLORS[i]}:{}} onClick={()=>setQuickTarget(p.id)}>
                  {v || "·"}
                </div>
                <button className="step-btn plus" onClick={()=>setScore(p.id,(v||PAR[hole])+1)}>+</button>
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
              <button className="numpad-key del" onClick={()=>{setScore(quickTarget,0);setQuickTarget(null);}}>⌫</button>
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
function Screen4Results({ match, onBack, onNewMatch }) {
  const m = match || SAMPLE_MATCHES[0];
  const players = m.players;
  const { summary, holeResults } = calcResults(players, m.scores || SAMPLE_SCORES, m.mode, m.amount);
  const winner = summary[0];
  const rankColors = ["rank-1","rank-2","rank-3","rank-4"];
  const rankEmoji = ["🥇","🥈","🥉","4"];

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
          <div className="winner-avatar-lg" style={{ background: colorFor(winner.id) }}>{winner.name[0]}</div>
          <div className="winner-name">{winner.name}</div>
          <div className="winner-amount">{fmt(winner.earnings)}</div>
          <div className="winner-strokes">총 {winner.strokes}타 · {winner.wins}홀 승리</div>
        </div>
      </div>

      <div className="result-body">
        {/* ③ RankingCard */}
        <div className="result-card">
          <div className="result-card-header">📊 전체 순위</div>
          {summary.map((p, i) => (
            <div className="ranking-row" key={p.id}>
              <div className={`rank-num ${rankColors[i]}`}>{rankEmoji[i]}</div>
              <div className="rank-avatar" style={{ background: colorFor(p.id) }}>{p.name[0]}</div>
              <div className="rank-info">
                <div className="rank-name">{p.name}{p.hc ? <span style={{fontSize:11,color:"#aaa",fontWeight:400,marginLeft:4}}>H{p.hc}</span> : null}</div>
                <div className="rank-detail">{p.strokes}타 · {p.strokes - 72 >= 0 ? "+" : ""}{p.strokes - 72} 오버</div>
              </div>
              <div className="rank-amount">
                <div className={`rank-money ${p.earnings>0?"plus":p.earnings<0?"minus":"zero"}`}>{fmt(p.earnings)}</div>
                <div className="rank-wins">{p.wins}홀 승</div>
              </div>
            </div>
          ))}
        </div>

        {/* ④ HoleTimeline */}
        <div className="result-card">
          <div className="result-card-header">⛳ 홀별 결과</div>
          <div className="hole-timeline">
            {holeResults.slice(0,9).map((hr, i) => {
              if (!hr) return null;
              const winP = hr.winnerId ? players.find(p=>p.id===hr.winnerId) : null;
              const winColor = winP ? colorFor(winP.id) : "#ccc";
              return (
                <div className="hole-timeline-row" key={i}>
                  <div className={`ht-num ${hr.tie?"tie":""}`}>{i+1}</div>
                  <div className="ht-winner" style={{ color: hr.tie ? "#999" : winColor }}>
                    {hr.tie ? "⚖️ 타이" : `🏆 ${winP?.name}`}
                  </div>
                  <div className="ht-scores">
                    {hr.scores.map(s => {
                      const pp = players.find(p=>p.id===s.id);
                      const c = colorFor(s.id);
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
            <div style={{ padding:"8px 16px", fontSize:11, color:"#bbb", textAlign:"center" }}>— 전반 9홀 표시 중 —</div>
          </div>
        </div>

        {/* ⑤ PaymentSummary */}
        <div className="result-card">
          <div className="result-card-header">💸 정산 요약</div>
          <div style={{ padding:"12px 16px", display:"flex", flexDirection:"column", gap:8 }}>
            {summary.filter(p=>p.earnings<0).map(loser => {
              const losee = summary.find(p=>p.earnings>0);
              return (
                <div key={loser.id} style={{ display:"flex", alignItems:"center", gap:8, fontSize:13 }}>
                  <span style={{ fontWeight:700, color: colorFor(loser.id) }}>{loser.name}</span>
                  <span style={{ color:"#ccc" }}>→</span>
                  <span style={{ fontWeight:700, color: colorFor(losee?.id||"p1") }}>{losee?.name}</span>
                  <span style={{ marginLeft:"auto", fontWeight:900, color:COLORS[0], fontFamily:"'Bebas Neue'" }}>{Math.abs(loser.earnings).toLocaleString()}원</span>
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
export default function App() {
  const [screen, setScreen] = useState("main");
  const [activeMatch, setActiveMatch] = useState(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleSelectMatch = (m) => {
    setActiveMatch(m);
    setScreen(m.done ? "results" : "score");
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
            <Screen2Create onBack={() => setScreen("main")} onStart={m => { setActiveMatch(m); setScreen("score"); }} />
          )}
          {screen === "score" && (
            <Screen3Score match={activeMatch} onBack={() => setScreen("main")} onFinish={() => setScreen("results")} />
          )}
          {screen === "results" && (
            <Screen4Results match={activeMatch} onBack={() => setScreen("main")} onNewMatch={() => setScreen("create")} />
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

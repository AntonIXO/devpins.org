/* @ds-bundle: {"format":4,"namespace":"OptiHealthDesignSystem_24abdb","components":[],"sourceHashes":{"sleep/SleepStages.jsx":"023dd9b94a33","sleep/design-canvas.jsx":"5d0e39003628","ui_kits/web/AuthModal.jsx":"0db970fc1bdb","ui_kits/web/Button.jsx":"2e4cc700656d","ui_kits/web/Dashboard.jsx":"e6b15071549d","ui_kits/web/GlassPrimitives.jsx":"4e06df7c0f12","ui_kits/web/Icons.jsx":"a4845d590130","ui_kits/web/Landing.jsx":"44818ca3d17d"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.OptiHealthDesignSystem_24abdb = window.OptiHealthDesignSystem_24abdb || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// sleep/SleepStages.jsx
try { (() => {
// SleepStages — sleep architecture viewer for optiHealth web (liquid glass).
// One component, two density modes:
//   variant="compact" — for the main dashboard (single hero strip, summary stats)
//   variant="full"    — for the data page (timeline + axis + per-stage breakdown + legend)
//
// Stage tokens — picked to read on the indigo gradient. Awake is warm (alert),
// light is sky-blue (drift), deep is brand-indigo (rest), REM is purple (dreams).
const SLEEP_TOKENS = {
  awake: {
    label: 'Awake',
    color: '#fb923c',
    track: 4,
    dot: '#fb923c'
  },
  rem: {
    label: 'REM',
    color: '#c084fc',
    track: 3,
    dot: '#c084fc'
  },
  light: {
    label: 'Light',
    color: '#60a5fa',
    track: 2,
    dot: '#60a5fa'
  },
  deep: {
    label: 'Deep',
    color: '#3b4cb8',
    track: 1,
    dot: '#6677e0'
  }
};
const TRACK_ORDER = ['awake', 'rem', 'light', 'deep']; // top → bottom

// ---------- helpers ----------------------------------------------------------
const fmtClock = iso => {
  const d = new Date(iso);
  return d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};
const fmtDur = s => {
  const h = Math.floor(s / 3600);
  const m = Math.round(s % 3600 / 60);
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
};
const fmtDurShort = s => {
  const h = Math.floor(s / 3600);
  const m = Math.round(s % 3600 / 60);
  return h ? `${h}h${String(m).padStart(2, '0')}` : `${m}m`;
};
const pct = (n, d) => d ? Math.round(n / d * 100) : 0;
const aggregate = stages => {
  if (!stages?.length) return null;
  const start = new Date(stages[0].startTimestamp).getTime();
  const end = new Date(stages[stages.length - 1].endTimestamp).getTime();
  const totalMs = end - start;
  const inBed = stages.reduce((a, s) => a + s.durationSeconds, 0);
  const asleep = stages.filter(s => s.stage !== 'awake').reduce((a, s) => a + s.durationSeconds, 0);
  const byStage = {};
  for (const k of TRACK_ORDER) byStage[k] = 0;
  for (const s of stages) byStage[s.stage] = (byStage[s.stage] || 0) + s.durationSeconds;
  const efficiency = pct(asleep, inBed);
  return {
    start,
    end,
    totalMs,
    inBed,
    asleep,
    byStage,
    efficiency
  };
};

// ---------- compact strip (main page) ----------------------------------------
// A single horizontal hypnogram strip, ~64px tall, with stage steps drawn as
// tall blocks per track. Intended to live inside a Glass card on the dashboard.
const SleepStrip = ({
  stages,
  height = 56,
  showAxis = true
}) => {
  const agg = aggregate(stages);
  if (!agg) return null;
  const {
    start,
    totalMs
  } = agg;
  const trackH = height / TRACK_ORDER.length;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height,
      width: '100%'
    }
  }, TRACK_ORDER.map((_, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: i * trackH + trackH / 2,
      height: 1,
      borderTop: '1px dashed rgba(255,255,255,0.10)'
    }
  })), /*#__PURE__*/React.createElement("svg", {
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      overflow: 'visible'
    },
    viewBox: `0 0 1000 ${height}`,
    preserveAspectRatio: "none"
  }, /*#__PURE__*/React.createElement("defs", null, TRACK_ORDER.map(k => {
    const c = SLEEP_TOKENS[k].color;
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: k
    }, /*#__PURE__*/React.createElement("linearGradient", {
      id: `cgrad-${k}`,
      x1: "0",
      y1: "0",
      x2: "0",
      y2: "1"
    }, /*#__PURE__*/React.createElement("stop", {
      offset: "0",
      stopColor: c,
      stopOpacity: "1"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "1",
      stopColor: c,
      stopOpacity: "0.7"
    })), /*#__PURE__*/React.createElement("linearGradient", {
      id: `csheen-${k}`,
      x1: "0",
      y1: "0",
      x2: "0",
      y2: "1"
    }, /*#__PURE__*/React.createElement("stop", {
      offset: "0",
      stopColor: "#fff",
      stopOpacity: "0.45"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "1",
      stopColor: "#fff",
      stopOpacity: "0"
    })));
  })), stages.map((s, i) => {
    if (i === 0) return null;
    const prev = stages[i - 1];
    const py = TRACK_ORDER.indexOf(prev.stage) * trackH + trackH / 2;
    const cy = TRACK_ORDER.indexOf(s.stage) * trackH + trackH / 2;
    if (py === cy) return null;
    const x = (new Date(s.startTimestamp).getTime() - start) / totalMs * 1000;
    const yTop = Math.min(py, cy),
      yBot = Math.max(py, cy);
    return /*#__PURE__*/React.createElement("rect", {
      key: `s${i}`,
      x: x - 1.5,
      y: yTop,
      width: 3,
      height: yBot - yTop,
      rx: 1.5,
      ry: 1.5,
      fill: `url(#cgrad-${s.stage})`,
      opacity: "0.7"
    });
  }), stages.map((s, i) => {
    const t = SLEEP_TOKENS[s.stage];
    if (!t) return null;
    const trackIdx = TRACK_ORDER.indexOf(s.stage);
    const x = (new Date(s.startTimestamp).getTime() - start) / totalMs * 1000;
    const w = Math.max(s.durationSeconds * 1000 / totalMs * 1000, 4);
    const capH = trackH - 4;
    const y = trackIdx * trackH + 2;
    const r = Math.min(capH / 2, w / 2);
    return /*#__PURE__*/React.createElement("g", {
      key: `c${i}`
    }, /*#__PURE__*/React.createElement("title", null, `${t.label} · ${fmtClock(s.startTimestamp)}–${fmtClock(s.endTimestamp)} · ${fmtDur(s.durationSeconds)}`), /*#__PURE__*/React.createElement("rect", {
      x: x,
      y: y,
      width: w,
      height: capH,
      rx: r,
      ry: r,
      fill: `url(#cgrad-${s.stage})`
    }), /*#__PURE__*/React.createElement("rect", {
      x: x + 1,
      y: y + 1,
      width: Math.max(w - 2, 0),
      height: capH / 2,
      rx: Math.max(r - 1, 0),
      ry: Math.max(r - 1, 0),
      fill: `url(#csheen-${s.stage})`
    }));
  }))), showAxis && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: 6,
      font: '500 11px Geist Mono, ui-monospace, monospace',
      color: 'rgba(255,255,255,0.5)',
      letterSpacing: '0.04em'
    }
  }, /*#__PURE__*/React.createElement("span", null, fmtClock(stages[0].startTimestamp)), /*#__PURE__*/React.createElement("span", null, fmtClock(stages[stages.length - 1].endTimestamp))));
};

// Compact card — for main dashboard
const SleepCardCompact = ({
  stages,
  date = 'Last night'
}) => {
  const agg = aggregate(stages);
  if (!agg) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'rgba(255,255,255,0.10)',
      border: '1px solid rgba(255,255,255,0.20)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderRadius: 16,
      padding: 20,
      fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif',
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      color: 'rgba(255,255,255,0.7)',
      font: '500 11px Geist, system-ui, sans-serif',
      letterSpacing: '0.08em',
      textTransform: 'uppercase'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
  })), "Sleep \xB7 ", date), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 8,
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 28px Geist',
      letterSpacing: '-0.01em'
    }
  }, fmtDurShort(agg.asleep)), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'rgba(255,255,255,0.5)',
      font: '400 13px Geist'
    }
  }, "asleep"))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '600 20px Geist',
      color: '#4ade80'
    }
  }, agg.efficiency, "%"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '500 10px Geist',
      color: 'rgba(255,255,255,0.5)',
      letterSpacing: '0.06em',
      textTransform: 'uppercase'
    }
  }, "efficiency"))), /*#__PURE__*/React.createElement(SleepStrip, {
    stages: stages,
    height: 48
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: 14,
      gap: 8
    }
  }, TRACK_ORDER.map(k => {
    const t = SLEEP_TOKENS[k];
    const dur = agg.byStage[k] || 0;
    return /*#__PURE__*/React.createElement("div", {
      key: k,
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 2
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: t.color,
        flex: 'none'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        font: '500 10px Geist',
        color: 'rgba(255,255,255,0.6)',
        letterSpacing: '0.06em',
        textTransform: 'uppercase'
      }
    }, t.label)), /*#__PURE__*/React.createElement("div", {
      style: {
        font: '600 13px Geist Mono, ui-monospace, monospace',
        color: '#fff'
      }
    }, fmtDurShort(dur)));
  })));
};

// ---------- full hypnogram (data page) ---------------------------------------
// Apple-Health-inspired flowing ribbon: each stage renders as a fat capsule
// on its track with thin "stems" up/down to the neighbour stages, so the
// whole night reads as one continuous glassy ribbon. The capsules carry a
// vertical glass gradient + sheen, and bloom on hover.
const SleepHypnogram = ({
  stages
}) => {
  const [hoverIdx, setHoverIdx] = React.useState(null);
  const agg = aggregate(stages);
  if (!agg) return null;
  const {
    start,
    end,
    totalMs
  } = agg;
  const trackHeight = 56;
  const trackGap = 8;
  const capsuleH = 36; // fat pillar height
  const stemW = 4; // connector stem width (thin)
  const totalTrackH = trackHeight * TRACK_ORDER.length + trackGap * (TRACK_ORDER.length - 1);
  const VB_W = 1000; // viewBox width — percent-mapped

  // axis ticks every hour
  const ticks = [];
  const startHour = Math.ceil(new Date(start).getTime() / 3600000) * 3600000;
  for (let t = startHour; t <= end; t += 3600000) ticks.push(t);

  // Helpers — centre Y of a stage track, and X for a timestamp
  const trackCenterY = key => TRACK_ORDER.indexOf(key) * (trackHeight + trackGap) + trackHeight / 2;
  const timeToX = iso => (new Date(iso).getTime() - start) / totalMs * VB_W;

  // Build the ribbon path data per stage:
  //   - main capsule on the stage's track (rounded rect)
  //   - leading stem from previous stage's track centre to this capsule top/bottom
  //   - trailing stem to next stage (rendered as that stage's leading stem)
  // Each stage owns one capsule + its LEADING stem.
  const stageBlocks = stages.map((s, i) => {
    const tk = SLEEP_TOKENS[s.stage];
    if (!tk) return null;
    const x0 = timeToX(s.startTimestamp);
    const x1 = timeToX(s.endTimestamp);
    const cy = trackCenterY(s.stage);
    const capX = x0;
    const capW = Math.max(x1 - x0, stemW + 2);
    const capY = cy - capsuleH / 2;

    // Leading stem: connects from previous stage capsule's edge (at prev cy)
    // up/down to this capsule's near edge (at this cy). Drawn as a thin
    // rounded rect spanning the vertical gap, anchored at the boundary x.
    let stem = null;
    if (i > 0) {
      const prev = stages[i - 1];
      const prevCy = trackCenterY(prev.stage);
      if (prevCy !== cy) {
        const yTop = Math.min(prevCy, cy);
        const yBot = Math.max(prevCy, cy);
        // anchor at the transition timestamp, centered on the stem width
        const sx = x0 - stemW / 2;
        stem = {
          x: sx,
          y: yTop,
          w: stemW,
          h: yBot - yTop
        };
      }
    }
    return {
      i,
      key: s.stage,
      tk,
      capsule: {
        x: capX,
        y: capY,
        w: capW,
        h: capsuleH
      },
      stem,
      raw: s
    };
  }).filter(Boolean);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 80,
      flex: 'none'
    }
  }, TRACK_ORDER.map((k, i) => {
    const dur = agg.byStage[k] || 0;
    return /*#__PURE__*/React.createElement("div", {
      key: k,
      style: {
        height: trackHeight,
        marginBottom: i < TRACK_ORDER.length - 1 ? trackGap : 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: '600 13px Geist',
        color: '#fff',
        marginBottom: 2
      }
    }, SLEEP_TOKENS[k].label), /*#__PURE__*/React.createElement("div", {
      style: {
        font: '500 11px Geist Mono, ui-monospace, monospace',
        color: 'rgba(255,255,255,0.5)'
      }
    }, dur ? fmtDurShort(dur) : '—'));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height: totalTrackH
    }
  }, TRACK_ORDER.map((k, i) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: i * (trackHeight + trackGap) + trackHeight / 2,
      height: 1,
      borderTop: '1px dashed rgba(255,255,255,0.10)'
    }
  })), /*#__PURE__*/React.createElement("svg", {
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      overflow: 'visible'
    },
    viewBox: `0 0 ${VB_W} ${totalTrackH}`,
    preserveAspectRatio: "none"
  }, /*#__PURE__*/React.createElement("defs", null, TRACK_ORDER.map(k => {
    const c = SLEEP_TOKENS[k].color;
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: k
    }, /*#__PURE__*/React.createElement("linearGradient", {
      id: `grad-${k}`,
      x1: "0",
      y1: "0",
      x2: "0",
      y2: "1"
    }, /*#__PURE__*/React.createElement("stop", {
      offset: "0",
      stopColor: c,
      stopOpacity: "1"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "0.5",
      stopColor: c,
      stopOpacity: "0.85"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "1",
      stopColor: c,
      stopOpacity: "0.7"
    })), /*#__PURE__*/React.createElement("linearGradient", {
      id: `sheen-${k}`,
      x1: "0",
      y1: "0",
      x2: "0",
      y2: "1"
    }, /*#__PURE__*/React.createElement("stop", {
      offset: "0",
      stopColor: "#ffffff",
      stopOpacity: "0.45"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "0.5",
      stopColor: "#ffffff",
      stopOpacity: "0.10"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "1",
      stopColor: "#ffffff",
      stopOpacity: "0"
    })));
  })), stageBlocks.map(b => b.stem && /*#__PURE__*/React.createElement("rect", {
    key: `stem-${b.i}`,
    x: b.stem.x,
    y: b.stem.y,
    width: b.stem.w,
    height: b.stem.h,
    rx: b.stem.w / 2,
    ry: b.stem.w / 2,
    fill: `url(#grad-${b.key})`,
    opacity: hoverIdx === null || hoverIdx === b.i || hoverIdx === b.i - 1 ? 0.75 : 0.4,
    style: {
      transition: 'opacity .15s'
    },
    vectorEffect: "non-scaling-stroke"
  })), stageBlocks.map(b => {
    const isHover = hoverIdx === b.i;
    const r = Math.min(capsuleH / 2, b.capsule.w / 2);
    return /*#__PURE__*/React.createElement("g", {
      key: `cap-${b.i}`,
      onMouseEnter: () => setHoverIdx(b.i),
      onMouseLeave: () => setHoverIdx(null),
      style: {
        cursor: 'pointer'
      }
    }, isHover && /*#__PURE__*/React.createElement("rect", {
      x: b.capsule.x - 1,
      y: b.capsule.y - 1,
      width: b.capsule.w + 2,
      height: b.capsule.h + 2,
      rx: r + 1,
      ry: r + 1,
      fill: "none",
      stroke: b.tk.color,
      strokeWidth: "1.5",
      opacity: "0.9",
      vectorEffect: "non-scaling-stroke"
    }), /*#__PURE__*/React.createElement("rect", {
      x: b.capsule.x,
      y: b.capsule.y,
      width: b.capsule.w,
      height: b.capsule.h,
      rx: r,
      ry: r,
      fill: `url(#grad-${b.key})`,
      opacity: hoverIdx === null ? 1 : isHover ? 1 : 0.7,
      style: {
        transition: 'opacity .15s'
      }
    }), /*#__PURE__*/React.createElement("rect", {
      x: b.capsule.x + 1,
      y: b.capsule.y + 1,
      width: Math.max(b.capsule.w - 2, 0),
      height: b.capsule.h / 2,
      rx: Math.max(r - 1, 0),
      ry: Math.max(r - 1, 0),
      fill: `url(#sheen-${b.key})`,
      pointerEvents: "none"
    }));
  })), hoverIdx !== null && (() => {
    const s = stages[hoverIdx];
    const tk = SLEEP_TOKENS[s.stage];
    const left = (new Date(s.startTimestamp).getTime() - start) / totalMs * 100 + s.durationSeconds * 1000 / totalMs * 50;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: `${left}%`,
        top: -8,
        transform: 'translate(-50%, -100%)',
        background: 'rgba(20, 18, 50, 0.95)',
        border: '1px solid rgba(255,255,255,0.20)',
        backdropFilter: 'blur(12px)',
        borderRadius: 8,
        padding: '8px 12px',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        boxShadow: '0 12px 24px rgba(0,0,0,0.4)',
        zIndex: 5
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: tk.color
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        font: '600 12px Geist',
        color: '#fff'
      }
    }, tk.label)), /*#__PURE__*/React.createElement("div", {
      style: {
        font: '400 11px Geist Mono, ui-monospace, monospace',
        color: 'rgba(255,255,255,0.7)'
      }
    }, fmtClock(s.startTimestamp), "\u2013", fmtClock(s.endTimestamp), " \xB7 ", fmtDur(s.durationSeconds)));
  })()), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height: 22,
      marginTop: 8
    }
  }, ticks.map((t, i) => {
    const x = (t - start) / totalMs * 100;
    const d = new Date(t);
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        position: 'absolute',
        left: `${x}%`,
        transform: 'translateX(-50%)',
        font: '500 11px Geist Mono, ui-monospace, monospace',
        color: 'rgba(255,255,255,0.5)'
      }
    }, String(d.getHours()).padStart(2, '0'), ":00");
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      top: 0,
      font: '600 11px Geist Mono, ui-monospace, monospace',
      color: 'rgba(255,255,255,0.85)'
    }
  }, fmtClock(stages[0].startTimestamp)), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: 0,
      top: 0,
      font: '600 11px Geist Mono, ui-monospace, monospace',
      color: 'rgba(255,255,255,0.85)'
    }
  }, fmtClock(stages[stages.length - 1].endTimestamp))))));
};

// Stage breakdown rail — proportional bar of the night plus per-stage stats.
const SleepBreakdown = ({
  stages
}) => {
  const agg = aggregate(stages);
  if (!agg) return null;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      height: 8,
      borderRadius: 4,
      overflow: 'hidden',
      background: 'rgba(255,255,255,0.06)',
      marginBottom: 16
    }
  }, TRACK_ORDER.slice().reverse().map(k => {
    const dur = agg.byStage[k] || 0;
    const w = dur / agg.inBed * 100;
    if (!w) return null;
    return /*#__PURE__*/React.createElement("div", {
      key: k,
      title: `${SLEEP_TOKENS[k].label} ${pct(dur, agg.inBed)}%`,
      style: {
        width: `${w}%`,
        background: SLEEP_TOKENS[k].color
      }
    });
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 12
    }
  }, TRACK_ORDER.map(k => {
    const tk = SLEEP_TOKENS[k];
    const dur = agg.byStage[k] || 0;
    const p = pct(dur, agg.inBed);
    return /*#__PURE__*/React.createElement("div", {
      key: k,
      style: {
        padding: 14,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: tk.color
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        font: '500 11px Geist',
        color: 'rgba(255,255,255,0.7)',
        letterSpacing: '0.06em',
        textTransform: 'uppercase'
      }
    }, tk.label)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: '600 22px Geist',
        letterSpacing: '-0.01em'
      }
    }, fmtDurShort(dur)), /*#__PURE__*/React.createElement("span", {
      style: {
        font: '500 12px Geist Mono, ui-monospace, monospace',
        color: 'rgba(255,255,255,0.5)'
      }
    }, p, "%")));
  })));
};

// Full card — for data page
const SleepCardFull = ({
  stages,
  date = 'Wed, Oct 23'
}) => {
  const agg = aggregate(stages);
  if (!agg) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'rgba(255,255,255,0.10)',
      border: '1px solid rgba(255,255,255,0.20)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderRadius: 16,
      padding: 24,
      fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif',
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 24,
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      color: 'rgba(255,255,255,0.7)',
      font: '500 11px Geist',
      letterSpacing: '0.08em',
      textTransform: 'uppercase'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
  })), "Sleep architecture \xB7 ", date), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 12,
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 36px Geist',
      letterSpacing: '-0.02em'
    }
  }, fmtDurShort(agg.asleep)), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'rgba(255,255,255,0.5)',
      font: '400 14px Geist'
    }
  }, "asleep \xB7 in bed ", fmtDurShort(agg.inBed)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    label: "Efficiency",
    value: `${agg.efficiency}%`,
    accent: "#4ade80"
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "Bedtime",
    value: fmtClock(stages[0].startTimestamp)
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "Wake",
    value: fmtClock(stages[stages.length - 1].endTimestamp)
  }))), /*#__PURE__*/React.createElement(SleepHypnogram, {
    stages: stages
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'rgba(255,255,255,0.10)',
      margin: '24px 0'
    }
  }), /*#__PURE__*/React.createElement(SleepBreakdown, {
    stages: stages
  }));
};
const Stat = ({
  label,
  value,
  accent = '#fff'
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    textAlign: 'right'
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    font: '600 18px Geist',
    color: accent,
    letterSpacing: '-0.01em'
  }
}, value), /*#__PURE__*/React.createElement("div", {
  style: {
    font: '500 10px Geist',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginTop: 2
  }
}, label));

// Unified entry — pick variant. Same data, two densities.
const SleepStages = ({
  stages,
  variant = 'full',
  date
}) => {
  return variant === 'compact' ? /*#__PURE__*/React.createElement(SleepCardCompact, {
    stages: stages,
    date: date
  }) : /*#__PURE__*/React.createElement(SleepCardFull, {
    stages: stages,
    date: date
  });
};
Object.assign(window, {
  SleepStages,
  SleepCardCompact,
  SleepCardFull,
  SleepHypnogram,
  SleepStrip,
  SleepBreakdown,
  SLEEP_TOKENS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "sleep/SleepStages.jsx", error: String((e && e.message) || e) }); }

// sleep/design-canvas.jsx
try { (() => {
// DesignCanvas.jsx — Figma-ish design canvas wrapper
// Warm gray grid bg + Sections + Artboards + PostIt notes.
// Artboards are reorderable (grip-drag), labels/titles are inline-editable,
// and any artboard can be opened in a fullscreen focus overlay (←/→/Esc).
// State persists to a .design-canvas.state.json sidecar via the host
// bridge. No assets, no deps.
//
// Usage:
//   <DesignCanvas>
//     <DCSection id="onboarding" title="Onboarding" subtitle="First-run variants">
//       <DCArtboard id="a" label="A · Dusk" width={260} height={480}>…</DCArtboard>
//       <DCArtboard id="b" label="B · Minimal" width={260} height={480}>…</DCArtboard>
//     </DCSection>
//   </DesignCanvas>

const DC = {
  bg: '#f0eee9',
  grid: 'rgba(0,0,0,0.06)',
  label: 'rgba(60,50,40,0.7)',
  title: 'rgba(40,30,20,0.85)',
  subtitle: 'rgba(60,50,40,0.6)',
  postitBg: '#fef4a8',
  postitText: '#5a4a2a',
  font: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
};

// One-time CSS injection (classes are dc-prefixed so they don't collide with
// the hosted design's own styles).
if (typeof document !== 'undefined' && !document.getElementById('dc-styles')) {
  const s = document.createElement('style');
  s.id = 'dc-styles';
  s.textContent = ['.dc-editable{cursor:text;outline:none;white-space:nowrap;border-radius:3px;padding:0 2px;margin:0 -2px}', '.dc-editable:focus{background:#fff;box-shadow:0 0 0 1.5px #c96442}', '[data-dc-slot]{transition:transform .18s cubic-bezier(.2,.7,.3,1)}', '[data-dc-slot].dc-dragging{transition:none;z-index:10;pointer-events:none}', '[data-dc-slot].dc-dragging .dc-card{box-shadow:0 12px 40px rgba(0,0,0,.25),0 0 0 2px #c96442;transform:scale(1.02)}', '.dc-card{transition:box-shadow .15s,transform .15s}', '.dc-card *{scrollbar-width:none}', '.dc-card *::-webkit-scrollbar{display:none}', '.dc-labelrow{display:flex;align-items:center;gap:4px;height:24px}', '.dc-grip{cursor:grab;display:flex;align-items:center;padding:5px 4px;border-radius:4px;transition:background .12s}', '.dc-grip:hover{background:rgba(0,0,0,.08)}', '.dc-grip:active{cursor:grabbing}', '.dc-labeltext{cursor:pointer;border-radius:4px;padding:3px 6px;display:flex;align-items:center;transition:background .12s}', '.dc-labeltext:hover{background:rgba(0,0,0,.05)}', '.dc-expand{position:absolute;bottom:100%;right:0;margin-bottom:5px;z-index:2;opacity:0;transition:opacity .12s,background .12s;', '  width:22px;height:22px;border-radius:5px;border:none;cursor:pointer;padding:0;', '  background:transparent;color:rgba(60,50,40,.7);display:flex;align-items:center;justify-content:center}', '.dc-expand:hover{background:rgba(0,0,0,.06);color:#2a251f}', '[data-dc-slot]:hover .dc-expand{opacity:1}'].join('\n');
  document.head.appendChild(s);
}
const DCCtx = React.createContext(null);

// ─────────────────────────────────────────────────────────────
// DesignCanvas — stateful wrapper around the pan/zoom viewport.
// Owns runtime state (per-section order, renamed titles/labels, focused
// artboard). Order/titles/labels persist to a .design-canvas.state.json
// sidecar next to the HTML. Reads go via plain fetch() so the saved
// arrangement is visible anywhere the HTML + sidecar are served together
// (omelette preview, direct link, downloaded zip). Writes go through the
// host's window.omelette bridge — editing requires the omelette runtime.
// Focus is ephemeral.
// ─────────────────────────────────────────────────────────────
const DC_STATE_FILE = '.design-canvas.state.json';
function DesignCanvas({
  children,
  minScale,
  maxScale,
  style
}) {
  const [state, setState] = React.useState({
    sections: {},
    focus: null
  });
  // Hold rendering until the sidecar read settles so the saved order/titles
  // appear on first paint (no source-order flash). didRead gates writes until
  // the read settles so the empty initial state can't clobber a slow read;
  // skipNextWrite suppresses the one echo-write that would otherwise follow
  // hydration.
  const [ready, setReady] = React.useState(false);
  const didRead = React.useRef(false);
  const skipNextWrite = React.useRef(false);
  React.useEffect(() => {
    let off = false;
    fetch('./' + DC_STATE_FILE).then(r => r.ok ? r.json() : null).then(saved => {
      if (off || !saved || !saved.sections) return;
      skipNextWrite.current = true;
      setState(s => ({
        ...s,
        sections: saved.sections
      }));
    }).catch(() => {}).finally(() => {
      didRead.current = true;
      if (!off) setReady(true);
    });
    const t = setTimeout(() => {
      if (!off) setReady(true);
    }, 150);
    return () => {
      off = true;
      clearTimeout(t);
    };
  }, []);
  React.useEffect(() => {
    if (!didRead.current) return;
    if (skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }
    const t = setTimeout(() => {
      window.omelette?.writeFile(DC_STATE_FILE, JSON.stringify({
        sections: state.sections
      })).catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [state.sections]);

  // Build registries synchronously from children so FocusOverlay can read
  // them in the same render. Only direct DCSection > DCArtboard children are
  // walked — wrapping them in other elements opts out of focus/reorder.
  const registry = {}; // slotId -> { sectionId, artboard }
  const sectionMeta = {}; // sectionId -> { title, subtitle, slotIds[] }
  const sectionOrder = [];
  React.Children.forEach(children, sec => {
    if (!sec || sec.type !== DCSection) return;
    const sid = sec.props.id ?? sec.props.title;
    if (!sid) return;
    sectionOrder.push(sid);
    const persisted = state.sections[sid] || {};
    const srcIds = [];
    React.Children.forEach(sec.props.children, ab => {
      if (!ab || ab.type !== DCArtboard) return;
      const aid = ab.props.id ?? ab.props.label;
      if (!aid) return;
      registry[`${sid}/${aid}`] = {
        sectionId: sid,
        artboard: ab
      };
      srcIds.push(aid);
    });
    const kept = (persisted.order || []).filter(k => srcIds.includes(k));
    sectionMeta[sid] = {
      title: persisted.title ?? sec.props.title,
      subtitle: sec.props.subtitle,
      slotIds: [...kept, ...srcIds.filter(k => !kept.includes(k))]
    };
  });
  const api = React.useMemo(() => ({
    state,
    section: id => state.sections[id] || {},
    patchSection: (id, p) => setState(s => ({
      ...s,
      sections: {
        ...s.sections,
        [id]: {
          ...s.sections[id],
          ...(typeof p === 'function' ? p(s.sections[id] || {}) : p)
        }
      }
    })),
    setFocus: slotId => setState(s => ({
      ...s,
      focus: slotId
    }))
  }), [state]);

  // Esc exits focus; any outside pointerdown commits an in-progress rename.
  React.useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') api.setFocus(null);
    };
    const onPd = e => {
      const ae = document.activeElement;
      if (ae && ae.isContentEditable && !ae.contains(e.target)) ae.blur();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPd, true);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPd, true);
    };
  }, [api]);
  return /*#__PURE__*/React.createElement(DCCtx.Provider, {
    value: api
  }, /*#__PURE__*/React.createElement(DCViewport, {
    minScale: minScale,
    maxScale: maxScale,
    style: style
  }, ready && children), state.focus && registry[state.focus] && /*#__PURE__*/React.createElement(DCFocusOverlay, {
    entry: registry[state.focus],
    sectionMeta: sectionMeta,
    sectionOrder: sectionOrder
  }));
}

// ─────────────────────────────────────────────────────────────
// DCViewport — transform-based pan/zoom (internal)
//
// Input mapping (Figma-style):
//   • trackpad pinch  → zoom   (ctrlKey wheel; Safari gesture* events)
//   • trackpad scroll → pan    (two-finger)
//   • mouse wheel     → zoom   (notched; distinguished from trackpad scroll)
//   • middle-drag / primary-drag-on-bg → pan
//
// Transform state lives in a ref and is written straight to the DOM
// (translate3d + will-change) so wheel ticks don't go through React —
// keeps pans at 60fps on dense canvases.
// ─────────────────────────────────────────────────────────────
function DCViewport({
  children,
  minScale = 0.1,
  maxScale = 8,
  style = {}
}) {
  const vpRef = React.useRef(null);
  const worldRef = React.useRef(null);
  const tf = React.useRef({
    x: 0,
    y: 0,
    scale: 1
  });
  const apply = React.useCallback(() => {
    const {
      x,
      y,
      scale
    } = tf.current;
    const el = worldRef.current;
    if (el) el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
  }, []);
  React.useEffect(() => {
    const vp = vpRef.current;
    if (!vp) return;
    const zoomAt = (cx, cy, factor) => {
      const r = vp.getBoundingClientRect();
      const px = cx - r.left,
        py = cy - r.top;
      const t = tf.current;
      const next = Math.min(maxScale, Math.max(minScale, t.scale * factor));
      const k = next / t.scale;
      // keep the world point under the cursor fixed
      t.x = px - (px - t.x) * k;
      t.y = py - (py - t.y) * k;
      t.scale = next;
      apply();
    };

    // Mouse-wheel vs trackpad-scroll heuristic. A physical wheel sends
    // line-mode deltas (Firefox) or large integer pixel deltas with no X
    // component (Chrome/Safari, typically multiples of 100/120). Trackpad
    // two-finger scroll sends small/fractional pixel deltas, often with
    // non-zero deltaX. ctrlKey is set by the browser for trackpad pinch.
    const isMouseWheel = e => e.deltaMode !== 0 || e.deltaX === 0 && Number.isInteger(e.deltaY) && Math.abs(e.deltaY) >= 40;
    const onWheel = e => {
      e.preventDefault();
      if (isGesturing) return; // Safari: gesture* owns the pinch — discard concurrent wheels
      if (e.ctrlKey) {
        // trackpad pinch (or explicit ctrl+wheel)
        zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.01));
      } else if (isMouseWheel(e)) {
        // notched mouse wheel — fixed-ratio step per click
        zoomAt(e.clientX, e.clientY, Math.exp(-Math.sign(e.deltaY) * 0.18));
      } else {
        // trackpad two-finger scroll — pan
        tf.current.x -= e.deltaX;
        tf.current.y -= e.deltaY;
        apply();
      }
    };

    // Safari sends native gesture* events for trackpad pinch with a smooth
    // e.scale; preferring these over the ctrl+wheel fallback gives a much
    // better feel there. No-ops on other browsers. Safari also fires
    // ctrlKey wheel events during the same pinch — isGesturing makes
    // onWheel drop those entirely so they neither zoom nor pan.
    let gsBase = 1;
    let isGesturing = false;
    const onGestureStart = e => {
      e.preventDefault();
      isGesturing = true;
      gsBase = tf.current.scale;
    };
    const onGestureChange = e => {
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, gsBase * e.scale / tf.current.scale);
    };
    const onGestureEnd = e => {
      e.preventDefault();
      isGesturing = false;
    };

    // Drag-pan: middle button anywhere, or primary button on canvas
    // background (anything that isn't an artboard or an inline editor).
    let drag = null;
    const onPointerDown = e => {
      const onBg = !e.target.closest('[data-dc-slot], .dc-editable');
      if (!(e.button === 1 || e.button === 0 && onBg)) return;
      e.preventDefault();
      vp.setPointerCapture(e.pointerId);
      drag = {
        id: e.pointerId,
        lx: e.clientX,
        ly: e.clientY
      };
      vp.style.cursor = 'grabbing';
    };
    const onPointerMove = e => {
      if (!drag || e.pointerId !== drag.id) return;
      tf.current.x += e.clientX - drag.lx;
      tf.current.y += e.clientY - drag.ly;
      drag.lx = e.clientX;
      drag.ly = e.clientY;
      apply();
    };
    const onPointerUp = e => {
      if (!drag || e.pointerId !== drag.id) return;
      vp.releasePointerCapture(e.pointerId);
      drag = null;
      vp.style.cursor = '';
    };
    vp.addEventListener('wheel', onWheel, {
      passive: false
    });
    vp.addEventListener('gesturestart', onGestureStart, {
      passive: false
    });
    vp.addEventListener('gesturechange', onGestureChange, {
      passive: false
    });
    vp.addEventListener('gestureend', onGestureEnd, {
      passive: false
    });
    vp.addEventListener('pointerdown', onPointerDown);
    vp.addEventListener('pointermove', onPointerMove);
    vp.addEventListener('pointerup', onPointerUp);
    vp.addEventListener('pointercancel', onPointerUp);
    return () => {
      vp.removeEventListener('wheel', onWheel);
      vp.removeEventListener('gesturestart', onGestureStart);
      vp.removeEventListener('gesturechange', onGestureChange);
      vp.removeEventListener('gestureend', onGestureEnd);
      vp.removeEventListener('pointerdown', onPointerDown);
      vp.removeEventListener('pointermove', onPointerMove);
      vp.removeEventListener('pointerup', onPointerUp);
      vp.removeEventListener('pointercancel', onPointerUp);
    };
  }, [apply, minScale, maxScale]);
  const gridSvg = `url("data:image/svg+xml,%3Csvg width='120' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M120 0H0v120' fill='none' stroke='${encodeURIComponent(DC.grid)}' stroke-width='1'/%3E%3C/svg%3E")`;
  return /*#__PURE__*/React.createElement("div", {
    ref: vpRef,
    className: "design-canvas",
    style: {
      height: '100vh',
      width: '100vw',
      background: DC.bg,
      overflow: 'hidden',
      overscrollBehavior: 'none',
      touchAction: 'none',
      position: 'relative',
      fontFamily: DC.font,
      boxSizing: 'border-box',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: worldRef,
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      transformOrigin: '0 0',
      willChange: 'transform',
      width: 'max-content',
      minWidth: '100%',
      minHeight: '100%',
      padding: '60px 0 80px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: -6000,
      backgroundImage: gridSvg,
      backgroundSize: '120px 120px',
      pointerEvents: 'none',
      zIndex: -1
    }
  }), children));
}

// ─────────────────────────────────────────────────────────────
// DCSection — editable title + h-row of artboards in persisted order
// ─────────────────────────────────────────────────────────────
function DCSection({
  id,
  title,
  subtitle,
  children,
  gap = 48
}) {
  const ctx = React.useContext(DCCtx);
  const sid = id ?? title;
  const all = React.Children.toArray(children);
  const artboards = all.filter(c => c && c.type === DCArtboard);
  const rest = all.filter(c => !(c && c.type === DCArtboard));
  const srcOrder = artboards.map(a => a.props.id ?? a.props.label);
  const sec = ctx && sid && ctx.section(sid) || {};
  const order = React.useMemo(() => {
    const kept = (sec.order || []).filter(k => srcOrder.includes(k));
    return [...kept, ...srcOrder.filter(k => !kept.includes(k))];
  }, [sec.order, srcOrder.join('|')]);
  const byId = Object.fromEntries(artboards.map(a => [a.props.id ?? a.props.label, a]));
  return /*#__PURE__*/React.createElement("div", {
    "data-dc-section": sid,
    style: {
      marginBottom: 80,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 60px 56px'
    }
  }, /*#__PURE__*/React.createElement(DCEditable, {
    tag: "div",
    value: sec.title ?? title,
    onChange: v => ctx && sid && ctx.patchSection(sid, {
      title: v
    }),
    style: {
      fontSize: 28,
      fontWeight: 600,
      color: DC.title,
      letterSpacing: -0.4,
      marginBottom: 6,
      display: 'inline-block'
    }
  }), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      color: DC.subtitle
    }
  }, subtitle)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap,
      padding: '0 60px',
      alignItems: 'flex-start',
      width: 'max-content'
    }
  }, order.map(k => /*#__PURE__*/React.createElement(DCArtboardFrame, {
    key: k,
    sectionId: sid,
    artboard: byId[k],
    order: order,
    label: (sec.labels || {})[k] ?? byId[k].props.label,
    onRename: v => ctx && ctx.patchSection(sid, x => ({
      labels: {
        ...x.labels,
        [k]: v
      }
    })),
    onReorder: next => ctx && ctx.patchSection(sid, {
      order: next
    }),
    onFocus: () => ctx && ctx.setFocus(`${sid}/${k}`)
  }))), rest);
}

// DCArtboard — marker; rendered by DCArtboardFrame via DCSection.
function DCArtboard() {
  return null;
}
function DCArtboardFrame({
  sectionId,
  artboard,
  label,
  order,
  onRename,
  onReorder,
  onFocus
}) {
  const {
    id: rawId,
    label: rawLabel,
    width = 260,
    height = 480,
    children,
    style = {}
  } = artboard.props;
  const id = rawId ?? rawLabel;
  const ref = React.useRef(null);

  // Live drag-reorder: dragged card sticks to cursor; siblings slide into
  // their would-be slots in real time via transforms. DOM order only
  // changes on drop.
  const onGripDown = e => {
    e.preventDefault();
    e.stopPropagation();
    const me = ref.current;
    // translateX is applied in local (pre-scale) space but pointer deltas and
    // getBoundingClientRect().left are screen-space — divide by the viewport's
    // current scale so the dragged card tracks the cursor at any zoom level.
    const scale = me.getBoundingClientRect().width / me.offsetWidth || 1;
    const peers = Array.from(document.querySelectorAll(`[data-dc-section="${sectionId}"] [data-dc-slot]`));
    const homes = peers.map(el => ({
      el,
      id: el.dataset.dcSlot,
      x: el.getBoundingClientRect().left
    }));
    const slotXs = homes.map(h => h.x);
    const startIdx = order.indexOf(id);
    const startX = e.clientX;
    let liveOrder = order.slice();
    me.classList.add('dc-dragging');
    const layout = () => {
      for (const h of homes) {
        if (h.id === id) continue;
        const slot = liveOrder.indexOf(h.id);
        h.el.style.transform = `translateX(${(slotXs[slot] - h.x) / scale}px)`;
      }
    };
    const move = ev => {
      const dx = ev.clientX - startX;
      me.style.transform = `translateX(${dx / scale}px)`;
      const cur = homes[startIdx].x + dx;
      let nearest = 0,
        best = Infinity;
      for (let i = 0; i < slotXs.length; i++) {
        const d = Math.abs(slotXs[i] - cur);
        if (d < best) {
          best = d;
          nearest = i;
        }
      }
      if (liveOrder.indexOf(id) !== nearest) {
        liveOrder = order.filter(k => k !== id);
        liveOrder.splice(nearest, 0, id);
        layout();
      }
    };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      const finalSlot = liveOrder.indexOf(id);
      me.classList.remove('dc-dragging');
      me.style.transform = `translateX(${(slotXs[finalSlot] - homes[startIdx].x) / scale}px)`;
      // After the settle transition, kill transitions + clear transforms +
      // commit the reorder in the same frame so there's no visual snap-back.
      setTimeout(() => {
        for (const h of homes) {
          h.el.style.transition = 'none';
          h.el.style.transform = '';
        }
        if (liveOrder.join('|') !== order.join('|')) onReorder(liveOrder);
        requestAnimationFrame(() => requestAnimationFrame(() => {
          for (const h of homes) h.el.style.transition = '';
        }));
      }, 180);
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    "data-dc-slot": id,
    style: {
      position: 'relative',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-labelrow",
    style: {
      position: 'absolute',
      bottom: '100%',
      left: -4,
      marginBottom: 4,
      color: DC.label
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-grip",
    onPointerDown: onGripDown,
    title: "Drag to reorder"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "9",
    height: "13",
    viewBox: "0 0 9 13",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "2",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "2",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "6.5",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "6.5",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "11",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "11",
    r: "1.1"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "dc-labeltext",
    onClick: onFocus,
    title: "Click to focus"
  }, /*#__PURE__*/React.createElement(DCEditable, {
    value: label,
    onChange: onRename,
    onClick: e => e.stopPropagation(),
    style: {
      fontSize: 15,
      fontWeight: 500,
      color: DC.label,
      lineHeight: 1
    }
  }))), /*#__PURE__*/React.createElement("button", {
    className: "dc-expand",
    onClick: onFocus,
    onPointerDown: e => e.stopPropagation(),
    title: "Focus"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 12 12",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M7 1h4v4M5 11H1V7M11 1L7.5 4.5M1 11l3.5-3.5"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "dc-card",
    style: {
      borderRadius: 2,
      boxShadow: '0 1px 3px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.06)',
      overflow: 'hidden',
      width,
      height,
      background: '#fff',
      ...style
    }
  }, children || /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#bbb',
      fontSize: 13,
      fontFamily: DC.font
    }
  }, id)));
}

// Inline rename — commits on blur or Enter.
function DCEditable({
  value,
  onChange,
  style,
  tag = 'span',
  onClick
}) {
  const T = tag;
  return /*#__PURE__*/React.createElement(T, {
    className: "dc-editable",
    contentEditable: true,
    suppressContentEditableWarning: true,
    onClick: onClick,
    onPointerDown: e => e.stopPropagation(),
    onBlur: e => onChange && onChange(e.currentTarget.textContent),
    onKeyDown: e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.currentTarget.blur();
      }
    },
    style: style
  }, value);
}

// ─────────────────────────────────────────────────────────────
// Focus mode — overlay one artboard; ←/→ within section, ↑/↓ across
// sections, Esc or backdrop click to exit.
// ─────────────────────────────────────────────────────────────
function DCFocusOverlay({
  entry,
  sectionMeta,
  sectionOrder
}) {
  const ctx = React.useContext(DCCtx);
  const {
    sectionId,
    artboard
  } = entry;
  const sec = ctx.section(sectionId);
  const meta = sectionMeta[sectionId];
  const peers = meta.slotIds;
  const aid = artboard.props.id ?? artboard.props.label;
  const idx = peers.indexOf(aid);
  const secIdx = sectionOrder.indexOf(sectionId);
  const go = d => {
    const n = peers[(idx + d + peers.length) % peers.length];
    if (n) ctx.setFocus(`${sectionId}/${n}`);
  };
  const goSection = d => {
    const ns = sectionOrder[(secIdx + d + sectionOrder.length) % sectionOrder.length];
    const first = sectionMeta[ns] && sectionMeta[ns].slotIds[0];
    if (first) ctx.setFocus(`${ns}/${first}`);
  };
  React.useEffect(() => {
    const k = e => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(-1);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(1);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        goSection(-1);
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        goSection(1);
      }
    };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  });
  const {
    width = 260,
    height = 480,
    children
  } = artboard.props;
  const [vp, setVp] = React.useState({
    w: window.innerWidth,
    h: window.innerHeight
  });
  React.useEffect(() => {
    const r = () => setVp({
      w: window.innerWidth,
      h: window.innerHeight
    });
    window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  }, []);
  const scale = Math.max(0.1, Math.min((vp.w - 200) / width, (vp.h - 260) / height, 2));
  const [ddOpen, setDd] = React.useState(false);
  const Arrow = ({
    dir,
    onClick
  }) => /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      onClick();
    },
    style: {
      position: 'absolute',
      top: '50%',
      [dir]: 28,
      transform: 'translateY(-50%)',
      border: 'none',
      background: 'rgba(255,255,255,.08)',
      color: 'rgba(255,255,255,.9)',
      width: 44,
      height: 44,
      borderRadius: 22,
      fontSize: 18,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background .15s'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'rgba(255,255,255,.18)',
    onMouseLeave: e => e.currentTarget.style.background = 'rgba(255,255,255,.08)'
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 18 18",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: dir === 'left' ? 'M11 3L5 9l6 6' : 'M7 3l6 6-6 6'
  })));

  // Portal to body so position:fixed is the real viewport regardless of any
  // transform on DesignCanvas's ancestors (including the canvas zoom itself).
  return ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
    onClick: () => ctx.setFocus(null),
    onWheel: e => e.preventDefault(),
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'rgba(24,20,16,.6)',
      backdropFilter: 'blur(14px)',
      fontFamily: DC.font,
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 72,
      display: 'flex',
      alignItems: 'flex-start',
      padding: '16px 20px 0',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setDd(o => !o),
    style: {
      border: 'none',
      background: 'transparent',
      color: '#fff',
      cursor: 'pointer',
      padding: '6px 8px',
      borderRadius: 6,
      textAlign: 'left',
      fontFamily: 'inherit'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18,
      fontWeight: 600,
      letterSpacing: -0.3
    }
  }, meta.title), /*#__PURE__*/React.createElement("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 11 11",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    style: {
      opacity: .7
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2 4l3.5 3.5L9 4"
  }))), meta.subtitle && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 13,
      opacity: .6,
      fontWeight: 400,
      marginTop: 2
    }
  }, meta.subtitle)), ddOpen && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '100%',
      left: 0,
      marginTop: 4,
      background: '#2a251f',
      borderRadius: 8,
      boxShadow: '0 8px 32px rgba(0,0,0,.4)',
      padding: 4,
      minWidth: 200,
      zIndex: 10
    }
  }, sectionOrder.map(sid => /*#__PURE__*/React.createElement("button", {
    key: sid,
    onClick: () => {
      setDd(false);
      const f = sectionMeta[sid].slotIds[0];
      if (f) ctx.setFocus(`${sid}/${f}`);
    },
    style: {
      display: 'block',
      width: '100%',
      textAlign: 'left',
      border: 'none',
      cursor: 'pointer',
      background: sid === sectionId ? 'rgba(255,255,255,.1)' : 'transparent',
      color: '#fff',
      padding: '8px 12px',
      borderRadius: 5,
      fontSize: 14,
      fontWeight: sid === sectionId ? 600 : 400,
      fontFamily: 'inherit'
    }
  }, sectionMeta[sid].title)))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => ctx.setFocus(null),
    onMouseEnter: e => e.currentTarget.style.background = 'rgba(255,255,255,.12)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent',
    style: {
      border: 'none',
      background: 'transparent',
      color: 'rgba(255,255,255,.7)',
      width: 32,
      height: 32,
      borderRadius: 16,
      fontSize: 20,
      cursor: 'pointer',
      lineHeight: 1,
      transition: 'background .12s'
    }
  }, "\xD7")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 64,
      bottom: 56,
      left: 100,
      right: 100,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: width * scale,
      height: height * scale,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      height,
      transform: `scale(${scale})`,
      transformOrigin: 'top left',
      background: '#fff',
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: '0 20px 80px rgba(0,0,0,.4)'
    }
  }, children || /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#bbb'
    }
  }, aid))), /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      fontSize: 14,
      fontWeight: 500,
      opacity: .85,
      textAlign: 'center'
    }
  }, (sec.labels || {})[aid] ?? artboard.props.label, /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: .5,
      marginLeft: 10,
      fontVariantNumeric: 'tabular-nums'
    }
  }, idx + 1, " / ", peers.length))), /*#__PURE__*/React.createElement(Arrow, {
    dir: "left",
    onClick: () => go(-1)
  }), /*#__PURE__*/React.createElement(Arrow, {
    dir: "right",
    onClick: () => go(1)
  }), /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: 'absolute',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: 8
    }
  }, peers.map((p, i) => /*#__PURE__*/React.createElement("button", {
    key: p,
    onClick: () => ctx.setFocus(`${sectionId}/${p}`),
    style: {
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      width: 6,
      height: 6,
      borderRadius: 3,
      background: i === idx ? '#fff' : 'rgba(255,255,255,.3)'
    }
  })))), document.body);
}

// ─────────────────────────────────────────────────────────────
// Post-it — absolute-positioned sticky note
// ─────────────────────────────────────────────────────────────
function DCPostIt({
  children,
  top,
  left,
  right,
  bottom,
  rotate = -2,
  width = 180
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top,
      left,
      right,
      bottom,
      width,
      background: DC.postitBg,
      padding: '14px 16px',
      fontFamily: '"Comic Sans MS", "Marker Felt", "Segoe Print", cursive',
      fontSize: 14,
      lineHeight: 1.4,
      color: DC.postitText,
      boxShadow: '0 2px 8px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
      transform: `rotate(${rotate}deg)`,
      zIndex: 5
    }
  }, children);
}
Object.assign(window, {
  DesignCanvas,
  DCSection,
  DCArtboard,
  DCPostIt
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "sleep/design-canvas.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/AuthModal.jsx
try { (() => {
// AuthModal — glass-strong modal with tab switcher (Sign in / Create account).
const AuthModal = ({
  open,
  onClose,
  onSuccess
}) => {
  const [mode, setMode] = React.useState('signin');
  const [email, setEmail] = React.useState('alex@optihealth.app');
  const [password, setPassword] = React.useState('••••••••');
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 50,
      background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'fadeIn .2s ease'
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement(GlassStrong, {
    style: {
      width: 420,
      padding: 32,
      animation: 'popIn .25s cubic-bezier(.2,.8,.2,1.2)'
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 24px/1.2 Geist, system-ui, sans-serif',
      letterSpacing: '-0.01em'
    }
  }, "Welcome to optiHealth"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '400 14px/1.4 Geist, system-ui, sans-serif',
      color: 'rgba(255,255,255,0.7)',
      marginTop: 6
    }
  }, "Your proofable biohacking platform")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      gap: 4,
      padding: 4,
      background: 'rgba(255,255,255,0.10)',
      borderRadius: 9999,
      marginBottom: 20,
      width: '100%'
    }
  }, ['signin', 'signup'].map(m => /*#__PURE__*/React.createElement("button", {
    key: m,
    onClick: () => setMode(m),
    style: {
      flex: 1,
      padding: '6px 14px',
      borderRadius: 9999,
      border: 'none',
      cursor: 'pointer',
      font: '500 13px Geist, system-ui, sans-serif',
      background: mode === m ? 'rgba(255,255,255,0.80)' : 'transparent',
      color: mode === m ? '#0a0a0a' : 'rgba(255,255,255,0.8)',
      transition: 'all .15s'
    }
  }, m === 'signin' ? 'Sign in' : 'Create account'))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '500 13px Geist, system-ui, sans-serif',
      marginBottom: 6
    }
  }, "Email"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      borderRadius: 12,
      border: '1px solid rgba(255,255,255,0.20)',
      background: 'rgba(255,255,255,0.10)',
      backdropFilter: 'blur(12px)',
      padding: '10px 12px'
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: email,
    onChange: e => setEmail(e.target.value),
    style: {
      flex: 1,
      background: 'transparent',
      border: 'none',
      outline: 'none',
      color: '#fff',
      font: '400 14px Geist, system-ui, sans-serif'
    }
  }))), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '500 13px Geist, system-ui, sans-serif',
      marginBottom: 6
    }
  }, "Password"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      borderRadius: 12,
      border: '1px solid rgba(255,255,255,0.20)',
      background: 'rgba(255,255,255,0.10)',
      backdropFilter: 'blur(12px)',
      padding: '10px 12px'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "password",
    value: password,
    onChange: e => setPassword(e.target.value),
    style: {
      flex: 1,
      background: 'transparent',
      border: 'none',
      outline: 'none',
      color: '#fff',
      font: '400 14px Geist, system-ui, sans-serif'
    }
  }))), mode === 'signin' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      font: '400 13px Geist, system-ui, sans-serif',
      color: 'rgba(255,255,255,0.8)'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    defaultChecked: true
  }), " Remember me"), /*#__PURE__*/React.createElement("a", {
    style: {
      color: 'rgba(255,255,255,0.9)',
      textDecoration: 'underline',
      cursor: 'pointer'
    }
  }, "Forgot password?")), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    style: {
      width: '100%',
      justifyContent: 'center'
    },
    onClick: onSuccess
  }, mode === 'signin' ? 'Sign in' : 'Create account'), /*#__PURE__*/React.createElement(Button, {
    variant: "demo",
    size: "md",
    style: {
      width: '100%',
      justifyContent: 'center'
    },
    onClick: onSuccess
  }, "Demo login")), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginTop: 18,
      font: '400 12px Geist, system-ui, sans-serif',
      color: 'rgba(255,255,255,0.6)'
    }
  }, "By continuing you agree to our ", /*#__PURE__*/React.createElement("a", {
    style: {
      color: 'rgba(255,255,255,0.9)',
      textDecoration: 'underline'
    }
  }, "Terms"), " and ", /*#__PURE__*/React.createElement("a", {
    style: {
      color: 'rgba(255,255,255,0.9)',
      textDecoration: 'underline'
    }
  }, "Privacy Policy"), ".")));
};
window.AuthModal = AuthModal;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/AuthModal.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Button — web variants. Matches shadcn button.tsx mapped to the glass world.
const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  onClick,
  style = {},
  ...rest
}) => {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
    fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif',
    fontWeight: 600,
    lineHeight: 1,
    border: '1px solid transparent',
    transition: 'all .15s',
    userSelect: 'none',
    whiteSpace: 'nowrap'
  };
  const sizes = {
    sm: {
      padding: '6px 12px',
      fontSize: 12,
      borderRadius: 10
    },
    md: {
      padding: '10px 16px',
      fontSize: 14,
      borderRadius: 12
    },
    lg: {
      padding: '12px 20px',
      fontSize: 16,
      borderRadius: 12
    },
    icon: {
      width: 36,
      height: 36,
      padding: 0,
      justifyContent: 'center',
      borderRadius: 10,
      fontSize: 14
    }
  };
  const variants = {
    primary: {
      background: '#fff',
      color: '#0a0a0a',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
    },
    glass: {
      background: 'rgba(255,255,255,0.10)',
      color: '#fff',
      borderColor: 'rgba(255,255,255,0.20)',
      backdropFilter: 'blur(12px)'
    },
    ghost: {
      background: 'transparent',
      color: '#fff',
      borderColor: 'rgba(255,255,255,0.20)'
    },
    destructive: {
      background: '#e25555',
      color: '#fff'
    },
    demo: {
      background: 'rgba(254,240,138,0.95)',
      color: '#713f12',
      borderColor: 'rgba(254,240,138,0.60)'
    }
  };
  const [down, setDown] = React.useState(false);
  const [hover, setHover] = React.useState(false);
  const hoverStyle = hover ? variant === 'primary' ? {
    background: 'rgba(255,255,255,0.92)'
  } : variant === 'glass' ? {
    background: 'rgba(255,255,255,0.15)'
  } : variant === 'ghost' ? {
    background: 'rgba(255,255,255,0.08)'
  } : {} : {};
  return /*#__PURE__*/React.createElement("button", _extends({
    style: {
      ...base,
      ...sizes[size],
      ...variants[variant],
      ...hoverStyle,
      transform: down ? 'scale(0.98)' : 'scale(1)',
      ...style
    },
    onMouseDown: () => setDown(true),
    onMouseUp: () => setDown(false),
    onMouseLeave: () => {
      setDown(false);
      setHover(false);
    },
    onMouseEnter: () => setHover(true),
    onClick: onClick
  }, rest), icon, children);
};
window.Button = Button;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/Button.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/Dashboard.jsx
try { (() => {
// Dashboard — a plausible daily view following dashboard-nav.tsx patterns.
const DashboardNav = ({
  onLogout
}) => {
  const items = [{
    Icon: IconDashboard,
    label: 'Dashboard',
    active: true
  }, {
    Icon: IconBarChart,
    label: 'Analytics'
  }, {
    Icon: IconBook,
    label: 'Journal'
  }, {
    Icon: IconBrain,
    label: 'Insights'
  }, {
    Icon: IconTarget,
    label: 'Protocols'
  }];
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 40,
      borderBottom: '1px solid rgba(255,255,255,0.10)',
      background: 'rgba(255,255,255,0.05)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1400,
      margin: '0 auto',
      padding: '0 32px',
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 26,
      height: 26,
      borderRadius: 6,
      border: '2px solid #fff',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '50%',
      top: 0,
      bottom: 0,
      width: 2,
      background: '#fff'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 4,
      bottom: 3,
      width: 8,
      height: 8,
      borderRadius: '50%',
      border: '2px solid #4ade80'
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '700 16px Geist, system-ui, sans-serif'
    }
  }, "optiHealth")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4
    }
  }, items.map((it, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 12px',
      borderRadius: 10,
      border: 'none',
      cursor: 'pointer',
      background: it.active ? 'rgba(255,255,255,0.10)' : 'transparent',
      color: it.active ? '#fff' : 'rgba(255,255,255,0.7)',
      font: '500 13px Geist, system-ui, sans-serif',
      transition: 'all .15s'
    },
    onMouseEnter: e => {
      if (!it.active) {
        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
        e.currentTarget.style.color = '#fff';
      }
    },
    onMouseLeave: e => {
      if (!it.active) {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
      }
    }
  }, /*#__PURE__*/React.createElement(it.Icon, {
    size: 16
  }), it.label)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "glass",
    size: "sm",
    icon: /*#__PURE__*/React.createElement(IconPlus, {
      size: 14
    })
  }, "Log data"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "icon"
  }, /*#__PURE__*/React.createElement(IconSettings, {
    size: 16
  })), /*#__PURE__*/React.createElement("button", {
    onClick: onLogout,
    style: {
      width: 36,
      height: 36,
      borderRadius: 10,
      border: '1px solid rgba(255,255,255,0.20)',
      background: 'transparent',
      color: '#fff',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    title: "Sign out"
  }, /*#__PURE__*/React.createElement(IconLogOut, {
    size: 16
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 32,
      height: 32,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #60a5fa, #c084fc)',
      font: '600 13px Geist',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, "AK"))));
};

// Tiny sparkline helper using SVG
const Spark = ({
  data,
  color = '#4ade80',
  width = 140,
  height = 36,
  fill = true
}) => {
  const max = Math.max(...data),
    min = Math.min(...data);
  const pts = data.map((v, i) => [i / (data.length - 1) * width, height - (v - min) / (max - min || 1) * height]);
  const path = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = path + ` L ${width} ${height} L 0 ${height} Z`;
  return /*#__PURE__*/React.createElement("svg", {
    width: width,
    height: height
  }, fill && /*#__PURE__*/React.createElement("path", {
    d: area,
    fill: color,
    opacity: "0.15"
  }), /*#__PURE__*/React.createElement("path", {
    d: path,
    stroke: color,
    strokeWidth: "2",
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }));
};
const MetricTile = ({
  label,
  value,
  unit,
  delta,
  color,
  data,
  icon
}) => /*#__PURE__*/React.createElement(Glass, {
  style: {
    padding: 20
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    color: 'rgba(255,255,255,0.7)',
    font: '500 12px Geist, system-ui, sans-serif',
    letterSpacing: '0.04em',
    textTransform: 'uppercase'
  }
}, icon, label), /*#__PURE__*/React.createElement("span", {
  style: {
    font: '500 11px Geist, system-ui, sans-serif',
    color: delta >= 0 ? '#4ade80' : '#f87171'
  }
}, delta >= 0 ? '▲' : '▼', " ", Math.abs(delta), "%")), /*#__PURE__*/React.createElement("div", {
  style: {
    font: '700 32px/1.1 Geist, system-ui, sans-serif',
    letterSpacing: '-0.01em',
    marginTop: 10
  }
}, value, /*#__PURE__*/React.createElement("span", {
  style: {
    font: '500 14px Geist Mono, ui-monospace, monospace',
    color: 'rgba(255,255,255,0.6)',
    marginLeft: 6
  }
}, unit)), /*#__PURE__*/React.createElement("div", {
  style: {
    marginTop: 8
  }
}, /*#__PURE__*/React.createElement(Spark, {
  data: data,
  color: color
})));
const Dashboard = () => {
  const supplements = [{
    name: 'Magnesium Glycinate',
    dose: '400 mg',
    time: '22:00',
    taken: true
  }, {
    name: 'Creatine monohydrate',
    dose: '5 g',
    time: '08:30',
    taken: true
  }, {
    name: 'Vitamin D3',
    dose: '4000 IU',
    time: '08:30',
    taken: true
  }, {
    name: 'Omega-3 (EPA/DHA)',
    dose: '2 g',
    time: '13:00',
    taken: false
  }, {
    name: 'Ashwagandha KSM-66',
    dose: '600 mg',
    time: '21:00',
    taken: false
  }];
  const insights = [{
    accent: '#c084fc',
    Icon: IconBrain,
    title: 'Sleep correlates with magnesium timing',
    body: 'When you take magnesium before 22:00, your deep sleep averages 1h 42m (+18% vs late). n=37 nights.'
  }, {
    accent: '#4ade80',
    Icon: IconTrendingUp,
    title: 'HRV trending up',
    body: 'Your 7-day HRV has climbed 8 ms over the last 3 weeks. Matches your reduced caffeine after 14:00.'
  }, {
    accent: '#facc15',
    Icon: IconShield,
    title: 'Protocol #3 hit significance',
    body: 'Ashwagandha + cold plunge vs baseline: resting HR down 4.2 bpm, p=0.03 over 28 days.'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1400,
      margin: '0 auto',
      padding: '32px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'end',
      marginBottom: 28
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '500 13px Geist, system-ui, sans-serif',
      color: 'rgba(255,255,255,0.7)',
      letterSpacing: '0.05em',
      textTransform: 'uppercase'
    }
  }, "Sunday \xB7 April 19"), /*#__PURE__*/React.createElement("h1", {
    style: {
      font: '700 36px/1.1 Geist, system-ui, sans-serif',
      letterSpacing: '-0.01em',
      marginTop: 4
    }
  }, "Good morning, Alex"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '400 15px Geist, system-ui, sans-serif',
      color: 'rgba(255,255,255,0.8)',
      marginTop: 6
    }
  }, "Your readiness is ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#4ade80',
      fontWeight: 600
    }
  }, "high"), " \u2014 a good day for harder training.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      padding: 4,
      background: 'rgba(255,255,255,0.10)',
      borderRadius: 9999
    }
  }, ['Today', '7d', '30d', '90d'].map((k, i) => /*#__PURE__*/React.createElement("button", {
    key: k,
    style: {
      padding: '6px 14px',
      borderRadius: 9999,
      border: 'none',
      cursor: 'pointer',
      background: i === 1 ? 'rgba(255,255,255,0.80)' : 'transparent',
      color: i === 1 ? '#0a0a0a' : 'rgba(255,255,255,0.8)',
      font: '500 13px Geist, system-ui, sans-serif'
    }
  }, k)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 16,
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(MetricTile, {
    label: "HRV",
    value: "58",
    unit: "ms",
    delta: 12,
    color: "#4ade80",
    icon: /*#__PURE__*/React.createElement(IconActivity, {
      size: 14
    }),
    data: [42, 45, 41, 47, 50, 48, 53, 55, 54, 58]
  }), /*#__PURE__*/React.createElement(MetricTile, {
    label: "Deep sleep",
    value: "1:42",
    unit: "h",
    delta: 8,
    color: "#60a5fa",
    icon: /*#__PURE__*/React.createElement(IconMoon, {
      size: 14
    }),
    data: [70, 85, 72, 88, 95, 90, 102, 98, 105, 102]
  }), /*#__PURE__*/React.createElement(MetricTile, {
    label: "Resting HR",
    value: "54",
    unit: "bpm",
    delta: -4,
    color: "#c084fc",
    icon: /*#__PURE__*/React.createElement(IconHeart, {
      size: 14
    }),
    data: [60, 58, 59, 57, 55, 56, 55, 54, 54, 54]
  }), /*#__PURE__*/React.createElement(MetricTile, {
    label: "Readiness",
    value: "87",
    unit: "/100",
    delta: 6,
    color: "#facc15",
    icon: /*#__PURE__*/React.createElement(IconZap, {
      size: 14
    }),
    data: [70, 72, 75, 78, 80, 82, 81, 84, 85, 87]
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Glass, {
    style: {
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '600 16px Geist, system-ui, sans-serif',
      whiteSpace: 'nowrap'
    }
  }, "AI insights"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '500 11px Geist Mono, ui-monospace, monospace',
      color: 'rgba(255,255,255,0.6)'
    }
  }, "3 new")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 12
    }
  }, insights.map((ins, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      gap: 14,
      padding: 16,
      borderRadius: 12,
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.10)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      borderRadius: 10,
      background: 'rgba(255,255,255,0.08)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement(ins.Icon, {
    size: 18,
    stroke: ins.accent
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '600 14px Geist, system-ui, sans-serif'
    }
  }, ins.title), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '400 13px/1.5 Geist, system-ui, sans-serif',
      color: 'rgba(255,255,255,0.7)',
      marginTop: 4
    }
  }, ins.body)))))), /*#__PURE__*/React.createElement(Glass, {
    style: {
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '600 16px Geist, system-ui, sans-serif',
      whiteSpace: 'nowrap'
    }
  }, "Today's stack"), /*#__PURE__*/React.createElement("button", {
    style: {
      border: 'none',
      background: 'transparent',
      color: 'rgba(255,255,255,0.7)',
      cursor: 'pointer',
      font: '500 12px Geist, system-ui, sans-serif'
    }
  }, "Manage \u2192")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 8
    }
  }, supplements.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 12px',
      borderRadius: 10,
      background: s.taken ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.05)',
      border: s.taken ? '1px solid rgba(74,222,128,0.25)' : '1px solid rgba(255,255,255,0.10)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 20,
      height: 20,
      borderRadius: 6,
      border: s.taken ? 'none' : '1.5px solid rgba(255,255,255,0.4)',
      background: s.taken ? '#4ade80' : 'transparent',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#083d21',
      font: '700 12px Geist'
    }
  }, s.taken ? '✓' : ''), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '500 13px Geist, system-ui, sans-serif',
      textDecoration: s.taken ? 'line-through' : 'none',
      color: s.taken ? 'rgba(255,255,255,0.6)' : '#fff',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, s.name), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '400 11px Geist Mono, ui-monospace, monospace',
      color: 'rgba(255,255,255,0.5)',
      marginTop: 2
    }
  }, s.dose, " \xB7 ", s.time))))))));
};
Object.assign(window, {
  DashboardNav,
  Dashboard,
  Spark,
  MetricTile
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/Dashboard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/GlassPrimitives.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Glass primitives — the 3 atomic surfaces that define the web product.
const PageWash = ({
  children,
  style
}) => /*#__PURE__*/React.createElement("div", {
  className: "page-wash",
  style: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #581c87 50%, #312e81 100%)',
    backgroundAttachment: 'fixed',
    color: '#fff',
    fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif',
    ...style
  }
}, children);
const Glass = ({
  children,
  hover,
  className = '',
  style,
  as: Tag = 'div',
  ...rest
}) => /*#__PURE__*/React.createElement(Tag, _extends({
  className: className,
  style: {
    background: 'rgba(255,255,255,0.10)',
    border: '1px solid rgba(255,255,255,0.20)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: 16,
    color: '#fff',
    transition: 'background .15s',
    ...style
  }
}, rest), children);
const GlassSubtle = ({
  children,
  style,
  ...rest
}) => /*#__PURE__*/React.createElement("div", _extends({
  style: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.10)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: 12,
    color: '#fff',
    ...style
  }
}, rest), children);
const GlassStrong = ({
  children,
  style,
  ...rest
}) => /*#__PURE__*/React.createElement("div", _extends({
  style: {
    background: 'rgba(255,255,255,0.20)',
    border: '1px solid rgba(255,255,255,0.20)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    borderRadius: 24,
    color: '#fff',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.45)',
    position: 'relative',
    overflow: 'hidden',
    ...style
  }
}, rest), /*#__PURE__*/React.createElement("div", {
  style: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'
  }
}), children);
Object.assign(window, {
  PageWash,
  Glass,
  GlassSubtle,
  GlassStrong
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/GlassPrimitives.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/Icons.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Icon helpers — minimal Lucide-alike set used across the kit.
// Stroke-based, 2px, currentColor. Matches lucide-react defaults.
const Icon = ({
  d,
  size = 20,
  stroke = 'currentColor',
  children,
  ...rest
}) => /*#__PURE__*/React.createElement("svg", _extends({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: stroke,
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, rest), d ? /*#__PURE__*/React.createElement("path", {
  d: d
}) : children);
const IconActivity = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("polyline", {
  points: "22 12 18 12 15 21 9 3 6 12 2 12"
}));
const IconBrain = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"
}));
const IconTrendingUp = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("polyline", {
  points: "22 7 13.5 15.5 8.5 10.5 2 17"
}), /*#__PURE__*/React.createElement("polyline", {
  points: "16 7 22 7 22 13"
}));
const IconHeart = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l8.84 8.84 8.84-8.84a5.5 5.5 0 0 0 0-7.78z"
}));
const IconShield = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
}));
const IconZap = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("polygon", {
  points: "13 2 3 14 12 14 11 22 21 10 12 10 13 2"
}));
const IconDashboard = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("rect", {
  x: "3",
  y: "3",
  width: "7",
  height: "9"
}), /*#__PURE__*/React.createElement("rect", {
  x: "14",
  y: "3",
  width: "7",
  height: "5"
}), /*#__PURE__*/React.createElement("rect", {
  x: "14",
  y: "12",
  width: "7",
  height: "9"
}), /*#__PURE__*/React.createElement("rect", {
  x: "3",
  y: "16",
  width: "7",
  height: "5"
}));
const IconBarChart = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("line", {
  x1: "3",
  y1: "20",
  x2: "3",
  y2: "10"
}), /*#__PURE__*/React.createElement("line", {
  x1: "9",
  y1: "20",
  x2: "9",
  y2: "4"
}), /*#__PURE__*/React.createElement("line", {
  x1: "15",
  y1: "20",
  x2: "15",
  y2: "14"
}), /*#__PURE__*/React.createElement("line", {
  x1: "21",
  y1: "20",
  x2: "21",
  y2: "8"
}));
const IconBook = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
}), /*#__PURE__*/React.createElement("path", {
  d: "M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
}));
const IconTarget = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "10"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "6"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "2"
}));
const IconSettings = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "3"
}), /*#__PURE__*/React.createElement("path", {
  d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9 1.65 1.65 0 0 0 4.27 7.18l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.37.16.7.4 1 .72.3.33.5.72.58 1.14"
}));
const IconLogOut = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
}), /*#__PURE__*/React.createElement("polyline", {
  points: "16 17 21 12 16 7"
}), /*#__PURE__*/React.createElement("line", {
  x1: "21",
  y1: "12",
  x2: "9",
  y2: "12"
}));
const IconMoon = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
}));
const IconPill = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
  d: "M10.5 20.5 3.5 13.5a5 5 0 0 1 7-7l7 7a5 5 0 0 1-7 7z"
}), /*#__PURE__*/React.createElement("line", {
  x1: "8.5",
  y1: "8.5",
  x2: "15.5",
  y2: "15.5"
}));
const IconDot = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "3",
  fill: "currentColor"
}));
const IconPlus = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("line", {
  x1: "12",
  y1: "5",
  x2: "12",
  y2: "19"
}), /*#__PURE__*/React.createElement("line", {
  x1: "5",
  y1: "12",
  x2: "19",
  y2: "12"
}));
const IconArrow = p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("line", {
  x1: "5",
  y1: "12",
  x2: "19",
  y2: "12"
}), /*#__PURE__*/React.createElement("polyline", {
  points: "12 5 19 12 12 19"
}));
Object.assign(window, {
  Icon,
  IconActivity,
  IconBrain,
  IconTrendingUp,
  IconHeart,
  IconShield,
  IconZap,
  IconDashboard,
  IconBarChart,
  IconBook,
  IconTarget,
  IconSettings,
  IconLogOut,
  IconMoon,
  IconPill,
  IconDot,
  IconPlus,
  IconArrow
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/Icons.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/Landing.jsx
try { (() => {
// Landing — hero + feature grid. Recreates features-showcase-page.tsx at high fidelity.
const FEATURES = [{
  Icon: IconActivity,
  color: '#60a5fa',
  title: 'Comprehensive Tracking',
  body: 'Sleep, HRV, nutrition, mood, supplements — from wearables or manual logs.'
}, {
  Icon: IconBrain,
  color: '#c084fc',
  title: 'AI-Powered Insights',
  body: 'Ask plain-language questions. Surface correlations you would never find.'
}, {
  Icon: IconTrendingUp,
  color: '#4ade80',
  title: 'Advanced Analytics',
  body: 'Every metric you care about, graphed across arbitrary windows.'
}, {
  Icon: IconHeart,
  color: '#f87171',
  title: 'Holistic Health View',
  body: 'Mental and physical together — one database, one timeline.'
}, {
  Icon: IconShield,
  color: '#facc15',
  title: 'Privacy & Security',
  body: 'Client-side encrypted, zstd-compressed uploads. You own the data.'
}, {
  Icon: IconZap,
  color: '#fb923c',
  title: 'Real-time Sync',
  body: 'Live sync across phone, wearable and web. No manual export.'
}];
const Landing = ({
  onAuth
}) => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("nav", {
  style: {
    position: 'sticky',
    top: 0,
    zIndex: 40,
    borderBottom: '1px solid rgba(255,255,255,0.10)',
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)'
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    maxWidth: 1280,
    margin: '0 auto',
    padding: '0 32px',
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    alignItems: 'center',
    gap: 10
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    width: 28,
    height: 28,
    borderRadius: 6,
    border: '2px solid #fff',
    position: 'relative'
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 2,
    background: '#fff'
  }
}), /*#__PURE__*/React.createElement("div", {
  style: {
    position: 'absolute',
    left: 5,
    bottom: 4,
    width: 8,
    height: 8,
    borderRadius: '50%',
    border: '2px solid #4ade80'
  }
})), /*#__PURE__*/React.createElement("span", {
  style: {
    font: '700 18px Geist, system-ui, sans-serif',
    letterSpacing: '-0.01em'
  }
}, "optiHealth")), /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    gap: 8
  }
}, /*#__PURE__*/React.createElement(Button, {
  variant: "ghost",
  size: "md",
  onClick: onAuth
}, "Login / Sign up")))), /*#__PURE__*/React.createElement("section", {
  style: {
    maxWidth: 960,
    margin: '0 auto',
    padding: '96px 32px',
    textAlign: 'center'
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'inline-block',
    padding: '6px 14px',
    borderRadius: 9999,
    background: 'rgba(255,255,255,0.10)',
    border: '1px solid rgba(255,255,255,0.20)',
    backdropFilter: 'blur(12px)',
    font: '500 12px Geist, system-ui, sans-serif',
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 24,
    letterSpacing: '0.02em'
  }
}, "PROOFABLE BIOHACKING PLATFORM \xB7 N=1"), /*#__PURE__*/React.createElement("h1", {
  style: {
    font: '700 60px/1.05 Geist, system-ui, sans-serif',
    letterSpacing: '-0.02em',
    margin: 0
  }
}, "Transform your health data into", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
  style: {
    background: 'linear-gradient(90deg, #60a5fa, #c084fc)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  }
}, "actionable insights")), /*#__PURE__*/React.createElement("p", {
  style: {
    font: '400 18px/1.5 Geist, system-ui, sans-serif',
    color: 'rgba(255,255,255,0.8)',
    maxWidth: 640,
    margin: '24px auto 0',
    textWrap: 'pretty'
  }
}, "optiHealth empowers you to collect, visualize, and analyze your personal health data. Discover patterns, track progress, and unlock personalized insights with AI-powered analysis."), /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
    marginTop: 36
  }
}, /*#__PURE__*/React.createElement(Button, {
  variant: "primary",
  size: "lg",
  onClick: onAuth,
  icon: /*#__PURE__*/React.createElement(IconArrow, {
    size: 16
  })
}, "Start your journey"), /*#__PURE__*/React.createElement(Button, {
  variant: "glass",
  size: "lg"
}, "See how it works"))), /*#__PURE__*/React.createElement("section", {
  style: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '32px 32px 96px'
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    textAlign: 'center',
    marginBottom: 48
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    font: '500 13px Geist, system-ui, sans-serif',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase'
  }
}, "Everything you need"), /*#__PURE__*/React.createElement("h2", {
  style: {
    font: '700 36px/1.1 Geist, system-ui, sans-serif',
    letterSpacing: '-0.01em',
    marginTop: 8
  }
}, "to optimize your health")), /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 20
  }
}, FEATURES.map((f, i) => /*#__PURE__*/React.createElement(Glass, {
  key: i,
  style: {
    padding: 24
  }
}, /*#__PURE__*/React.createElement(f.Icon, {
  size: 22,
  stroke: f.color
}), /*#__PURE__*/React.createElement("div", {
  style: {
    font: '600 17px/1.3 Geist, system-ui, sans-serif',
    marginTop: 14
  }
}, f.title), /*#__PURE__*/React.createElement("div", {
  style: {
    font: '400 14px/1.5 Geist, system-ui, sans-serif',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 6
  }
}, f.body))))), /*#__PURE__*/React.createElement("section", {
  style: {
    maxWidth: 800,
    margin: '0 auto',
    padding: '0 32px 96px',
    textAlign: 'center'
  }
}, /*#__PURE__*/React.createElement(GlassStrong, {
  style: {
    padding: 48
  }
}, /*#__PURE__*/React.createElement("h3", {
  style: {
    font: '700 32px/1.1 Geist, system-ui, sans-serif',
    letterSpacing: '-0.01em',
    margin: 0
  }
}, "Ready to optimize your health?"), /*#__PURE__*/React.createElement("p", {
  style: {
    font: '400 16px/1.5 Geist, system-ui, sans-serif',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 12,
    maxWidth: 520,
    marginInline: 'auto'
  }
}, "Join thousands of users who are already transforming their health data into actionable insights."), /*#__PURE__*/React.createElement("div", {
  style: {
    marginTop: 28
  }
}, /*#__PURE__*/React.createElement(Button, {
  variant: "primary",
  size: "lg",
  onClick: onAuth
}, "Get started \u2014 it's free")))));
window.Landing = Landing;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/Landing.jsx", error: String((e && e.message) || e) }); }

})();

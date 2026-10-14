import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

const COLORS = ["#10B981", "#0284C7", "#64748B"];
const BASE = 100;
const POOL = 400;

const AgentCanvas = forwardRef(function AgentCanvas({ config = {}, onStats }, ref) {
  const canvasRef = useRef(null);
  const cfgRef = useRef({ agents: 140, volatility: 1, ...config });
  const stateRef = useRef({ shock: 0, sentiment: 0.1, regime: 0.1, volBase: 1, prevRet: 0 });
  const statsRef = useRef(onStats);

  useEffect(() => { cfgRef.current = { ...cfgRef.current, ...config }; }, [config]);
  useEffect(() => { statsRef.current = onStats; }, [onStats]);

  useImperativeHandle(ref, () => ({
    shock: () => { const s = stateRef.current; s.shock = 1; s.sentiment = -0.9; s.regime = -0.5; },
    panic: () => { const s = stateRef.current; s.shock = 1.6; s.sentiment = -1; s.regime = -0.9; },
    rally: () => { const s = stateRef.current; s.shock = 0; s.sentiment = 0.85; s.regime = 0.5; },
    recovery: () => { const s = stateRef.current; s.shock = 0; s.sentiment = 0.5; s.regime = 0.25; },
    bubble: () => { const s = stateRef.current; s.shock = 0; s.sentiment = 1; s.regime = 0.9; },
    calm: () => { const s = stateRef.current; s.shock = 0; s.sentiment = 0.1; s.regime = 0.05; },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf; let w = 0; let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const agents = Array.from({ length: POOL }, () => ({
      x: Math.random(), y: Math.random(), vx: 0, vy: 0,
      t: Math.floor(Math.random() * 3),
    }));
    let price = BASE;
    const series = Array.from({ length: 240 }, () => BASE);
    const mouse = { x: -10, y: -10 };
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) / r.width;
      mouse.y = (e.clientY - r.top) / r.height;
    };
    canvas.addEventListener("mousemove", onMove);

    let frame = 0;
    const tick = () => {
      const cfg = cfgRef.current;
      const s = stateRef.current;
      frame++;

      // regime switching: the market drifts between bull / bear / sideways phases
      if (frame % 220 === 0 && Math.random() < 0.65 && s.shock < 0.15) {
        s.regime = (Math.floor(Math.random() * 3) - 1) * (0.08 + Math.random() * 0.5);
      }
      // volatility clustering: calm periods and stormy periods
      s.volBase = Math.max(0.35, Math.min(2.1, s.volBase + (Math.random() - 0.5) * 0.06));

      s.shock *= 0.986;
      s.sentiment += (s.regime - s.sentiment) * 0.004 + (Math.random() - 0.5) * 0.045;
      s.sentiment = Math.max(-1, Math.min(1, s.sentiment));

      // return = sentiment drift + momentum + noise + weak mean reversion
      const vol = (0.1 + s.shock * 1.7) * cfg.volatility * s.volBase;
      const ret =
        s.sentiment * 0.3 * cfg.volatility +
        s.prevRet * 0.28 +
        (Math.random() - 0.5) * vol * 2.4 -
        ((price - BASE) / BASE) * 0.035;
      s.prevRet = ret;
      price = Math.max(5, price + ret);
      series.push(price);
      if (series.length > 260) series.shift();

      const N = Math.min(cfg.agents, POOL);
      for (let i = 0; i < N; i++) {
        const a = agents[i];
        const herd = a.t === 1 ? s.prevRet * 0.02 : a.t === 0 ? ((BASE - price) / BASE) * 0.004 : 0;
        a.vx += (Math.random() - 0.5) * 0.0013 + s.sentiment * 0.0006 * (a.t === 1 ? 1.8 : 1) + herd;
        a.vy += (Math.random() - 0.5) * 0.0013;
        if (s.shock > 0.25) {
          a.vx += (a.x - 0.5) * 0.005 * s.shock;
          a.vy += (a.y - 0.5) * 0.005 * s.shock;
        }
        const dx = a.x - mouse.x; const dy = a.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 0.012 && d2 > 0) { a.vx += dx * 0.02; a.vy += dy * 0.02; }
        a.vx *= 0.96; a.vy *= 0.96;
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0.02 || a.x > 0.98) { a.vx *= -1; a.x = Math.max(0.02, Math.min(0.98, a.x)); }
        if (a.y < 0.02 || a.y > 0.98) { a.vy *= -1; a.y = Math.max(0.02, Math.min(0.98, a.y)); }
      }

      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 0.55;
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const a = agents[i]; const b = agents[j];
          const d = Math.hypot((a.x - b.x) * w, (a.y - b.y) * h);
          if (d < 64) {
            ctx.strokeStyle = `rgba(16,185,129,${(1 - d / 64) * 0.2})`;
            ctx.beginPath(); ctx.moveTo(a.x * w, a.y * h); ctx.lineTo(b.x * w, b.y * h); ctx.stroke();
          }
        }
      }
      for (let i = 0; i < N; i++) {
        const a = agents[i];
        ctx.fillStyle = COLORS[a.t];
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.arc(a.x * w, a.y * h, a.t === 2 ? 1.3 : 2.1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      const min = Math.min(...series); const max = Math.max(...series);
      const range = max - min || 1;
      ctx.beginPath();
      series.forEach((p, i) => {
        const x = (i / (series.length - 1)) * w;
        const y = h - 20 - ((p - min) / range) * h * 0.45;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = s.sentiment >= 0 ? "#10B981" : "#EF4444";
      ctx.lineWidth = 1.7;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

      if (frame % 20 === 0 && statsRef.current) {
        statsRef.current({ price, change: ((price - BASE) / BASE) * 100, sentiment: s.sentiment });
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMove);
    };
  }, []);

  return <canvas ref={canvasRef} data-testid="hero-simulation-canvas" className="h-full w-full" />;
});

export default AgentCanvas;

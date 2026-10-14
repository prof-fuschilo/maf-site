import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

const COLORS = ["#10B981", "#0284C7", "#64748B"];

const AgentCanvas = forwardRef(function AgentCanvas(_props, ref) {
  const canvasRef = useRef(null);
  const stateRef = useRef({ shock: 0, sentiment: 0.15 });

  useImperativeHandle(ref, () => ({
    shock: () => { stateRef.current.shock = 1; stateRef.current.sentiment = -0.9; },
    rally: () => { stateRef.current.shock = 0; stateRef.current.sentiment = 0.85; },
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

    const N = 140;
    const agents = Array.from({ length: N }, () => ({
      x: Math.random(), y: Math.random(), vx: 0, vy: 0,
      t: Math.floor(Math.random() * 3),
    }));
    let price = 100;
    const series = Array.from({ length: 240 }, () => 100);
    const mouse = { x: -10, y: -10 };
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) / r.width;
      mouse.y = (e.clientY - r.top) / r.height;
    };
    canvas.addEventListener("mousemove", onMove);

    const tick = () => {
      const s = stateRef.current;
      s.shock *= 0.986;
      s.sentiment += (0.15 - s.sentiment) * 0.0025 + (Math.random() - 0.5) * 0.03;
      s.sentiment = Math.max(-1, Math.min(1, s.sentiment));

      const vol = 0.1 + s.shock * 1.7;
      price += s.sentiment * 0.32 + (Math.random() - 0.5) * vol * 2.4;
      series.push(price);
      if (series.length > 260) series.shift();

      for (const a of agents) {
        a.vx += (Math.random() - 0.5) * 0.0013 + s.sentiment * 0.0006 * (a.t === 1 ? 1.8 : 1);
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
      for (let i = 0; i < agents.length; i++) {
        for (let j = i + 1; j < agents.length; j++) {
          const a = agents[i]; const b = agents[j];
          const d = Math.hypot((a.x - b.x) * w, (a.y - b.y) * h);
          if (d < 64) {
            ctx.strokeStyle = `rgba(16,185,129,${(1 - d / 64) * 0.2})`;
            ctx.beginPath(); ctx.moveTo(a.x * w, a.y * h); ctx.lineTo(b.x * w, b.y * h); ctx.stroke();
          }
        }
      }
      for (const a of agents) {
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

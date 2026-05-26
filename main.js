/* ═══════════════════════════════════════
   VELTO — main.js  (Professional v3)
   ═══════════════════════════════════════ */
(function () {
  'use strict';

  /* ── NAV ── */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.style.boxShadow = window.scrollY > 20 ? '0 1px 12px rgba(0,0,0,0.06)' : '';
  }, { passive: true });

  const burger  = document.getElementById('burger');
  const mobMenu = document.getElementById('mobMenu');
  burger && burger.addEventListener('click', () => mobMenu.classList.toggle('open'));
  document.querySelectorAll('.mob-l').forEach(l =>
    l.addEventListener('click', () => mobMenu.classList.remove('open'))
  );

  /* ── NETWORK CANVAS ── */
  (function initNet() {
    const canvas = document.getElementById('netCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr  = window.devicePixelRatio || 1;
      W = canvas.width  = rect.width  * dpr;
      H = canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      W = rect.width; H = rect.height;
    }
    resize();
    window.addEventListener('resize', () => { resize(); });

    /* Node definitions */
    /* Each node: initial position (random) → target (structured grid) */
    const NODES = [
      { ix:.12, iy:.18, tx:.20, ty:.22, label:'BRAND' },
      { ix:.80, iy:.12, tx:.50, ty:.22, label:'MARKET' },
      { ix:.65, iy:.75, tx:.80, ty:.22, label:'GROWTH' },
      { ix:.20, iy:.82, tx:.20, ty:.55, label:'DATA' },
      { ix:.90, iy:.50, tx:.50, ty:.55, label:'VELTO' },
      { ix:.40, iy:.08, tx:.80, ty:.55, label:'SYSTEM' },
      { ix:.08, iy:.55, tx:.20, ty:.78, label:'OUTPUT' },
      { ix:.75, iy:.90, tx:.50, ty:.78, label:'RESULT' },
      { ix:.35, iy:.60, tx:.80, ty:.78, label:'ALIGN' },
    ];

    /* Edges between target nodes */
    const EDGES = [
      [0,1],[1,2],[0,3],[3,4],[1,4],[4,5],[3,6],[4,7],[5,8],[6,7],[7,8],[2,5]
    ];

    let phase = 0; // 0→1: scatter→align, loops
    let t = 0;
    let direction = 1;
    const SPEED = 0.003;

    function easeInOut(t) {
      return t < 0.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2;
    }
    function lerp(a,b,t) { return a + (b-a)*t; }

    function getPos(n, e) {
      return {
        x: lerp(n.ix, n.tx, e) * W,
        y: lerp(n.iy, n.ty, e) * H,
      };
    }

    function draw(ts) {
      ctx.clearRect(0, 0, W, H);

      // Draw fine grid in background
      ctx.strokeStyle = 'rgba(0,0,0,0.04)';
      ctx.lineWidth   = 0.8;
      const step = Math.round(W / 8);
      for (let x = 0; x < W; x += step) {
        ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke();
      }
      for (let y = 0; y < H; y += step) {
        ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
      }

      const e = easeInOut(phase);

      // Draw edges
      EDGES.forEach(([a,b]) => {
        const pa = getPos(NODES[a], e);
        const pb = getPos(NODES[b], e);
        const alpha = 0.06 + e * 0.22;
        ctx.strokeStyle = `rgba(17,18,18,${alpha})`;
        ctx.lineWidth   = 0.8;
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.stroke();
      });

      // Highlight "VELTO" node edges
      const veltoIdx = 4;
      const velto = getPos(NODES[veltoIdx], e);
      EDGES.filter(([a,b]) => a === veltoIdx || b === veltoIdx).forEach(([a,b]) => {
        const pa = getPos(NODES[a], e);
        const pb = getPos(NODES[b], e);
        ctx.strokeStyle = `rgba(255,214,0,${0.3 + e * 0.5})`;
        ctx.lineWidth   = 1.5;
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.stroke();
      });

      // Draw nodes
      NODES.forEach((n, i) => {
        const p   = getPos(n, e);
        const isV = i === veltoIdx;
        const r   = isV ? 8 : 5;

        // Node circle
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI*2);
        if (isV) {
          ctx.fillStyle = '#FFD600';
        } else {
          ctx.fillStyle = `rgba(17,18,18,${0.3 + e * 0.5})`;
        }
        ctx.fill();

        // Label (appears as nodes align)
        if (e > 0.5) {
          const labelAlpha = (e - 0.5) * 2;
          ctx.fillStyle = `rgba(80,80,80,${labelAlpha * 0.7})`;
          ctx.font = `${Math.round(W * 0.022)}px 'DM Mono', monospace`;
          ctx.textAlign = 'center';
          ctx.fillText(n.label, p.x, p.y - r - 5);
        }
      });

      // Advance phase
      t += SPEED;
      phase = (Math.sin(t * Math.PI) + 1) / 2; // oscillates 0→1→0

      requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
  })();

  /* ── COUNTER ── */
  function animCount(el) {
    const target = parseInt(el.dataset.target, 10);
    const dur = 1200;
    let start = null;
    function tick(ts) {
      if (!start) start = ts;
      const p = Math.min((ts-start)/dur, 1);
      el.textContent = Math.floor((1 - Math.pow(1-p,3)) * target);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    }
    requestAnimationFrame(tick);
  }

  /* ── INTERSECTION OBSERVER ── */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      if (el.classList.contains('reveal')) { el.classList.add('in'); io.unobserve(el); }
      if (el.classList.contains('hm-n'))   { animCount(el); io.unobserve(el); }
      if (el.classList.contains('mf-num')) { animCount(el); io.unobserve(el); }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  document.querySelectorAll('.hm-n, .mf-num').forEach(el => io.observe(el));

  /* ── CHIPS ── */
  document.querySelectorAll('.chip').forEach(c => {
    c.addEventListener('click', () => {
      document.querySelectorAll('.chip').forEach(x => x.classList.remove('active'));
      c.classList.add('active');
      const h = document.getElementById('f-domain');
      if (h) h.value = c.dataset.val;
    });
  });

  /* ── FORM ── */
  const form = document.getElementById('intakeForm');
  const ok   = document.getElementById('formOk');

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;

      [['f-name','fg-name'],['f-email','fg-email'],['f-cur','fg-cur'],['f-goal','fg-goal']]
        .forEach(([id, gid]) => {
          const inp = document.getElementById(id);
          const grp = document.getElementById(gid);
          if (!inp || !grp) return;
          const bad = !inp.value.trim() ||
            (id==='f-email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value));
          grp.classList.toggle('error', bad);
          if (bad) valid = false;
        });

      const dom = document.getElementById('f-domain');
      const dgp = document.getElementById('fg-domain');
      if (dom && dgp && !dom.value) {
        dgp.style.outline = '1px solid #ff6b6b';
        valid = false;
      } else if (dgp) { dgp.style.outline = ''; }

      if (!valid) return;

      const btn = document.getElementById('submitBtn');
      btn.textContent = '전송 중...'; btn.disabled = true;
      setTimeout(() => {
        form.querySelectorAll('.f-row,.fg,.f-footer').forEach(el => el.style.display='none');
        ok.classList.add('show');
      }, 900);
    });

    form.querySelectorAll('input,textarea').forEach(inp =>
      inp.addEventListener('input', () => inp.closest('.fg')?.classList.remove('error'))
    );
  }

})();

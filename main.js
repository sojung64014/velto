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

  /* ── TRAJECTORY CANVAS ── */
  (function initTraj() {
    const canvas = document.getElementById('trajCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr  = window.devicePixelRatio || 1;
      canvas.width  = rect.width  * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(1,0,0,1,0,0);
      ctx.scale(dpr, dpr);
      W = rect.width; H = rect.height;
    }
    resize();
    window.addEventListener('resize', () => { resize(); });

    // Bezier: bottom-left → upper-right with natural upward curve
    function getBez(t) {
      const p0x = 0.02*W, p0y = 0.87*H;
      const cpx  = 0.38*W, cpy  = 0.78*H;
      const p1x  = 0.97*W, p1y  = 0.08*H;
      return {
        x: (1-t)*(1-t)*p0x + 2*(1-t)*t*cpx + t*t*p1x,
        y: (1-t)*(1-t)*p0y + 2*(1-t)*t*cpy + t*t*p1y,
      };
    }

    const DATA_POINTS = [0.18, 0.35, 0.52, 0.68, 0.84];
    let prog = 0;
    const SPEED = 0.006;

    function redraw(p) {
      ctx.clearRect(0, 0, W, H);

      // Grid
      ctx.strokeStyle = 'rgba(0,0,0,0.05)';
      ctx.lineWidth   = 0.7;
      [0.08,0.28,0.48,0.68,0.88].forEach(yf => {
        ctx.beginPath(); ctx.moveTo(0, yf*H); ctx.lineTo(W, yf*H); ctx.stroke();
      });
      [0.15,0.3,0.45,0.6,0.75,0.9].forEach(xf => {
        ctx.beginPath(); ctx.moveTo(xf*W, 0); ctx.lineTo(xf*W, H); ctx.stroke();
      });

      if (p <= 0) return;

      // Trajectory line
      ctx.save();
      ctx.strokeStyle = '#FFD600';
      ctx.lineWidth   = 2.2;
      ctx.lineJoin    = 'round';
      ctx.shadowColor = 'rgba(255,214,0,0.3)';
      ctx.shadowBlur  = 8;
      ctx.beginPath();
      for (let s = 0; s <= 100; s++) {
        const t  = (s / 100) * Math.min(p, 0.97);
        const pt = getBez(t);
        s === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
      ctx.restore();

      // Data point markers
      DATA_POINTS.forEach(dp => {
        if (dp > p) return;
        const pt = getBez(dp);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI*2);
        ctx.fillStyle = '#FFD600';
        ctx.fill();
      });

      // Animated tip
      const tip = getBez(Math.min(p, 0.97));
      ctx.beginPath();
      ctx.arc(tip.x, tip.y, 5, 0, Math.PI*2);
      ctx.fillStyle = '#FFD600';
      ctx.fill();
    }

    function pulse() {
      let r = 5; let grow = true;
      function tick() {
        redraw(0.97);
        const tip = getBez(0.97);
        if (grow) { r += 0.12; if (r > 8) grow = false; }
        else      { r -= 0.12; if (r < 5) grow = true;  }
        ctx.beginPath();
        ctx.arc(tip.x, tip.y, r, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(255,214,0,0.15)';
        ctx.fill();
        requestAnimationFrame(tick);
      }
      tick();
    }

    function animate() {
      prog = Math.min(prog + SPEED, 0.97);
      redraw(prog);
      if (prog < 0.97) requestAnimationFrame(animate);
      else pulse();
    }

    requestAnimationFrame(animate);
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

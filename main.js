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
      
      const formData = new FormData(form);
      const dataObj = Object.fromEntries(formData.entries());
      dataObj.submittedAt = new Date().toISOString();
      dataObj.source = window.location.pathname || 'index.html';

      window.db.collection('applications').add(dataObj)
      .then(() => {
        let apps = JSON.parse(localStorage.getItem('veltoApplications') || '[]');
        dataObj.id = Date.now();
        apps.unshift(dataObj);
        localStorage.setItem('veltoApplications', JSON.stringify(apps));

        form.querySelectorAll('.f-row,.fg,.f-footer').forEach(el => el.style.display='none');
        ok.classList.add('show');
      })
      .catch(error => {
        console.error("Error adding document: ", error);
        alert('전송에 실패했습니다. 잠시 후 다시 시도해주세요.');
        btn.textContent = '궤적 정렬 시작하기 ↗'; btn.disabled = false;
      });
    });

    form.querySelectorAll('input,textarea').forEach(inp =>
      inp.addEventListener('input', () => inp.closest('.fg')?.classList.remove('error'))
    );
  }

  /* ── INTERACTIVE STRATEGY BOARD ── */
  const STRAT_DATA = [
    {
      tag: "Friction Bottleneck Detection",
      title: "Velocity Axis Map<br><span style='font-size: 1.25rem; font-weight: 500; color: var(--M);'>속도 축 지도</span>",
      desc: "스케일업 과정에서 기업 성장의 흐름을 방해하는 정체 요소(Friction)와 병목(Bottleneck) 노드를 계량적으로 매핑합니다. 불필요한 직관을 거두고, 마케팅 유입부터 거래 종결까지의 핵심 전환율을 정렬선 위에 늘어놓아 '가장 먼저 해체해야 할 정체'를 시각화합니다.",
      caseText: "<strong>F&B 스케일업 파트너십:</strong> 가맹점 확장 프로세스 중 '물류 리드타임'과 '디지털 계약 체결' 구간의 병목 노드를 식별하여 교정, 계약 성사 속도를 14일 만에 210% 가속화시켰습니다.",
      visualHtml: `
        <div class="axis-map-container">
          <p class="mono" style="font-size:0.6rem; color:var(--L); text-align:center; margin-bottom:8px;">[ REAL-TIME BOTTLENECK DETECTOR ]</p>
          <div class="axis-row-element">
            <div class="axis-row-line"></div>
            <div class="axis-node active">IN</div>
            <div class="axis-node active">01</div>
            <div class="axis-node active bottleneck">02</div>
            <div class="axis-node">03</div>
            <div class="axis-node">OUT</div>
          </div>
          <p class="mono" style="font-size:0.58rem; color:#ff3b30; text-align:center; margin-top:8px; letter-spacing:0.02em;">⚠ NODE 02: 마케팅 리드 이탈 병목 감지 (누수 72%)</p>
        </div>
      `
    },
    {
      tag: "럭셔리 포지셔닝 전환 프로젝트",
      title: "Alto Positioning Matrix<br><span style='font-size: 1.25rem; font-weight: 500; color: var(--M);'>정점 포지셔닝 매트릭스</span>",
      desc: "저단가 경쟁 레드오션을 탈출하여, 하이엔드 브랜드 자산 가치를 극대화하고 가격 저항을 해소하는 2x2 포지셔닝 맵입니다. 독점적 위치인 Alto-Zone을 획득하기 위한 가격 책정(Pricing), 프리미엄 퍼널 팩터, 핵심 정체성을 수학적으로 좌표 위에 정렬시킵니다.",
      caseText: "<strong>프리미엄 코스메틱 브랜드:</strong> 중저가 포지셔닝에서 럭셔리 등급 매트릭스로 재편성하여, 브랜드 리뉴얼 직후 객단가 3.8배 상승 및 프리미엄 타겟 구매 전환율 24% 성장을 입증했습니다.",
      visualHtml: `
        <div class="matrix-grid">
          <div class="matrix-quad">Commodity</div>
          <div class="matrix-quad" style="border-right: none;">Premium</div>
          <div class="matrix-quad" style="border-bottom: none;">Low Price</div>
          <div class="matrix-quad" style="border-bottom: none; border-right: none; background: rgba(255,214,0,0.03);">Alto-Zone</div>
          <div class="matrix-point"></div>
          <span class="matrix-label-y">Brand Premium ↑</span>
          <span class="matrix-label-x">Aesthetic Value →</span>
        </div>
      `
    },
    {
      tag: "C-Level 인지 격차 해소",
      title: "Perception Gap Analytics<br><span style='font-size: 1.25rem; font-weight: 500; color: var(--M);'>인지 격차 분석표</span>",
      desc: "경영진(C-Level)이 바라보는 이상적인 비즈니스 궤적과 실제 시장 고객 및 실무 현장의 원시 데이터(Raw Data) 사이에 존재하는 왜곡 편차를 측정합니다. 주관적 맹신을 해체하고, 양측의 인지 간극(Perception Gap)을 수치화하여 즉각적으로 의사결정의 오차를 복구합니다.",
      caseText: "<strong>IT 플랫폼 유니콘 스타트업:</strong> 대표의 프로덕트 자신감 수치(92%)와 실제 현업 영업 사원의 마찰 감지율(48%) 사이의 유의미한 간극을 발견, 커뮤니케이션 리포팅 구조 교정으로 리드 유실을 원천 통제했습니다.",
      visualHtml: `
        <div class="gap-analytics">
          <div class="gap-bar-group">
            <div class="gap-bar-label"><span>C-Level Perception</span><span>92%</span></div>
            <div class="gap-bar-bg"><div class="gap-bar-fill fill-c" style="width: 92%;"></div></div>
          </div>
          <div class="gap-bar-group">
            <div class="gap-bar-label"><span>Actual Market Raw Data</span><span>48%</span></div>
            <div class="gap-bar-bg"><div class="gap-bar-fill fill-y" style="width: 48%;"></div></div>
          </div>
          <p class="mono" style="font-size:0.58rem; color:var(--Y); text-align:center; letter-spacing:0.02em;">GAP DELTA: 44% (Critical Distortion Zone)</p>
        </div>
      `
    }
  ];

  window.switchStrat = function (index) {
    const tabs = document.querySelectorAll('.strat-tab');
    tabs.forEach((t, idx) => t.classList.toggle('active', idx === index));

    const item = STRAT_DATA[index];
    const visual = document.getElementById('stratVisualArea');
    const info = document.getElementById('stratInfoArea');

    if (!visual || !info) return;

    // Apply fade-out
    visual.style.opacity = '0';
    info.style.opacity = '0';
    visual.style.transform = 'translateY(10px)';
    info.style.transform = 'translateY(10px)';
    visual.style.transition = 'all 0.25s var(--ease)';
    info.style.transition = 'all 0.25s var(--ease)';

    setTimeout(() => {
      // Switch Content
      visual.innerHTML = item.visualHtml;
      info.innerHTML = `
        <span class="strat-tag-small">${item.tag}</span>
        <h3>${item.title}</h3>
        <p class="desc">${item.desc}</p>
        <div class="strat-case">
          <h4>SUCCESS CASE STUDY</h4>
          <p>${item.caseText}</p>
        </div>
      `;

      // Apply fade-in
      visual.style.opacity = '1';
      info.style.opacity = '1';
      visual.style.transform = 'translateY(0)';
      info.style.transform = 'translateY(0)';
    }, 250);
  };

  /* ── DYNAMIC PREMIUM LOGIN SYSTEM ── */
  (function initPortalAuth() {
    // 1. Inject Login Modal HTML dynamically
    const modalHtml = `
      <div class="login-modal-overlay" id="loginModal">
        <div class="login-modal-card">
          <div class="login-modal-header">
            <span class="login-modal-logo">VELTO</span>
            <button class="login-modal-close" id="closeLogin">&times;</button>
          </div>
          <div class="login-form-title">MEMBER PORTAL LOGIN</div>
          <div class="login-form-subtitle">벨토 멤버십 고객 전용 프라이빗 포털</div>
          <form id="portalLoginForm">
            <div class="login-fg">
              <label for="p-email">MEMBER ID</label>
              <input type="text" id="p-email" placeholder="" required />
            </div>
            <div class="login-fg">
              <label for="p-password">ACCESS PASSWORD</label>
              <input type="password" id="p-password" placeholder="" required />
            </div>
            <button type="submit" class="login-submit-btn" id="loginSubmitBtn">SECURE SIGN IN</button>
            <div class="login-error-msg" id="loginErrorMsg">⚠ 아이디 또는 비밀번호가 올바르지 않습니다.</div>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const loginModal = document.getElementById('loginModal');
    const closeLogin = document.getElementById('closeLogin');
    const loginForm  = document.getElementById('portalLoginForm');
    const errorMsg   = document.getElementById('loginErrorMsg');

    // 2. Add Login buttons dynamically to GNB and Mobile menu
    const navRight = document.querySelector('.nav-right');
    if (navRight) {
      const loginBtn = document.createElement('a');
      loginBtn.href = '#';
      loginBtn.className = 'nl nl-portal';
      loginBtn.id = 'portalBtn';
      loginBtn.innerHTML = 'Login';
      navRight.appendChild(loginBtn);
    }

    const mobMenu = document.getElementById('mobMenu');
    if (mobMenu) {
      const mobLoginBtn = document.createElement('a');
      mobLoginBtn.href = '#';
      mobLoginBtn.className = 'mob-l mob-portal-l';
      mobLoginBtn.id = 'mobPortalBtn';
      mobLoginBtn.innerHTML = 'Login';
      mobMenu.appendChild(mobLoginBtn);
    }

    const portalBtn    = document.getElementById('portalBtn');
    const mobPortalBtn = document.getElementById('mobPortalBtn');

    function checkSessionExpiry() {
      const isLogged = localStorage.getItem('veltoMember') === 'true';
      if (isLogged) {
        const loginTime = parseInt(localStorage.getItem('veltoLoginTime') || '0', 10);
        const now = Date.now();
        const oneHour = 60 * 60 * 1000; // 3,600,000 ms

        if (now - loginTime > oneHour) {
          localStorage.removeItem('veltoMember');
          localStorage.removeItem('veltoLoginTime');
          updateAuthState();
          alert('보안 정책에 따라 로그인 1시간 후 자동 로그아웃 되었습니다. 다시 로그인해 주세요.');
          location.href = 'index.html';
        }
      }
    }

    function updateAuthState() {
      // Check session expiry before updating GNB states
      checkSessionExpiry();
      
      const isLogged = localStorage.getItem('veltoMember') === 'true';
      if (isLogged) {
        if (portalBtn) {
          portalBtn.innerHTML = '<span class="portal-dot"></span> Active';
          portalBtn.title = '클릭 시 로그아웃';
        }
        if (mobPortalBtn) {
          mobPortalBtn.innerHTML = '└ Logout (Active)';
        }

        // Dynamically add ESG link to GNB
        if (navRight && portalBtn && !document.getElementById('esgNavBtn')) {
          const esgBtn = document.createElement('a');
          esgBtn.href = 'esg.html';
          esgBtn.className = 'nl';
          esgBtn.id = 'esgNavBtn';
          esgBtn.innerHTML = 'ESG';
          navRight.insertBefore(esgBtn, portalBtn);
        }

        // Dynamically add Status link to GNB
        if (navRight && portalBtn && !document.getElementById('statusNavBtn')) {
          const statusBtn = document.createElement('a');
          statusBtn.href = 'status.html';
          statusBtn.className = 'nl';
          statusBtn.id = 'statusNavBtn';
          statusBtn.innerHTML = '신청현황';
          navRight.insertBefore(statusBtn, portalBtn);
        }

        // Dynamically add ESG link to Mobile Menu
        if (mobMenu && mobPortalBtn && !document.getElementById('mobEsgNavBtn')) {
          const mobEsgBtn = document.createElement('a');
          mobEsgBtn.href = 'esg.html';
          mobEsgBtn.className = 'mob-l';
          mobEsgBtn.id = 'mobEsgNavBtn';
          mobEsgBtn.innerHTML = 'ESG 경영';
          mobMenu.insertBefore(mobEsgBtn, mobPortalBtn);
        }

        // Dynamically add Status link to Mobile Menu
        if (mobMenu && mobPortalBtn && !document.getElementById('mobStatusNavBtn')) {
          const mobStatusBtn = document.createElement('a');
          mobStatusBtn.href = 'status.html';
          mobStatusBtn.className = 'mob-l';
          mobStatusBtn.id = 'mobStatusNavBtn';
          mobStatusBtn.innerHTML = '신청현황';
          mobMenu.insertBefore(mobStatusBtn, mobPortalBtn);
        }
      } else {
        if (portalBtn) {
          portalBtn.innerHTML = 'Login';
          portalBtn.title = '';
        }
        if (mobPortalBtn) {
          mobPortalBtn.innerHTML = 'Login';
        }

        // Remove ESG GNB links if exists
        const existingEsgBtn = document.getElementById('esgNavBtn');
        if (existingEsgBtn) existingEsgBtn.remove();

        const existingMobEsgBtn = document.getElementById('mobEsgNavBtn');
        if (existingMobEsgBtn) existingMobEsgBtn.remove();

        // Remove Status GNB links if exists
        const existingStatusBtn = document.getElementById('statusNavBtn');
        if (existingStatusBtn) existingStatusBtn.remove();

        const existingMobStatusBtn = document.getElementById('mobStatusNavBtn');
        if (existingMobStatusBtn) existingMobStatusBtn.remove();
      }
    }

    function handlePortalClick(e) {
      e.preventDefault();
      const isLogged = localStorage.getItem('veltoMember') === 'true';
      if (isLogged) {
        if (confirm('로그아웃 하시겠습니까?')) {
          localStorage.removeItem('veltoMember');
          localStorage.removeItem('veltoLoginTime');
          updateAuthState();
          alert('로그아웃 되었습니다.');
          location.reload();
        }
      } else {
        loginModal.classList.add('open');
      }
    }

    if (portalBtn) portalBtn.addEventListener('click', handlePortalClick);
    if (mobPortalBtn) mobPortalBtn.addEventListener('click', handlePortalClick);

    if (closeLogin) {
      closeLogin.addEventListener('click', () => {
        loginModal.classList.remove('open');
        errorMsg.style.display = 'none';
      });
    }

    // Close when overlay is clicked
    if (loginModal) {
      loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) {
          loginModal.classList.remove('open');
          errorMsg.style.display = 'none';
        }
      });
    }

    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('p-email').value.trim();
        const pass  = document.getElementById('p-password').value;

        if (email === 'toqn1' && pass === 'toqn1!') {
          const submitBtn = document.getElementById('loginSubmitBtn');
          submitBtn.textContent = 'AUTHENTICATING...';
          submitBtn.disabled = true;
          errorMsg.style.display = 'none';

          setTimeout(() => {
            localStorage.setItem('veltoMember', 'true');
            localStorage.setItem('veltoLoginTime', Date.now().toString());
            updateAuthState();
            loginModal.classList.remove('open');
            submitBtn.textContent = 'SECURE SIGN IN';
            submitBtn.disabled = false;
            alert('로그인에 성공했습니다. 벨토 프라이빗 멤버십 포털이 활성화되었습니다.');
          }, 1000);
        } else {
          errorMsg.style.display = 'block';
        }
      });
    }

    // Initial check & continuous check session expiry every 5 seconds
    updateAuthState();
    setInterval(checkSessionExpiry, 5000);
  })();

})();

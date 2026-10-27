document.addEventListener('DOMContentLoaded', () => {
  // ---------- logo click => play the intro loader on the home page ----------
  document.querySelectorAll('a.brand').forEach(a => {
    a.addEventListener('click', () => {
      try { sessionStorage.setItem('kd-force', '1'); } catch (e) {}
    });
  });
});

// ---------- mobile nav ----------
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('menuToggle');
  const links = document.getElementById('navlinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
  }

  // ---------- developer credit floating button ----------
  const devBtn = document.createElement('a');
  devBtn.className = 'dev-credit';
  devBtn.href = 'tel:03161618156';
  devBtn.setAttribute('aria-label', 'Website developed by Naeem Ansari — call 03161618156');
  devBtn.innerHTML = '<span class="dev-avatar">NA</span><span class="dev-text"><small>Website by</small><strong>Naeem Ansari</strong></span>';
  document.body.appendChild(devBtn);

  // ---------- mark active nav link ----------
  const here = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.navlinks a').forEach(a => {
    const target = a.getAttribute('href');
    if (target === here || (here === '' && target === 'index.html')) a.classList.add('active');
  });

  // ---------- count-up stats (with drop-in animation) ----------
  const stats = document.querySelectorAll('[data-count]');
  if (stats.length) {
    const reduceMotion = !window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
    const obs = new IntersectionObserver(entries => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const card = el.closest('.stat') || el;
          card.classList.add('stat-in');

          const target = parseFloat(el.dataset.count);
          const suffix = el.dataset.suffix || '';
          const dur = 900;
          // let the number finish dropping into place before it starts counting
          const startDelay = reduceMotion ? 0 : 550 + i * 140;

          setTimeout(() => {
            const start = performance.now();
            function tick(now) {
              const p = Math.min(1, (now - start) / dur);
              const eased = 1 - Math.pow(1 - p, 3);
              const val = target * eased;
              el.textContent = (target % 1 === 0 ? Math.floor(val).toLocaleString() : val.toFixed(1)) + suffix;
              if (p < 1) requestAnimationFrame(tick);
              else el.textContent = (target % 1 === 0 ? target.toLocaleString() : target.toFixed(1)) + suffix;
            }
            requestAnimationFrame(tick);
          }, startDelay);

          obs.unobserve(el);
        }
      });
    }, { threshold: 0.4 });
    stats.forEach(el => obs.observe(el));
  }

  // ---------- scroll reveal for cards & section content ----------
  const revealTargets = document.querySelectorAll(
    '.card, .price-card, .service-block, .blog-card, .featured-post, .gswatch, .reason-row, .info-card, .section-head, .accordion-item, .qcard, .contact-form-card, .hoop-card'
  );
  if (revealTargets.length && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    revealTargets.forEach(el => el.classList.add('reveal'));
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const delay = (i % 3) * 80;
          setTimeout(() => entry.target.classList.add('in-view'), delay);
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
    revealTargets.forEach(el => revealObs.observe(el));
  }

  // ---------- FAQ accordion ----------
  document.querySelectorAll('.accordion-item').forEach(item => {
    const q = item.querySelector('.accordion-q');
    const a = item.querySelector('.accordion-a');
    if (!q || !a) return;
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.accordion-item.open').forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          other.querySelector('.accordion-a').style.maxHeight = null;
        }
      });
      item.classList.toggle('open', !isOpen);
      a.style.maxHeight = !isOpen ? a.scrollHeight + 'px' : null;
    });
  });

  // ---------- stitch cursor-trail canvas (hero signature) ----------
  const canvas = document.getElementById('stitchCanvas');
  if (canvas && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    const ctx = canvas.getContext('2d');
    let w, h, points = [];
    const colors = ['#e63950', '#f2b705', '#00a896', '#7c5cfc'];
    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      w = canvas.width = rect.width * devicePixelRatio;
      h = canvas.height = rect.height * devicePixelRatio;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.scale(devicePixelRatio, devicePixelRatio);
    }
    resize();
    window.addEventListener('resize', resize);

    let last = null;
    canvas.parentElement.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (!last || Math.hypot(x - last.x, y - last.y) > 18) {
        points.push({ x, y, color: colors[points.length % colors.length], life: 1 });
        last = { x, y };
        if (points.length > 40) points.shift();
      }
    });
    canvas.parentElement.addEventListener('mouseleave', () => { last = null; });

    function draw() {
      ctx.clearRect(0, 0, w / devicePixelRatio, h / devicePixelRatio);
      ctx.lineWidth = 2;
      for (let i = 1; i < points.length; i++) {
        const p0 = points[i - 1], p1 = points[i];
        p1.life -= 0.006;
        if (p1.life <= 0) continue;
        ctx.globalAlpha = Math.max(0, p1.life);
        ctx.strokeStyle = p1.color;
        ctx.setLineDash([5, 6]);
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
        // x-stitch mark
        ctx.beginPath();
        ctx.moveTo(p1.x - 3, p1.y - 3); ctx.lineTo(p1.x + 3, p1.y + 3);
        ctx.moveTo(p1.x + 3, p1.y - 3); ctx.lineTo(p1.x - 3, p1.y + 3);
        ctx.stroke();
      }
      points = points.filter(p => p.life > 0);
      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }
});



// ======================= THEME TOGGLE + BACK TO TOP =======================
document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;

  // ---------- light / dark toggle ----------
  const sun  = '<svg class="i-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2" fill="currentColor"/><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3l1.7 1.7M17 17l1.7 1.7M5.3 18.7L7 17M17 7l1.7-1.7"/></svg>';
  const moon = '<svg class="i-moon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.6 14.6A8.6 8.6 0 0 1 9.4 3.4a.7.7 0 0 0-.9-.9A10.2 10.2 0 1 0 21.5 15.5a.7.7 0 0 0-.9-.9z"/></svg>';

  const navcta = document.querySelector('.navcta');
  if (navcta) {
    const tbtn = document.createElement('button');
    tbtn.type = 'button';
    tbtn.className = 'theme-toggle';
    tbtn.id = 'themeToggle';
    tbtn.innerHTML = sun + moon;
    const label = () => {
      const light = root.getAttribute('data-theme') === 'light';
      tbtn.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
      tbtn.title = light ? 'Dark mode' : 'Light mode';
    };
    label();
    navcta.insertBefore(tbtn, navcta.firstChild);

    tbtn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.classList.add('kd-theme-anim');
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('kd-theme', next); } catch (e) {}
      label();
      setTimeout(() => root.classList.remove('kd-theme-anim'), 500);
    });
  }

  // ---------- back to top = a needle ----------
  const up = document.createElement('button');
  up.type = 'button';
  up.className = 'to-top';
  up.setAttribute('aria-label', 'Back to top');
  up.title = 'Back to top';
  up.innerHTML =
    '<svg viewBox="0 0 46 134" aria-hidden="true">' +
      '<defs><linearGradient id="ndGrad" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#5b6370"/><stop offset=".35" stop-color="#ffffff"/>' +
        '<stop offset=".62" stop-color="#b7bec9"/><stop offset="1" stop-color="#4b5260"/></linearGradient></defs>' +
      '<g class="nd">' +
        '<circle class="tip-glow" cx="23" cy="4" r="6"/>' +
        '<path d="M23 3 C24.6 14 26 26 26.3 40 L26.3 101 Q26.3 103 24.3 103 H21.7 Q19.7 103 19.7 101 L19.7 40 C20 26 21.4 14 23 3Z" fill="url(#ndGrad)"/>' +
        '<line class="glint" x1="22" y1="12" x2="21.6" y2="62" stroke-width="1.1" stroke-linecap="round"/>' +
        '<rect class="eye" x="21.3" y="84" width="3.4" height="14" rx="1.7"/>' +
        '<path class="thread" d="M23 88 C23 99 33 100 30 110 S12 119 21 127 S32 131 24 134" fill="none" style="stroke:var(--accent)" stroke-width="2.3" stroke-linecap="round"/>' +
      '</g>' +
    '</svg>';
  document.body.appendChild(up);

  let ticking = false;
  const update = () => {
    const y = window.pageYOffset || document.documentElement.scrollTop;
    if (!up.classList.contains('launch')) up.classList.toggle('show', y > 320);
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('resize', update);
  update();

  up.addEventListener('click', () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    if (reduce) return;
    up.classList.add('launch');
    setTimeout(() => {
      up.classList.remove('launch');
      up.classList.remove('show');
      update();
    }, 900);
  });
});

// ======================= NEEDLE FLIGHTS ON NAVBAR CLICKS =======================
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let canvas = null, ctx = null, W = 0, H = 0, busy = false;

  function ensure() {
    if (canvas) return;
    canvas = document.createElement('canvas');
    canvas.className = 'needle-fx';
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    size();
    window.addEventListener('resize', size);
  }
  function size() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  const accent = () => (getComputedStyle(document.body).getPropertyValue('--accent') || '').trim() || '#e63950';
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const bez = (p, t) => { const u = 1 - t;
    return { x: u*u*u*p[0].x + 3*u*u*t*p[1].x + 3*u*t*t*p[2].x + t*t*t*p[3].x,
             y: u*u*u*p[0].y + 3*u*u*t*p[1].y + 3*u*t*t*p[2].y + t*t*t*p[3].y }; };
  const bezT = (p, t) => { const u = 1 - t;
    return { x: 3*u*u*(p[1].x-p[0].x) + 6*u*t*(p[2].x-p[1].x) + 3*t*t*(p[3].x-p[2].x),
             y: 3*u*u*(p[1].y-p[0].y) + 6*u*t*(p[2].y-p[1].y) + 3*t*t*(p[3].y-p[2].y) }; };

  function drawNeedle(x, y, ang) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    ctx.shadowColor = 'rgba(255,241,176,.9)'; ctx.shadowBlur = 16;
    const g = ctx.createLinearGradient(0, -3.4, 0, 3.4);
    g.addColorStop(0, '#ffffff'); g.addColorStop(.5, '#c3c9d2'); g.addColorStop(1, '#6b7280');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(36, 0); ctx.quadraticCurveTo(12, -3.2, -26, -3.2); ctx.lineTo(-32, -3.2);
    ctx.lineTo(-32, 3.2); ctx.lineTo(-26, 3.2); ctx.quadraticCurveTo(12, 3.2, 36, 0); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(15,10,3,.8)';
    ctx.beginPath(); ctx.ellipse(-25, 0, 5, 1.3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // fly a needle along a cubic bezier, leaving a dashed thread behind
  function fly(p, dur, onProgress) {
    return new Promise(resolve => {
      ensure();
      const col = accent(), trail = [], t0 = performance.now();
      (function frame(now) {
        const raw = Math.min(1, (now - t0) / dur), t = ease(raw);
        const pt = bez(p, t), tg = bezT(p, Math.max(.001, t));
        trail.push({ x: pt.x, y: pt.y });
        ctx.clearRect(0, 0, W, H);
        // thread
        ctx.save();
        ctx.lineWidth = 2.6; ctx.lineCap = 'round'; ctx.setLineDash([7, 7]);
        ctx.strokeStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 8;
        const n = trail.length, step = 4;
        for (let i = step; i < n; i += step) {
          ctx.globalAlpha = Math.max(0, i / n) * 0.95;
          ctx.beginPath(); ctx.moveTo(trail[i - step].x, trail[i - step].y);
          for (let k = i - step + 1; k <= i; k++) ctx.lineTo(trail[k].x, trail[k].y);
          ctx.stroke();
        }
        ctx.restore();
        drawNeedle(pt.x, pt.y, Math.atan2(tg.y, tg.x));
        if (onProgress) onProgress(raw);
        if (raw < 1) requestAnimationFrame(frame); else resolve();
      })(t0);
    });
  }
  function fadeOut() {
    if (!canvas) return;
    canvas.style.transition = 'opacity .35s ease'; canvas.style.opacity = '0';
    setTimeout(() => { if (canvas) ctx.clearRect(0, 0, W, H); canvas.style.opacity = '1'; canvas.style.transition = ''; }, 380);
  }

  document.addEventListener('DOMContentLoaded', () => {
    // --- arrival pass: the needle sweeps across under the header on the new page ---
    let arrived = false;
    try { arrived = sessionStorage.getItem('kd-nav') === '1'; sessionStorage.removeItem('kd-nav'); } catch (e) {}
    if (arrived && !reduce) {
      ensure();
      const hdr = document.querySelector('header');
      const y0 = (hdr ? hdr.getBoundingClientRect().bottom : 70) + 14;
      fly([{x:-90,y:y0}, {x:W*.3,y:y0-70}, {x:W*.65,y:y0+80}, {x:W+90,y:y0-10}], 900).then(fadeOut);
    }

    // --- departure: needle flies out of the clicked button, then we navigate ---
    document.querySelectorAll('header a[href]').forEach(a => {
      if (a.classList.contains('brand')) return;            // logo keeps its loader behaviour
      const href = a.getAttribute('href') || '';
      if (!/^[\w-]+\.html([#?].*)?$/.test(href)) return;     // only internal pages
      a.addEventListener('click', e => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (reduce) return;
        e.preventDefault();
        if (busy) return; busy = true;

        const r = a.getBoundingClientRect();
        const sx = r.left + r.width / 2, sy = r.top + r.height / 2;
        const target = href.split(/[#?]/)[0];
        const here = location.pathname.split('/').pop() || 'index.html';
        const same = target === here;

        const path = [{x:sx,y:sy}, {x:sx + W*.22, y:sy - 190}, {x:sx + W*.5, y:sy + 260}, {x:W + 90, y:sy - 40}];
        if (same) window.scrollTo({ top: 0, behavior: 'smooth' });
        fly(path, same ? 800 : 640, p => {
          if (!same && p > .9 && !a._go) {
            a._go = true;
            try { sessionStorage.setItem('kd-nav', '1'); } catch (e) {}
            window.location.href = href;
          }
        }).then(() => { busy = false; if (same) fadeOut(); });
      });
    });
  });
})();

// ---------- mobile nav ----------
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('menuToggle');
  const links = document.getElementById('navlinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
  }

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


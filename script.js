(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.primary-nav');
  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '關閉導覽選單' : '開啟導覽選單');
    nav.classList.toggle('is-open', open);
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    toggle?.setAttribute('aria-expanded', 'false');
    toggle?.setAttribute('aria-label', '開啟導覽選單');
    nav.classList.remove('is-open');
  }));

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.12 });
    revealItems.forEach(item => observer.observe(item));
  } else revealItems.forEach(item => item.classList.add('is-visible'));

  const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (canHover && !reduced) document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('pointermove', event => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      const visual = card.querySelector('.project-visual');
      visual.style.transform = `perspective(900px) rotateX(${-y * 3}deg) rotateY(${x * 3}deg) translateY(-2px)`;
    });
    card.addEventListener('pointerleave', () => { card.querySelector('.project-visual').style.transform = ''; });
  });

  const canvas = document.querySelector('.particle-canvas');
  const ctx = canvas?.getContext('2d', { alpha: true });
  if (!ctx || reduced) return;
  const mobile = matchMedia('(max-width: 600px)');
  let width = 0, height = 0, particles = [], raf = 0, pointer = { x: -1000, y: -1000 };
  const colors = ['104,225,232', '151,143,255', '255,160,135'];
  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 1.6);
    width = innerWidth; height = innerHeight;
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(mobile.matches ? 30 : 68, Math.floor(width / (mobile.matches ? 14 : 19)));
    particles = Array.from({ length: count }, () => ({ x: Math.random() * width, y: Math.random() * height, vx: (Math.random() - .5) * .18, vy: (Math.random() - .5) * .18, r: Math.random() * 1.4 + .4, c: colors[Math.floor(Math.random() * colors.length)] }));
  };
  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
      const dx = pointer.x - p.x, dy = pointer.y - p.y, dist = Math.hypot(dx, dy);
      if (dist < 115) { p.x -= dx * .0008; p.y -= dy * .0008; }
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.c},${dist < 115 ? .8 : .48})`; ctx.fill();
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j], d = Math.hypot(q.x - p.x, q.y - p.y);
        if (d < 95) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.strokeStyle = `rgba(127,177,220,${(1 - d / 95) * .11})`; ctx.lineWidth = .6; ctx.stroke(); }
      }
    });
    raf = requestAnimationFrame(draw);
  };
  addEventListener('resize', resize, { passive: true });
  addEventListener('pointermove', event => { pointer.x = event.clientX; pointer.y = event.clientY; }, { passive: true });
  addEventListener('pointerleave', () => { pointer.x = -1000; pointer.y = -1000; });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf); else if (!raf) draw();
  });
  resize(); draw();
})();

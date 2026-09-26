/* ================================================================
   main.js — Abinav G Portfolio Interactive Logic
   Custom Cursor | Canvas Geo BG | Scroll Reveals | Counter | 
   Parallax | Metric Bars | Mobile Menu | Navbar Scroll
   ================================================================ */

'use strict';

// ── UTILITY ────────────────────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ── CUSTOM CURSOR ──────────────────────────────────────────────────
(function initCursor() {
  const dot  = $('#cursor-dot');
  const ring = $('#cursor-ring');
  if (!dot || !ring) return;

  let mx = 0, my = 0;
  let rx = 0, ry = 0;
  let rafId;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  function animateRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    rafId = requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover effect
  const hoverEls = $$('a, button, .project-card, .contact-card, .achievement-card, .skill-category');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
  });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });
})();

// ── CANVAS GEOMETRIC BACKGROUND ───────────────────────────────────
(function initCanvas() {
  const canvas = $('#geo-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, shapes = [];
  let mouseX = 0, mouseY = 0;

  const ACCENT = '#FF8200';
  const COLORS = [ACCENT, '#CC6800', '#FFB055'];

  class Shape {
    constructor() { this.reset(true); }

    reset(init = false) {
      this.x     = Math.random() * W;
      this.y     = init ? Math.random() * H : H + 60;
      this.size  = 10 + Math.random() * 80;
      this.type  = ['circle', 'rect', 'tri', 'line'][Math.floor(Math.random() * 4)];
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.alpha = 0.04 + Math.random() * 0.12;
      this.vx    = (Math.random() - 0.5) * 0.3;
      this.vy    = -(0.15 + Math.random() * 0.35);
      this.rot   = Math.random() * Math.PI * 2;
      this.vrot  = (Math.random() - 0.5) * 0.005;
      this.fill  = Math.random() > 0.5;
    }

    update(mxNorm, myNorm) {
      this.x   += this.vx + mxNorm * 0.4;
      this.y   += this.vy + myNorm * 0.2;
      this.rot += this.vrot;
      if (this.y < -this.size - 100) this.reset();
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.strokeStyle = this.color;
      ctx.fillStyle   = this.color;
      ctx.lineWidth   = 1.5;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);

      const s = this.size;

      if (this.type === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, s / 2, 0, Math.PI * 2);
        this.fill ? ctx.fill() : ctx.stroke();
      } else if (this.type === 'rect') {
        this.fill
          ? ctx.fillRect(-s / 2, -s / 2, s, s)
          : ctx.strokeRect(-s / 2, -s / 2, s, s);
      } else if (this.type === 'tri') {
        ctx.beginPath();
        ctx.moveTo(0, -s / 2);
        ctx.lineTo(s / 2, s / 2);
        ctx.lineTo(-s / 2, s / 2);
        ctx.closePath();
        this.fill ? ctx.fill() : ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(-s / 2, 0);
        ctx.lineTo(s / 2, 0);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function initShapes() {
    shapes = Array.from({ length: 30 }, () => new Shape());
  }

  let lastMX, lastMY;
  document.addEventListener('mousemove', e => {
    lastMX = e.clientX;
    lastMY = e.clientY;
  });

  function loop() {
    ctx.clearRect(0, 0, W, H);
    const mxNorm = ((lastMX ?? W / 2) / W - 0.5) * 0.5;
    const myNorm = ((lastMY ?? H / 2) / H - 0.5) * 0.5;
    shapes.forEach(s => { s.update(mxNorm, myNorm); s.draw(); });
    requestAnimationFrame(loop);
  }

  resize();
  initShapes();
  loop();
  window.addEventListener('resize', () => { resize(); });
})();

// ── NAVBAR SCROLL EFFECT ──────────────────────────────────────────
(function initNavbar() {
  const nav = $('#navbar');
  if (!nav) return;

  const handleScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  // Active link highlighting
  const sections = $$('section[id]');
  const navLinks = $$('.nav-link');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => link.classList.remove('active'));
        const active = navLinks.find(l => l.getAttribute('href') === '#' + entry.target.id);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => observer.observe(s));
})();

// ── MOBILE MENU ───────────────────────────────────────────────────
(function initMobileMenu() {
  const btn  = $('#hamburger-btn');
  const menu = $('#mobile-menu');
  if (!btn || !menu) return;

  let open = false;

  function toggle() {
    open = !open;
    btn.classList.toggle('open', open);
    menu.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  btn.addEventListener('click', toggle);

  $$('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (open) toggle();
    });
  });
})();

// ── SCROLL REVEAL ─────────────────────────────────────────────────
(function initReveal() {
  const revealEls = $$('.reveal');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger within parent
        const siblings = $$('.reveal', entry.target.parentElement);
        const idx = siblings.indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, idx * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => observer.observe(el));
})();

// ── COUNTER ANIMATION ─────────────────────────────────────────────
(function initCounters() {
  const counters = $$('.stat-number[data-target]');
  if (!counters.length) return;

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1400;
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }

    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();

// ── METRIC BARS ───────────────────────────────────────────────────
(function initMetricBars() {
  const fills = $$('.metric-fill[data-width]');
  if (!fills.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target.dataset.width;
        setTimeout(() => {
          entry.target.style.width = target + '%';
        }, 300);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  fills.forEach(el => observer.observe(el));
})();

// ── PARALLAX / CURSOR PHYSICS ON HERO ────────────────────────────
(function initParallax() {
  const orbs = $$('.geo-orb');
  const chips = $$('.floating-chip');
  const bauhausCard = $('.hero-bauhaus-card');
  if (!orbs.length) return;

  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  let rafId;

  document.addEventListener('mousemove', e => {
    targetX = (e.clientX / window.innerWidth  - 0.5) * 2;
    targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function animateParallax() {
    currentX += (targetX - currentX) * 0.06;
    currentY += (targetY - currentY) * 0.06;

    orbs.forEach((orb, i) => {
      const depth = [30, 20, 15][i] || 20;
      orb.style.transform = `translate(${currentX * depth}px, ${currentY * depth}px)`;
    });

    chips.forEach((chip, i) => {
      const depth = 8 + i * 3;
      const phase = i * 0.4;
      chip.style.transform = `translateY(${Math.sin(Date.now() / 1000 + phase) * 12}px) translate(${currentX * depth}px, ${currentY * depth * 0.5}px)`;
    });

    if (bauhausCard) {
      bauhausCard.style.transform = `perspective(800px) rotateX(${currentY * -4}deg) rotateY(${currentX * 4}deg)`;
    }

    rafId = requestAnimationFrame(animateParallax);
  }

  animateParallax();
})();

// ── SMOOTH ANCHOR SCROLLING ───────────────────────────────────────
$$('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = $(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── PROJECT CARD 3D TILT ─────────────────────────────────────────
(function initCardTilt() {
  const cards = $$('.project-card, .achievement-card, .timeline-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;

      const rotX = y * -6;
      const rotY = x * 6;

      card.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
      setTimeout(() => card.style.transition = '', 500);
    });
  });
})();

// ── SKILLS PILL HOVER RIPPLE ──────────────────────────────────────
$$('.sk-pill, .about-tag').forEach(pill => {
  pill.addEventListener('click', () => {
    pill.style.transform = 'scale(0.93)';
    setTimeout(() => pill.style.transform = '', 150);
  });
});

// ── TYPEWRITER EFFECT FOR HERO ────────────────────────────────────
(function initTypewriter() {
  const tagline = $('.hero-tagline');
  if (!tagline) return;

  const phrases = [
    'building systems that perceive, learn, and adapt.',
    'training models that ship — optimized and reliable.',
    'engineering AI from data to deployment.',
  ];

  let phraseIdx = 0;
  let charIdx   = 0;
  let deleting  = false;

  const em = tagline.querySelector('em:last-of-type') ||
             document.createElement('em');

  // Only animate the last em tag to avoid breaking layout
  const staticPart = 'Hands-on expertise in <em>Machine Learning</em>, <em>Deep Learning</em>, <em>NLP</em>, and <em>Computer Vision</em> — ';
  const dynamicEl  = document.createElement('span');
  dynamicEl.id     = 'typewriter-span';
  tagline.innerHTML = staticPart;
  tagline.appendChild(dynamicEl);

  function tick() {
    const phrase = phrases[phraseIdx];

    if (!deleting) {
      dynamicEl.textContent = phrase.slice(0, charIdx + 1);
      charIdx++;
      if (charIdx === phrase.length) {
        deleting = true;
        setTimeout(tick, 2200);
        return;
      }
    } else {
      dynamicEl.textContent = phrase.slice(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
      }
    }

    const speed = deleting ? 28 : 46;
    setTimeout(tick, speed);
  }

  setTimeout(tick, 1800);
})();

// ── PAGE LOAD ANIMATION ───────────────────────────────────────────
(function initPageLoad() {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.5s ease';

  window.addEventListener('load', () => {
    requestAnimationFrame(() => {
      document.body.style.opacity = '1';
    });
  });
})();

console.log('%c[AG] Portfolio loaded.', 'color: #FF8200; font-family: monospace; font-size: 14px; font-weight: bold;');

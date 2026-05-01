/**
 * ZENORA HIRE – World Class Animations  v1.0.0
 * Particle hero · Typewriter · Counters · Parallax · Cursor · Ripple
 * Scroll progress · Back-to-top · GSAP section reveals · AOS
 */
(function () {
  'use strict';

  /* ── Utility: run after DOM ready ── */
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  /* ================================================================
     1. PAGE LOADER
  ================================================================ */
  function initLoader() {
    const loader = document.createElement('div');
    loader.id = 'zenora-loader';
    loader.innerHTML = '<div class="zenora-loader-ring"></div><span class="zenora-loader-logo">ZENORA</span>';
    document.body.appendChild(loader);

    window.addEventListener('load', function () {
      setTimeout(function () {
        loader.classList.add('hidden');
        setTimeout(function () { loader.remove(); }, 700);
      }, 400);
    });
  }

  /* ================================================================
     2. SCROLL PROGRESS BAR
  ================================================================ */
  function initScrollProgress() {
    const bar = document.createElement('div');
    bar.id = 'zenora-scroll-progress';
    document.body.prepend(bar);

    window.addEventListener('scroll', function () {
      const scrolled = window.scrollY;
      const total    = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
    }, { passive: true });
  }

  /* ================================================================
     3. CUSTOM CURSOR
  ================================================================ */
  function initCursor() {
    const cursor    = document.getElementById('zenora-cursor');
    const cursorDot = document.getElementById('zenora-cursor-dot');
    if (!cursor || !cursorDot) return;

    let mouseX = 0, mouseY = 0;
    let dotX = 0,   dotY = 0;
    let raf;

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.left = mouseX + 'px';
      cursor.style.top  = mouseY + 'px';
    }, { passive: true });

    function animateDot() {
      dotX += (mouseX - dotX) * 0.15;
      dotY += (mouseY - dotY) * 0.15;
      cursorDot.style.left = dotX + 'px';
      cursorDot.style.top  = dotY + 'px';
      raf = requestAnimationFrame(animateDot);
    }
    animateDot();

    document.querySelectorAll('a, button, [data-tilt]').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        cursor.style.width  = '60px';
        cursor.style.height = '60px';
        cursor.style.background = 'rgba(0,201,167,0.1)';
      });
      el.addEventListener('mouseleave', function () {
        cursor.style.width  = '40px';
        cursor.style.height = '40px';
        cursor.style.background = 'transparent';
      });
    });
  }

  /* ================================================================
     4. PARTICLE CANVAS HERO
  ================================================================ */
  function initParticles() {
    const canvas = document.getElementById('zenora-particle-canvas');
    if (!canvas) return;

    const ctx    = canvas.getContext('2d');
    const parent = canvas.parentElement;
    let particles = [];
    let animId;

    function resize() {
      canvas.width  = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const COUNT = Math.min(120, Math.floor((canvas.width * canvas.height) / 8000));

    function Particle() {
      this.reset();
    }
    Particle.prototype.reset = function () {
      this.x    = Math.random() * canvas.width;
      this.y    = Math.random() * canvas.height;
      this.r    = Math.random() * 2.5 + 0.5;
      this.vx   = (Math.random() - 0.5) * 0.6;
      this.vy   = (Math.random() - 0.5) * 0.6;
      this.life = Math.random();
      this.alpha = Math.random() * 0.6 + 0.2;
    };
    Particle.prototype.update = function () {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width)  this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    };

    for (let i = 0; i < COUNT; i++) particles.push(new Particle());

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.strokeStyle = 'rgba(255,255,255,' + (1 - dist / 120) * 0.2 + ')';
            ctx.lineWidth   = 0.6;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach(function (p) {
        p.update();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,201,167,' + p.alpha + ')';
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    }
    draw();
  }

  /* ================================================================
     5. TYPEWRITER
  ================================================================ */
  function initTypewriters() {
    document.querySelectorAll('.zenora-typewriter').forEach(function (el) {
      let texts;
      try { texts = JSON.parse(el.dataset.texts); } catch (e) { return; }
      const speed   = parseInt(el.dataset.speed, 10) || 80;
      const pause   = 1800;
      let   tIdx    = 0, cIdx = 0, deleting = false;

      const cursor = document.createElement('span');
      cursor.className = 'zenora-typewriter-cursor';
      el.parentNode.insertBefore(cursor, el.nextSibling);

      function tick() {
        const text = texts[tIdx];
        if (!deleting) {
          el.textContent = text.slice(0, ++cIdx);
          if (cIdx === text.length) {
            deleting = true;
            setTimeout(tick, pause);
            return;
          }
        } else {
          el.textContent = text.slice(0, --cIdx);
          if (cIdx === 0) {
            deleting = false;
            tIdx = (tIdx + 1) % texts.length;
          }
        }
        setTimeout(tick, deleting ? speed / 2 : speed);
      }
      tick();
    });
  }

  /* ================================================================
     6. ANIMATED COUNTERS
  ================================================================ */
  function initCounters() {
    const counters = document.querySelectorAll('.zenora-counter');
    if (!counters.length) return;

    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        const el       = entry.target;
        const end      = parseInt(el.dataset.end, 10)      || 0;
        const duration = (parseFloat(el.dataset.duration)  || 2) * 1000;
        const prefix   = el.dataset.prefix || '';
        const suffix   = el.dataset.suffix || '';
        const valueEl  = el.querySelector('.zenora-counter-value');
        const start    = Date.now();

        function update() {
          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(eased * end);
          valueEl.textContent = prefix + current.toLocaleString() + suffix;
          if (progress < 1) requestAnimationFrame(update);
        }
        update();
      });
    }, { threshold: 0.4 });

    counters.forEach(function (el) { obs.observe(el); });
  }

  /* ================================================================
     7. SCROLL REVEAL (custom, supplements AOS)
  ================================================================ */
  function initScrollReveal() {
    const revealClasses = [
      '.zenora-reveal-up',
      '.zenora-reveal-left',
      '.zenora-reveal-right',
      '.zenora-stagger',
      '.zenora-timeline-item',
    ];

    const els = document.querySelectorAll(revealClasses.join(','));
    if (!els.length) return;

    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('zenora-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    els.forEach(function (el) { obs.observe(el); });
  }

  /* ================================================================
     8. SKILL / PROGRESS BARS
  ================================================================ */
  function initSkillBars() {
    const fills = document.querySelectorAll('.zenora-skill-fill');
    if (!fills.length) return;

    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.width = entry.target.dataset.width || '80%';
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    fills.forEach(function (el) { obs.observe(el); });
  }

  /* ================================================================
     9. PARALLAX (mouse + scroll)
  ================================================================ */
  function initParallax() {
    const parallaxEls = document.querySelectorAll('.zenora-parallax');
    if (!parallaxEls.length) return;

    window.addEventListener('scroll', function () {
      const scrollY = window.scrollY;
      parallaxEls.forEach(function (el) {
        const speed = parseFloat(el.dataset.parallaxSpeed) || 0.3;
        el.style.transform = 'translateY(' + (scrollY * speed) + 'px)';
      });
    }, { passive: true });
  }

  /* ================================================================
     10. MOUSE-TRACK PARALLAX on hero blobs
  ================================================================ */
  function initMouseParallax() {
    const blobs = document.querySelectorAll('.zenora-blob');
    if (!blobs.length) return;

    document.addEventListener('mousemove', function (e) {
      const cx = window.innerWidth  / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;

      blobs.forEach(function (blob, i) {
        const factor = (i + 1) * 18;
        blob.style.transform = 'translate(' + (dx * factor) + 'px,' + (dy * factor) + 'px)';
      });
    }, { passive: true });
  }

  /* ================================================================
     11. RIPPLE EFFECT on buttons / links
  ================================================================ */
  function initRipple() {
    document.querySelectorAll('.zenora-ripple, .zenora-pulse-btn').forEach(function (el) {
      el.addEventListener('click', function (e) {
        const rect   = el.getBoundingClientRect();
        const size   = Math.max(rect.width, rect.height) * 2;
        const x      = e.clientX - rect.left - size / 2;
        const y      = e.clientY - rect.top  - size / 2;
        const circle = document.createElement('span');
        circle.className = 'zenora-ripple-circle';
        circle.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + x + 'px;top:' + y + 'px;';
        el.appendChild(circle);
        setTimeout(function () { circle.remove(); }, 600);
      });
    });
  }

  /* ================================================================
     12. BACK TO TOP
  ================================================================ */
  function initBackToTop() {
    const btn = document.createElement('button');
    btn.id        = 'zenora-back-top';
    btn.innerHTML = '&#8679;';
    btn.setAttribute('aria-label', 'Back to top');
    document.body.appendChild(btn);

    window.addEventListener('scroll', function () {
      if (window.scrollY > 400) btn.classList.add('visible');
      else                       btn.classList.remove('visible');
    }, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ================================================================
     13. GSAP SECTION REVEALS (headings & media)
  ================================================================ */
  function initGSAP() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    // Headings slide-up with split chars effect
    gsap.utils.toArray('h1, h2, h3').forEach(function (el) {
      if (el.closest('.zenora-particle-hero')) return; // skip hero, handled separately
      gsap.from(el, {
        opacity: 0,
        y: 40,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      });
    });

    // Images scale-in
    gsap.utils.toArray('img:not(.zenora-particle-hero img)').forEach(function (el) {
      gsap.from(el, {
        scale: 0.9,
        opacity: 0,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      });
    });

    // Hero content entrance
    const heroContent = document.querySelector('.zenora-particle-content');
    if (heroContent) {
      gsap.from(heroContent.children, {
        opacity: 0,
        y: 60,
        stagger: 0.2,
        duration: 1,
        ease: 'power3.out',
        delay: 0.5,
      });
    }
  }

  /* ================================================================
     14. AOS INIT
  ================================================================ */
  function initAOS() {
    if (typeof AOS === 'undefined') return;
    AOS.init({
      duration: 700,
      easing:   'ease-out-cubic',
      once:     true,
      offset:   60,
    });
  }

  /* ================================================================
     15. VANILLA TILT (3-D hover on tilt cards)
  ================================================================ */
  function initTilt() {
    if (typeof VanillaTilt === 'undefined') return;
    VanillaTilt.init(document.querySelectorAll('[data-tilt]'), {
      max:        8,
      speed:      400,
      glare:      true,
      'max-glare': 0.2,
    });
  }

  /* ================================================================
     16. SMOOTH ANCHOR SCROLL
  ================================================================ */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        const target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  /* ================================================================
     17. NAV SHRINK ON SCROLL
  ================================================================ */
  function initNavShrink() {
    const nav = document.querySelector('header, nav, .site-header, #masthead');
    if (!nav) return;
    window.addEventListener('scroll', function () {
      if (window.scrollY > 80) nav.classList.add('zenora-nav-scrolled');
      else                      nav.classList.remove('zenora-nav-scrolled');
    }, { passive: true });

    // Inject style for scrolled state
    const s = document.createElement('style');
    s.textContent = '.zenora-nav-scrolled{box-shadow:0 4px 24px rgba(10,102,194,.12);background:rgba(255,255,255,.96)!important;backdrop-filter:blur(12px);transition:all .4s cubic-bezier(.4,0,.2,1);}';
    document.head.appendChild(s);
  }

  /* ================================================================
     BOOT
  ================================================================ */
  initLoader();
  initScrollProgress();
  initBackToTop();

  ready(function () {
    initCursor();
    initParticles();
    initTypewriters();
    initCounters();
    initScrollReveal();
    initSkillBars();
    initParallax();
    initMouseParallax();
    initRipple();
    initSmoothScroll();
    initNavShrink();
    initAOS();
    initTilt();
    // GSAP runs after other libs load
    window.addEventListener('load', initGSAP);
  });

})();

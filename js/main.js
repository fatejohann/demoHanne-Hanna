/* ─────────────────────────────────────────────
   MOTION SYSTEM
   Intersection Observer + Parallax + Load
───────────────────────────────────────────── */
(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── PAGE LOAD SEQUENCE ─────────────────── */
  const heroEyebrow = document.querySelector('.hero__eyebrow');
  const heroTitle   = document.querySelector('.hero__title');
  const heroTagline = document.querySelector('.hero__tagline');
  const heroScroll  = document.querySelector('.hero__scroll');

  /* Emil rule ease-custom-curves: strong ease-out for all reveals */
  var EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';

  function fadeIn(el, delay, duration) {
    if (!el) return;
    el.style.transition = 'opacity ' + duration + 'ms ' + EASE_OUT + ', transform ' + duration + 'ms ' + EASE_OUT;
    setTimeout(function () {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, delay);
  }

  if (!reduced) {
    window.addEventListener('DOMContentLoaded', function () {
      /* Staggered hero entrance — marketing exception allows longer durations */
      fadeIn(heroTitle,   60,  900);   /* title leads — biggest impact first */
      fadeIn(heroEyebrow, 220, 550);   /* eyebrow follows title */
      fadeIn(heroTagline, 380, 650);   /* tagline last in content */
      fadeIn(heroScroll,  1100, 500);  /* scroll indicator after content settles */
    });
  } else {
    /* Reduced motion: fade to visible gently, no transforms */
    [heroEyebrow, heroTitle, heroTagline, heroScroll].forEach(function (el) {
      if (el) {
        el.style.transition = 'opacity 400ms ease';
        el.style.opacity = '1';
        el.style.transform = 'none';
      }
    });
  }

  /* ── PARALLAX ───────────────────────────── */
  var heroBg     = document.getElementById('heroBg');
  var heroEl     = document.getElementById('hero');
  var heroH      = heroEl ? heroEl.offsetHeight : 0;

  if (!reduced && heroBg) {
    window.addEventListener('scroll', function () {
      if (window.scrollY < heroH) {
        heroBg.style.transform = 'translateY(' + (window.scrollY * 0.14) + 'px)';
      }
    }, { passive: true });
  }

  /* ── NAVBAR ─────────────────────────────── */
  var nav = document.getElementById('nav');
  window.addEventListener('scroll', function () {
    nav.classList.toggle('is-scrolled', window.scrollY > 80);
  }, { passive: true });

  /* ── MOBILE DRAWER ──────────────────────── */
  var burger      = document.getElementById('burger');
  var drawer      = document.getElementById('drawer');
  var drawerClose = document.getElementById('drawerClose');

  function openDrawer() {
    drawer.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    drawer.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  burger.addEventListener('click', openDrawer);
  drawerClose.addEventListener('click', closeDrawer);
  drawer.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeDrawer);
  });

  /* ── SCROLL ANIMATIONS ──────────────────── */
  if (!reduced) {
    /* Emil rule polish-scroll-reveal: trigger at appropriate threshold */
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var delay = parseInt(el.dataset.delay || '0', 10);
          setTimeout(function () { el.classList.add('is-visible'); }, delay);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.10, rootMargin: '0px 0px -60px 0px' });

    /* Assign stagger delays and observe */
    function observe(selector, baseDelay, step) {
      var els = document.querySelectorAll(selector);
      els.forEach(function (el, i) {
        el.dataset.delay = baseDelay + (step || 0) * i;
        io.observe(el);
      });
    }

    /* Identity */
    observe('.identity .section-eyebrow', 0);
    observe('.identity .identity__title',  120);
    observe('.identity .identity__rule',   220);
    observe('.identity .identity__body',   320);
    observe('.identity .identity__img',    80);

    /* Menu */
    observe('.menu-section__eyebrow', 0);
    observe('.menu-section__title',   100);
    observe('.menu-item',             0, 70);

    /* Gallery */
    observe('.gallery__eyebrow', 0);
    observe('.gallery__cell img', 0, 110);

    /* Reservations */
    observe('.reservations__eyebrow',  0);
    observe('.reservations__headline', 100);
    observe('.reservations__sub',      200);
    observe('.res-form',               300);
  }

  /* ── FLOATING LABELS ────────────────────── */
  document.querySelectorAll('.res-field').forEach(function (field) {
    var input = field.querySelector('.res-input, .res-textarea');
    if (!input) return;
    function update() {
      field.classList.toggle('is-filled', input.value.trim().length > 0);
    }
    input.addEventListener('input', update);
    input.addEventListener('change', update);
    update();
  });

  /* ── FORM SUBMIT ────────────────────────── */
  var resForm    = document.getElementById('resForm');
  var resSuccess = document.getElementById('resSuccess');

  if (resForm) {
    resForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var valid = true;
      resForm.querySelectorAll('[required]').forEach(function (inp) {
        if (!inp.value.trim()) {
          valid = false;
          inp.closest('.res-field').style.borderBottomColor = 'var(--color-primary)';
        }
      });
      if (!valid) return;

      /* Build WhatsApp message with the reservation data */
      var name   = document.getElementById('r-name').value.trim();
      var date   = document.getElementById('r-date').value;
      var guests = document.getElementById('r-guests').value;
      var note   = document.getElementById('r-msg').value.trim();

      var msgText =
        'Hola, quisiera hacer una reserva en Hanne Hanna.\n' +
        'Nombre: ' + name + '\n' +
        'Fecha: ' + date + '\n' +
        'Personas: ' + guests +
        (note ? '\nNota: ' + note : '');

      window.open(
        'https://wa.me/50361673417?text=' + encodeURIComponent(msgText),
        '_blank'
      );

      var btn = resForm.querySelector('.res-submit');
      btn.textContent = 'Abriendo WhatsApp…';
      btn.disabled = true;

      setTimeout(function () {
        resForm.style.transition = 'opacity 450ms ease';
        resForm.style.opacity = '0';
        setTimeout(function () {
          resForm.style.display = 'none';
          resSuccess.style.display = 'block';
          setTimeout(function () {
            resSuccess.style.opacity = '1';
          }, 40);
        }, 460);
      }, 800);
    });
  }

  /* ── SMOOTH ANCHOR SCROLL ───────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = this.getAttribute('href');
      if (id === '#') return;
      var target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

}());

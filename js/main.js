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
  const heroCta     = document.querySelector('.hero__cta');
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
      fadeIn(heroTitle,   60,  550);
      fadeIn(heroEyebrow, 200, 380);
      fadeIn(heroTagline, 320, 400);
      fadeIn(heroCta,     500, 350);
      fadeIn(heroScroll,  800, 300);
    });
  } else {
    /* Reduced motion: fade to visible gently, no transforms */
    [heroEyebrow, heroTitle, heroTagline, heroCta, heroScroll].forEach(function (el) {
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
    var parallaxTicking = false;
    window.addEventListener('scroll', function () {
      if (!parallaxTicking && window.scrollY < heroH) {
        parallaxTicking = true;
        requestAnimationFrame(function () {
          heroBg.style.transform = 'translateY(' + (window.scrollY * 0.14) + 'px)';
          parallaxTicking = false;
        });
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

  function getFocusables(el) {
    return Array.from(el.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ));
  }

  function trapFocus(e) {
    var focusables = getFocusables(drawer);
    var first = focusables[0];
    var last  = focusables[focusables.length - 1];
    if (e.key === 'Escape') { closeDrawer(); return; }
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
  }

  function openDrawer() {
    drawer.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    drawer.addEventListener('keydown', trapFocus);
    var focusables = getFocusables(drawer);
    if (focusables.length) { setTimeout(function () { focusables[0].focus(); }, 50); }
  }
  function closeDrawer() {
    drawer.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    drawer.removeEventListener('keydown', trapFocus);
    burger.focus();
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

    /* Micro-CTAs */
    observe('.identity .micro-cta',       400);
    observe('.menu__cta',                 100);
    observe('.gallery__cta-row .micro-cta', 200);
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

  var FIELD_ERRORS = {
    'r-name':   'Por favor, ingresa tu nombre.',
    'r-email':  'Ingresa un correo electrónico válido.',
    'r-date':   'Selecciona una fecha futura.',
    'r-guests': 'Indica el número de personas (1–12).'
  };

  function isFieldValid(inp) {
    if (!inp.value.trim()) return false;
    if (inp.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value.trim())) return false;
    if (inp.type === 'date') {
      var today = new Date().toISOString().split('T')[0];
      if (inp.value < today) return false;
    }
    if (inp.type === 'number') {
      var n = parseInt(inp.value, 10);
      if (isNaN(n) || n < 1 || n > 12) return false;
    }
    return true;
  }

  function setFieldError(inp) {
    var field = inp.closest('.res-field');
    if (!field) return;
    field.classList.add('has-error');
    inp.setAttribute('aria-invalid', 'true');
    var errEl = document.getElementById(inp.id + '-error');
    if (errEl && FIELD_ERRORS[inp.id]) errEl.textContent = FIELD_ERRORS[inp.id];
  }

  function clearFieldError(inp) {
    var field = inp.closest('.res-field');
    if (!field) return;
    field.classList.remove('has-error');
    inp.setAttribute('aria-invalid', 'false');
    var errEl = document.getElementById(inp.id + '-error');
    if (errEl) errEl.textContent = '';
  }

  if (resForm) {
    /* Set date minimum to today */
    var dateInp = document.getElementById('r-date');
    if (dateInp) dateInp.min = new Date().toISOString().split('T')[0];

    /* Clear error when field becomes valid */
    resForm.querySelectorAll('.res-input, .res-textarea').forEach(function (inp) {
      inp.addEventListener('input', function () {
        if (isFieldValid(this)) clearFieldError(this);
      });
    });

    resForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var valid = true;
      resForm.querySelectorAll('[required]').forEach(function (inp) {
        if (!isFieldValid(inp)) {
          valid = false;
          setFieldError(inp);
        }
      });
      if (!valid) {
        var firstInvalid = resForm.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

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
        target.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
      }
    });
  });

}());

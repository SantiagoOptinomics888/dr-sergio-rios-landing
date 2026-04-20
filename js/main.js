/* ═══════════════════════════════════════════════════════════ */
/* Dr. Sergio Ríos — Enhanced UX JavaScript                   */
/* Accessibility-first, performance-optimized                  */
/* ═════���════════════════════════════════════════��════════════ */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── Scroll Reveal (IntersectionObserver) ────────────── */
  function initScrollReveal() {
    var elements = document.querySelectorAll('.reveal');
    if (prefersReducedMotion) {
      elements.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );

    elements.forEach(function (el) { observer.observe(el); });
  }

  /* ─── Floating Sticky Navigation ─────────────────────── */
  function initStickyNav() {
    var nav = document.getElementById('nav');
    if (!nav) return;

    var lastScroll = 0;
    var scrollThreshold = 80;

    function onScroll() {
      var currentScroll = window.scrollY;

      if (currentScroll > scrollThreshold) {
        nav.classList.add('nav--scrolled');
      } else {
        nav.classList.remove('nav--scrolled');
      }

      lastScroll = currentScroll;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ─── Mobile Menu with A11y ─────────────────────────── */
  function initMobileMenu() {
    var hamburger = document.getElementById('hamburger');
    var mobileMenu = document.getElementById('mobileMenu');
    if (!hamburger || !mobileMenu) return;

    function toggleMenu() {
      var isActive = mobileMenu.classList.contains('active');
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('active');

      var nowActive = !isActive;
      hamburger.setAttribute('aria-expanded', String(nowActive));
      mobileMenu.setAttribute('aria-hidden', String(!nowActive));
      document.body.style.overflow = nowActive ? 'hidden' : '';

      if (nowActive) {
        var firstLink = mobileMenu.querySelector('a');
        if (firstLink) firstLink.focus();
      }
    }

    hamburger.addEventListener('click', toggleMenu);

    var links = mobileMenu.querySelectorAll('a');
    links.forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
        toggleMenu();
        hamburger.focus();
      }
    });
  }

  /* ─── Smooth Scroll for Anchor Links ────────────────── */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        if (targetId === '#') return;

        var target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });

        if (target.hasAttribute('tabindex') || target.tagName === 'INPUT') {
          target.focus({ preventScroll: true });
        }
      });
    });
  }

  /* ─── Active Nav Link Highlight ─────────────────────── */
  function initActiveNavLink() {
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.nav__links a');
    if (sections.length === 0 || navLinks.length === 0) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute('id');
            navLinks.forEach(function (link) {
              link.classList.remove('active');
              if (link.getAttribute('href') === '#' + id) {
                link.classList.add('active');
              }
            });
          }
        });
      },
      { threshold: 0.25, rootMargin: '-100px 0px -50% 0px' }
    );

    sections.forEach(function (section) { observer.observe(section); });
  }

  /* ─── Counter Animation (Bento numbers) ────────────── */
  function initCounterAnimation() {
    if (prefersReducedMotion) return;

    var counters = document.querySelectorAll('[data-count]');
    if (counters.length === 0) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(function (el) { observer.observe(el); });

    function animateCounter(el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      var duration = 1500;
      var startTime = null;
      var originalText = el.textContent;
      var prefix = originalText.match(/^[^0-9]*/)[0];
      var suffix = originalText.match(/[^0-9]*$/)[0];

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = Math.floor(eased * target);

        if (target >= 1000) {
          el.textContent = prefix + current.toLocaleString('es-CO') + suffix;
        } else {
          el.textContent = prefix + current + suffix;
        }

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = originalText;
        }
      }

      requestAnimationFrame(step);
    }
  }

  /* ─── Contact Form — Real-time Validation ───���───────── */
  function initContactForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;

    var fields = form.querySelectorAll('[required]');

    fields.forEach(function (field) {
      field.addEventListener('blur', function () {
        validateField(field);
      });

      field.addEventListener('input', function () {
        if (field.classList.contains('error')) {
          validateField(field);
        }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var isValid = true;

      fields.forEach(function (field) {
        if (!validateField(field)) {
          isValid = false;
        }
      });

      if (isValid) {
        var submitBtn = form.querySelector('[type="submit"]');
        var originalHTML = submitBtn.innerHTML;

        submitBtn.innerHTML = '<span>Enviado correctamente</span>';
        submitBtn.style.background = 'var(--accent)';
        submitBtn.style.boxShadow = '0 4px 16px rgba(100, 169, 158, 0.3)';
        submitBtn.disabled = true;
        submitBtn.setAttribute('aria-busy', 'true');

        setTimeout(function () {
          submitBtn.innerHTML = originalHTML;
          submitBtn.style.background = '';
          submitBtn.style.boxShadow = '';
          submitBtn.disabled = false;
          submitBtn.removeAttribute('aria-busy');
          form.reset();
        }, 3000);
      } else {
        var firstError = form.querySelector('.error');
        if (firstError) {
          firstError.focus();
        }
      }
    });

    function validateField(field) {
      var value = field.value.trim();
      var isValid = true;
      var errorMsg = '';

      field.classList.remove('error');
      var errorEl = field.parentNode.querySelector('.error-message');

      if (!value && field.hasAttribute('required')) {
        isValid = false;
        errorMsg = 'Este campo es obligatorio';
      } else if (field.type === 'email' && value) {
        var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
          isValid = false;
          errorMsg = 'Ingrese un correo electrónico válido';
        }
      }

      if (!isValid) {
        field.classList.add('error');
        if (errorEl) {
          errorEl.textContent = errorMsg;
          errorEl.classList.add('visible');
        }
        field.setAttribute('aria-invalid', 'true');
      } else {
        if (errorEl) {
          errorEl.textContent = '';
          errorEl.classList.remove('visible');
        }
        field.removeAttribute('aria-invalid');
      }

      return isValid;
    }
  }

  /* ─── Lazy Load Images (when real images are added) ──── */
  function initLazyImages() {
    var images = document.querySelectorAll('img[loading="lazy"]');
    if ('loading' in HTMLImageElement.prototype) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
          }
          observer.unobserve(img);
        }
      });
    });

    images.forEach(function (img) { observer.observe(img); });
  }

  /* ─── Initialize ────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    initScrollReveal();
    initStickyNav();
    initMobileMenu();
    initSmoothScroll();
    initActiveNavLink();
    initCounterAnimation();
    initContactForm();
    initLazyImages();
  });
})();

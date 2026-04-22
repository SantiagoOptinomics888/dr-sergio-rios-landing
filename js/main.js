/* ═══════════════════════════════════════════════════════════ */
/* Dr. Sergio Ríos — Dynamic Animations (Tony Robbins style)  */
/* Parallax, split text, magnetic hover, tilt, marquee        */
/* ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── Directional Scroll Reveal ──────────────────────── */
  function initScrollReveal() {
    var elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
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
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach(function (el) { observer.observe(el); });
  }

  /* ─── Service Progress Connector ─────────────────────── */
  function initServiceProgress() {
    var progress = document.querySelector('.svc-progress');
    var fill = document.querySelector('.svc-progress__fill');
    var dots = document.querySelectorAll('.svc-progress__dot');
    var sections = document.querySelectorAll('.svc');

    if (!progress || !sections.length || !dots.length) return;

    var sectionIds = ['implantologia', 'diseno-sonrisa', 'rehabilitacion', 'ortodoncia'];

    // Click dots to scroll to section
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        var target = document.getElementById(sectionIds[i]);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    function onScroll() {
      var vh = window.innerHeight;
      var firstRect = sections[0].getBoundingClientRect();
      var lastRect = sections[sections.length - 1].getBoundingClientRect();

      // Show/hide progress
      var inRange = firstRect.top < vh * 0.8 && lastRect.bottom > vh * 0.2;
      if (inRange) {
        progress.classList.add('svc-progress--visible');
      } else {
        progress.classList.remove('svc-progress--visible');
      }

      // Calculate fill and active dots
      var activeIndex = -1;
      sections.forEach(function (sec, i) {
        var rect = sec.getBoundingClientRect();
        var center = rect.top + rect.height / 2;
        if (center < vh * 0.6) activeIndex = i;
      });

      // Fill bar
      var fillPercent = activeIndex >= 0 ? ((activeIndex + 1) / sections.length) * 100 : 0;
      if (fill) fill.style.height = fillPercent + '%';

      // Update dots
      dots.forEach(function (dot, i) {
        dot.classList.remove('svc-progress__dot--active', 'svc-progress__dot--passed');
        if (i === activeIndex) {
          dot.classList.add('svc-progress__dot--active');
        } else if (i < activeIndex) {
          dot.classList.add('svc-progress__dot--passed');
        }
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ─── Service Section Visibility (left bar + number parallax) ─ */
  function initServiceSectionEffects() {
    var sections = document.querySelectorAll('.svc');
    if (!sections.length) return;

    // Section visibility for left accent bar
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          } else {
            entry.target.classList.remove('visible');
          }
        });
      },
      { threshold: 0.15 }
    );

    sections.forEach(function (sec) { sectionObserver.observe(sec); });

    // Parallax on service numbers
    if (prefersReducedMotion) return;

    var numbers = document.querySelectorAll('.svc__number');
    var ticking = false;

    function onScroll() {
      if (ticking) return;
      requestAnimationFrame(function () {
        var vh = window.innerHeight;
        numbers.forEach(function (num) {
          var rect = num.getBoundingClientRect();
          if (rect.top < vh && rect.bottom > 0) {
            var progress = (vh - rect.top) / (vh + rect.height);
            var offset = (progress - 0.5) * -30;
            var scale = 1 + Math.abs(progress - 0.5) * 0.04;
            num.style.transform = 'translateY(' + offset + 'px) scale(' + scale + ')';
          }
        });
        ticking = false;
      });
      ticking = true;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ─── Hero Text Typewriter / Split ───────────────────── */
  function initHeroTextAnimation() {
    if (prefersReducedMotion) return;

    var title = document.querySelector('.hero__title');
    if (!title) return;

    title.classList.add('hero__title--animate');
  }

  /* ─── Parallax on Scroll ─────────────────────────────── */
  function initParallax() {
    if (prefersReducedMotion) return;

    var heroImage = document.querySelector('.hero__image-frame');
    var orb1 = document.querySelector('.hero__bg-orb--1');
    var orb2 = document.querySelector('.hero__bg-orb--2');
    var badges = document.querySelectorAll('.hero__badge');
    var parallaxImages = document.querySelectorAll('.parallax-img');

    var ticking = false;

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(function () {
          var scrollY = window.scrollY;
          var vh = window.innerHeight;

          if (scrollY < vh * 1.5) {
            if (heroImage) {
              heroImage.style.transform = 'translateY(' + (scrollY * 0.08) + 'px)';
            }
            if (orb1) {
              orb1.style.transform = 'translate(' + (scrollY * -0.04) + 'px, ' + (scrollY * 0.06) + 'px)';
            }
            if (orb2) {
              orb2.style.transform = 'translate(' + (scrollY * 0.03) + 'px, ' + (scrollY * -0.05) + 'px)';
            }
            badges.forEach(function (badge, i) {
              var rate = i === 0 ? -0.12 : 0.1;
              badge.style.transform = 'translateY(' + (scrollY * rate) + 'px)';
            });
          }

          parallaxImages.forEach(function (img) {
            var rect = img.getBoundingClientRect();
            if (rect.top < vh && rect.bottom > 0) {
              var progress = (vh - rect.top) / (vh + rect.height);
              var offset = (progress - 0.5) * 40;
              img.style.transform = 'translateY(' + offset + 'px) scale(1.05)';
            }
          });

          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ─── Floating Sticky Navigation + Progress Bar ──────── */
  function initStickyNav() {
    var nav = document.getElementById('nav');
    var progressBar = document.querySelector('.nav__progress');
    if (!nav) return;

    var scrollThreshold = 80;

    function onScroll() {
      var currentScroll = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = Math.min(currentScroll / docHeight, 1);

      if (currentScroll > scrollThreshold) {
        nav.classList.add('nav--scrolled');
      } else {
        nav.classList.remove('nav--scrolled');
      }

      if (progressBar) {
        progressBar.style.transform = 'scaleX(' + progress + ')';
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ─── Magnetic Hover on CTA Buttons ──────────────────── */
  function initMagneticButtons() {
    if (prefersReducedMotion) return;

    var buttons = document.querySelectorAll('.btn--primary, .nav__cta');

    buttons.forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = 'translate(' + (x * 0.15) + 'px, ' + (y * 0.15) + 'px)';
      });

      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  }

  /* ─── Tilt Effect on Bento Cards ─────────────────────── */
  function initTiltCards() {
    if (prefersReducedMotion) return;

    var cards = document.querySelectorAll('.bento__item, .testimonial');

    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width;
        var y = (e.clientY - rect.top) / rect.height;
        var tiltX = (y - 0.5) * 8;
        var tiltY = (x - 0.5) * -8;
        card.style.transform = 'perspective(800px) rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg) translateY(-4px)';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  /* ─── Smooth Image Reveal on Scroll ──────────────────── */
  function initImageReveal() {
    if (prefersReducedMotion) return;

    var images = document.querySelectorAll('.hero__photo, .service__magazine-photo, .service__case-photo, .service__ortho-photo, .galeria__photo');

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('img-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    images.forEach(function (img) { observer.observe(img); });
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

    mobileMenu.querySelectorAll('a').forEach(function (link) {
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

  /* ─── Smooth Scroll for Anchors ─────────────────────── */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        if (targetId === '#') return;
        var target = document.querySelector(targetId);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  /* ─── Active Nav Link ───────────────────────────────── */
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
      { threshold: 0.2, rootMargin: '-100px 0px -50% 0px' }
    );

    sections.forEach(function (section) { observer.observe(section); });
  }

  /* ─── Counter Animation ─────────────────────────────── */
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
      var duration = 2000;
      var startTime = null;
      var originalText = el.textContent;
      var prefix = originalText.match(/^[^0-9]*/)[0];
      var suffix = originalText.match(/[^0-9]*$/)[0];

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 4);
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

  /* ─── Marquee Auto-scroll ───────────────────────────── */
  function initMarquee() {
    if (prefersReducedMotion) return;

    var marquee = document.querySelector('.marquee__track');
    if (!marquee) return;

    var content = marquee.innerHTML;
    marquee.innerHTML = content + content;
  }

  /* ─── Contact Form Validation ───────────────────────── */
  function initContactForm() {
    var forms = document.querySelectorAll('#contactForm, #contactFormBottom');
    forms.forEach(function (form) { setupForm(form); });
  }

  function setupForm(form) {
    if (!form) return;

    var fields = form.querySelectorAll('[required]');

    fields.forEach(function (field) {
      field.addEventListener('blur', function () { validateField(field); });
      field.addEventListener('input', function () {
        if (field.classList.contains('error')) validateField(field);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var isValid = true;

      fields.forEach(function (field) {
        if (!validateField(field)) isValid = false;
      });

      if (isValid) {
        var submitBtn = form.querySelector('[type="submit"]');
        var originalHTML = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Enviado correctamente</span>';
        submitBtn.style.background = 'var(--accent)';
        submitBtn.disabled = true;
        submitBtn.setAttribute('aria-busy', 'true');

        setTimeout(function () {
          submitBtn.innerHTML = originalHTML;
          submitBtn.style.background = '';
          submitBtn.disabled = false;
          submitBtn.removeAttribute('aria-busy');
          form.reset();
        }, 3000);
      } else {
        var firstError = form.querySelector('.error');
        if (firstError) firstError.focus();
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
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          isValid = false;
          errorMsg = 'Ingrese un correo electrónico válido';
        }
      }

      if (!isValid) {
        field.classList.add('error');
        if (errorEl) { errorEl.textContent = errorMsg; errorEl.classList.add('visible'); }
        field.setAttribute('aria-invalid', 'true');
      } else {
        if (errorEl) { errorEl.textContent = ''; errorEl.classList.remove('visible'); }
        field.removeAttribute('aria-invalid');
      }
      return isValid;
    }
  }

  /* ─── Discover More — Expand/Collapse Panels ────────── */
  function initDiscoverPanels() {
    var buttons = document.querySelectorAll('.svc__discover-btn');

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var panelId = btn.getAttribute('aria-controls');
        var panel = document.getElementById(panelId);
        if (!panel) return;

        var isExpanded = btn.getAttribute('aria-expanded') === 'true';

        // Close any other open panels first
        buttons.forEach(function (otherBtn) {
          if (otherBtn === btn) return;
          var otherId = otherBtn.getAttribute('aria-controls');
          var otherPanel = document.getElementById(otherId);
          if (otherBtn.getAttribute('aria-expanded') === 'true') {
            otherBtn.setAttribute('aria-expanded', 'false');
            otherBtn.querySelector('span').textContent = 'Descubrir más';
            if (otherPanel) {
              otherPanel.setAttribute('aria-hidden', 'true');
              cleanupDiscoverPanel(otherPanel);
            }
          }
        });

        // Toggle current panel
        if (isExpanded) {
          btn.setAttribute('aria-expanded', 'false');
          btn.querySelector('span').textContent = 'Descubrir más';
          panel.setAttribute('aria-hidden', 'true');
          cleanupDiscoverPanel(panel);
        } else {
          btn.setAttribute('aria-expanded', 'true');
          btn.querySelector('span').textContent = 'Ver menos';
          panel.setAttribute('aria-hidden', 'false');

          // Fire dynamic enhancements
          initDiscoverGalleryTilt(panel);
          initDiscoverParticles(panel);
          initDiscoverHeadingReveal(panel);

          // Smooth scroll to panel after animation
          setTimeout(function () {
            panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 350);
        }
      });
    });
  }

  /* ── Gallery 3D tilt on mouse move ─────────────── */
  function initDiscoverGalleryTilt(panel) {
    if (prefersReducedMotion) return;

    var gallery = panel.querySelector('.svc__discover-gallery');
    if (!gallery) return;

    function handleMove(e) {
      var rect = gallery.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;

      var tiltX = y * -8;
      var tiltY = x * 8;

      gallery.style.transform = 'perspective(800px) rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg) scale(1.02)';
      gallery.style.transition = 'transform 0.1s ease-out';
    }

    function handleLeave() {
      gallery.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
      gallery.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
    }

    gallery.addEventListener('mousemove', handleMove);
    gallery.addEventListener('mouseleave', handleLeave);

    gallery._discoverTilt = { move: handleMove, leave: handleLeave };
  }

  /* ── Floating particles ────────────────────────── */
  function initDiscoverParticles(panel) {
    if (prefersReducedMotion) return;

    var grid = panel.querySelector('.svc__discover-grid');
    if (!grid) return;

    var particleCount = 8;
    var particles = [];

    for (var i = 0; i < particleCount; i++) {
      var dot = document.createElement('span');
      dot.className = 'svc__discover-particle';
      dot.setAttribute('aria-hidden', 'true');

      var size = 3 + Math.random() * 5;
      var startX = Math.random() * 100;
      var startY = Math.random() * 100;
      var duration = 4 + Math.random() * 6;
      var delay = Math.random() * 3;
      var isAccent = Math.random() > 0.5;

      dot.style.cssText =
        'position:absolute;' +
        'width:' + size + 'px;' +
        'height:' + size + 'px;' +
        'border-radius:50%;' +
        'background:' + (isAccent ? 'var(--accent)' : 'var(--cta)') + ';' +
        'left:' + startX + '%;' +
        'top:' + startY + '%;' +
        'opacity:0;' +
        'pointer-events:none;' +
        'z-index:0;' +
        'animation:discoverFloat ' + duration + 's ease-in-out ' + delay + 's infinite,' +
                  'discoverDotPulse ' + (duration * 0.6) + 's ease-in-out ' + delay + 's infinite;';

      grid.appendChild(dot);
      particles.push(dot);
    }

    grid._discoverParticles = particles;
  }

  /* ── Heading letter-by-letter reveal ────────────── */
  function initDiscoverHeadingReveal(panel) {
    if (prefersReducedMotion) return;

    var heading = panel.querySelector('.svc__discover-heading');
    if (!heading || heading._discoverRevealed) return;

    var text = heading.textContent;
    heading.textContent = '';
    heading._discoverRevealed = true;

    var chars = text.split('');
    chars.forEach(function (char, i) {
      var span = document.createElement('span');
      span.textContent = char;
      span.style.cssText =
        'display:inline-block;' +
        'opacity:0;' +
        'transform:translateY(12px) rotate(3deg);' +
        'transition:opacity 0.3s ease ' + (i * 25 + 200) + 'ms,' +
                    'transform 0.4s cubic-bezier(0.34,1.56,0.64,1) ' + (i * 25 + 200) + 'ms;';
      if (char === ' ') span.style.width = '0.3em';
      heading.appendChild(span);
    });

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        var spans = heading.querySelectorAll('span');
        spans.forEach(function (s) {
          s.style.opacity = '1';
          s.style.transform = 'translateY(0) rotate(0)';
        });
      });
    });
  }

  /* ── Cleanup when panel closes ─────────────────── */
  function cleanupDiscoverPanel(panel) {
    // Remove particles
    var grid = panel.querySelector('.svc__discover-grid');
    if (grid && grid._discoverParticles) {
      grid._discoverParticles.forEach(function (dot) { dot.remove(); });
      grid._discoverParticles = null;
    }

    // Remove tilt listeners
    var gallery = panel.querySelector('.svc__discover-gallery');
    if (gallery && gallery._discoverTilt) {
      gallery.removeEventListener('mousemove', gallery._discoverTilt.move);
      gallery.removeEventListener('mouseleave', gallery._discoverTilt.leave);
      gallery.style.transform = '';
      gallery._discoverTilt = null;
    }

    // Reset heading for re-animation on next open
    var heading = panel.querySelector('.svc__discover-heading');
    if (heading && heading._discoverRevealed) {
      var text = heading.textContent;
      heading.textContent = text;
      heading._discoverRevealed = false;
    }
  }

  /* ─── Initialize ────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    initScrollReveal();
    initServiceProgress();
    initServiceSectionEffects();
    initHeroTextAnimation();
    initParallax();
    initStickyNav();
    initMagneticButtons();
    initTiltCards();
    initImageReveal();
    initMobileMenu();
    initSmoothScroll();
    initActiveNavLink();
    initCounterAnimation();
    initMarquee();
    initContactForm();
    initDiscoverPanels();
  });
})();

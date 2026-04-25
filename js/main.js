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

  /* ─── Sonrisa Showcase — Lagom-style carousel ───────── */
  function initSonrisaShowcase() {
    var showcases = document.querySelectorAll('.sonrisa-showcase');
    if (!showcases.length) return;
    showcases.forEach(initOneShowcase);
  }

  function initOneShowcase(showcase) {
    var slides = showcase.querySelectorAll('.sonrisa-showcase__slide');
    var bars = showcase.querySelectorAll('.sonrisa-showcase__bar');
    if (!slides.length || !bars.length) return;

    var content = showcase.querySelector('.sonrisa-showcase__content');
    var frame = showcase.querySelector('.sonrisa-showcase__frame');
    var els = {
      priceKicker: showcase.querySelector('[data-ss-price-kicker]'),
      price: showcase.querySelector('[data-ss-price]'),
      priceUnit: showcase.querySelector('[data-ss-price-unit]'),
      duration: showcase.querySelector('[data-ss-duration]'),
      counter: showcase.querySelector('[data-ss-counter]'),
      title: showcase.querySelector('[data-ss-title]'),
      subtitle: showcase.querySelector('[data-ss-subtitle]'),
      location: showcase.querySelector('[data-ss-location]'),
      badgeNum: showcase.querySelector('[data-ss-badge-num]'),
      badgeLabel: showcase.querySelector('[data-ss-badge-label]'),
      img: showcase.querySelector('[data-ss-img]')
    };

    var index = 0;
    var timer = null;
    var AUTO_MS = 6000;

    function parsePrice(raw) {
      // Splits "desde $850" → kicker="desde" + price="$850"
      if (!raw) return { kicker: '', price: '' };
      var m = raw.match(/^(\S+)\s+(.+)$/);
      if (m) return { kicker: m[1], price: m[2] };
      return { kicker: '', price: raw };
    }

    var isFirstRender = true;
    var transitioning = false;

    function applyData(s) {
      var pp = parsePrice(s.getAttribute('data-price'));
      if (els.priceKicker) els.priceKicker.textContent = pp.kicker;
      if (els.price) els.price.textContent = pp.price;
      if (els.priceUnit) els.priceUnit.textContent = s.getAttribute('data-price-unit') || '';
      if (els.duration) els.duration.textContent = s.getAttribute('data-duration') || '';
      if (els.counter) els.counter.textContent = (s.getAttribute('data-counter') || '').split('/')[0];
      if (els.title) els.title.textContent = s.getAttribute('data-title') || '';
      if (els.subtitle) els.subtitle.textContent = s.getAttribute('data-subtitle') || '';
      if (els.location) els.location.textContent = s.getAttribute('data-location') || '';
      if (els.badgeNum) els.badgeNum.textContent = s.getAttribute('data-badge-num') || '';
      if (els.badgeLabel) els.badgeLabel.textContent = s.getAttribute('data-badge-label') || '';
      if (els.img) {
        var imgSrc = s.getAttribute('data-img');
        if (imgSrc) {
          els.img.src = imgSrc;
          els.img.alt = s.getAttribute('data-img-alt') || '';
        }
      }
    }

    function syncBars(i) {
      bars.forEach(function (b) {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      var activeBar = bars[i];
      if (activeBar) {
        void activeBar.offsetWidth;
        activeBar.classList.add('is-active');
        activeBar.setAttribute('aria-selected', 'true');
      }
    }

    function pulseBadge() {
      var badge = showcase.querySelector('.sonrisa-showcase__badge');
      if (!badge || !showcase.classList.contains('is-in-view')) return;
      badge.classList.remove('is-pulsing');
      void badge.offsetWidth;
      badge.classList.add('is-pulsing');
    }

    function restartKenBurns() {
      if (!els.img) return;
      els.img.style.animation = 'none';
      void els.img.offsetWidth;
      els.img.style.animation = '';
    }

    function render(i) {
      var s = slides[i];
      if (!s) return;
      slides.forEach(function (sl, j) { sl.classList.toggle('is-active', j === i); });

      // FIRST render: just set data, no transition (let is-in-view stagger play)
      if (isFirstRender) {
        isFirstRender = false;
        applyData(s);
        syncBars(i);
        return;
      }

      if (transitioning) return;
      transitioning = true;

      // Phase 1: SLIDE OUT (current content + image leave to the left)
      if (content) content.classList.add('ss-out');
      if (frame) frame.classList.add('ss-out');

      setTimeout(function () {
        // Phase 2: SWAP DATA (during the brief instant content is invisible)
        applyData(s);
        syncBars(i);
        pulseBadge();

        // Phase 3: SLIDE IN (new content + image enter from the right)
        if (content) {
          content.classList.remove('ss-out');
          content.classList.add('ss-in');
        }
        if (frame) {
          frame.classList.remove('ss-out');
          frame.classList.add('ss-in');
        }

        // Phase 4: cleanup after slide-in finishes → Ken Burns kicks back
        setTimeout(function () {
          if (content) content.classList.remove('ss-in');
          if (frame) frame.classList.remove('ss-in');
          restartKenBurns();
          transitioning = false;
        }, 720); // match ssSlideInRight + buffer
      }, 380); // match ssSlideOutLeft duration
    }

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      render(index);
      restart();
    }

    function next() { goTo(index + 1); }

    function restart() {
      if (timer) clearTimeout(timer);
      timer = setTimeout(next, AUTO_MS);
    }

    function pause() {
      if (timer) { clearTimeout(timer); timer = null; }
      var barsContainer = showcase.querySelector('.sonrisa-showcase__bars');
      if (barsContainer) barsContainer.classList.add('is-paused');
    }

    function resume() {
      var barsContainer = showcase.querySelector('.sonrisa-showcase__bars');
      if (barsContainer) barsContainer.classList.remove('is-paused');
      restart();
    }

    // Click navigation
    bars.forEach(function (b) {
      b.addEventListener('click', function () {
        goTo(parseInt(b.getAttribute('data-ss-bar'), 10));
      });
    });

    // Pause on hover, resume on leave
    showcase.addEventListener('mouseenter', pause);
    showcase.addEventListener('mouseleave', resume);

    // Start only when visible + toggle is-in-view for entrance anims
    var visObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          showcase.classList.add('is-in-view');
          render(0);
          restart();
        } else {
          pause();
        }
      });
    }, { threshold: 0.18 });
    visObs.observe(showcase);

    // ── Scroll-linked parallax on image ─────────────
    if (!prefersReducedMotion) {
      var imgScroll = showcase.querySelector('.sonrisa-showcase__img-scroll');
      var frame = showcase.querySelector('.sonrisa-showcase__frame');
      if (imgScroll && frame) {
        var ticking = false;
        function updateParallax() {
          if (ticking) return;
          ticking = true;
          requestAnimationFrame(function () {
            var rect = frame.getBoundingClientRect();
            var vh = window.innerHeight;
            if (rect.bottom < -100 || rect.top > vh + 100) { ticking = false; return; }
            var center = rect.top + rect.height / 2;
            var progress = (center - vh / 2) / (vh / 2); // -1 to 1
            progress = Math.max(-1, Math.min(1, progress));
            var offset = -progress * 28; // px
            imgScroll.style.setProperty('--ss-parallax', offset.toFixed(2) + 'px');
            ticking = false;
          });
        }
        window.addEventListener('scroll', updateParallax, { passive: true });
        window.addEventListener('resize', updateParallax);
        updateParallax();
      }
    }

  }

  /* ─── Turismo Médico — stats count-up when visible ──── */
  function initTurismoStats() {
    var nums = document.querySelectorAll('.turismo__stat-num');
    if (!nums.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-count'), 10);
        if (!target || isNaN(target)) { observer.unobserve(el); return; }
        var duration = 1400;
        var start = null;
        function step(ts) {
          if (!start) start = ts;
          var progress = Math.min(1, (ts - start) / duration);
          var eased = 1 - Math.pow(1 - progress, 4); // ease-out-quart
          el.textContent = Math.floor(eased * target);
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = target;
        }
        requestAnimationFrame(step);
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });

    nums.forEach(function (n) { observer.observe(n); });
  }

  /* ─── Service word-by-word reveal (tpl A/B/C/D titles) ─ */
  function initServiceWordReveal() {
    var titles = document.querySelectorAll('.svc--tplA .svc__title, .svc--tplB .svc__title, .svc--tplC .svc__title, .svc--tplD .svc__title');
    titles.forEach(function (title) {
      if (title.dataset.wordReveal === 'done') return;
      // Split each text node on whitespace into word spans, preserving <em> and <br>
      var html = title.innerHTML;
      // Replace plain text tokens (outside tags) with word wrappers
      var tokenized = html.replace(/(<[^>]+>)|([^<\s]+)/g, function (m, tag, word) {
        if (tag) return tag;
        if (word) return '<span class="svc-word"><span class="svc-word__inner">' + word + '</span></span>';
        return m;
      });
      title.innerHTML = tokenized;
      title.dataset.wordReveal = 'done';
    });
  }

  /* ─── Scroll-linked parallax on service images (B, C) ─── */
  function initServiceParallax() {
    if (prefersReducedMotion) return;

    var wrappers = document.querySelectorAll('.svc--tplB .svc__img-wrapper, .svc--tplC .svc__img-wrapper');
    if (!wrappers.length) return;

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var vh = window.innerHeight;
        wrappers.forEach(function (w) {
          var rect = w.getBoundingClientRect();
          // Only animate when on-screen
          if (rect.bottom < -100 || rect.top > vh + 100) return;
          // Progress: -1 (bottom of viewport) → 0 (center) → 1 (top)
          var center = rect.top + rect.height / 2;
          var progress = (center - vh / 2) / (vh / 2);
          progress = Math.max(-1, Math.min(1, progress));
          // Translate ±30px based on progress
          var offset = -progress * 30;
          w.style.setProperty('--svc-parallax', offset.toFixed(2) + 'px');
        });
        ticking = false;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }

  /* ─── Scrollytelling: pinned image + scrolling steps ──── */
  function initScrollyFeatures() {
    var blocks = document.querySelectorAll('.svc-scroll');
    if (!blocks.length) return;

    blocks.forEach(function (block) {
      var steps = block.querySelectorAll('.svc-scroll__step');
      var images = block.querySelectorAll('.svc-scroll__img');
      var heroGalleries = block.querySelectorAll('.svc-scroll__hero-gallery');
      if (!steps.length) return;

      function setActive(stepId) {
        steps.forEach(function (s) {
          s.classList.toggle('is-active', s.getAttribute('data-step') === stepId);
        });
        images.forEach(function (img) {
          img.classList.toggle('svc-scroll__img--active', img.getAttribute('data-step') === stepId);
        });
        heroGalleries.forEach(function (g) {
          g.classList.toggle('svc-scroll__hero-gallery--active', g.getAttribute('data-step') === stepId);
        });
      }

      // Track which steps are currently in the active band
      var intersecting = {};

      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var id = entry.target.getAttribute('data-step');
          intersecting[id] = entry.isIntersecting;
        });
        // Pick the lowest (topmost on page) step that is currently intersecting
        var activeId = null;
        for (var i = 0; i < steps.length; i++) {
          var id = steps[i].getAttribute('data-step');
          if (intersecting[id]) { activeId = id; break; }
        }
        // Fallback: if nothing in the center band → keep step 0 (hero) active
        if (activeId === null) activeId = '0';
        setActive(activeId);
      }, {
        // Active band is the middle ~30% of viewport
        rootMargin: '-35% 0px -35% 0px',
        threshold: 0
      });

      steps.forEach(function (s) { observer.observe(s); });
    });
  }

  /* ─── Service Templates: entrance observer (A/B/C/D) ─── */
  function initServiceTemplates() {
    var templates = document.querySelectorAll('.svc--tplA, .svc--tplB, .svc--tplC, .svc--tplD');
    if (!templates.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    templates.forEach(function (sec) { observer.observe(sec); });

    // Count-up for Template C stats
    var statNumbers = document.querySelectorAll('.svc--tplC .svc__stat-number');
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        countUpStat(entry.target);
        countObserver.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(function (el) { countObserver.observe(el); });
  }

  function countUpStat(el) {
    var raw = (el.textContent || '').trim();
    // Pull out the leading integer portion
    var match = raw.match(/^(\d+)/);
    if (!match) return;
    var target = parseInt(match[1], 10);
    var suffix = raw.slice(match[1].length); // "%" / "+" / "h" etc.
    if (isNaN(target) || target <= 0) return;

    var duration = 1200;
    var start = null;

    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min(1, (ts - start) / duration);
      // ease-out-quart
      var eased = 1 - Math.pow(1 - progress, 4);
      var current = Math.floor(eased * target);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }

    el.textContent = '0' + suffix;
    requestAnimationFrame(step);
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

    // Parallax on service numbers disabled — Viktor Oddy style is static.
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

  /* ─── UNVRS Gallery Carousel ─────────────────────────── */
  function initUnvrsGallery() {
    var section = document.querySelector('.galeria--unvrs');
    if (!section) return;

    var track = section.querySelector('.galeria__track');
    var cards = section.querySelectorAll('.galeria__card');
    var percent = section.querySelector('.galeria__percent');
    var fill = section.querySelector('.galeria__progress-fill');
    var prev = section.querySelector('.galeria__arrow--prev');
    var next = section.querySelector('.galeria__arrow--next');
    var counterCur = section.querySelector('.galeria__counter-current');
    var counterTotal = section.querySelector('.galeria__counter-total');
    var filters = section.querySelectorAll('.galeria__filter');

    if (!track || !cards.length) return;

    if (counterTotal) counterTotal.textContent = String(cards.length).padStart(2, '0');

    // Entrance animation when section enters viewport
    var visObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          section.classList.add('is-visible');
          visObserver.unobserve(section);
        }
      });
    }, { threshold: 0.15 });
    visObserver.observe(section);

    // Compute a step = distance between two cards (for arrow nav)
    function getStep() {
      if (cards.length >= 2) {
        var r1 = cards[0].getBoundingClientRect();
        var r2 = cards[1].getBoundingClientRect();
        return r2.left - r1.left;
      }
      return cards[0] ? cards[0].getBoundingClientRect().width : 400;
    }

    // Detect which card is closest to viewport center → is-active
    function updateActiveCard() {
      var trackRect = track.getBoundingClientRect();
      var centerX = trackRect.left + trackRect.width / 2;
      var closest = null;
      var closestDist = Infinity;

      cards.forEach(function (card) {
        var r = card.getBoundingClientRect();
        var cardCenter = r.left + r.width / 2;
        var dist = Math.abs(cardCenter - centerX);
        if (dist < closestDist) {
          closestDist = dist;
          closest = card;
        }
      });

      cards.forEach(function (card, idx) {
        if (card === closest) {
          card.classList.add('is-active');
          if (counterCur) {
            counterCur.textContent = String(idx + 1).padStart(2, '0');
          }
        } else {
          card.classList.remove('is-active');
        }
      });
    }

    // Filter logic
    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = btn.getAttribute('data-filter');
        filters.forEach(function (b) {
          b.classList.remove('galeria__filter--active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('galeria__filter--active');
        btn.setAttribute('aria-selected', 'true');

        cards.forEach(function (card) {
          var cat = card.getAttribute('data-category');
          if (target === 'all' || cat === target) {
            card.classList.remove('is-hidden');
          } else {
            card.classList.add('is-hidden');
          }
        });

        // Scroll to the first visible card
        var firstVisible = Array.prototype.find
          ? Array.prototype.find.call(cards, function (c) { return !c.classList.contains('is-hidden'); })
          : null;
        if (firstVisible) {
          var rect = firstVisible.getBoundingClientRect();
          var trackRect = track.getBoundingClientRect();
          track.scrollBy({ left: rect.left - trackRect.left - 24, behavior: 'smooth' });
        }
      });
    });

    // Update progress bar + arrow enabled state + active card
    function updateProgress() {
      var max = track.scrollWidth - track.clientWidth;
      var p = max > 0 ? track.scrollLeft / max : 0;
      var pct = Math.round(p * 100);

      if (percent) percent.textContent = pct + '%';
      if (fill) fill.style.width = pct + '%';

      if (prev) {
        if (track.scrollLeft <= 2) prev.setAttribute('disabled', '');
        else prev.removeAttribute('disabled');
      }
      if (next) {
        if (track.scrollLeft >= max - 2) next.setAttribute('disabled', '');
        else next.removeAttribute('disabled');
      }

      updateActiveCard();
    }

    track.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);

    // Initial paint — mark the first card active
    setTimeout(updateProgress, 50);

    // Arrow navigation
    if (prev) {
      prev.addEventListener('click', function () {
        track.scrollBy({ left: -getStep(), behavior: 'smooth' });
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        track.scrollBy({ left: getStep(), behavior: 'smooth' });
      });
    }

    // Drag-to-scroll (desktop)
    var isDown = false;
    var startX = 0;
    var startScroll = 0;
    var moved = false;

    track.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return;
      isDown = true;
      moved = false;
      startX = e.pageX;
      startScroll = track.scrollLeft;
      track.classList.add('is-dragging');
    });

    window.addEventListener('mousemove', function (e) {
      if (!isDown) return;
      var dx = e.pageX - startX;
      if (Math.abs(dx) > 4) moved = true;
      track.scrollLeft = startScroll - dx;
    });

    window.addEventListener('mouseup', function () {
      if (!isDown) return;
      isDown = false;
      track.classList.remove('is-dragging');
      if (moved) {
        var blockClick = function (ev) {
          ev.stopPropagation();
          ev.preventDefault();
          window.removeEventListener('click', blockClick, true);
        };
        window.addEventListener('click', blockClick, true);
      }
    });

    track.addEventListener('mouseleave', function () {
      if (isDown) {
        isDown = false;
        track.classList.remove('is-dragging');
      }
    });

    // Wheel: vertical scroll inside track → horizontal scroll
    track.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        var max = track.scrollWidth - track.clientWidth;
        var atStart = track.scrollLeft <= 0 && e.deltaY < 0;
        var atEnd = track.scrollLeft >= max && e.deltaY > 0;
        if (atStart || atEnd) return;
        e.preventDefault();
        track.scrollLeft += e.deltaY;
      }
    }, { passive: false });

    // Keyboard when track focused
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        track.scrollBy({ left: getStep(), behavior: 'smooth' });
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        track.scrollBy({ left: -getStep(), behavior: 'smooth' });
      }
    });
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
    initServiceWordReveal();
    initTurismoStats();
    initSonrisaShowcase();
    initServiceTemplates();
    initServiceParallax();
    initScrollyFeatures();
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
    initUnvrsGallery();
  });
})();

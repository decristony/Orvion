/* AIthor — Home replica */

(function () {
  "use strict";

  /* ---------- Hero: word-by-word animation ---------- */
  var heroTitle = document.getElementById("hero-title");
  if (heroTitle) {
    var words = heroTitle.querySelectorAll(".w");
    words.forEach(function (w, i) {
      w.style.setProperty("--d", (0.15 + i * 0.07).toFixed(2) + "s");
    });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        heroTitle.classList.add("in");
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- Watermark: sequential letter reveal on scroll ---------- */
  var watermark = document.querySelector(".about-watermark");
  var aboutSection = document.getElementById("sobre");
  if (watermark && aboutSection && "IntersectionObserver" in window) {
    var wio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            watermark.classList.add("in");
            wio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    wio.observe(aboutSection);
  } else if (watermark) {
    watermark.classList.add("in");
  }

  /* ---------- Section cascade: stagger .reveal children on scroll ---------- */
  var sections = document.querySelectorAll("section.section, section.hero, .section-panel");
  if ("IntersectionObserver" in window && sections.length) {
    var sio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var kids = entry.target.querySelectorAll(".reveal");
          kids.forEach(function (el, i) {
            if (el.getAttribute("style") && /--delay/.test(el.getAttribute("style"))) return;
            el.style.setProperty("--delay", Math.min(i * 0.06, 0.6).toFixed(2) + "s");
          });
          sio.unobserve(entry.target);
        });
      },
      { threshold: 0.08 }
    );
    sections.forEach(function (s) { sio.observe(s); });
  }

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll(".counter");

  function animateCounter(el) {
    var target = parseInt(el.getAttribute("data-target"), 10) || 0;
    var duration = 1600;
    var start = null;

    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toString();
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if ("IntersectionObserver" in window && counters.length) {
    var cio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            cio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (c) { cio.observe(c); });
  } else {
    counters.forEach(function (c) {
      c.textContent = c.getAttribute("data-target");
    });
  }

  /* ---------- Infinite tickers (duplicate content once) ---------- */
  document.querySelectorAll("[data-ticker] > [class*='track']").forEach(function (track) {
    if (track.dataset.cloned) return;
    track.innerHTML += track.innerHTML;
    track.setAttribute("aria-hidden", "false");
    Array.prototype.slice.call(track.children, track.children.length / 2).forEach(function (clone) {
      clone.setAttribute("aria-hidden", "true");
    });
    track.dataset.cloned = "1";
  });

  /* ---------- Mobile menu ---------- */
  var nav = document.querySelector(".nav");
  var toggle = document.querySelector(".nav-toggle");

  if (nav) {
    function onScroll() {
      nav.classList.toggle("scrolled", window.scrollY > 40);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  if (nav && toggle) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    nav.querySelectorAll(".mobile-menu a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- FAQs: close others when one opens ---------- */
  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (!item.open) return;
      faqItems.forEach(function (other) {
        if (other !== item) other.open = false;
      });
    });
  });

  /* ---------- Custom cursor dot ---------- */
  if (window.matchMedia("(min-width: 1200px) and (pointer: fine)").matches) {
    var dot = document.createElement("div");
    dot.className = "cursor-dot";
    document.body.appendChild(dot);

    var glow = document.createElement("div");
    glow.className = "cursor-glow";
    document.body.appendChild(glow);

    var TRAIL = 12;
    var trailDots = [];
    for (var t = 0; t < TRAIL; t++) {
      var d = document.createElement("div");
      d.className = "cursor-trail";
      document.body.appendChild(d);
      trailDots.push(d);
    }
    var history = [];
    var historyLen = 24;

    var cx = -100, cy = -100, mx = cx, my = cy, overDark = false;
    function setTrail(on) {
      for (var i = 0; i < trailDots.length; i++) trailDots[i].style.opacity = on ? "1" : "0";
    }
    window.addEventListener("pointermove", function (e) {
      mx = e.clientX;
      my = e.clientY;
      overDark = e.target && !!e.target.closest(".section--dark");
      glow.classList.toggle("is-active", overDark);
      setTrail(!overDark);
    });
    document.addEventListener("mouseleave", function () { dot.classList.add("is-hidden"); glow.classList.remove("is-active"); setTrail(false); });
    document.addEventListener("mouseenter", function () { dot.classList.remove("is-hidden"); });

    (function follow() {
      cx += (mx - cx) * 0.2;
      cy += (my - cy) * 0.2;
      dot.style.transform = "translate3d(" + cx + "px," + cy + "px,0)";
      glow.style.transform = "translate3d(" + cx + "px," + cy + "px,0)";

      history.push({ x: cx, y: cy });
      if (history.length > historyLen) history.shift();
      var last = history.length - 1;
      var step = Math.max(1, Math.floor(TRAIL / Math.max(1, last)));
      for (var i = 0; i < trailDots.length; i++) {
        var idx = Math.max(0, last - i * step - 2);
        var p = history[idx] || { x: cx, y: cy };
        var s = 1 - (i / trailDots.length) * 0.6;
        trailDots[i].style.transform = "translate3d(" + p.x + "px," + p.y + "px,0) scale(" + s + ")";
      }
      requestAnimationFrame(follow);
    })();
  }

  /* ---------- Hero mockups: coverflow com as imagens dos protótipos ----------
     Os cards são montados a partir de js/mockups.js (manifesto sem servidor).
     Cada card recebe uma moldura de browser moderna, URL de caso e badge de métrica. */
  (function () {
    var stage = document.querySelector("[data-coverflow]");
    var indicatorsWrap = document.querySelector(".stage-dots");
    var manifest = window.ORVION_MOCKUPS;
    if (!stage || !indicatorsWrap || !manifest || !manifest.folder) return;

    var folder = manifest.folder;
    var images = Array.isArray(manifest.images) ? manifest.images : [];
    var cards = [];
    var dots = [];
    var current = 0;
    var timer = null;
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var INTERVAL = 4200;

    var caseMeta = [
      { url: "orvion.agency/cases/saas-tech", badge: "⚡ PageSpeed 99+", icon: "⚡" },
      { url: "orvion.agency/cases/ecommerce-cro", badge: "📈 +185% Conversão", icon: "📈" },
      { url: "orvion.agency/cases/institucional-pro", badge: "🎯 UX/UI & Estratégia", icon: "🎯" },
      { url: "orvion.agency/cases/landing-performance", badge: "🚀 Core Web Vitals 100", icon: "🚀" }
    ];

    function url(name) {
      return folder.split("/").map(encodeURIComponent).join("/") + "/" + encodeURIComponent(name);
    }

    function build() {
      stage.classList.remove("is-empty");
      stage.innerHTML = "";
      indicatorsWrap.innerHTML = "";
      cards = [];
      dots = [];
      current = 0;

      images.forEach(function (name, i) {
        var meta = caseMeta[i % caseMeta.length];

        var card = document.createElement("div");
        card.className = "cf-card";
        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");
        card.setAttribute("aria-label", "Ver projeto " + (i + 1));

        card.innerHTML =
          '<div class="mockup-viewport">' +
            '<img src="' + url(name) + '" alt="Projeto ORVION ' + (i + 1) + '" loading="lazy">' +
            '<div class="mockup-overlay-badge">' +
              '<span class="badge-icon">' + meta.icon + '</span>' +
              '<span>' + meta.badge + '</span>' +
            '</div>' +
          '</div>';

        card.addEventListener("click", function () {
          if (i !== current) {
            go(i);
          }
        });

        card.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            go(i);
          }
        });

        stage.appendChild(card);
        cards.push(card);

        var dot = document.createElement("span");
        dot.className = "sd";
        dot.setAttribute("role", "tab");
        dot.setAttribute("aria-label", "Slide " + (i + 1));
        dot.addEventListener("click", function () {
          go(i);
        });
        indicatorsWrap.appendChild(dot);
        dots.push(dot);
      });

      if (!cards.length) {
        stage.classList.add("is-empty");
        stop();
        return;
      }
      layout();
      startAuto();
    }

    function layout() {
      var n = images.length;
      cards.forEach(function (card, i) {
        card.classList.remove("is-center", "is-left", "is-right", "is-hidden");
        if (i === current) {
          card.classList.add("is-center");
          card.setAttribute("aria-current", "true");
        } else if ((current + 1) % n === i) {
          card.classList.add("is-right");
          card.removeAttribute("aria-current");
        } else if ((current - 1 + n) % n === i) {
          card.classList.add("is-left");
          card.removeAttribute("aria-current");
        } else {
          card.classList.add("is-hidden");
          card.removeAttribute("aria-current");
        }
        card.style.zIndex =
          i === current ? "4" : (i === (current + 1) % n || i === (current - 1 + n) % n) ? "2" : "1";
      });

      dots.forEach(function (dot, i) {
        var active = i === current;
        dot.classList.toggle("active", active);
        dot.setAttribute("aria-selected", active ? "true" : "false");
      });
    }

    function step() {
      current = (current + 1) % images.length;
      layout();
    }

    function prev() {
      stop();
      current = (current - 1 + images.length) % images.length;
      layout();
      startAuto();
    }

    function next() {
      stop();
      current = (current + 1) % images.length;
      layout();
      startAuto();
    }

    function go(i) {
      stop();
      current = ((i % images.length) + images.length) % images.length;
      layout();
      startAuto();
    }

    function startAuto() {
      stop();
      if (!reduceMotion && images.length > 1) {
        timer = setInterval(step, INTERVAL);
      }
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    var prevBtn = document.querySelector(".cf-arrow--prev");
    var nextBtn = document.querySelector(".cf-arrow--next");
    if (prevBtn) prevBtn.addEventListener("click", prev);
    if (nextBtn) nextBtn.addEventListener("click", next);

    var heroStage = document.querySelector(".hero-stage");
    if (heroStage) {
      heroStage.addEventListener("mouseenter", stop);
      heroStage.addEventListener("mouseleave", startAuto);

      // Touch swipe support
      var startX = 0;
      heroStage.addEventListener("touchstart", function (e) {
        if (e.touches && e.touches.length) startX = e.touches[0].clientX;
      }, { passive: true });

      heroStage.addEventListener("touchend", function (e) {
        if (e.changedTouches && e.changedTouches.length) {
          var diff = e.changedTouches[0].clientX - startX;
          if (Math.abs(diff) > 40) {
            if (diff > 0) prev();
            else next();
          }
        }
      }, { passive: true });
    }

    build();

    // Pausar auto-avanço quando a hero sai de vista
    if (heroStage && "IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            startAuto();
          } else {
            stop();
          }
        });
      }, { threshold: 0.05 }).observe(heroStage);
    }
  })();

})();

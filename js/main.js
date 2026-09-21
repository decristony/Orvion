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
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function formatCounter(el, value) {
    var decimals = parseInt(el.getAttribute("data-decimals"), 10) || 0;
    return value.toFixed(decimals).replace(".", ",");
  }

  function animateCounter(el) {
    var target = parseFloat(el.getAttribute("data-target")) || 0;
    if (reduceMotion) { el.textContent = formatCounter(el, target); return; }
    var duration = 1600;
    var start = null;

    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatCounter(el, target * eased);
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  // Só conta quando o reveal da dobra já revelou o número em cena.
  function startCounterWhenRevealed(el) {
    var blocker = el.closest(".reveal");
    if (!blocker || blocker.classList.contains("visible")) { animateCounter(el); return; }
    if ("MutationObserver" in window) {
      var mo = new MutationObserver(function () {
        if (blocker.classList.contains("visible")) {
          mo.disconnect();
          animateCounter(el);
        }
      });
      mo.observe(blocker, { attributes: true, attributeFilter: ["class"] });
    } else {
      animateCounter(el);
    }
  }

  if ("IntersectionObserver" in window && counters.length) {
    var cio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            startCounterWhenRevealed(entry.target);
            cio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (c) { cio.observe(c); });
  } else {
    counters.forEach(function (c) {
      if (reduceMotion) { c.textContent = formatCounter(c, parseFloat(c.getAttribute("data-target")) || 0); return; }
      startCounterWhenRevealed(c);
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
    function setOpen(open) {
      nav.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("nav-open", open);
    }

    toggle.addEventListener("click", function () {
      setOpen(!nav.classList.contains("open"));
    });

    nav.querySelectorAll(".mobile-menu a").forEach(function (link) {
      link.addEventListener("click", function () {
        setOpen(false);
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) setOpen(false);
    });

    document.addEventListener("click", function (e) {
      if (!nav.classList.contains("open")) return;
      if (nav.contains(e.target)) return;
      setOpen(false);
    });
  }

  /* ---------- Seções e Topo em Fluxo (imune ao sticky fold stack) ---------- */
  function getSectionScrollTop(target) {
    if (!target) return 0;
    if (target.id === "hero" || target.closest(".top-zone")) return 0;

    var main = document.querySelector("main");
    if (!main) {
      var y = 0, el = target;
      while (el) { y += el.offsetTop || 0; el = el.offsetParent; }
      return y;
    }

    var block = target;
    while (block && block.parentElement !== main) {
      block = block.parentElement;
    }
    if (!block) return 0;

    var top = 0;
    var current = main.firstElementChild;
    while (current && current !== block) {
      if (current.offsetParent !== null || current.offsetHeight > 0) {
        top += current.offsetHeight;
      }
      current = current.nextElementSibling;
    }

    return top;
  }

  /* ---------- Scrollspy: menu ativo (imune ao sticky fold) ---------- */
  var desktopSpy = Array.prototype.slice.call(document.querySelectorAll(".menu .menu-link"));
  var mobileSpy = Array.prototype.slice.call(document.querySelectorAll(".mobile-menu .menu-link"));
  var spyItems = desktopSpy.concat(mobileSpy);

  function updateSpy() {
    if (!spyItems.length) return;
    var currentY = window.scrollY || window.pageYOffset || 0;
    var threshold = currentY + 120;
    var active = spyItems[0];
    spyItems.forEach(function (link) {
      var href = link.getAttribute("href");
      if (!href || href.length < 2 || href.charAt(1) === "#") return;
      var target = document.querySelector(href);
      if (target && getSectionScrollTop(target) <= threshold) {
        active = link;
      }
    });
    spyItems.forEach(function (link) {
      link.classList.toggle("is-active", link === active);
    });
  }

  window.addEventListener("scroll", updateSpy, { passive: true });
  window.addEventListener("resize", updateSpy);
  updateSpy();

  /* ---------- Smooth animated scroll (garante a transição ultra-suave) ---------- */
  var activeScrollAnim = null;

  function smoothScrollTo(targetY) {
    if (activeScrollAnim) {
      cancelAnimationFrame(activeScrollAnim);
      activeScrollAnim = null;
    }

    var startY = window.scrollY || window.pageYOffset || 0;
    var diff = targetY - startY;

    if (reduceMotion || Math.abs(diff) < 2) {
      window.scrollTo(0, targetY);
      return;
    }

    var prevScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";

    var startTime = null;
    // Duração sedosa calibrada: mínimo 650ms, máximo 1150ms
    var duration = Math.min(1150, Math.max(650, Math.abs(diff) * 0.48));

    // Curva easeInOutQuart: aceleração imperceptível e desaceleração longa e aveludada
    function smoothEase(t) {
      return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
    }

    function cleanup() {
      document.documentElement.style.scrollBehavior = prevScrollBehavior;
      activeScrollAnim = null;
      window.removeEventListener("wheel", cancelAnim, { passive: true });
      window.removeEventListener("touchmove", cancelAnim, { passive: true });
    }

    function cancelAnim() {
      if (activeScrollAnim) {
        cancelAnimationFrame(activeScrollAnim);
        cleanup();
      }
    }

    function step(ts) {
      if (!startTime) startTime = ts;
      var p = Math.min((ts - startTime) / duration, 1);
      var eased = smoothEase(p);
      window.scrollTo(0, startY + diff * eased);

      if (p < 1) {
        activeScrollAnim = requestAnimationFrame(step);
      } else {
        window.scrollTo(0, targetY);
        cleanup();
      }
    }

    window.addEventListener("wheel", cancelAnim, { passive: true, once: true });
    window.addEventListener("touchmove", cancelAnim, { passive: true, once: true });
    activeScrollAnim = requestAnimationFrame(step);
  }

  /* ---------- Anchor navigation (corrige a transição da volta no menu) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var href = link.getAttribute("href");
      if (!href || href.length < 2 || href.charAt(1) === "#") return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();

      var top = getSectionScrollTop(target);
      smoothScrollTo(top);
      if (history.replaceState) history.replaceState(null, "", href);
    });
  });

  /* ---------- FAQs: abertura suave + fecha outros ---------- */
  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    var answer = item.querySelector(".faq-a");
    if (!answer) return;

    answer.style.maxHeight = "0px";
    answer.style.opacity = "0";
    answer.style.paddingBottom = "0px";

    if (reduceMotion) {
      answer.style.transition = "none";
    }

    function applyState() {
      if (item.open) {
        answer.style.maxHeight = answer.scrollHeight + "px";
        answer.style.opacity = "1";
        answer.style.paddingBottom = "24px";
      } else {
        answer.style.maxHeight = "0px";
        answer.style.opacity = "0";
        answer.style.paddingBottom = "0px";
      }
    }

    item.addEventListener("toggle", function () {
      if (item.open) {
        faqItems.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      }
      applyState();
    });

    if (item.open) applyState();
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
      overDark = e.target && !!e.target.closest(".panel--dark");
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

  /* ---------- Cases: Screenshot Showcase ---------- */
  (function () {
    var root = document.querySelector("[data-cases-showcase]");
    if (!root) return;

    var mainImg   = root.querySelector(".cases-main-img");
    var mainGlass = root.querySelector(".cases-main-glass");
    var mainNum   = root.querySelector(".cases-main-num");
    var mainName  = root.querySelector(".cases-main-name");
    var thumbs    = Array.prototype.slice.call(root.querySelectorAll(".cases-thumb"));
    if (!mainImg || !thumbs.length) return;

    var PROJECTS = [
      { img: "public/portfolio/Site 01.webp", num: "01", name: "Odonto Vita", url: "https://decristony.github.io/OdontoVitta/" },
      { img: "public/portfolio/site 04.webp", num: "02", name: "Santos e Robert", url: "https://santosrobert.com.br/" },
      { img: "public/portfolio/Site 03.webp", num: "03", name: "La Maison", url: "https://decristony.github.io/Luxury-Cardapio/" },
      { img: "public/portfolio/Site 02.webp", num: "04", name: "Liora Aura", url: "https://decristony.github.io/Aura-Premium/" }
    ];

    var SCROLL_DOWN_MS = 12000;
    var PAUSE_BOTTOM_MS = 1400;
    var SCROLL_UP_MS = 2600;
    var PAUSE_TOP_MS = 700;

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var current = 0;
    var phase = "idle";      // loading | down | bottom | up | top | idle
    var phaseStart = 0;
    var pausedFlag = false;
    var pauseStarted = 0;
    var raf = null;
    var loadTimer = null;

    // Preload all screenshots up front
    PROJECTS.forEach(function (p) { var img = new Image(); img.src = p.img; });

    function ready() {
      return mainImg.complete && mainImg.naturalWidth > 0;
    }

    function maxY() {
      var screen = mainImg.parentElement;
      var d = mainImg.clientHeight - screen.clientHeight;
      return d > 0 ? d : 1;
    }

    function easeInOut(p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
    function easeOut(p) { return 1 - Math.pow(1 - p, 3); }

    function updateActive() {
      thumbs.forEach(function (t, i) {
        t.classList.toggle("active", i === current);
        t.setAttribute("aria-pressed", i === current ? "true" : "false");
      });
    }

    function goTo(index) {
      if (index < 0 || index >= PROJECTS.length) return;
      if (index === current && phase !== "idle") { return; }

      current = index;
      var p = PROJECTS[index];

      // Page-pull transition on the main glass
      mainGlass.classList.remove("switching");
      void mainGlass.offsetWidth;
      mainGlass.classList.add("switching");

      // Update thumbnails stack + active state
      updateActive();

      // Title
      mainNum.textContent = p.num;
      mainName.textContent = p.name;

      // Swap screenshot and reset to top
      mainImg.style.transition = "none";
      mainImg.src = p.img;
      mainImg.style.transform = "translateY(0px)";

      // Start vertical scroll
      var start = function () {
        mainImg.style.transition = "";
        phase = "down";
        phaseStart = performance.now();
      };
      if (mainImg.complete && mainImg.naturalWidth > 0) {
        phase = "loading";
        if (loadTimer) clearTimeout(loadTimer);
        loadTimer = setTimeout(start, reduceMotion ? 900 : 80);
      } else {
        mainImg.onload = start;
      }
    }

    function loop(now) {
      raf = requestAnimationFrame(loop);
      if (pausedFlag) return;
      // Wait for the screenshot to be measurable before scrolling
      if (!ready()) { phaseStart = now; return; }

      var elapsed = now - phaseStart;
      var dist = maxY();

      if (phase === "down") {
        var d = Math.min(1, elapsed / SCROLL_DOWN_MS);
        mainImg.style.transform = "translateY(" + (-dist * easeInOut(d)) + "px)";
        if (d >= 1) { phase = "bottom"; phaseStart = now; mainImg.style.transform = "translateY(" + (-dist) + "px)"; }
      } else if (phase === "bottom") {
        if (elapsed >= PAUSE_BOTTOM_MS) { phase = "up"; phaseStart = now; }
      } else if (phase === "up") {
        var u = Math.min(1, elapsed / SCROLL_UP_MS);
        mainImg.style.transform = "translateY(" + (-dist * (1 - easeOut(u))) + "px)";
        if (u >= 1) { phase = "top"; phaseStart = now; mainImg.style.transform = "translateY(0px)"; }
      } else if (phase === "top") {
        if (elapsed >= PAUSE_TOP_MS) {
          phase = "idle";
          goTo((current + 1) % PROJECTS.length);
        }
      }
    }

    function startLoop() {
      if (raf) return;
      raf = requestAnimationFrame(loop);
    }
    function stopLoop() {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
    }

    // Pause / resume keeps the scroll progression continuous
    function pauseCycle() {
      if (pausedFlag) return;
      pausedFlag = true;
      pauseStarted = performance.now();
    }
    function resumeCycle() {
      if (!pausedFlag) return;
      pausedFlag = false;
      phaseStart += performance.now() - pauseStarted;
    }

    // Thumbnail clicks: switch project immediately
    thumbs.forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        var idx = parseInt(this.getAttribute("data-index"), 10);
        pauseCycle();
        goTo(idx);
        resumeCycle();
      });
    });

    // Hover on a thumbnail: pause the autoplay temporarily
    thumbs.forEach(function (thumb) {
      thumb.addEventListener("mouseenter", pauseCycle);
      thumb.addEventListener("mouseleave", resumeCycle);
      thumb.addEventListener("focus", pauseCycle);
      thumb.addEventListener("blur", resumeCycle);
    });

    // Touch swipe on the main screen: change project
    if (mainGlass) {
      var startY = 0;
      var startT = 0;
      var swipedAt = 0;
      mainGlass.addEventListener("touchstart", function (e) {
        startY = e.touches[0].clientY;
        startT = Date.now();
      }, { passive: true });
      mainGlass.addEventListener("touchend", function (e) {
        if (!e.changedTouches || !e.changedTouches.length) return;
        var diff = e.changedTouches[0].clientY - startY;
        if (Math.abs(diff) > 40) {
          swipedAt = Date.now();
          pauseCycle();
          goTo((current + (diff > 0 ? -1 : 1) + PROJECTS.length) % PROJECTS.length);
          resumeCycle();
        }
      }, { passive: true });

      // Open the active project's site
      mainGlass.addEventListener("click", function () {
        if (Date.now() - swipedAt < 500) return;
        var p = PROJECTS[current];
        if (p && p.url) window.open(p.url, "_blank", "noopener");
      });
    }

    // Keyboard navigation
    root.setAttribute("tabindex", "0");
    root.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        pauseCycle(); goTo((current + 1) % PROJECTS.length); resumeCycle();
      }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        pauseCycle(); goTo((current - 1 + PROJECTS.length) % PROJECTS.length); resumeCycle();
      }
    });

    // Pause when the section leaves the viewport
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { resumeCycle(); if (!reduceMotion) startLoop(); }
          else { pauseCycle(); stopLoop(); }
        });
      }, { threshold: 0.1 }).observe(root);
    }

    // Init
    updateActive();
    mainNum.textContent = PROJECTS[0].num;
    mainName.textContent = PROJECTS[0].name;

    // Reduced motion: show a static screenshot, no auto-scroll
    if (reduceMotion) {
      mainImg.style.transform = "translateY(0px)";
      phase = "idle";
      return;
    }

    phase = "down";
    phaseStart = performance.now();
    startLoop();
  })();

  /* ---------- Founders: carrossel mobile (1 card por vez) ---------- */
  (function () {
    var root = document.querySelector("[data-founders-carousel]");
    if (!root) return;

    var track = root.querySelector(".founders-track");
    var cards = track ? Array.prototype.slice.call(track.children) : [];
    var dotsWrap = root.querySelector(".founders-dots");
    if (!track || cards.length < 2 || !dotsWrap) return;

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var mobileQuery = window.matchMedia("(max-width: 640.98px)");
    var INTERVAL = 5000;
    var current = 0;
    var timer = null;

    var dots = cards.map(function (card, i) {
      var d = document.createElement("span");
      d.className = "fdot";
      d.setAttribute("role", "tab");
      d.setAttribute("aria-label", "Membro " + (i + 1));
      d.addEventListener("click", function () { go(i); });
      dotsWrap.appendChild(d);
      return d;
    });

    function isMobile() { return mobileQuery.matches; }

    function go(i) {
      current = ((i % cards.length) + cards.length) % cards.length;
      var stepPct = isMobile() ? (100 / cards.length) : 100;
      track.style.transform = "translateX(" + (-current * stepPct) + "%)";
      if (!isMobile()) return;
      cards.forEach(function (card, c) {
        card.setAttribute("aria-hidden", c === current ? "false" : "true");
      });
      dots.forEach(function (dot, c) {
        dot.classList.toggle("active", c === current);
      });
    }

    function step() { go(current + 1); }
    function prev() { stop(); go(current - 1); startAuto(); }
    function next() { stop(); go(current + 1); startAuto(); }

    function startAuto() {
      stop();
      if (isMobile() && !reduceMotion && cards.length > 1) {
        timer = setInterval(step, INTERVAL);
      }
    }
    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
    }

    // Swipe
    var startX = 0;
    var startY = 0;
    root.addEventListener("touchstart", function (e) {
      if (!isMobile()) return;
      if (e.touches && e.touches.length) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }
    }, { passive: true });

    root.addEventListener("touchend", function (e) {
      if (!isMobile() || !e.changedTouches || !e.changedTouches.length) return;
      var diffX = e.changedTouches[0].clientX - startX;
      var diffY = e.changedTouches[0].clientY - startY;
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
        if (diffX > 0) prev();
        else next();
      }
    }, { passive: true });

    // Keyboard
    root.setAttribute("tabindex", "0");
    root.addEventListener("keydown", function (e) {
      if (!isMobile()) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); prev(); }
    });

    // Tablet/desktop: reseta o carrossel e mostra os cards na grade
    function onMq() {
      if (isMobile()) {
        go(current);
        startAuto();
      } else {
        stop();
        track.style.transform = "translateX(0px)";
        cards.forEach(function (card) { card.removeAttribute("aria-hidden"); });
      }
    }
    if (mobileQuery.addEventListener) mobileQuery.addEventListener("change", onMq);
    else if (mobileQuery.addListener) mobileQuery.addListener(onMq);

    // Pausa quando a seção sai de vista
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) startAuto();
          else stop();
        });
      }, { threshold: 0.1 }).observe(root);
    }

    // Init
    go(0);
    startAuto();
  })();

})();

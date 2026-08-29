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

  /* ---------- Section cascade: stagger .reveal children on scroll ---------- */
  var sections = document.querySelectorAll("section.section, section.hero");
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

    var cx = -100, cy = -100, mx = cx, my = cy;
    window.addEventListener("pointermove", function (e) {
      mx = e.clientX;
      my = e.clientY;
    });
    document.addEventListener("mouseleave", function () { dot.classList.add("is-hidden"); });
    document.addEventListener("mouseenter", function () { dot.classList.remove("is-hidden"); });

    (function follow() {
      cx += (mx - cx) * 0.2;
      cy += (my - cy) * 0.2;
      dot.style.transform = "translate3d(" + cx + "px," + cy + "px,0)";
      requestAnimationFrame(follow);
    })();
  }

  /* ---------- Hero mockups: coverflow com as imagens dos protótipos ----------
     Os cards são montados a partir de js/mockups.js (manifesto sem servidor).
     Para incluir uma imagem nova, basta adicionar o nome do arquivo ao array
     "images" em js/mockups.js — funciona até abrindo o index.html direto
     (protocolo file://), sem precisar de servidor. */
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
    var INTERVAL = 4000;

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
        var card = document.createElement("div");
        card.className = "cf-card";
        var img = document.createElement("img");
        img.src = url(name);
        img.alt = name.replace(/\.[^.]+$/, "");
        img.loading = "lazy";
        card.appendChild(img);
        stage.appendChild(card);
        cards.push(card);

        var dot = document.createElement("span");
        dot.className = "sd";
        dot.setAttribute("role", "tab");
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
      stop();
      if (!reduceMotion) timer = setInterval(step, INTERVAL);
    }

    function layout() {
      var n = images.length;
      cards.forEach(function (card, i) {
        card.classList.remove("is-center", "is-left", "is-right", "is-hidden");
        if (i === current) card.classList.add("is-center");
        else if ((current + 1) % n === i) card.classList.add("is-right");
        else if ((current - 1 + n) % n === i) card.classList.add("is-left");
        else card.classList.add("is-hidden");
        card.style.zIndex =
          i === current ? "3" : (i === (current + 1) % n || i === (current - 1 + n) % n) ? "2" : "1";
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
      if (!reduceMotion) timer = setInterval(step, INTERVAL);
    }

    function next() {
      stop();
      current = (current + 1) % images.length;
      layout();
      if (!reduceMotion) timer = setInterval(step, INTERVAL);
    }

    var prevBtn = document.querySelector(".cf-arrow--prev");
    var nextBtn = document.querySelector(".cf-arrow--next");
    if (prevBtn) prevBtn.addEventListener("click", prev);
    if (nextBtn) nextBtn.addEventListener("click", next);

    function go(i) {
      stop();
      current = ((i % images.length) + images.length) % images.length;
      layout();
      if (!reduceMotion) timer = setInterval(step, INTERVAL);
    }

    function stop() {
      clearInterval(timer);
      timer = null;
    }

    build();

    // Pausar o auto-avanço quando a hero sai da tela (já era o comportamento da referência)
    var heroStage = document.querySelector(".hero-stage");
    if (heroStage && "IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            stop();
            if (!reduceMotion) timer = setInterval(step, INTERVAL);
          } else {
            stop();
          }
        });
      }, { threshold: 0.05 }).observe(heroStage);
    }
  })();

  /* ---------- Scroll suave controlado pelo mouse (substitui o scroll normal) ----------
     A página começa na hero. Conforme o mouse desce na altura da viewport, o site
     sobe suavemente até o fim do documento (~2s para completar todo o percurso). */
  (function () {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var raf = null;
    var target = window.scrollY || window.pageYOffset || 0;
    var current = target;
    var last = 0;

    function maxScroll() {
      return Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        0
      );
    }

    function frame(ts) {
      var dt = Math.min(last ? ts - last : 16, 50) / 1000;
      last = ts;
      var m = maxScroll();
      target = Math.min(Math.max(target, 0), m);
      var k = 1 - Math.exp(-dt / 0.7); /* ~2s para completar o percurso */
      current += (target - current) * k;
      if (Math.abs(target - current) > 0.4 || Math.abs(current - (window.scrollY || 0)) > 0.4) {
        window.scrollTo(0, current);
        raf = requestAnimationFrame(frame);
      } else {
        window.scrollTo(0, target);
        current = target;
        raf = null;
      }
    }

    /* Posição do mouse define o alvo do scroll (topo = início = hero). */
    window.addEventListener(
      "pointermove",
      function (e) {
        if (e.pointerType && e.pointerType !== "mouse") return;
        var vh = window.innerHeight || 1;
        var ratio = Math.min(Math.max(e.clientY / vh, 0), 1);
        target = ratio * maxScroll();
        if (!raf) {
          current = window.scrollY || window.pageYOffset || 0;
          last = 0;
          raf = requestAnimationFrame(frame);
        }
      },
      { passive: true }
    );

    /* Links de âncora: pular suavemente até a seção alvo. */
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (e) {
        var id = link.getAttribute("href");
        if (!id || id === "#") return;
        var el = document.querySelector(id);
        if (!el) return;
        e.preventDefault();
        target = Math.max(el.getBoundingClientRect().top + (window.scrollY || 0) - 80, 0);
        if (!raf) {
          current = window.scrollY || window.pageYOffset || 0;
          last = 0;
          raf = requestAnimationFrame(frame);
        }
      });
    });

    window.addEventListener("resize", function () {
      target = Math.min(Math.max(target, 0), maxScroll());
    });
  })();

})();

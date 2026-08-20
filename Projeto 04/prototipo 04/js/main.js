/* ============================================================
   ORVION — Landing Page
   Loading, Nav, Mobile Menu, Scroll Reveal, Terminal Typing,
   Marquee, Sticky Services
   ============================================================ */

(function () {
    "use strict";

    /* ---------- Loading Screen ---------- */
    var loadingScreen = document.getElementById("loading-screen");

    function hideLoading() {
        if (!loadingScreen) return;
        setTimeout(function () {
            loadingScreen.classList.add("hidden");
            document.body.classList.remove("loading");
        }, 2200);
    }

    if (document.readyState === "complete") {
        hideLoading();
    } else {
        window.addEventListener("load", hideLoading);
    }

    /* ---------- Navbar Scroll State ---------- */
    var nav = document.getElementById("nav");

    function onScroll() {
        if (!nav) return;
        if (window.scrollY > 40) {
            nav.classList.add("scrolled");
        } else {
            nav.classList.remove("scrolled");
        }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* ---------- Mobile Menu ---------- */
    var navToggle = document.getElementById("nav-toggle");
    var mobileMenu = document.getElementById("mobile-menu");

    if (navToggle && mobileMenu) {
        navToggle.addEventListener("click", function () {
            var isOpen = mobileMenu.classList.toggle("open");
            navToggle.classList.toggle("active");
            document.body.classList.toggle("menu-open");
            navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
            navToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
        });

        mobileMenu.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                mobileMenu.classList.remove("open");
                navToggle.classList.remove("active");
                document.body.classList.remove("menu-open");
                navToggle.setAttribute("aria-expanded", "false");
            });
        });
    }

    /* ---------- Scroll Reveal (with Stagger) ---------- */
    var revealEls = document.querySelectorAll(".reveal");

    function initReveal() {
        if (!("IntersectionObserver" in window)) {
            revealEls.forEach(function (el) {
                el.classList.add("visible");
            });
            return;
        }

        var io = new IntersectionObserver(
            function (entries) {
                var delay = 0;
                // Filter and sort entries by vertical offset to reveal top-to-bottom
                var intersecting = entries
                    .filter(function (e) { return e.isIntersecting; })
                    .sort(function (a, b) {
                        return a.target.getBoundingClientRect().top - b.target.getBoundingClientRect().top;
                    });

                intersecting.forEach(function (entry) {
                    var el = entry.target;
                    io.unobserve(el);

                    // Stagger grid items or list elements for a premium feel
                    if (el.classList.contains("project-card") || 
                        el.classList.contains("process-step") || 
                        el.classList.contains("metric") || 
                        el.classList.contains("testimonial")) {
                        setTimeout(function () {
                            el.classList.add("visible");
                        }, delay);
                        delay += 120;
                    } else {
                        el.classList.add("visible");
                    }
                });
            },
            { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
        );

        revealEls.forEach(function (el) {
            io.observe(el);
        });
    }

    initReveal();

    /* ---------- Hero Scroll Fade & Scale ---------- */
    var heroContent = document.querySelector(".hero-content");
    var heroTerminal = document.querySelector(".hero-terminal");

    function fadeHeroOnScroll() {
        if (!heroContent || !heroTerminal) return;
        var scrollY = window.scrollY;
        var fadeEnd = window.innerHeight * 0.75;

        if (scrollY <= fadeEnd) {
            var progress = scrollY / fadeEnd;
            var opacity = 1 - progress;
            var scale = 1 - (progress * 0.05);
            var translateY = progress * 40;

            heroContent.style.opacity = opacity;
            heroContent.style.transform = "scale(" + scale + ") translateY(" + translateY + "px)";

            heroTerminal.style.opacity = opacity;
            heroTerminal.style.transform = "scale(" + scale + ") translateY(" + translateY + "px)";
        } else {
            heroContent.style.opacity = 0;
            heroTerminal.style.opacity = 0;
        }
    }

    window.addEventListener("scroll", fadeHeroOnScroll, { passive: true });
    fadeHeroOnScroll();

    /* ---------- Terminal Typing ---------- */
    var typedEl = document.getElementById("typed-text");
    var phrases = [
        "ORVION",
        "Seu site precisa vender",
        "Performance + SEO",
        "Estratégia & Conversão",
        "Experiência que converte"
    ];
    var phraseIdx = 0;
    var charIdx = 0;
    var isDeleting = false;
    var typingSpeed = 80;

    function typeEffect() {
        if (!typedEl) return;

        var current = phrases[phraseIdx];

        if (!isDeleting) {
            typedEl.textContent = current.substring(0, charIdx + 1);
            charIdx++;

            if (charIdx === current.length) {
                isDeleting = true;
                typingSpeed = 2000;
            } else {
                typingSpeed = 70 + Math.random() * 60;
            }
        } else {
            typedEl.textContent = current.substring(0, charIdx - 1);
            charIdx--;

            if (charIdx === 0) {
                isDeleting = false;
                phraseIdx = (phraseIdx + 1) % phrases.length;
                typingSpeed = 400;
            } else {
                typingSpeed = 35;
            }
        }

        setTimeout(typeEffect, typingSpeed);
    }

    setTimeout(typeEffect, 2800);

    /* ---------- Active Nav Link on Scroll ---------- */
    var sections = document.querySelectorAll("main section[id]");
    var navLinks = document.querySelectorAll(".nav-link");

    function highlightActiveLink() {
        var pos = window.scrollY + 160;
        var current = "";

        sections.forEach(function (sec) {
            var top = sec.offsetTop;
            var bottom = top + sec.offsetHeight;
            if (pos >= top && pos < bottom) {
                current = sec.id;
            }
        });

        navLinks.forEach(function (link) {
            if (link.getAttribute("href") === "#" + current) {
                link.style.color = "var(--text-primary)";
            } else {
                link.style.color = "";
            }
        });
    }

    window.addEventListener("scroll", highlightActiveLink, { passive: true });
    highlightActiveLink();

})();

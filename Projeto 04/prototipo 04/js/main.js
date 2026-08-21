/* ============================================================
   ORVION — Landing Page
   Loading, Nav, Mobile Menu, Scroll Reveal, 3D Magazine,
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
    var heroMagazine = document.querySelector(".hero-magazine");

    function fadeHeroOnScroll() {
        if (!heroContent || !heroMagazine) return;
        var scrollY = window.scrollY;
        var fadeEnd = window.innerHeight * 0.75;

        if (scrollY <= fadeEnd) {
            var progress = scrollY / fadeEnd;
            var opacity = 1 - progress;
            var scale = 1 - (progress * 0.05);
            var translateY = progress * 40;

            heroContent.style.opacity = opacity;
            heroContent.style.transform = "scale(" + scale + ") translateY(" + translateY + "px)";

            heroMagazine.style.opacity = opacity;
            heroMagazine.style.transform = "scale(" + scale + ") translateY(" + translateY + "px)";
        } else {
            heroContent.style.opacity = 0;
            heroMagazine.style.opacity = 0;
        }
    }

    window.addEventListener("scroll", fadeHeroOnScroll, { passive: true });
    fadeHeroOnScroll();

    /* ---------- 3D Magazine ---------- */
    var magazine = document.getElementById("magazine");
    var magazineScene = document.querySelector(".magazine-scene");

    if (magazine && magazineScene) {
        var TOTAL_PAGES = 4;
        var PAGE_TURN_INTERVAL = 3000;
        var RESTART_DELAY = 2000;
        var magazineCurrentPage = 0;
        var magazineTimer = null;
        var magazinePaused = false;
        var magazineInView = false;

        function magazineGoToPage(n) {
            for (var i = 1; i <= TOTAL_PAGES; i++) {
                magazine.classList.remove("is-turning-" + i);
            }
            if (n > 0 && n <= TOTAL_PAGES) {
                void magazine.offsetHeight;
                magazine.classList.add("is-turning-" + n);
            }
            magazineCurrentPage = n;
        }

        function magazineNextPage() {
            if (magazineCurrentPage < TOTAL_PAGES) {
                magazineGoToPage(magazineCurrentPage + 1);
                magazineScheduleNext();
            } else {
                setTimeout(function () {
                    magazineReset();
                    setTimeout(function () {
                        if (!magazinePaused && magazineInView) magazineScheduleNext();
                    }, 800);
                }, RESTART_DELAY);
            }
        }

        function magazineScheduleNext() {
            clearTimeout(magazineTimer);
            if (!magazinePaused && magazineInView) {
                magazineTimer = setTimeout(magazineNextPage, PAGE_TURN_INTERVAL);
            }
        }

        function magazineReset() {
            for (var i = 1; i <= TOTAL_PAGES; i++) {
                magazine.classList.remove("is-turning-" + i);
            }
            magazineCurrentPage = 0;
            var pages = magazine.querySelectorAll(".magazine-page");
            pages.forEach(function (p) { p.style.transition = "none"; });
            void magazine.offsetHeight;
            pages.forEach(function (p) { p.style.transition = ""; });
        }

        function magazineStartAutoplay() {
            if (magazinePaused || !magazineInView) return;
            magazineReset();
            setTimeout(magazineScheduleNext, 1500);
        }

        /* Pause on hover */
        magazineScene.addEventListener("mouseenter", function () {
            if (!magazinePaused) clearTimeout(magazineTimer);
        });
        magazineScene.addEventListener("mouseleave", function () {
            if (!magazinePaused && magazineInView) magazineScheduleNext();
        });

        /* Visibility observer */
        var magazineObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting && !magazinePaused) {
                    magazineInView = true;
                    magazineStartAutoplay();
                } else {
                    magazineInView = false;
                    clearTimeout(magazineTimer);
                }
            });
        }, { threshold: 0.3 });
        magazineObserver.observe(magazineScene);

        /* Tilt on mouse move */
        var tiltTargetX = 2, tiltTargetY = -15;
        var tiltCurrentX = 2, tiltCurrentY = -15;

        magazineScene.addEventListener("mousemove", function (e) {
            var rect = magazineScene.getBoundingClientRect();
            var x = (e.clientX - rect.left) / rect.width;
            var y = (e.clientY - rect.top) / rect.height;
            tiltTargetY = -15 + (x - 0.5) * 30;
            tiltTargetX = 2 + (y - 0.5) * -10;
        });
        magazineScene.addEventListener("mouseleave", function () {
            tiltTargetY = -15;
            tiltTargetX = 2;
        });

        function tiltAnimate() {
            tiltCurrentX += (tiltTargetX - tiltCurrentX) * 0.06;
            tiltCurrentY += (tiltTargetY - tiltCurrentY) * 0.06;
            magazine.style.setProperty("--tilt-x", tiltCurrentX + "deg");
            magazine.style.setProperty("--tilt-y", tiltCurrentY + "deg");
            requestAnimationFrame(tiltAnimate);
        }
        tiltAnimate();

        /* Click to advance */
        magazineScene.addEventListener("click", function () {
            if (magazineCurrentPage < TOTAL_PAGES) {
                clearTimeout(magazineTimer);
                magazineNextPage();
            } else {
                magazineReset();
                setTimeout(function () {
                    if (!magazinePaused && magazineInView) magazineScheduleNext();
                }, 600);
            }
        });
    }

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

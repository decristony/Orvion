/* LANDIN - premium agency landing page
   Menu mobile, scroll reveal, navbar state, FAQ, slider, newsletter */

(function () {
    "use strict";

    /* ---------- Mobile menu ---------- */
    const navToggle = document.getElementById("nav-toggle");
    const body = document.body;

    if (navToggle) {
        navToggle.addEventListener("click", function () {
            const open = body.classList.toggle("menu-open");
            navToggle.setAttribute("aria-expanded", open ? "true" : "false");
            navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        });

        document.querySelectorAll(".mobile-menu a").forEach(function (link) {
            link.addEventListener("click", function () {
                body.classList.remove("menu-open");
                navToggle.setAttribute("aria-expanded", "false");
            });
        });
    }

    /* ---------- Navbar scroll state ---------- */
    const nav = document.getElementById("nav");

    function onScroll() {
        if (!nav) return;
        if (window.scrollY > 40) {
            nav.style.background = "rgba(0, 0, 0, 0.6)";
            nav.style.backdropFilter = "blur(12px)";
            nav.style.webkitBackdropFilter = "blur(12px)";
        } else {
            nav.style.background = "transparent";
            nav.style.backdropFilter = "none";
            nav.style.webkitBackdropFilter = "none";
        }

        highlightActiveLink();
    }

    /* ---------- Active nav link on scroll ---------- */
    const sections = document.querySelectorAll("main section[id]");
    const navLinks = document.querySelectorAll(".nav-link");

    function highlightActiveLink() {
        const pos = window.scrollY + 120;
        let current = "top";

        sections.forEach(function (sec) {
            const top = sec.offsetTop;
            const bottom = top + sec.offsetHeight;
            if (pos >= top && pos < bottom) {
                current = sec.id;
            }
        });

        navLinks.forEach(function (link) {
            link.classList.toggle("active", link.getAttribute("href") === "#" + current);
        });
    }

    /* ---------- Scroll reveal ---------- */
    const revealEls = document.querySelectorAll(".reveal");

    function initReveal() {
        if (!("IntersectionObserver" in window)) {
            revealEls.forEach(function (el) {
                el.classList.add("visible");
            });
            return;
        }

        const io = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        io.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
        );

        revealEls.forEach(function (el) {
            io.observe(el);
        });
    }

    /* ---------- Testimonial slider ---------- */
    const track = document.getElementById("slider-track");
    const dotsWrap = document.getElementById("slider-dots");
    const prevBtn = document.getElementById("slider-prev");
    const nextBtn = document.getElementById("slider-next");

    let slideIndex = 0;

    function initSlider() {
        if (!track || !dotsWrap) return;

        const slides = track.querySelectorAll(".slide");
        slides.forEach(function (_, i) {
            const dot = document.createElement("button");
            dot.setAttribute("aria-label", "Go to review " + (i + 1));
            if (i === 0) dot.classList.add("active");
            dot.addEventListener("click", function () {
                goTo(i);
            });
            dotsWrap.appendChild(dot);
        });

        if (prevBtn) {
            prevBtn.addEventListener("click", function () {
                goTo(slideIndex - 1);
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener("click", function () {
                goTo(slideIndex + 1);
            });
        }

        let auto = setInterval(function () {
            goTo(slideIndex + 1);
        }, 6000);

        const slider = document.querySelector(".slider");
        if (slider) {
            slider.addEventListener("mouseenter", function () {
                clearInterval(auto);
            });
            slider.addEventListener("mouseleave", function () {
                auto = setInterval(function () {
                    goTo(slideIndex + 1);
                }, 6000);
            });
        }
    }

    function goTo(index) {
        if (!track) return;
        const total = track.querySelectorAll(".slide").length;
        if (total === 0) return;
        slideIndex = ((index % total) + total) % total;
        track.style.transform = "translateX(-" + slideIndex * 100 + "%)";

        const dots = dotsWrap ? dotsWrap.querySelectorAll("button") : [];
        dots.forEach(function (dot, i) {
            dot.classList.toggle("active", i === slideIndex);
        });
    }

    /* ---------- Newsletter form ---------- */
    const form = document.getElementById("newsletter-form");
    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            const input = document.getElementById("newsletter-email");
            if (input && input.value.trim()) {
                alert("Thanks for subscribing! You will hear from us soon.");
                input.value = "";
            }
        });
    }

    /* ---------- Init ---------- */
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    initReveal();
    initSlider();
})();

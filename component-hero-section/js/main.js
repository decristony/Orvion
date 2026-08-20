/* ============================================================
   3D Magazine — Hero Section Component
   Controle de animação, interatividade e autoplay
   ============================================================ */

(function () {
    'use strict';

    const magazine = document.getElementById('magazine');
    const scene = document.getElementById('magazine-scene');
    if (!magazine || !scene) return;

    const TOTAL_PAGES = 4;
    const PAGE_TURN_INTERVAL = 3000;   // ms between each page turn
    const RESTART_DELAY = 2000;        // ms before restarting after last page

    let currentPage = 0;
    let turnTimer = null;
    let isPaused = false;
    let isInView = false;

    // ---------- Page Turn Logic ----------

    function goToPage(n) {
        // Remove all turning classes
        for (let i = 1; i <= TOTAL_PAGES; i++) {
            magazine.classList.remove('is-turning-' + i);
        }

        if (n > 0 && n <= TOTAL_PAGES) {
            // Force reflow so CSS transition re-triggers
            void magazine.offsetHeight;
            magazine.classList.add('is-turning-' + n);
        }

        currentPage = n;
    }

    function nextPage() {
        if (currentPage < TOTAL_PAGES) {
            goToPage(currentPage + 1);
            scheduleNext();
        } else {
            // After last page, pause then restart
            setTimeout(() => {
                resetMagazine();
                setTimeout(() => {
                    if (!isPaused && isInView) {
                        scheduleNext();
                    }
                }, 800);
            }, RESTART_DELAY);
        }
    }

    function scheduleNext() {
        clearTimeout(turnTimer);
        if (!isPaused && isInView) {
            turnTimer = setTimeout(nextPage, PAGE_TURN_INTERVAL);
        }
    }

    function resetMagazine() {
        for (let i = 1; i <= TOTAL_PAGES; i++) {
            magazine.classList.remove('is-turning-' + i);
        }
        currentPage = 0;

        // Reset all page transitions
        const pages = magazine.querySelectorAll('.magazine-page');
        pages.forEach(p => {
            p.style.transition = 'none';
        });
        void magazine.offsetHeight;
        pages.forEach(p => {
            p.style.transition = '';
        });
    }

    // ---------- Auto Play ----------

    function startAutoplay() {
        if (isPaused || !isInView) return;
        resetMagazine();
        setTimeout(() => scheduleNext(), 1500);
    }

    function stopAutoplay() {
        clearTimeout(turnTimer);
        isPaused = true;
        magazine.classList.add('is-paused');
    }

    function resumeAutoplay() {
        isPaused = false;
        magazine.classList.remove('is-paused');
        if (isInView) {
            scheduleNext();
        }
    }

    // ---------- Pause on Hover ----------

    scene.addEventListener('mouseenter', () => {
        if (!isPaused) {
            clearTimeout(turnTimer);
        }
    });

    scene.addEventListener('mouseleave', () => {
        if (!isPaused && isInView) {
            scheduleNext();
        }
    });

    // ---------- Pause/Resume on Visibility ----------

    function setupVisibilityObserver() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !isPaused) {
                        isInView = true;
                        startAutoplay();
                    } else {
                        isInView = false;
                        clearTimeout(turnTimer);
                    }
                });
            },
            { threshold: 0.3 }
        );

        observer.observe(scene);
    }

    // ---------- 3D Tilt on Mouse Move ----------

    function setupTiltEffect() {
        let rafId = null;
        let targetRotateX = 2;
        let targetRotateY = -15;
        let currentRotateX = 2;
        let currentRotateY = -15;

        scene.addEventListener('mousemove', (e) => {
            const rect = scene.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;

            targetRotateY = -15 + (x - 0.5) * 30;
            targetRotateX = 2 + (y - 0.5) * -10;
        });

        scene.addEventListener('mouseleave', () => {
            targetRotateY = -15;
            targetRotateX = 2;
        });

        function animate() {
            currentRotateX += (targetRotateX - currentRotateX) * 0.06;
            currentRotateY += (targetRotateY - currentRotateY) * 0.06;

            if (!magazine.classList.contains('is-paused')) {
                // Apply tilt on top of the float animation
                magazine.style.setProperty('--tilt-x', currentRotateX + 'deg');
                magazine.style.setProperty('--tilt-y', currentRotateY + 'deg');
            }

            rafId = requestAnimationFrame(animate);
        }

        animate();
    }

    // ---------- Click to Advance ----------

    scene.addEventListener('click', () => {
        if (currentPage < TOTAL_PAGES) {
            clearTimeout(turnTimer);
            nextPage();
        } else {
            resetMagazine();
            setTimeout(() => {
                if (!isPaused && isInView) {
                    scheduleNext();
                }
            }, 600);
        }
    });

    // ---------- Initialize ----------

    function init() {
        setupVisibilityObserver();
        setupTiltEffect();

        // Ensure all videos play
        document.querySelectorAll('.page-media video').forEach(vid => {
            vid.muted = true;
            vid.play().catch(() => {});
        });
    }

    // Start after DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

/* ============================================================
   ORVION — Interactions
   ============================================================ */
(function () {
	'use strict';

	/* ---------- Mobile menu ---------- */
	var toggle = document.querySelector('.nav-toggle');
	var menu = document.getElementById('mobileMenu');
	var closeBtn = document.querySelector('.nav-close');

	function closeMenu() {
		menu.classList.remove('open');
		menu.setAttribute('aria-hidden', 'true');
		document.body.style.overflow = '';
	}

	if (toggle && menu) {
		toggle.addEventListener('click', function () {
			menu.classList.add('open');
			menu.setAttribute('aria-hidden', 'false');
			document.body.style.overflow = 'hidden';
		});
		if (closeBtn) closeBtn.addEventListener('click', closeMenu);
		menu.querySelectorAll('a').forEach(function (a) {
			a.addEventListener('click', closeMenu);
		});
	}

	/* ---------- Testimonials slider ---------- */
	var tSlider = document.querySelector('.t-slider');
	var tRoot = document.querySelector('.testimonials');
	if (tSlider) {
		var tTrack = tSlider.querySelector('.t-slides');
		var tSlides = tTrack ? tTrack.children.length : 0;
		var tCountEl = tRoot ? tRoot.querySelector('.t-count') : null;
		var tIdx = 0;

		function tGo(i) {
			tIdx = (i + tSlides) % tSlides;
			tTrack.style.transform = 'translateX(-' + tIdx * 100 + '%)';

			var prevBtn = tRoot.querySelector('.slide-btn.prev');
			var nextBtn = tRoot.querySelector('.slide-btn.next');
			if (prevBtn) prevBtn.disabled = tIdx === 0;
			if (nextBtn) nextBtn.disabled = tIdx === tSlides - 1;

			if (tCountEl) {
				var num = tCountEl.querySelector('.t-count-num');
				var em = tCountEl.querySelector('em');
				if (num) num.textContent = String(tIdx + 1).padStart(2, '0');
				if (em) em.textContent = '/0' + tSlides;
			}
		}

		var prevBtn = tRoot ? tRoot.querySelector('.slide-prev') : null;
		var nextBtn = tRoot ? tRoot.querySelector('.slide-next') : null;

		if (prevBtn) prevBtn.addEventListener('click', function () { tGo(tIdx - 1); });
		if (nextBtn) nextBtn.addEventListener('click', function () { tGo(tIdx + 1); });

		tGo(0);
	}

	/* ---------- FAQ accordion ---------- */
	document.querySelectorAll('.faq-item').forEach(function (item) {
		var q = item.querySelector('.faq-question');
		q.addEventListener('click', function () {
			var wasOpen = item.classList.contains('open');
			document.querySelectorAll('.faq-item.open').forEach(function (other) {
				other.classList.remove('open');
			});
			if (!wasOpen) item.classList.add('open');
		});
	});

	/* ---------- Scroll reveal ---------- */
	var revealObs = new IntersectionObserver(function (entries) {
		entries.forEach(function (entry) {
			if (entry.isIntersecting) {
				entry.target.classList.add('in-view');
				revealObs.unobserve(entry.target);
			}
		});
	}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

	document.querySelectorAll('.reveal').forEach(function (el) {
		revealObs.observe(el);
	});

	/* ---------- Back to top + progress ring ---------- */
	var backTop = document.getElementById('backToTop');
	var ring = backTop ? backTop.querySelector('.btt-circle') : null;
	var RING = 100.5309649;

	function onScroll() {
		var doc = document.documentElement;
		var max = doc.scrollHeight - window.innerHeight;
		var p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
		if (ring) ring.style.strokeDashoffset = (RING - RING * p).toFixed(1);
		if (window.scrollY > 400) backTop.classList.add('show');
		else backTop.classList.remove('show');
	}

	if (backTop) {
		if (ring) ring.style.strokeDasharray = RING;
		window.addEventListener('scroll', onScroll, { passive: true });
		onScroll();
	}
})();

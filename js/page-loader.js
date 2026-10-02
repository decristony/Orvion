(() => {
  "use strict";

  const loader = document.querySelector("[data-page-loader]");
  if (!loader) return;

  const startedAt = performance.now();
  let dismissed = false;
  let leaving = false;

  function resetAnimation() {
    const svg = loader.querySelector("svg");
    if (svg && typeof svg.setCurrentTime === "function") {
      try { svg.setCurrentTime(0); } catch (_) {}
    }
  }

  function hideLoader() {
    if (dismissed || leaving) return;
    dismissed = true;
    const elapsed = performance.now() - startedAt;
    const wait = Math.max(0, 340 - elapsed);
    window.setTimeout(() => loader.classList.add("is-hidden"), wait);
  }

  // Do not hold the page for every image below the fold. Release on load,
  // but cap the wait so the loader never becomes a performance bottleneck.
  if (document.readyState === "complete") hideLoader();
  else window.addEventListener("load", hideLoader, { once: true });
  window.setTimeout(hideLoader, 900);

  function transitionTo(url) {
    if (leaving) return;
    leaving = true;
    dismissed = false;
    resetAnimation();
    loader.classList.remove("is-hidden");
    loader.classList.add("is-entering");
    window.setTimeout(() => { window.location.href = url; }, 280);
  }

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest("a[href]");
    if (!link || link.hasAttribute("download") || link.target === "_blank") return;
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) return;

    let url;
    try { url = new URL(link.href, window.location.href); } catch (_) { return; }
    const isLanguageLink = !!link.closest(".language-switcher");
    const isSameOriginPage = url.origin === window.location.origin && url.pathname !== window.location.pathname;
    if (!isLanguageLink && !isSameOriginPage) return;

    event.preventDefault();
    transitionTo(url.href);
  });

  // BFCache restores can bring back the old overlay state.
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      leaving = false;
      dismissed = true;
      loader.classList.remove("is-entering");
      loader.classList.add("is-hidden");
    }
  });
})();

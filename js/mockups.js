/* ORVION — Manifesto das imagens dos mockups da hero.
   O caminho é resolvido a partir deste próprio arquivo para funcionar
   na raiz, /pt/, /en/, GitHub Pages e hospedagens em subdiretórios. */
(function () {
  var scriptUrl = document.currentScript && document.currentScript.src
    ? document.currentScript.src
    : window.location.href;

  window.ORVION_MOCKUPS = {
    folder: new URL("../public/mockups/", scriptUrl).href,
    images: [
      "slide 1-optimized.webp",
      "slide 2-optimized.webp",
      "slide 3-optimized.webp",
      "slide 4-optimized.webp",
      "slide 5-optimized.webp",
      "slide 6-optimized.webp"
    ]
  };
})();

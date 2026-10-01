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
      "slide 1.webp",
      "slide 2.webp",
      "slide 3.webp",
      "slide 4.webp",
      "slide 5.webp",
      "slide 6.webp"
    ]
  };
})();

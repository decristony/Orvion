/* ORVION — Manifesto das imagens dos mockups da hero.
   O caminho é resolvido a partir deste próprio arquivo para funcionar
   na raiz, /pt/, /en/, GitHub Pages e hospedagens em subdiretórios.
   Cada imagem tem duas larguras (640 e 1060 px, WebP): o navegador escolhe
   pelo srcset a menor que fica nítida no tamanho do card e na densidade da tela. */
(function () {
  var scriptUrl = document.currentScript && document.currentScript.src
    ? document.currentScript.src
    : window.location.href;

  function slide(name) {
    return { src: "hero-" + name + "-1060.webp", srcset: [["hero-" + name + "-640.webp", 640], ["hero-" + name + "-1060.webp", 1060]] };
  }

  window.ORVION_MOCKUPS = {
    folder: new URL("../public/mockups/", scriptUrl).href,
    sizes: "(max-width: 809.98px) min(74vw, 340px), (max-width: 899.98px) min(86vw, 440px), min(36vw, 530px)",
    images: [
      slide("iris-oftalmologia"),
      slide("raiz-fisioterapia"),
      slide("dr-diego"),
      slide("santos-robert"),
      slide("ifortec"),
      slide("mendes-advogados")
    ]
  };
})();

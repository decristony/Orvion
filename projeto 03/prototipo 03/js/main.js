(function () {
  'use strict';

  var toggle = document.querySelector('.nav-toggle');
  var menu = document.querySelector('.menu');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Toggle menu');
    });

    menu.addEventListener('click', function (event) {
      if (event.target.closest('a') && menu.classList.contains('open')) {
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Toggle menu');
      }
    });
  }

  var form = document.querySelector('.news-form');

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[type="email"]');
      if (input && input.value.trim()) {
        form.reset();
      }
    });
  }
})();

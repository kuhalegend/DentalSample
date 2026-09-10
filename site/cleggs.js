(() => {
  const slides = [...document.querySelectorAll('.slide')];
  const counter = document.querySelector('.slide-number strong');
  const carousel = document.querySelector('.hero');
  let current = 0;
  let timer;
  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, position) => {
      const active = position === current;
      slide.classList.toggle('active', active);
      slide.setAttribute('aria-hidden', String(!active));
    });
    counter.textContent = String(current + 1).padStart(2, '0');
  };
  const start = () => { window.clearInterval(timer); timer = window.setInterval(() => show(current + 1), 3000); };
  const move = (amount) => { show(current + amount); start(); };
  document.querySelector('[data-prev]').addEventListener('click', () => move(-1));
  document.querySelector('[data-next]').addEventListener('click', () => move(1));
  document.querySelector('[data-go]').addEventListener('click', () => move(1));
  carousel.addEventListener('mouseenter', () => window.clearInterval(timer));
  carousel.addEventListener('mouseleave', start);
  carousel.addEventListener('focusin', () => window.clearInterval(timer));
  carousel.addEventListener('focusout', start);
  document.addEventListener('visibilitychange', () => document.hidden ? window.clearInterval(timer) : start());
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');
  menuButton.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
  });
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) { nav.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); }
  });
  document.querySelectorAll('[data-open-riley]').forEach((button) => button.addEventListener('click', () => {
    if (typeof window.rileyOpen === 'function') window.rileyOpen(true);
    else document.querySelector('.riley-launcher')?.click();
  }));
  show(0);
  start();
})();

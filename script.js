let lastScrollTop = 0;
const navbar = document.getElementById('navbar');
let isAtTop = true;

window.addEventListener('scroll', function () {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;

  if (scrollTop > lastScrollTop && scrollTop > 50) {
    navbar.classList.add('hidden');
    isAtTop = false;
  } else {
    navbar.classList.remove('hidden');
    isAtTop = true;
  }

  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});

document.addEventListener('mousemove', function (e) {
  if (e.clientY < 10 && !isAtTop) {
    navbar.classList.remove('hidden');
  }
});

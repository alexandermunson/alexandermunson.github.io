import './style.css';

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15,
  }
);

document.querySelectorAll('.reveal').forEach((el) => {
  observer.observe(el);
});

const projects = {
  playground: {
    title: 'Playground Design',
    image: '/images/projects/playground2.png',
    description: 'I led a team of 4 engineering students to plan and design a playground to fit in the Fargo, ND area. The project involved site analysis, safety compliance, and full CAD documentation. This was the term project for ME 212 (Fundamentals of Visual Communication for Engineers) at NDSU.',
    tags: ['CAD', 'Team Leadership', 'Technical Drawing'],
    links: [],
  },
  portfolio: {
    title: 'Portfolio Website',
    image: '/images/projects/portfolio.png',
    description: "You're looking at it right now! Built from scratch using Vite, Tailwind CSS v4, and vanilla JavaScript. I've gone through multiple iterations, updating the design and content as I gain more experience.",
    tags: ['HTML', 'Tailwind CSS v4', 'JavaScript', 'Vite'],
    links: [
      { label: 'View Source', href: 'https://github.com/alexandermunson/alexandermunson.github.io' },
    ],
  },
  lineFollower: {
    title: 'Line Following Robot',
    image: '/images/projects/linefollower.png',
    description: 'This was the final project for my Introduction to Robotics class! We were given a kit and some outline for the code and then put it together to make it work!',
    tags: ['Sensor Integration', 'Python'],
    links: [],
  },
  speakerMount: {
    title: 'Dorm Speaker Mount',
    image: '/images/projects/speaker.jpg',
    description: 'In my freshman year me and my roomates wanted to get a movie theatre setup in our dorm, so we did! I designed some mounts for our rear left and right speakers that hooked onto the bedframe and sat behind us using OnShape and the NDSU Library 3d printers.',
    tags: ['CAD', 'OnShape','3D Printing'],
    links: [],
  },
};

const modal = document.getElementById('project-modal');
const modalContent = document.getElementById('modal-content');
const modalClose = document.getElementById('modal-close');
const modalBackdrop = document.getElementById('modal-backdrop');

function openModal(key) {
  const data = projects[key];
  if (!data) return;

  document.getElementById('modal-image').src = data.image;
  document.getElementById('modal-image').alt = data.title;
  document.getElementById('modal-title').textContent = data.title;
  document.getElementById('modal-description').textContent = data.description;

  const tagsEl = document.getElementById('modal-tags');
  tagsEl.innerHTML = data.tags
    .map((t) => `<span class="px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs">${t}</span>`)
    .join('');

  const linksEl = document.getElementById('modal-links');
  linksEl.innerHTML = data.links
    .map((l) => `<a href="${l.href}" target="_blank" rel="noopener noreferrer" class="px-5 py-2 rounded-full bg-white text-black text-sm font-medium transition duration-200 hover:bg-orange-500 hover:text-white">${l.label}</a>`)
    .join('');

  modal.classList.remove('opacity-0', 'pointer-events-none');
  modalContent.classList.remove('scale-95');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.add('opacity-0', 'pointer-events-none');
  modalContent.classList.add('scale-95');
  document.body.style.overflow = '';
}

document.querySelectorAll('[data-project]').forEach((card) => {
  card.addEventListener('click', () => openModal(card.dataset.project));
});

modalClose.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', closeModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

const navbar = document.getElementById('navbar');
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const current = window.scrollY;
  navbar.style.transform = current > lastScroll && current > 80 ? 'translateY(-100px)' : 'translateY(0)';
  lastScroll = current;
});
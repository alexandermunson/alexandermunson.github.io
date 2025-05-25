// Scrollspy with most visible section detection
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-link");

let visibleSections = {};

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      visibleSections[entry.target.id] = entry.intersectionRatio;

      const mostVisible = Object.entries(visibleSections)
        .sort((a, b) => b[1] - a[1])[0][0];

      navLinks.forEach((link) => {
        link.classList.toggle(
          "active",
          link.getAttribute("href").substring(1) === mostVisible
        );
      });
    });
  },
  {
    threshold: Array.from({ length: 101 }, (_, i) => i / 100), // 0 to 1 in 0.01 steps
  }
);

sections.forEach((section) => {
  visibleSections[section.id] = 0;
  observer.observe(section);
});

// Sidebar toggle
const toggleBtn = document.getElementById("sidebarToggle");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

function toggleSidebar() {
  sidebar.classList.toggle("show");
  overlay.classList.toggle("show");
  toggleBtn.classList.toggle("open");
}

toggleBtn.addEventListener("click", toggleSidebar);
overlay.addEventListener("click", toggleSidebar);

// Auto-close sidebar after link click on mobile
document.querySelectorAll(".sidebar a").forEach(link =>
  link.addEventListener("click", () => {
    if (window.innerWidth <= 768) {
      toggleSidebar();
    }
  })
);


let i = 0;
const text = "Hello There! Welcome to my Website";
function type() {
  if (i < text.length) {
    document.getElementById("intro").innerHTML += text.charAt(i);
    i++;
    setTimeout(type, 150);
  }
}
window.onload = type;

const scrollBar = document.getElementById("scrollProgressBar");
let scrollTimeout;

window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrolled = (scrollTop / docHeight) * 100;

  // Update width and fade in
  scrollBar.style.width = `${scrolled}%`;
  scrollBar.style.opacity = 1;

  // Color change based on scroll depth
  if (scrolled < 33) {
    scrollBar.style.backgroundColor = "rgb(183, 61, 24)"; 
  } else if (scrolled < 66) {
    scrollBar.style.backgroundColor = "rgb(255, 97, 47)"; 
  } else {
    scrollBar.style.backgroundColor = "rgb(255, 154, 47)"; 
  }

  // Reset fade-out timer
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    scrollBar.style.opacity = 0;
  }, 800);
});

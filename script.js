// Scrollspy
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-link");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("href").substring(1) === entry.target.id) {
            link.classList.add("active");
          }
        });
      }
    });
  },
  {
    threshold: 0.6, // Section must be 60% visible to activate
  }
);

sections.forEach((section) => {
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

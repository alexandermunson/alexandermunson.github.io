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
    rootMargin: "-30% 0px -60% 0px",
    threshold: 0.1,
  }
);

sections.forEach((section) => {
  observer.observe(section);
});

// Sidebar toggle
const toggleBtn = document.getElementById("sidebarToggle");
const sidebar = document.querySelector(".sidebar");

toggleBtn.addEventListener("click", () => {
  sidebar.classList.toggle("show");
});

// Optional: Auto-close sidebar when a link is clicked (mobile UX)
document.querySelectorAll(".sidebar a").forEach(link =>
  link.addEventListener("click", () => {
    if (window.innerWidth <= 768) {
      sidebar.classList.remove("show");
    }
  })
);

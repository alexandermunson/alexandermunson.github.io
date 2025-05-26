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
  if (scrolled < 17) {
    scrollBar.style.backgroundColor = "rgb(255, 0, 0)"; 
  } else if (scrolled < 34) {
    scrollBar.style.backgroundColor = "rgb(255, 98, 0)"; 
  } else if (scrolled < 51) {
    scrollBar.style.backgroundColor = "rgb(242, 255, 0)"; 
  } else if (scrolled < 68) {
    scrollBar.style.backgroundColor = "rgb(0, 255, 17)"; 
  }else if (scrolled < 85) {
    scrollBar.style.backgroundColor = "rgb(0, 174, 255)"; 
  } else {
    scrollBar.style.backgroundColor = "rgb(106, 0, 255)"; 
  }
  // Reset fade-out timer
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    scrollBar.style.opacity = 0;
  }, 800);
});

document.addEventListener("DOMContentLoaded", () => {
  const popup = document.getElementById("imagePopup");
  const closeBtn = document.querySelector(".close-btn");
  const morePictureButtons = document.querySelectorAll(".buttons a");

  morePictureButtons.forEach(button => {
    if (button.textContent.includes("More Pictures")) {
      button.addEventListener("click", (e) => {
        e.preventDefault(); // prevent default link behavior
        popup.style.display = "flex";
      });
    }
  });

  closeBtn.addEventListener("click", () => {
    popup.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === popup) {
      popup.style.display = "none";
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const popup = document.getElementById("imagePopup");
  const popupImages = document.getElementById("popupImages");
  const closeBtn = document.querySelector(".close-btn");

  const imageData = {
    cowbot: [
      "Images/beingbuilt.jpg",
      "Images/beingbuilt1.jpg",
      "Images/beingbuilt2.jpg",
      "Images/inthering.PNG",
      "Images/cadbot.png"
    ],
    playground: [
      "Images/Explodedframe-1.png",
      "Images/BB001-1.png",
      "Images/PF004-1.png",
      "Images/PF015-1.png",
      "Images/SN001-1.png"
    ],
    speaker: [
      "Images/onshapespeaker.png",
      "Images/speaker.jpg"
    ]
    // Add more as needed
  };

  document.querySelectorAll(".more-pictures-btn").forEach(button => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      const id = button.getAttribute("data-id");
      const images = imageData[id];

      // Clear previous images
      popupImages.innerHTML = "";

      // Append new images
      images.forEach(src => {
        const img = document.createElement("img");
        img.src = src;
        img.alt = `${id} image`;
        popupImages.appendChild(img);
      });

      popup.style.display = "flex";
    });
  });

  closeBtn.addEventListener("click", () => {
    popup.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === popup) {
      popup.style.display = "none";
    }
  });
});

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

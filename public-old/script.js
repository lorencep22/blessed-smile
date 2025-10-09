// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const href = this.getAttribute("href");
    if (href !== "#") {
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  });
});

// Navbar background change on scroll
window.addEventListener("scroll", () => {
  const navbar = document.getElementById("navbar");
  if (window.scrollY > 100) {
    navbar.style.background = "rgba(255, 255, 255, 0.98)";
    navbar.style.boxShadow = "0 2px 20px rgba(0, 0, 0, 0.1)";
  } else {
    navbar.style.background = "rgba(255, 255, 255, 0.95)";
    navbar.style.boxShadow = "none";
  }
});

// Intersection Observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, observerOptions);

// Observe all animated elements
document
  .querySelectorAll(".fade-in, .slide-in-left, .slide-in-right")
  .forEach((el) => {
    observer.observe(el);
  });

// Animated counter for stats
function animateCounter(element, target) {
  let current = 0;
  const increment = target / 100;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    element.textContent = Math.floor(current);
  }, 20);
}

// Trigger counter animation when stats section is visible
const statsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll(".stat-number").forEach((stat) => {
          const target = parseInt(stat.getAttribute("data-target"));
          animateCounter(stat, target);
        });
        statsObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

const statsSection = document.querySelector(".stats");
if (statsSection) {
  statsObserver.observe(statsSection);
}

// Mobile menu toggle
document.getElementById("mobile-menu").addEventListener("click", function () {
  const navLinks = document.querySelector(".nav-links");
  const mobileMenu = this;

  // Toggle mobile navigation
  navLinks.classList.toggle("mobile-active");
  mobileMenu.classList.toggle("active");
});

// Mobile dropdown handling
document.querySelectorAll(".dropdown-toggle").forEach((toggle) => {
  toggle.addEventListener("click", function (e) {
    // Only handle mobile dropdown clicks on mobile and tablet devices
    if (window.innerWidth <= 1024) {
      e.preventDefault();
      const dropdown = this.closest(".dropdown");
      dropdown.classList.toggle("mobile-open");
    }
  });
});

// Close mobile menu when clicking outside
document.addEventListener("click", function (e) {
  const navLinks = document.querySelector(".nav-links");
  const mobileMenu = document.getElementById("mobile-menu");
  const navbar = document.querySelector(".navbar");

  if (
    !navbar.contains(e.target) &&
    navLinks.classList.contains("mobile-active")
  ) {
    navLinks.classList.remove("mobile-active");
    mobileMenu.classList.remove("active");

    // Close all mobile dropdowns
    document.querySelectorAll(".dropdown").forEach((dropdown) => {
      dropdown.classList.remove("mobile-open");
    });
  }
});

// Close mobile menu when window is resized to desktop
window.addEventListener("resize", function () {
  if (window.innerWidth > 1024) {
    const navLinks = document.querySelector(".nav-links");
    const mobileMenu = document.getElementById("mobile-menu");

    navLinks.classList.remove("mobile-active");
    mobileMenu.classList.remove("active");

    // Close all mobile dropdowns
    document.querySelectorAll(".dropdown").forEach((dropdown) => {
      dropdown.classList.remove("mobile-open");
    });
  }
});

// Add loading animation
window.addEventListener("load", () => {
  document.body.style.opacity = "0";
  document.body.style.transition = "opacity 0.5s ease";
  setTimeout(() => {
    document.body.style.opacity = "1";
  }, 100);
});

// Parallax effect for hero section
window.addEventListener("scroll", () => {
  const scrolled = window.pageYOffset;
  const hero = document.querySelector(".hero");
  const rate = scrolled * -0.5;
  hero.style.transform = `translateY(${rate}px)`;
});

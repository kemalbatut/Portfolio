import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const themeMeta = document.querySelector('meta[name="theme-color"]');

function applyTheme(theme, persist = true) {
  const next = theme === "light" ? "light" : "dark";
  root.dataset.theme = next;

  if (persist) localStorage.setItem("portfolio-theme", next);
  if (themeMeta) themeMeta.setAttribute("content", next === "dark" ? "#0b0b0a" : "#eeece6");

  if (themeToggle) {
    const nextLabel = next === "dark" ? "Switch to light mode" : "Switch to dark mode";
    themeToggle.setAttribute("aria-label", nextLabel);
    themeToggle.setAttribute("title", nextLabel);
  }
}

applyTheme(root.dataset.theme || "dark", false);

themeToggle?.addEventListener("click", () => {
  applyTheme(root.dataset.theme === "dark" ? "light" : "dark");
});

const header = document.querySelector(".site-header");
const progress = document.querySelector(".scroll-progress span");

document.getElementById("year").textContent = new Date().getFullYear();

function updateChrome() {
  const y = window.scrollY;
  header?.classList.toggle("is-scrolled", y > 30);

  const max = document.documentElement.scrollHeight - window.innerHeight;
  const p = max > 0 ? Math.min(1, y / max) : 0;
  if (progress) progress.style.transform = `scaleX(${p})`;
}

updateChrome();
window.addEventListener("scroll", updateChrome, { passive: true });
window.addEventListener("resize", updateChrome);

// Graceful media fallback for project photos that are reserved but not uploaded yet.
document.querySelectorAll("[data-image-fallback] img").forEach((img) => {
  const markMissing = () => {
    img.closest("[data-image-fallback]")?.classList.add("is-missing");
    img.style.display = "none";
  };

  if (img.complete && img.naturalWidth === 0) markMissing();
  img.addEventListener("error", markMissing, { once: true });
});

if (!prefersReducedMotion) {
  const intro = gsap.timeline({ defaults: { ease: "power4.out" } });

  intro
    .to(".hero-line > span", {
      y: "0%",
      duration: 1.25,
      stagger: 0.11
    })
    .fromTo(".hero-reveal",
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.85, stagger: 0.09 },
      "-=0.72"
    )
    .fromTo(".hero-orbit",
      { scale: 0.78, opacity: 0, rotate: -8 },
      { scale: 1, opacity: 0.9, rotate: 0, duration: 1.2 },
      "-=0.95"
    );

  gsap.to(".hero-orbit", {
    rotate: 30,
    yPercent: 20,
    ease: "none",
    scrollTrigger: {
      trigger: "#hero",
      start: "top top",
      end: "bottom top",
      scrub: 0.65
    }
  });

  gsap.to(".hero-copy", {
    yPercent: 26,
    opacity: 0.08,
    scale: 0.965,
    ease: "none",
    scrollTrigger: {
      trigger: "#hero",
      start: "55% top",
      end: "bottom top",
      scrub: true
    }
  });

  gsap.to(".marquee-left", {
    xPercent: -38,
    ease: "none",
    scrollTrigger: {
      trigger: "#manifesto",
      start: "top bottom",
      end: "bottom top",
      scrub: 0.7
    }
  });

  gsap.fromTo(".marquee-right",
    { xPercent: -28 },
    {
      xPercent: 24,
      ease: "none",
      scrollTrigger: {
        trigger: "#manifesto",
        start: "top bottom",
        end: "bottom top",
        scrub: 0.7
      }
    }
  );

  gsap.utils.toArray("[data-reveal]").forEach((el) => {
    gsap.to(el, {
      y: 0,
      opacity: 1,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        once: true
      }
    });
  });

  gsap.utils.toArray("[data-parallax-image]").forEach((frame) => {
    const img = frame.querySelector("img");
    if (!img) return;

    gsap.fromTo(img,
      { yPercent: -16, scale: 1.10 },
      {
        yPercent: 12,
        scale: 1.015,
        ease: "none",
        scrollTrigger: {
          trigger: frame,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.55
        }
      }
    );
  });


  // Layered project drift for a more noticeable scroll-driven composition.
  gsap.utils.toArray("[data-project]").forEach((project, index) => {
    const copy = project.querySelector(".project-copy");
    const frame = project.querySelector(".project-frame");

    if (copy) {
      gsap.fromTo(copy,
        { yPercent: 7 },
        {
          yPercent: -8,
          ease: "none",
          scrollTrigger: {
            trigger: project,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.7
          }
        }
      );
    }

    if (frame) {
      gsap.fromTo(frame,
        { rotate: index % 2 === 0 ? -1.1 : 1.1, scale: 0.985 },
        {
          rotate: index % 2 === 0 ? 0.75 : -0.75,
          scale: 1.018,
          ease: "none",
          scrollTrigger: {
            trigger: project,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.75
          }
        }
      );
    }
  });

  gsap.utils.toArray(".number-block strong").forEach((number) => {
    gsap.from(number, {
      yPercent: 40,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: {
        trigger: number,
        start: "top 88%",
        once: true
      }
    });
  });

  gsap.to(".contact-orb", {
    yPercent: -34,
    xPercent: -14,
    scale: 1.22,
    ease: "none",
    scrollTrigger: {
      trigger: ".contact",
      start: "top bottom",
      end: "bottom bottom",
      scrub: 0.65
    }
  });

  // Subtle magnetic movement: enough to feel crafted, not gimmicky.
  document.querySelectorAll(".magnetic").forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      gsap.to(button, { x: x * 0.12, y: y * 0.12, duration: 0.25, ease: "power2.out" });
    });

    button.addEventListener("pointerleave", () => {
      gsap.to(button, { x: 0, y: 0, duration: 0.45, ease: "elastic.out(1, 0.35)" });
    });
  });
}

// Keep ScrollTrigger geometry correct after images/fonts settle.
window.addEventListener("load", () => ScrollTrigger.refresh());

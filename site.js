const content = window.BIOARCHAI_CONTENT;

const getCopy = (path) => {
  const value = path
    .split(".")
    .reduce((current, key) => current?.[key], content);

  if (value === undefined) {
    console.error(`Missing BioArchai content key: ${path}`);
  }

  return value;
};

const hydrateCopy = () => {
  if (!content) {
    console.error("BioArchai content failed to load.");
    return;
  }

  document.querySelectorAll("[data-copy]").forEach((element) => {
    const value = getCopy(element.dataset.copy);
    if (typeof value === "string") {
      element.textContent = value;
    }
  });

  document.querySelectorAll("*").forEach((element) => {
    [...element.attributes].forEach((attribute) => {
      if (!attribute.name.startsWith("data-copy-")) return;

      const targetAttribute = attribute.name.slice("data-copy-".length);
      const value = getCopy(attribute.value);

      if (typeof value === "string") {
        element.setAttribute(targetAttribute, value);
      }
    });
  });
};

const validateCopyCoverage = () => {
  const uncoveredText = [];
  const walker = document.createTreeWalker(
    document.documentElement,
    NodeFilter.SHOW_TEXT
  );
  let node;

  while ((node = walker.nextNode())) {
    const parent = node.parentElement;
    const value = node.nodeValue.trim();

    if (
      !value ||
      !parent ||
      ["SCRIPT", "STYLE"].includes(parent.tagName) ||
      parent.closest("[data-copy], .material-symbols-outlined")
    ) {
      continue;
    }

    uncoveredText.push(value);
  }

  const uncoveredAttributes = [];
  document.querySelectorAll("*").forEach((element) => {
    ["aria-label", "placeholder"].forEach((attribute) => {
      if (
        element.getAttribute(attribute) &&
        !element.hasAttribute(`data-copy-${attribute}`)
      ) {
        uncoveredAttributes.push(`${element.tagName.toLowerCase()}[${attribute}]`);
      }
    });

    if (
      element.matches('meta[name="description"]') &&
      !element.hasAttribute("data-copy-content")
    ) {
      uncoveredAttributes.push("meta[description]");
    }

    if (
      (element.matches('a[href^="mailto:"]') ||
        element.matches('form[action^="mailto:"]')) &&
      !element.hasAttribute(
        element.matches("a") ? "data-copy-href" : "data-copy-action"
      )
    ) {
      uncoveredAttributes.push(`${element.tagName.toLowerCase()}[mailto]`);
    }
  });

  if (uncoveredText.length || uncoveredAttributes.length) {
    console.error("User-facing copy must be added to content.js.", {
      text: uncoveredText,
      attributes: uncoveredAttributes
    });
  }
};

hydrateCopy();

const menuToggle = document.querySelector("[data-menu-toggle]");
const siteNav = document.querySelector("[data-site-nav]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const setupScrollReveal = () => {
  const revealGroups = [
    { selector: ".hero-copy", type: "left" },
    { selector: ".signal-panel", type: "right", baseDelay: 120 },
    { selector: ".page-hero-grid > *", type: "rise", step: 110 },
    { selector: ".section-header", type: "rise" },
    { selector: ".split-header > *", type: "rise", step: 90 },
    { selector: ".platform-flow > *", type: "rise", step: 95 },
    { selector: ".card-grid > *", type: "rise", step: 90 },
    { selector: ".feature-grid > *", type: "rise", step: 80 },
    { selector: ".story-grid > *", type: "rise", step: 95 },
    { selector: ".cta-band > *", type: "rise", step: 90 },
    { selector: ".final-cta-inner > *", type: "rise", step: 95 },
    { selector: ".architecture-map > *", type: "rise", step: 110 },
    { selector: ".timeline > *", type: "rise", step: 80 },
    { selector: ".profile-grid > *", type: "rise", step: 90 },
    { selector: ".news-grid > *", type: "rise", step: 90 },
    { selector: ".form-shell > *", type: "rise", step: 100 },
    { selector: ".mapping-table-wrap", type: "fade" },
    { selector: ".footer-grid > *", type: "rise", step: 70 }
  ];

  const revealElements = new Set();

  revealGroups.forEach(({ selector, type, baseDelay = 0, step = 0 }) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      if (!(element instanceof HTMLElement) || revealElements.has(element)) return;
      element.dataset.reveal = type;
      element.style.setProperty("--reveal-delay", `${baseDelay + index * step}ms`);
      revealElements.add(element);
    });
  });

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    document.documentElement.classList.add("reduce-motion");
    revealElements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  document.documentElement.classList.add("reveal-enabled");

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.08,
      rootMargin: "0px 0px -4% 0px"
    }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
};

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    siteNav.classList.toggle("open", !expanded);
  });

  siteNav.addEventListener("click", (event) => {
    const link = event.target instanceof Element ? event.target.closest("a") : null;
    if (link) {
      menuToggle.setAttribute("aria-expanded", "false");
      siteNav.classList.remove("open");
    }
  });
}

const canvas = document.getElementById("signal-canvas");

setupScrollReveal();

if (canvas instanceof HTMLCanvasElement) {
  const context = canvas.getContext("2d");
  const particles = [];
  const particleCount = 72;
  let animationFrame = 0;

  const resizeCanvas = () => {
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * ratio);
    canvas.height = Math.floor(rect.height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const createParticle = () => ({
    x: Math.random() * canvas.clientWidth,
    y: Math.random() * canvas.clientHeight,
    vx: (Math.random() - 0.5) * 0.32,
    vy: (Math.random() - 0.5) * 0.32,
    size: 1.4 + Math.random() * 2.3
  });

  const seedParticles = () => {
    particles.length = 0;
    for (let index = 0; index < particleCount; index += 1) {
      particles.push(createParticle());
    }
  };

  const draw = () => {
    if (!context) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    context.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i += 1) {
      const particle = particles[i];

      if (!prefersReducedMotion) {
        particle.x += particle.vx;
        particle.y += particle.vy;
      }

      if (particle.x < 0 || particle.x > width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > height) particle.vy *= -1;

      for (let j = i + 1; j < particles.length; j += 1) {
        const other = particles[j];
        const dx = particle.x - other.x;
        const dy = particle.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 145) {
          const opacity = 0.14 * (1 - distance / 145);
          context.strokeStyle = `rgba(0, 245, 255, ${opacity})`;
          context.lineWidth = 1;
          context.beginPath();
          context.moveTo(particle.x, particle.y);
          context.lineTo(other.x, other.y);
          context.stroke();
        }
      }

      context.fillStyle = "rgba(0, 245, 255, 0.62)";
      context.beginPath();
      context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      context.fill();
    }

    if (!prefersReducedMotion) {
      animationFrame = window.requestAnimationFrame(draw);
    }
  };

  window.addEventListener("resize", () => {
    resizeCanvas();
    seedParticles();
    if (prefersReducedMotion) {
      draw();
    }
  });

  resizeCanvas();
  seedParticles();
  if (animationFrame) {
    window.cancelAnimationFrame(animationFrame);
  }
  draw();
}

const demoForm = document.querySelector("[data-demo-form]");
const formStatus = document.querySelector("[data-form-status]");

if (demoForm instanceof HTMLFormElement) {
  demoForm.addEventListener("submit", (event) => {
    if (!demoForm.checkValidity()) return;

    event.preventDefault();
    const data = new FormData(demoForm);
    const emailCopy = getCopy("demo.email");
    const fields = emailCopy.fields;
    const lines = [
      `${fields.name}: ${data.get("name") || ""}`,
      `${fields.company}: ${data.get("company") || ""}`,
      `${fields.title}: ${data.get("title") || ""}`,
      `${fields.email}: ${data.get("email") || ""}`,
      `${fields.interest}: ${data.get("interest") || ""}`,
      `${fields.disease}: ${data.get("disease") || ""}`,
      "",
      `${fields.message}:`,
      String(data.get("message") || "")
    ];

    const subject = encodeURIComponent(emailCopy.subject);
    const body = encodeURIComponent(lines.join("\n"));

    if (formStatus) {
      formStatus.textContent = emailCopy.status;
    }

    window.location.href = `mailto:${emailCopy.recipient}?subject=${subject}&body=${body}`;
  });
}

validateCopyCoverage();

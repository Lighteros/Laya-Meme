const CONTRACT = "";

const links = {
  uniswap: CONTRACT
    ? `https://app.uniswap.org/swap?chain=base&outputCurrency=${CONTRACT}`
    : "https://app.uniswap.org/swap?chain=base",
  dex: CONTRACT
    ? `https://dexscreener.com/base/${CONTRACT}`
    : "https://dexscreener.com/base",
  x: "https://x.com/LayaonBase",
  explorer: CONTRACT
    ? `https://base.blockscout.com/token/${CONTRACT}`
    : "https://base.blockscout.com",
};

document.querySelectorAll("[data-link]").forEach((node) => {
  const href = links[node.dataset.link];
  if (href) node.href = href;
});

const label = document.getElementById("ca-label");
const go = document.getElementById("ca-go");
const ca = document.getElementById("ca");
if (CONTRACT) {
  const short = `${CONTRACT.slice(0, 6)}…${CONTRACT.slice(-4)}`;
  label.textContent = short;
  ca.title = CONTRACT;
} else {
  go.textContent = "Soon";
}

ca.addEventListener("click", async () => {
  if (!CONTRACT) {
    ca.classList.remove("shake");
    void ca.offsetWidth;
    ca.classList.add("shake");
    return;
  }
  try {
    await navigator.clipboard.writeText(CONTRACT);
    go.textContent = "Copied";
    setTimeout(() => {
      go.textContent = "Copy";
    }, 1400);
  } catch {
    go.textContent = "Select";
  }
});

const nav = document.getElementById("nav");
const burger = document.getElementById("burger");
burger.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  burger.setAttribute("aria-expanded", open ? "true" : "false");
  burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
});
const dock = document.querySelector(".dock");
const heroActions = document.querySelector(".hero-actions");
if (dock && heroActions) {
  const placeDock = () => {
    const rect = heroActions.getBoundingClientRect();
    const onScreen = rect.bottom > 72 && rect.top < window.innerHeight - 8;
    dock.classList.toggle("show", !onScreen);
    document.body.classList.toggle("dock-on", !onScreen);
  };
  placeDock();
  window.addEventListener("scroll", placeDock, { passive: true });
  window.addEventListener("resize", placeDock);
}

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
  });
});

const motion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const reveals = document.querySelectorAll(".reveal");
if (motion) {
  reveals.forEach((el) => el.classList.add("in"));
} else {
  const seen = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        seen.unobserve(entry.target);
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
  );
  reveals.forEach((el, index) => {
    el.style.animationDelay = `${(index % 4) * 0.08}s`;
    seen.observe(el);
  });
}

document.querySelectorAll(".panel").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    card.style.setProperty("--my", `${event.clientY - rect.top}px`);
  });
});

const pointer = document.querySelector(".pointer");
window.addEventListener("pointermove", (event) => {
  pointer.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
});

const counter = document.querySelector("[data-count]");
if (counter && !motion) {
  const target = Number(counter.dataset.count);
  const format = new Intl.NumberFormat("en-US");
  const countObserver = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      countObserver.disconnect();
      const start = performance.now();
      const duration = 1400;
      const tick = (now) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        counter.textContent = format.format(Math.round(target * eased));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    },
    { threshold: 0.5 }
  );
  countObserver.observe(counter);
}

const canvas = document.getElementById("dust");
if (canvas && !motion) {
  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let dots = [];

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = Math.min(80, Math.max(28, Math.floor(width / 18)));
    dots = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.8 + 0.4,
      o: Math.random() * 0.45 + 0.15,
      s: Math.random() * 0.35 + 0.08,
      w: Math.random() * Math.PI * 2,
    }));
  };

  const draw = (time) => {
    ctx.clearRect(0, 0, width, height);
    dots.forEach((dot) => {
      dot.y -= dot.s;
      dot.x += Math.sin(time / 900 + dot.w) * 0.18;
      if (dot.y < -8) {
        dot.y = height + 8;
        dot.x = Math.random() * width;
      }
      ctx.beginPath();
      ctx.fillStyle = `rgba(176, 214, 255, ${dot.o})`;
      ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  };

  resize();
  window.addEventListener("resize", resize);
  requestAnimationFrame(draw);
}

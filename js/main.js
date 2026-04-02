// button amination
const primaryButtons = document.querySelectorAll(".button-primary");
const supportsFinePointer = window.matchMedia("(pointer: fine)").matches;

const navigationEntry = performance.getEntriesByType("navigation")[0];

if (navigationEntry?.type === "reload") {
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  window.addEventListener(
    "load",
    () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    },
    { once: true }
  );
}

primaryButtons.forEach((button) => {
  if (supportsFinePointer) {
    button.addEventListener("pointermove", (event) => {
      const bounds = button.getBoundingClientRect();
      const offsetX = event.clientX - bounds.left - bounds.width / 2;
      const offsetY = event.clientY - bounds.top - bounds.height / 2;
      const moveX = (offsetX / (bounds.width / 2)) * 6;
      const moveY = (offsetY / (bounds.height / 2)) * 4;

      button.style.setProperty("--button-shift-x", `${moveX}px`);
      button.style.setProperty("--button-shift-y", `${moveY}px`);
    });
  }

  button.addEventListener("pointerleave", () => {
    button.style.setProperty("--button-shift-x", "0px");
    button.style.setProperty("--button-shift-y", "0px");
  });
});

// overlay menu
const siteMenu = document.querySelector(".site-menu");
const menuTriggers = document.querySelectorAll(".menu-link");
const menuCloseButton = document.querySelector(".site-menu__close");
const menuLinks = document.querySelectorAll(".site-menu__link");
const menuProjectLinks = document.querySelectorAll(".site-menu__project");

if (siteMenu && menuTriggers.length > 0 && menuCloseButton) {
  const menuTransitionMs = 560;

  const openMenu = () => {
    siteMenu.classList.add("is-open");
    siteMenu.setAttribute("aria-hidden", "false");
    document.body.classList.add("menu-open");
  };

  const closeMenu = () => {
    siteMenu.classList.remove("is-open");
    siteMenu.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-open");
  };

  menuTriggers.forEach((trigger) => {
    trigger.addEventListener("click", openMenu);
  });

  menuCloseButton.addEventListener("click", closeMenu);
  siteMenu.addEventListener("click", (event) => {
    if (event.target === siteMenu) {
      closeMenu();
    }
  });

  const bindMenuNavigation = (link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      if (!href || href === "#") {
        event.preventDefault();
        closeMenu();
        return;
      }

      const targetUrl = new URL(href, window.location.href);
      const isInternalNavigation = targetUrl.origin === window.location.origin;
      const isSamePage = targetUrl.pathname === window.location.pathname;

      if (!isInternalNavigation) {
        closeMenu();
        return;
      }

      event.preventDefault();
      closeMenu();

      if (isSamePage) {
        if (targetUrl.hash) {
          window.setTimeout(() => {
            document
              .querySelector(targetUrl.hash)
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, menuTransitionMs - 120);
        }

        return;
      }

      window.setTimeout(() => {
        window.location.href = targetUrl.href;
      }, menuTransitionMs - 40);
    });
  };

  menuLinks.forEach(bindMenuNavigation);
  menuProjectLinks.forEach(bindMenuNavigation);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && siteMenu.classList.contains("is-open")) {
      closeMenu();
    }
  });
}

// solutions video control
const solutionVideo = document.querySelector(".video video");
const solutionVideoButton = document.querySelector(".video-play-button");

if (solutionVideo && solutionVideoButton) {
  let isVideoLoaded = false;

  const loadSolutionVideo = () => {
    if (isVideoLoaded) {
      return;
    }

    const source = solutionVideo.dataset.src;

    if (!source) {
      return;
    }

    solutionVideo.src = source;
    solutionVideo.load();
    isVideoLoaded = true;
  };

  const syncVideoButtonState = () => {
    const isPaused = solutionVideo.paused;

    solutionVideoButton.classList.toggle("is-paused", !isPaused);
    solutionVideoButton.setAttribute(
      "aria-label",
      isPaused ? "Play video" : "Pause video"
    );
  };

  solutionVideoButton.addEventListener("click", () => {
    loadSolutionVideo();

    if (solutionVideo.paused) {
      solutionVideo.play();
    } else {
      solutionVideo.pause();
    }
  });

  solutionVideo.addEventListener("play", syncVideoButtonState);
  solutionVideo.addEventListener("pause", syncVideoButtonState);

  const videoObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        loadSolutionVideo();
        solutionVideo.play().catch(() => {});
        observer.disconnect();
      });
    },
    {
      rootMargin: "250px 0px",
    }
  );

  videoObserver.observe(solutionVideo);
  syncVideoButtonState();
}

// numbers count up
const numbersBlock = document.querySelector(".numbers-block");
const numberValues = document.querySelectorAll(".number-value");

if (numbersBlock && numberValues.length > 0) {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const animateValue = (element) => {
    const target = Number(element.dataset.value || 0);
    const suffix = element.dataset.suffix || "";

    if (prefersReducedMotion) {
      element.textContent = `${target}${suffix}`;
      return;
    }

    const duration = 850;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);

      element.textContent = `${current}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  };

  const numbersObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        numberValues.forEach((value) => {
          animateValue(value);
        });

        observer.disconnect();
      });
    },
    {
      threshold: 0.35,
    }
  );

  numbersObserver.observe(numbersBlock);
}

// discuss project image rotator
const projectRotators = document.querySelectorAll("[data-project-rotator]");

projectRotators.forEach((rotator) => {
  const imageList = (rotator.dataset.images || "")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);

  if (imageList.length < 2) {
    return;
  }

  let activeIndex = 0;

  imageList.forEach((src) => {
    const preload = new Image();
    preload.src = src;
  });

  window.setInterval(() => {
    activeIndex = (activeIndex + 1) % imageList.length;
    rotator.classList.add("is-switching");

    window.setTimeout(() => {
      rotator.src = imageList[activeIndex];
      rotator.classList.remove("is-switching");
    }, 180);
  }, 2600);
});

// back to top
const backToTopButtons = document.querySelectorAll("[data-back-to-top]");

if (backToTopButtons.length > 0) {
  const toggleBackToTopVisibility = () => {
    const shouldShow = window.scrollY > window.innerHeight * 0.9;

    backToTopButtons.forEach((button) => {
      button.classList.toggle("is-visible", shouldShow);
    });
  };

  backToTopButtons.forEach((button) => {
    button.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  });

  toggleBackToTopVisibility();
  window.addEventListener("scroll", toggleBackToTopVisibility, {
    passive: true,
  });
}

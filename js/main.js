// button amination
const primaryButtons = document.querySelectorAll(".button-primary");

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
  button.addEventListener("pointermove", (event) => {
    const bounds = button.getBoundingClientRect();
    const offsetX = event.clientX - bounds.left - bounds.width / 2;
    const offsetY = event.clientY - bounds.top - bounds.height / 2;
    const moveX = (offsetX / (bounds.width / 2)) * 6;
    const moveY = (offsetY / (bounds.height / 2)) * 4;

    button.style.setProperty("--button-shift-x", `${moveX}px`);
    button.style.setProperty("--button-shift-y", `${moveY}px`);
  });

  button.addEventListener("pointerleave", () => {
    button.style.setProperty("--button-shift-x", "0px");
    button.style.setProperty("--button-shift-y", "0px");
  });
});

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

// offer stack scroll
const offerStage = document.querySelector("[data-offer-stage]");
const offerSticky = offerStage?.querySelector(".offer-sticky");
const offerKicker = offerStage?.querySelector("[data-offer-kicker]");
const offerCards = offerStage
  ? [...offerStage.querySelectorAll("[data-offer-card]")]
  : [];

if (offerStage && offerSticky && offerKicker && offerCards.length > 0) {
  const stackedOffersMedia = window.matchMedia("(min-width: 981px)");
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  let currentPhase = 0;
  let targetPhase = 0;
  let rafId = 0;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);
  const offerHoldPadding = 0.14;

  const setStaticOffers = () => {
    offerKicker.textContent = offerCards[0].dataset.offerLabel || "Web Dev";

    offerCards.forEach((card, index) => {
      card.classList.toggle("is-active", index === 0);
      card.classList.toggle("is-behind", index > 0);
      card.removeAttribute("aria-hidden");
      card.style.removeProperty("transform");
      card.style.removeProperty("filter");
      card.style.removeProperty("opacity");
      card.style.removeProperty("z-index");
    });
  };

  const getOfferPhase = () => {
    const stageRect = offerStage.getBoundingClientRect();
    const scrollRange = Math.max(
      offerStage.offsetHeight - offerSticky.offsetHeight,
      1
    );
    const progress = clamp((-stageRect.top) / scrollRange, 0, 1);
    const usableProgress = clamp(
      (progress - offerHoldPadding) / (1 - offerHoldPadding * 2),
      0,
      1
    );
    const rawPhase = usableProgress * (offerCards.length - 1);
    const segment = Math.floor(rawPhase);
    const segmentProgress = rawPhase - segment;

    return Math.min(
      segment + easeOutCubic(segmentProgress),
      offerCards.length - 1
    );
  };

  const renderOfferStack = (phase) => {
    const activeIndex = clamp(Math.round(phase), 0, offerCards.length - 1);

    offerKicker.textContent =
      offerCards[activeIndex].dataset.offerLabel || "Web Dev";

    offerCards.forEach((card, index) => {
      const relative = index - phase;
      let translateY = 0;
      let scale = 1;
      let opacity = 1;
      let zIndex = 10 - index;
      const isActive = Math.abs(index - phase) < 0.5;
      const isBehind = relative > 0.08 && relative <= 2;

      if (relative < -1) {
        translateY = -46;
        scale = 0.98;
        opacity = 0;
        zIndex = 1;
      } else if (relative < 0) {
        const t = relative + 1;
        translateY = -42 * (1 - t);
        scale = 0.98 + 0.02 * t;
        opacity = 1;
      } else if (relative <= 1) {
        translateY = 18 * relative + 10 * relative * relative;
        scale = 1 - 0.035 * relative;
        opacity = 1;
      } else if (relative <= 2) {
        const t = relative - 1;
        translateY = 28 + 16 * t;
        scale = 0.965 - 0.025 * t;
        opacity = 1;
      } else {
        translateY = 44;
        scale = 0.94;
        opacity = 0;
        zIndex = 3;
      }

      // Once a card is effectively out of the stack, hide it completely so
      // the settled active card doesn't show a previous card peeking behind.
      if (relative <= -0.92) {
        translateY = -56;
        opacity = 0;
      }

      if (relative >= 1.92) {
        translateY = 56;
        opacity = 0;
      }

      if (isActive) {
        zIndex = 30;
      } else if (relative < 0) {
        zIndex = 20 - index;
      }

      card.classList.toggle("is-active", isActive);
      card.classList.toggle("is-behind", isBehind);
      card.setAttribute("aria-hidden", isActive ? "false" : "true");
      card.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`;
      card.style.opacity = `${opacity}`;
      card.style.zIndex = `${zIndex}`;
    });
  };

  const animateOfferStack = () => {
    currentPhase += (targetPhase - currentPhase) * 0.14;

    if (Math.abs(targetPhase - currentPhase) < 0.0015) {
      currentPhase = targetPhase;
    }

    renderOfferStack(currentPhase);

    if (Math.abs(targetPhase - currentPhase) < 0.0015) {
      rafId = 0;
      return;
    }

    rafId = requestAnimationFrame(animateOfferStack);
  };

  const scheduleOfferRender = () => {
    if (!stackedOffersMedia.matches || prefersReducedMotion) {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }

      setStaticOffers();
      return;
    }

    targetPhase = getOfferPhase();

    if (rafId) {
      return;
    }

    rafId = requestAnimationFrame(animateOfferStack);
  };

  if (!stackedOffersMedia.matches || prefersReducedMotion) {
    setStaticOffers();
  } else {
    targetPhase = getOfferPhase();
    currentPhase = targetPhase;
    renderOfferStack(currentPhase);
  }

  window.addEventListener("scroll", scheduleOfferRender, { passive: true });
  window.addEventListener("resize", scheduleOfferRender);
  stackedOffersMedia.addEventListener("change", scheduleOfferRender);
}

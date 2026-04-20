(() => {
  const body = document.body;
  const isHomepage = body?.dataset.page === "home";
  const HOMEPAGE_LOADER_STORAGE_KEY = "hadeon-home-loader-seen-v2";
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const supportsFinePointer = window.matchMedia("(pointer: fine)").matches;

  const emit = (name, detail = {}) => {
    window.dispatchEvent(new CustomEvent(name, { detail }));
  };

  let hasSeenHomepageLoader = false;

  try {
    hasSeenHomepageLoader =
      localStorage.getItem(HOMEPAGE_LOADER_STORAGE_KEY) === "1";
  } catch (error) {
    hasSeenHomepageLoader = false;
  }

  const initHomepageLoader = () => {
    if (!body || !isHomepage || hasSeenHomepageLoader) {
      return;
    }

    const pageLoader = document.createElement("div");
    pageLoader.className = "page-loader";
    pageLoader.setAttribute("aria-hidden", "true");
    pageLoader.innerHTML = `
      <div class="page-loader__inner">
        <div class="page-loader__count" data-page-loader-count>1%</div>
        <div class="page-loader__label">Loading</div>
      </div>
    `;

    const loaderCount = pageLoader.querySelector("[data-page-loader-count]");
    const loaderStart = performance.now();
    const minimumLoaderMs = prefersReducedMotion ? 250 : 2200;
    let currentProgress = 1;
    let targetProgress = 97;
    let isLoaderComplete = false;

    const renderLoaderProgress = (value) => {
      if (loaderCount) {
        loaderCount.textContent = `${value}%`;
      }
    };

    const completeLoader = () => {
      if (isLoaderComplete) {
        return;
      }

      isLoaderComplete = true;
      targetProgress = 100;

      try {
        localStorage.setItem(HOMEPAGE_LOADER_STORAGE_KEY, "1");
      } catch (error) {
        // Storage can be blocked in private browsing; the loader still works.
      }
    };

    const animateLoader = () => {
      if (currentProgress < targetProgress) {
        let step = 0.55;

        if (currentProgress >= 20 && currentProgress < 50) {
          step = 0.9;
        } else if (currentProgress >= 50 && currentProgress < 78) {
          step = 1.85;
        } else if (currentProgress >= 78 && currentProgress < 92) {
          step = 1.05;
        } else if (currentProgress >= 92 && currentProgress < 98) {
          step = 0.3;
        } else if (currentProgress >= 98 && currentProgress < 99) {
          step = 0.12;
        } else if (currentProgress >= 99) {
          step = 0.08;
        }

        currentProgress = Math.min(currentProgress + step, targetProgress);
        renderLoaderProgress(Math.round(currentProgress));
      }

      if (!isLoaderComplete || currentProgress < 100) {
        window.requestAnimationFrame(animateLoader);
        return;
      }

      window.setTimeout(() => {
        pageLoader.classList.add("is-hidden");
        body.classList.remove("page-loading");
        emit("hadeon:loader-complete");

        window.setTimeout(() => {
          pageLoader.remove();
        }, 360);
      }, 140);
    };

    body.classList.add("page-loading");
    body.appendChild(pageLoader);

    window.addEventListener(
      "load",
      () => {
        const elapsed = performance.now() - loaderStart;
        const remaining = Math.max(minimumLoaderMs - elapsed, 0);
        window.setTimeout(completeLoader, remaining);
      },
      { once: true }
    );

    window.setTimeout(completeLoader, prefersReducedMotion ? 450 : 3600);
    window.requestAnimationFrame(animateLoader);
  };

  const initReloadScrollReset = () => {
    const navigationEntry = performance.getEntriesByType("navigation")[0];

    if (navigationEntry?.type !== "reload") {
      return;
    }

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
  };

  const initButtonPointer = () => {
    const primaryButtons = document.querySelectorAll(".button-primary");

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
  };

  const initOverlayMenu = () => {
    const siteMenu = document.querySelector(".site-menu");
    const menuTriggers = document.querySelectorAll(".menu-link");
    const menuCloseButton = document.querySelector(".site-menu__close");
    const menuLinks = document.querySelectorAll(".site-menu__link");
    const menuProjectLinks = document.querySelectorAll(".site-menu__project");

    if (!siteMenu || menuTriggers.length === 0 || !menuCloseButton) {
      return;
    }

    const menuTransitionMs = 560;

    const openMenu = () => {
      siteMenu.classList.add("is-open");
      siteMenu.setAttribute("aria-hidden", "false");
      document.body.classList.add("menu-open");
      emit("hadeon:menu-open", { siteMenu });
    };

    const closeMenu = () => {
      emit("hadeon:menu-close", { siteMenu });
      siteMenu.classList.remove("is-open");
      siteMenu.setAttribute("aria-hidden", "true");
      document.body.classList.remove("menu-open");
    };

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

    menuTriggers.forEach((trigger) => {
      trigger.addEventListener("click", openMenu);
    });
    menuCloseButton.addEventListener("click", closeMenu);
    siteMenu.addEventListener("click", (event) => {
      if (event.target === siteMenu) {
        closeMenu();
      }
    });
    menuLinks.forEach(bindMenuNavigation);
    menuProjectLinks.forEach(bindMenuNavigation);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && siteMenu.classList.contains("is-open")) {
        closeMenu();
      }
    });
  };

  const initSolutionVideo = () => {
    const solutionVideo = document.querySelector(".video video");
    const solutionVideoButton = document.querySelector(".video-play-button");

    if (!solutionVideo || !solutionVideoButton) {
      return;
    }

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
  };

  const initProjectRotators = () => {
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
  };

  const initBackToTop = () => {
    const backToTopButtons = document.querySelectorAll("[data-back-to-top]");

    if (backToTopButtons.length === 0) {
      return;
    }

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
  };

  initHomepageLoader();
  initReloadScrollReset();
  initButtonPointer();
  initOverlayMenu();
  initSolutionVideo();
  initProjectRotators();
  initBackToTop();
})();

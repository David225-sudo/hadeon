(() => {
  const body = document.body;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (!gsap || prefersReducedMotion) {
    document.querySelectorAll(".reveal-on-scroll").forEach((element) => {
      element.classList.add("is-visible");
    });
    return;
  }

  const canUseScrollTrigger = Boolean(ScrollTrigger);

  if (canUseScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  const uniqueElements = (selectors) =>
    [
      ...new Set(
        selectors.flatMap((selector) => [
          ...document.querySelectorAll(selector),
        ])
      ),
    ].filter(Boolean);

  const revealTargets = uniqueElements([
    ".hero-left-top > *",
    ".hero-left-bottom",
    ".solutions-top > *",
    ".video",
    ".numbers-block",
    ".metrics-card",
    ".offer-card",
    ".contact-cta-panel > *",
    ".faq-title",
    ".faq-subtitle",
    ".faq-item",
    ".site-footer__top > *",
    ".about-feature__row > *",
    ".about-proof-card",
    ".about-process__title",
    ".about-process-card",
    ".about-recent-work__intro > *",
    ".about-recent-work__layout > *",
    ".project-head > *",
    ".project-layout > *",
    ".contact-details",
    ".contact-form",
    ".license-section-head",
    ".license-intro",
    ".license-card",
    ".not-found-copy > *",
  ]);

  const introTargets = uniqueElements([
    ".navigation-bar > *",
    ".contact-nav > *",
    ".hero-left-top > *",
    ".hero-left-bottom",
    ".about-hero .about-shell > *",
    ".contact-details",
    ".contact-form",
    ".project-head > *",
    ".license-hero > *",
    ".not-found-copy > *",
  ]);

  const playIntroAnimations = () => {
    if (introTargets.length === 0) {
      return;
    }

    gsap.fromTo(
      introTargets,
      { autoAlpha: 0, y: 28 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.065,
        clearProps: "opacity,visibility,transform",
      }
    );
  };

  const initRevealAnimations = () => {
    if (revealTargets.length === 0) {
      return;
    }

    if (!canUseScrollTrigger) {
      revealTargets.forEach((element, index) => {
        element.classList.add("reveal-on-scroll");
        element.style.setProperty(
          "--reveal-delay",
          `${Math.min(index % 6, 5) * 70}ms`
        );
      });

      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        {
          rootMargin: "0px 0px -10% 0px",
          threshold: 0.16,
        }
      );

      revealTargets.forEach((element) => {
        revealObserver.observe(element);
      });
      return;
    }

    const scrollRevealTargets = revealTargets.filter(
      (element) => !introTargets.includes(element)
    );

    gsap.set(introTargets, { autoAlpha: 0, y: 28 });
    gsap.set(scrollRevealTargets, { autoAlpha: 0, y: 34 });

    ScrollTrigger.batch(scrollRevealTargets, {
      start: "top 86%",
      once: true,
      onEnter: (batch) => {
        gsap.to(batch, {
          autoAlpha: 1,
          y: 0,
          duration: 0.78,
          ease: "power3.out",
          stagger: 0.075,
          overwrite: true,
          clearProps: "opacity,visibility,transform",
        });
      },
    });

    if (body?.classList.contains("page-loading")) {
      window.addEventListener("hadeon:loader-complete", playIntroAnimations, {
        once: true,
      });
    } else {
      window.requestAnimationFrame(playIntroAnimations);
    }
  };

  const initNumberCounters = () => {
    const numbersBlock = document.querySelector(".numbers-block");
    const numberValues = document.querySelectorAll(".number-value");

    if (!numbersBlock || numberValues.length === 0) {
      return;
    }

    const animateValue = (element) => {
      const target = Number(element.dataset.value || 0);
      const suffix = element.dataset.suffix || "";
      const counter = { value: 0 };

      gsap.to(counter, {
        value: target,
        duration: 1.05,
        ease: "power3.out",
        onUpdate: () => {
          element.textContent = `${Math.round(counter.value)}${suffix}`;
        },
      });
    };

    if (canUseScrollTrigger) {
      ScrollTrigger.create({
        trigger: numbersBlock,
        start: "top 72%",
        once: true,
        onEnter: () => numberValues.forEach(animateValue),
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries, intersectionObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          numberValues.forEach(animateValue);
          intersectionObserver.disconnect();
        });
      },
      { threshold: 0.35 }
    );

    observer.observe(numbersBlock);
  };

  const initFaqAnimations = () => {
    document.querySelectorAll(".faq-item").forEach((item) => {
      const answer = item.querySelector(".faq-answer");

      if (!answer) {
        return;
      }

      item.addEventListener("toggle", () => {
        if (!item.open) {
          return;
        }

        gsap.fromTo(
          answer,
          { autoAlpha: 0, y: -8 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.3,
            ease: "power3.out",
            clearProps: "opacity,visibility,transform",
          }
        );
      });
    });
  };

  const initMenuAnimations = () => {
    window.addEventListener("hadeon:menu-open", (event) => {
      const siteMenu = event.detail?.siteMenu;

      if (!siteMenu) {
        return;
      }

      const items = siteMenu.querySelectorAll(
        ".site-menu__top, .site-menu__link, .site-menu__bottom"
      );

      gsap.fromTo(
        items,
        { autoAlpha: 0, y: 18 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.38,
          ease: "power3.out",
          stagger: 0.04,
          clearProps: "opacity,visibility,transform",
        }
      );
    });
  };

  const initSmallHoverAnimations = () => {
    const supportsFinePointer = window.matchMedia("(pointer: fine)").matches;

    if (!supportsFinePointer) {
      return;
    }

    document
      .querySelectorAll(".site-footer__social, .site-menu__socials a")
      .forEach((element) => {
        element.addEventListener("pointerenter", () => {
          gsap.to(element, {
            y: -2,
            duration: 0.2,
            ease: "power3.out",
            overwrite: true,
          });
        });

        element.addEventListener("pointerleave", () => {
          gsap.to(element, {
            y: 0,
            duration: 0.28,
            ease: "power3.out",
            overwrite: true,
          });
        });
      });
  };

  const initValueReveals = () => {
    if (!canUseScrollTrigger) {
      return;
    }

    document
      .querySelectorAll(".metrics-card__value, .offer-price__number")
      .forEach((element) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: 16 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.62,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 88%",
              once: true,
            },
            clearProps: "opacity,visibility,transform",
          }
        );
      });
  };

  initRevealAnimations();
  initNumberCounters();
  initFaqAnimations();
  initMenuAnimations();
  initSmallHoverAnimations();
  initValueReveals();

  if (canUseScrollTrigger) {
    ScrollTrigger.refresh();
  }
})();

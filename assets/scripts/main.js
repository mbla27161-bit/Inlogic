(function () {
  "use strict";

  /* ---------- Theme ---------- */
  const THEME_KEY = "inlogic-theme";

  function systemPrefersDark() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  }

  function isNightHours() {
    const h = new Date().getHours();
    return h >= 20 || h < 7;
  }

  function resolveInitialTheme() {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === "light" || saved === "dark") return saved;
    } catch (_) {}
    if (systemPrefersDark()) return "dark";
    if (isNightHours()) return "dark";
    return "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const toggle = document.getElementById("themeToggle");
    if (toggle) {
      toggle.setAttribute(
        "aria-label",
        theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"
      );
      toggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    }
  }

  function initTheme() {
    applyTheme(resolveInitialTheme());
    const toggle = document.getElementById("themeToggle");
    if (toggle) {
      toggle.addEventListener("click", () => {
        const next =
          document.documentElement.getAttribute("data-theme") === "dark"
            ? "light"
            : "dark";
        applyTheme(next);
        try {
          localStorage.setItem(THEME_KEY, next);
        } catch (_) {}
      });
    }
    // react to OS preference only if user hasn't chosen
    if (window.matchMedia) {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", (e) => {
          try {
            if (localStorage.getItem(THEME_KEY)) return;
          } catch (_) {}
          applyTheme(e.matches ? "dark" : isNightHours() ? "dark" : "light");
        });
    }
  }

  initTheme();

  /* ---------- Header scroll ---------- */
  const header = document.getElementById("siteHeader");
  const toTop = document.getElementById("toTop");
  if (header) {
    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY;
        header.classList.toggle("scrolled", y > 40);
        if (toTop) toTop.classList.toggle("show", y > 700);
      },
      { passive: true }
    );
  }

  if (toTop) {
    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Mobile menu ---------- */
  const burger = document.getElementById("burgerBtn");
  const menu = document.getElementById("mobileMenu");
  if (burger && menu) {
    burger.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", open);
      document.body.style.overflow = open ? "hidden" : "";
    });
    menu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        menu.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      })
    );
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Counters ---------- */
  const counters = document.querySelectorAll(".counter");
  if (counters.length && "IntersectionObserver" in window) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          cio.unobserve(e.target);
          const target = +e.target.dataset.target;
          const dur = target >= 20 ? 2400 : 1800;
          const start = performance.now();
          function tick(now) {
            const p = Math.min((now - start) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            e.target.textContent = Math.round(target * eased).toLocaleString(
              "ru-RU"
            ); // thin spaces for thousands
            if (p < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => cio.observe(el));
  }

  /* ---------- Smooth anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", function (e) {
      const id = this.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 84;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });

  if (window.location.hash) {
    const target = document.querySelector(window.location.hash);
    if (target) {
      requestAnimationFrame(() => {
        const top = target.getBoundingClientRect().top + window.scrollY - 84;
        window.scrollTo({ top });
      });
    }
  }

  /* ---------- Forms → EmailJS ---------- */
  const FORM_COOLDOWN_MS = 8000;
  const EMAILJS_CFG = window.INLOGIC_EMAILJS || {};

  function showModal(title, message, isError) {
    let overlay = document.getElementById("formModal");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "formModal";
      overlay.className = "modal-overlay";
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-modal", "true");
      overlay.innerHTML =
        '<div class="modal-box"><div class="modal-icon" aria-hidden="true"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg></div><h3 id="formModalTitle"></h3><p id="formModalMsg"></p><button type="button" class="btn btn-primary" id="formModalClose">Закрыть</button></div>';
      document.body.appendChild(overlay);
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.classList.remove("open");
      });
      document
        .getElementById("formModalClose")
        .addEventListener("click", () => overlay.classList.remove("open"));
    }
    const icon = overlay.querySelector(".modal-icon");
    if (isError) {
      icon.innerHTML =
        '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>';
      icon.style.background = "rgba(200,80,60,.15)";
      icon.style.color = "#c45c4a";
    } else {
      icon.innerHTML =
        '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>';
      icon.style.background = "";
      icon.style.color = "";
    }
    document.getElementById("formModalTitle").textContent = title;
    document.getElementById("formModalMsg").textContent = message;
    overlay.classList.add("open");
  }

  function digitsOnly(raw) {
    let d = String(raw || "").replace(/\D/g, "");
    if (d.startsWith("375")) d = d.slice(3);
    if (d.startsWith("80") && d.length >= 10) d = d.slice(1);
    if (d.startsWith("0") && d.length >= 10) d = d.slice(1);
    return d.slice(0, 9);
  }

  /** Format local 9 digits as (29) 123-45-67 */
  function formatPhoneMask(digits) {
    const d = digitsOnly(digits);
    if (!d) return "";
    let out = "";
    if (d.length <= 2) return "(" + d;
    out = "(" + d.slice(0, 2) + ")";
    if (d.length <= 5) return out + " " + d.slice(2);
    out += " " + d.slice(2, 5);
    if (d.length <= 7) return out + "-" + d.slice(5);
    return out + "-" + d.slice(5, 7) + "-" + d.slice(7, 9);
  }

  function fullPhoneFromLocal(local) {
    const d = digitsOnly(local);
    return d ? "+375" + d : "";
  }

  // Phone fields: fixed +375 + mask (29) 123-45-67
  document
    .querySelectorAll(
      '.phone-field input[data-phone-local], .phone-field input[name="phone"]'
    )
    .forEach((input) => {
      input.setAttribute("placeholder", "(29) 123-45-67");
      input.addEventListener("input", () => {
        const formatted = formatPhoneMask(input.value);
        input.value = formatted;
      });
      input.addEventListener("blur", () => {
        input.value = formatPhoneMask(input.value);
      });
    });

  async function sendViaEmailJS(payload) {
    const pub = EMAILJS_CFG.publicKey || EMAILJS_CFG.userId;
    const service = EMAILJS_CFG.serviceId;
    const template = EMAILJS_CFG.templateId;
    if (!pub || !service || !template) {
      throw new Error("EmailJS not configured");
    }
    if (window.emailjs && typeof window.emailjs.send === "function") {
      if (typeof window.emailjs.init === "function") {
        try {
          window.emailjs.init({ publicKey: pub });
        } catch (_) {}
      }
      return window.emailjs.send(service, template, {
        name: payload.name,
        phone: payload.phone,
        from: payload.from,
        to: payload.to,
        type: payload.type,
        weight: payload.weight,
        message: payload.message || "",
        page: payload.page,
        sentAt: payload.sentAt,
      });
    }
    // Fallback REST API (no SDK)
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: service,
        template_id: template,
        user_id: pub,
        template_params: {
          name: payload.name,
          phone: payload.phone,
          from: payload.from,
          to: payload.to,
          type: payload.type,
          weight: payload.weight,
          message: payload.message || "",
          page: payload.page,
          sentAt: payload.sentAt,
        },
      }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error("EmailJS HTTP " + res.status + " " + t);
    }
    return res;
  }

  document.querySelectorAll(".quote-form").forEach((form) => {
    let lockedUntil = 0;
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      const now = Date.now();
      if (now < lockedUntil) return;
      const btn = this.querySelector('.btn, button[type="submit"]');
      const original = btn ? btn.textContent : "";
      if (btn) {
        btn.disabled = true;
        btn.classList.add("is-loading");
        btn.dataset.originalHtml = btn.innerHTML;
        btn.innerHTML =
          '<span class="btn-spinner" aria-hidden="true"></span> Отправляем заявку…';
      }

      const fd = new FormData(this);
      const phoneInput = this.querySelector(
        '[name="phone"], [data-phone-local]'
      );
      const phoneLocal = phoneInput ? phoneInput.value : fd.get("phone") || "";
      const phoneFull = fullPhoneFromLocal(phoneLocal);

      const payload = {
        name: fd.get("name") || "",
        phone: phoneFull,
        from: fd.get("from") || "",
        to: fd.get("to") || "",
        type: fd.get("type") || "",
        weight: fd.get("weight") || "",
        message: fd.get("message") || "",
        page: location.pathname,
        sentAt: new Date().toISOString(),
      };

      try {
        const configured =
          !!(EMAILJS_CFG.publicKey || EMAILJS_CFG.userId) &&
          EMAILJS_CFG.serviceId &&
          EMAILJS_CFG.templateId;
        if (configured) {
          await sendViaEmailJS(payload);
        } else {
          await new Promise((r) => setTimeout(r, 500));
          console.info(
            "[InLogic form] Configure window.INLOGIC_EMAILJS in config.js",
            payload
          );
        }
        this.reset();
        // restore phone input empty after reset
        if (phoneInput) phoneInput.value = "";
        lockedUntil = Date.now() + FORM_COOLDOWN_MS;
        showModal(
          "✓ Заявка успешно отправлена",
          "Спасибо! Персональный менеджер свяжется с вами в ближайшее время.",
          false
        );
      } catch (err) {
        console.error(err);
        showModal(
          "Не удалось отправить",
          "Проверьте соединение и попробуйте ещё раз или позвоните нам.",
          true
        );
      } finally {
        if (btn) {
          setTimeout(() => {
            btn.classList.remove("is-loading");
            btn.innerHTML = btn.dataset.originalHtml || original;
            btn.disabled = Date.now() < lockedUntil;
            if (btn.disabled) {
              const left = lockedUntil - Date.now();
              setTimeout(() => {
                btn.disabled = false;
              }, left);
            }
          }, 400);
        }
      }
    });
  });

  /* ---------- Tabs ---------- */
  document.querySelectorAll("[data-tabs]").forEach((root) => {
    const btns = root.querySelectorAll("[data-tab]");
    const panels = root.querySelectorAll("[data-tab-panel]");
    btns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-tab");
        btns.forEach((b) => b.classList.remove("active"));
        panels.forEach((p) => p.classList.remove("active"));
        btn.classList.add("active");
        const panel = root.querySelector('[data-tab-panel="' + id + '"]');
        if (panel) panel.classList.add("active");
      });
    });
  });

  /* ---------- Career / service split panels ---------- */
  document.querySelectorAll(".career-split, .svc-panel").forEach((panel) => {
    const btns = panel.querySelectorAll(
      ".career-split-nav button, .svc-panel-nav button"
    );
    const panes = panel.querySelectorAll(".career-split-pane, .svc-panel-pane");
    btns.forEach((btn) => {
      const activate = () => {
        const id = btn.dataset.pane;
        btns.forEach((b) => b.classList.remove("active"));
        panes.forEach((p) => p.classList.remove("active"));
        btn.classList.add("active");
        const pane = panel.querySelector('[data-pane-id="' + id + '"]');
        if (pane) pane.classList.add("active");
      };
      btn.addEventListener("click", activate);
      btn.addEventListener("mouseenter", () => {
        if (window.matchMedia("(hover:hover)").matches) activate();
      });
    });
  });

  /* ---------- Hero parallax (light) ---------- */
  const hero = document.querySelector(".hero");
  const heroArt = document.querySelector(".hero-art");
  if (
    hero &&
    heroArt &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    let ticking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const rect = hero.getBoundingClientRect();
          if (rect.bottom > 0 && rect.top < window.innerHeight) {
            const py = Math.max(-30, Math.min(30, rect.top * 0.08));
            hero.style.setProperty("--py", py + "px");
            hero.classList.add("is-parallax");
          }
          ticking = false;
        });
      },
      { passive: true }
    );
  }

  /* Pause SMIL vehicle animations when reduced motion */
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll("animateMotion").forEach((el) => {
      try {
        el.endElement && el.endElement();
      } catch (_) {}
      el.setAttribute("repeatCount", "0");
    });
  }

  /* ---------- Intro screen: draw → pins → word → soft glow → fade ---------- */
  (function initIntro() {
    const el = document.getElementById("introScreen");
    if (!el) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) {
      el.remove();
      return;
    }

    let isReload = false;
    try {
      const nav =
        performance.getEntriesByType &&
        performance.getEntriesByType("navigation")[0];
      if (nav) isReload = nav.type === "reload";
      else if (performance.navigation)
        isReload = performance.navigation.type === 1;
    } catch (_) {}

    let seen = false;
    try {
      seen = sessionStorage.getItem("inlogic-intro") === "1";
    } catch (_) {}

    if (seen && !isReload) {
      el.remove();
      return;
    }

    el.setAttribute("aria-hidden", "false");
    document.documentElement.style.overflow = "hidden";
    const logo = el.querySelector(".intro-logo-svg");

    // Timeline: draw ~0.7s, pins ~0.9s, word ~1.05s, glow at ~1.15s for 350ms, fade from ~1.5s
    const glowAt = 2000;
    const fadeAt = 2500;
    const removeAt = 3000;

    setTimeout(() => {
      if (logo) logo.classList.add("is-glow");
    }, glowAt);

    setTimeout(() => {
      if (logo) logo.classList.remove("is-glow");
      el.classList.add("is-done");
      document.documentElement.style.overflow = "";
      try {
        sessionStorage.setItem("inlogic-intro", "1");
      } catch (_) {}
    }, fadeAt);

    setTimeout(() => {
      el.remove();
      window.dispatchEvent(new Event("inlogicIntroDone"));
    }, removeAt);
  })();

  /* ---------- Hero logo: preloader-style draw, then idle ---------- */
  (function initHeroLogoPulse() {
    const svg = document.querySelector(".hero-logo-live");
    if (!svg) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      svg.classList.add("is-ready");
      return;
    }

    const startSequence = function () {
      svg.classList.add("is-started");

      // After draw + routes + dots (~5.5 s from sequence start)
      setTimeout(function () {
        svg.classList.add("is-ready");
      }, 5500);

      // Rare soft glow on one route (12–16 s interval), no chaotic effects
      const routes = Array.from(svg.querySelectorAll(".hl-route"));
      if (routes.length) {
        setTimeout(function loop() {
          const r = routes[Math.floor(Math.random() * routes.length)];
          r.classList.remove("hl-glow");
          void r.offsetWidth;
          r.classList.add("hl-glow");
          setTimeout(function () {
            r.classList.remove("hl-glow");
          }, 2100);
          setTimeout(loop, 12000 + Math.random() * 4000);
        }, 6000);
      }
    };

    // If preloader is present — wait for it; otherwise start immediately
    if (document.getElementById("introScreen")) {
      window.addEventListener("inlogicIntroDone", startSequence, {
        once: true,
      });
    } else {
      startSequence();
    }
  })();
})();

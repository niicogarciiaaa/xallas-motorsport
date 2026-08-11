/* ==========================================================================
   XALLAS MOTORSPORT — interacciones
   Sin dependencias. Todo el movimiento respeta prefers-reduced-motion.
   ========================================================================== */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Navbar: estado al hacer scroll ─────────────────────────────────── */
  var nav = document.getElementById("nav");
  var onScroll = function () {
    nav.classList.toggle("is-stuck", window.scrollY > 24);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ── Menú móvil ─────────────────────────────────────────────────────── */
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");

  var closeMenu = function () {
    links.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menú");
  };

  toggle.addEventListener("click", function () {
    var open = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  });

  links.addEventListener("click", function (e) {
    if (e.target.closest("a")) closeMenu();
  });

  document.addEventListener("click", function (e) {
    if (!links.classList.contains("is-open")) return;
    if (!e.target.closest("#navLinks") && !e.target.closest("#navToggle")) closeMenu();
  });

  /* ── Revelado progresivo al entrar en pantalla ──────────────────────── */
  var reveals = document.querySelectorAll(".reveal");

  if (reduced || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    reveals.forEach(function (el) { revealObserver.observe(el); });

    // Lo que ya está en pantalla al cargar no espera al observador: así el
    // hero nunca aparece en blanco. Se repite tras 'load' porque las webfonts
    // cambian la maquetación y pueden subir elementos hasta la zona visible.
    var revealInView = function () {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      reveals.forEach(function (el) {
        if (el.getBoundingClientRect().top < vh * 0.95) el.classList.add("is-in");
      });
    };
    requestAnimationFrame(revealInView);
    window.addEventListener("load", revealInView);
  }

  /* ── Contadores de las estadísticas ─────────────────────────────────── */
  var counters = document.querySelectorAll("[data-count]");

  var runCounter = function (el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";

    if (reduced) {
      el.textContent = target + suffix;
      return;
    }

    var duration = 1500;
    var start = null;

    var step = function (ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);          // easeOutCubic
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  if (!("IntersectionObserver" in window)) {
    counters.forEach(runCounter);
  } else {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        countObserver.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) { countObserver.observe(el); });
  }

  /* ── Enlace activo según la sección visible ─────────────────────────── */
  var navAnchors = Array.prototype.slice.call(
    links.querySelectorAll('a[href^="#"]:not(.btn)')
  );
  var sections = navAnchors
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navAnchors.forEach(function (a) {
          a.classList.toggle(
            "is-current",
            a.getAttribute("href") === "#" + entry.target.id
          );
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ── Escape cierra el menú móvil ────────────────────────────────────── */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (links.classList.contains("is-open")) { closeMenu(); toggle.focus(); }
  });
})();

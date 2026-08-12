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

  /* ── Inclinación 3D de las tarjetas de piloto ───────────────────────── */
  var punteroFino = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (punteroFino && !reduced) {
    var GIRO = 7;     // grados máximos de inclinación
    var FONDO = 9;    // px que se desplazan dorsal y casco, en sentido contrario

    document.querySelectorAll(".driver").forEach(function (tarjeta) {
      var pendiente = null;

      tarjeta.addEventListener("pointermove", function (e) {
        if (pendiente) return;                       // como mucho un cálculo por fotograma
        pendiente = requestAnimationFrame(function () {
          pendiente = null;
          var r = tarjeta.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width;    // 0 a 1
          var y = (e.clientY - r.top) / r.height;

          tarjeta.style.setProperty("--ry", ((x - 0.5) * 2 * GIRO).toFixed(2) + "deg");
          tarjeta.style.setProperty("--rx", ((0.5 - y) * 2 * GIRO).toFixed(2) + "deg");
          // El brillo sigue al cursor
          tarjeta.style.setProperty("--mx", (x * 100).toFixed(1) + "%");
          tarjeta.style.setProperty("--my", (y * 100).toFixed(1) + "%");
          // Dorsal y casco van al revés que el giro: eso es lo que da la profundidad
          tarjeta.style.setProperty("--pnx", ((0.5 - x) * FONDO).toFixed(1) + "px");
          tarjeta.style.setProperty("--pny", ((0.5 - y) * FONDO).toFixed(1) + "px");
          tarjeta.style.setProperty("--phx", ((0.5 - x) * FONDO * 0.6).toFixed(1) + "px");
          tarjeta.style.setProperty("--phy", ((0.5 - y) * FONDO * 0.6).toFixed(1) + "px");
        });
      });

      tarjeta.addEventListener("pointerenter", function () {
        tarjeta.classList.add("is-tilting");
      });

      tarjeta.addEventListener("pointerleave", function () {
        if (pendiente) { cancelAnimationFrame(pendiente); pendiente = null; }
        // Se quita la clase para que la vuelta a su sitio sí vaya con transición
        tarjeta.classList.remove("is-tilting");
        ["--rx", "--ry", "--pnx", "--pny", "--phx", "--phy"].forEach(function (v) {
          tarjeta.style.removeProperty(v);
        });
      });
    });
  }

  /* ── Emblema del hero: sigue al ratón ───────────────────────────────── */
  var emblema = document.getElementById("heroEmblema");
  var hero = document.getElementById("hero");

  if (emblema && hero && punteroFino && !reduced) {
    var pendienteHero = null;

    hero.addEventListener("pointermove", function (e) {
      if (pendienteHero) return;
      pendienteHero = requestAnimationFrame(function () {
        pendienteHero = null;
        var r = hero.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        emblema.classList.add("is-tilting");
        emblema.style.setProperty("--ery", (x * 13).toFixed(2) + "deg");
        emblema.style.setProperty("--erx", (-y * 9).toFixed(2) + "deg");
      });
    });

    hero.addEventListener("pointerleave", function () {
      if (pendienteHero) { cancelAnimationFrame(pendienteHero); pendienteHero = null; }
      emblema.classList.remove("is-tilting");   // así vuelve con transición
      emblema.style.removeProperty("--ery");
      emblema.style.removeProperty("--erx");
    });
  }

  /* ── Un único bucle para todo lo que depende del scroll ─────────────── */
  /* Barra de progreso, parallax y dibujado del trazado se calculan juntos:
     con manejadores separados cada uno pediría su propio fotograma. */
  var barra = document.getElementById("progreso");
  var capas = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
  var trazado = document.querySelector(".track__linea");
  var bloqueTrazado = trazado && trazado.closest(".section--paper");
  var largo = 0;

  if (trazado) {
    largo = trazado.getTotalLength();
    trazado.style.strokeDasharray = largo;
    trazado.style.strokeDashoffset = reduced ? 0 : largo;
  }

  var enCola = false;

  var alScroll = function () {
    enCola = false;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var y = window.scrollY || document.documentElement.scrollTop;

    if (barra) {
      var alto = document.documentElement.scrollHeight - vh;
      barra.style.setProperty("--avance", alto > 0 ? Math.min(1, y / alto).toFixed(4) : 0);
    }

    if (!reduced) {
      capas.forEach(function (capa) {
        var r = capa.getBoundingClientRect();
        // Solo se mueve lo que está en pantalla
        if (r.bottom < -200 || r.top > vh + 200) return;
        var centro = r.top + r.height / 2 - vh / 2;
        // Siempre por variable: varias de estas capas ya usan transform para
        // colocarse, y asignarlo desde aquí las descolocaría.
        var d = (centro * parseFloat(capa.dataset.parallax)).toFixed(1);
        capa.style.setProperty("--pary", d + "px");
      });

      if (trazado && bloqueTrazado) {
        var rb = bloqueTrazado.getBoundingClientRect();
        // 0 cuando el bloque asoma por abajo, 1 cuando ya ha subido lo suficiente
        var p = Math.max(0, Math.min(1, (vh - rb.top) / (vh * 0.72 + rb.height * 0.45)));
        trazado.style.strokeDashoffset = largo * (1 - p);
      }
    }
  };

  var pedirScroll = function () {
    if (enCola) return;
    enCola = true;
    requestAnimationFrame(alScroll);
  };

  window.addEventListener("scroll", pedirScroll, { passive: true });
  window.addEventListener("resize", pedirScroll);
  alScroll();

  /* ── Escape cierra el menú móvil ────────────────────────────────────── */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (links.classList.contains("is-open")) { closeMenu(); toggle.focus(); }
  });
})();

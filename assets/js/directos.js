/* ==========================================================================
   XALLAS MOTORSPORT — directos de Twitch

   Sin dependencias y sin claves. La web es estática, así que el estado se
   consulta desde el navegador del visitante contra DecAPI, que devuelve
   texto plano y no exige registro:

     GET decapi.me/twitch/uptime/<canal>
       · emitiendo → "2 hours, 14 minutes"
       · apagado   → "<canal> is offline"

   Regla de honestidad: solo se afirma "en directo" cuando la respuesta es
   claramente una duración. Ante un error, una caída del servicio o una
   respuesta inesperada NO se dice que esté apagado — se admite que no se ha
   podido comprobar. Es preferible no saberlo a mentir en las dos direcciones.

   Ojo con los nombres de canal: uno mal escrito que exista en Twitch se ve
   igual que uno apagado, porque DecAPI responde "is offline" tanto para un
   canal parado como para uno que no existe.
   ========================================================================== */
(function () {
  "use strict";

  /* ──────────────────────────────────────────────────────────────────────
     CANALES — lo único que hay que editar en este archivo.

     "twitch" es el nombre de usuario tal y como aparece en la URL del canal:
     twitch.tv/ESTO. Respeta mayúsculas o no, da igual. Un piloto que no
     emita se deja con "" y sencillamente no aparece en la sección.
     ────────────────────────────────────────────────────────────────────── */
  var CANALES = [
    { nombre: "Jose Calvin",            dorsal: "08", twitch: "malarkey_33" },
    { nombre: "Jorge Ibarra",           dorsal: "11", twitch: "" },
    { nombre: "Manuel Muñiz",           dorsal: "13", twitch: "manuel_sdc" },
    { nombre: "Francisco Javier Otero", dorsal: "14", twitch: "ottedy" },
    { nombre: "Maria Montenegro",       dorsal: "21", twitch: "" },
    { nombre: "Nicolás García",         dorsal: "22", twitch: "" },
    { nombre: "Borex Cholakov",         dorsal: "25", twitch: "" },
    { nombre: "Juanma Sierra",          dorsal: "28", twitch: "" }
  ];

  var API = "https://decapi.me/twitch/";
  var REFRESCO = 120000;   // cada 2 min, y solo con la pestaña a la vista
  var ESPERA   = 8000;     // corta una petición colgada antes que dejar el "comprobando" eterno

  var seccion = document.getElementById("directos");
  var lista   = document.getElementById("directosLista");
  var resumen = document.getElementById("directosResumen");
  var panel   = document.getElementById("directosPlayer");
  var marco   = document.getElementById("directosMarco");
  var viendo  = document.getElementById("directosViendo");
  var enlace  = document.getElementById("directosTwitch");
  var cuerpo  = document.getElementById("directosCuerpo");
  if (!lista || !resumen || !panel || !window.fetch || !window.Promise) return;

  var activos = CANALES.filter(function (c) { return c.twitch; });

  /* DecAPI solo tiene dos respuestas buenas: una duración ("34 minutes",
     "2 hours, 14 minutes") o "<canal> is offline". Se comprueba primero la de
     apagado, porque si no un canal que se llamara literalmente "day" haría que
     "day is offline" colase como duración. Cualquier otra cosa —una caída, un
     límite de peticiones, una página de error— no se interpreta: se admite que
     no se sabe, en vez de darlo por apagado. */
  var APAGADO  = /\bis offline\b/i;
  var DURACION = /\b(second|minute|hour|day)s?\b/i;

  var pedir = function (ruta) {
    var ctrl = window.AbortController ? new AbortController() : null;
    var corte = ctrl && setTimeout(function () { ctrl.abort(); }, ESPERA);

    return fetch(API + ruta, ctrl ? { signal: ctrl.signal } : undefined)
      .then(function (r) { return r.ok ? r.text() : Promise.reject(new Error(r.status)); })
      .then(function (t) { return t.trim(); })
      .then(function (t) { if (corte) clearTimeout(corte); return t; },
            function (e) { if (corte) clearTimeout(corte); throw e; });
  };

  var consultar = function (canal) {
    return pedir("uptime/" + encodeURIComponent(canal.twitch)).then(function (texto) {
      if (APAGADO.test(texto))   return { estado: "off" };
      if (!DURACION.test(texto)) return { estado: "?" };

      /* Solo se piden título y juego de quien está emitiendo: son un par de
         peticiones extra sobre un servicio gratuito, no ocho más por gusto. */
      return Promise.all([
        pedir("title/" + encodeURIComponent(canal.twitch)).catch(function () { return ""; }),
        pedir("game/"  + encodeURIComponent(canal.twitch)).catch(function () { return ""; })
      ]).then(function (extra) {
        return { estado: "on", desde: texto, titulo: extra[0], juego: extra[1] };
      });
    }, function () {
      return { estado: "?" };
    });
  };

  /* DecAPI responde en inglés; la sección está en castellano. */
  var castellano = function (d) {
    return d
      .replace(/\bdays?\b/i,    "d")
      .replace(/\bhours?\b/i,   "h")
      .replace(/\bminutes?\b/i, "min")
      .replace(/\bseconds?\b/i, "s")
      .replace(/,\s*/g, " ");
  };

  /* ── Reproductor ─────────────────────────────────────────────────────────
     Uno solo para toda la sección: incrustar un iframe por piloto sería meter
     varios reproductores de vídeo en una página que ya pesa. */

  var sonando  = null;    // canal cargado ahora mismo
  var alaVista = false;   // la sección ha llegado a acercarse a la pantalla

  var montarIframe = function (canal) {
    /* Twitch exige declarar el dominio que incrusta. Se toma del propio
       navegador para que valga igual en local, en xallasmotorsport.com y en
       cualquier subdominio, sin listas que mantener. */
    var src = "https://player.twitch.tv/?channel=" + encodeURIComponent(canal.twitch) +
              "&parent=" + encodeURIComponent(location.hostname) +
              "&muted=true&autoplay=true";

    /* Si ya está puesto ese canal no se recrea: el refresco de cada dos
       minutos le cortaría el directo al que lo esté viendo. */
    var puesto = marco.firstChild;
    if (puesto && puesto.src === src) return;

    marco.textContent = "";
    var f = document.createElement("iframe");
    f.src = src;
    f.title = "Directo de " + canal.nombre + " en Twitch";
    f.setAttribute("allowfullscreen", "");
    f.setAttribute("scrolling", "no");
    marco.appendChild(f);
  };

  var marcarActiva = function () {
    var tarjetas = lista.querySelectorAll(".canal--vivo");
    Array.prototype.forEach.call(tarjetas, function (t) {
      var suya = !!sonando && t.getAttribute("data-canal") === sonando.twitch;
      t.classList.toggle("is-sonando", suya);
      t.setAttribute("aria-pressed", suya ? "true" : "false");
    });
  };

  var reproducir = function (canal) {
    sonando = canal;
    panel.hidden = false;
    if (cuerpo) cuerpo.classList.add("tiene-player");
    viendo.textContent = canal.nombre + " · @" + canal.twitch;
    enlace.href = "https://www.twitch.tv/" + encodeURIComponent(canal.twitch);
    marcarActiva();
    if (alaVista) montarIframe(canal);
  };

  var apagarPanel = function () {
    sonando = null;
    panel.hidden = true;
    if (cuerpo) cuerpo.classList.remove("tiene-player");
    marco.textContent = "";
  };

  /* El iframe no se crea hasta que la sección se acerca a la pantalla: quien
     no baje hasta aquí no se descarga un reproductor de vídeo. */
  if (window.IntersectionObserver && seccion) {
    var ojo = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        alaVista = true;
        ojo.disconnect();
        if (sonando) montarIframe(sonando);
      });
    }, { rootMargin: "300px" });
    ojo.observe(seccion);
  } else {
    alaVista = true;
  }

  /* ── Tarjetas ───────────────────────────────────────────────────────────
     Quien emite es un botón, porque manda sobre el reproductor de arriba;
     quien no, un enlace a su canal. La etiqueta correcta importa para el
     teclado y para los lectores de pantalla. */

  /* Todo el interior va en <span>: una tarjeta en directo es un <button>, y un
     botón solo admite contenido de frase — ni <p> ni <h3> serían válidos ahí.
     El nombre no pierde nada: el texto completo de la tarjeta ya es su nombre
     accesible, y el encabezado de la sección sigue siendo el <h2> de arriba. */
  var tarjeta = function (canal, info) {
    var vivo = info.estado === "on";
    var el = document.createElement(vivo ? "button" : "a");
    el.className = "canal canal--" + (vivo ? "vivo" : info.estado === "off" ? "apagado" : "duda");
    el.setAttribute("data-canal", canal.twitch);

    if (vivo) {
      el.type = "button";
      el.setAttribute("aria-pressed", "false");
      el.addEventListener("click", function () {
        alaVista = true;   // lo ha pedido a mano: se carga aunque el observador no haya saltado
        reproducir(canal);
        montarIframe(canal);
      });
    } else {
      el.href = "https://www.twitch.tv/" + encodeURIComponent(canal.twitch);
      el.target = "_blank";
      el.rel = "noopener";
    }

    var dorsal = document.createElement("span");
    dorsal.className = "canal__dorsal";
    dorsal.setAttribute("aria-hidden", "true");
    dorsal.textContent = canal.dorsal;
    el.appendChild(dorsal);

    var pill = document.createElement("span");
    pill.className = "canal__estado";
    if (vivo) {
      var pulso = document.createElement("i");
      pulso.className = "canal__pulso";
      pulso.setAttribute("aria-hidden", "true");
      pill.appendChild(pulso);
    }
    pill.appendChild(document.createTextNode(
      vivo ? "En directo" : info.estado === "off" ? "Desconectado" : "Sin comprobar"
    ));
    el.appendChild(pill);

    var nombre = document.createElement("span");
    nombre.className = "canal__nombre";
    nombre.textContent = canal.nombre;
    el.appendChild(nombre);

    if (vivo && info.titulo) {
      var titulo = document.createElement("span");
      titulo.className = "canal__titulo";
      titulo.textContent = info.titulo;
      el.appendChild(titulo);
    }

    var pie = document.createElement("span");
    pie.className = "canal__pie";
    if (vivo) {
      pie.textContent = (info.juego ? info.juego + " · " : "") + "lleva " + castellano(info.desde);
    } else if (info.estado === "off") {
      pie.textContent = "@" + canal.twitch;
    } else {
      pie.textContent = "No se ha podido consultar";
    }
    el.appendChild(pie);

    return el;
  };

  var pintar = function (resultados) {
    var vivos = resultados.filter(function (r) { return r.info.estado === "on"; });
    var dudas = resultados.filter(function (r) { return r.info.estado === "?"; });

    /* Quien emite manda: primero los directos, luego el resto en su orden. */
    var peso = { on: 0, off: 1, "?": 2 };
    resultados.sort(function (a, b) { return peso[a.info.estado] - peso[b.info.estado]; });

    lista.textContent = "";
    resultados.forEach(function (r) { lista.appendChild(tarjeta(r.canal, r.info)); });

    if (dudas.length === resultados.length) {
      resumen.textContent = "Ahora mismo no se puede consultar el estado de los canales.";
    } else if (vivos.length === 0) {
      resumen.textContent = "Ahora mismo no hay nadie emitiendo.";
    } else if (vivos.length === 1) {
      resumen.textContent = vivos[0].canal.nombre + " está en directo.";
    } else {
      resumen.textContent = vivos.length + " pilotos en directo.";
    }

    /* Si a quien se está viendo le sigue el directo, no se toca el
       reproductor: repintar cada dos minutos se lo cortaría por nada. */
    var sigue = !!sonando && vivos.some(function (r) { return r.canal.twitch === sonando.twitch; });
    if (sigue) marcarActiva();
    else if (vivos.length) reproducir(vivos[0].canal);
    else apagarPanel();

    lista.setAttribute("data-estado", "listo");
  };

  var refrescar = function () {
    return Promise.all(activos.map(function (canal) {
      return consultar(canal).then(function (info) { return { canal: canal, info: info }; });
    })).then(pintar);
  };

  if (!activos.length) {
    lista.setAttribute("data-estado", "sin-canales");
    resumen.textContent = "Todavía no hay canales configurados.";
    return;
  }

  refrescar();

  /* Con la pestaña en segundo plano no se consulta: nadie lo está mirando y
     el servicio es gratuito. Al volver, se refresca en el acto. */
  var reloj = setInterval(function () {
    if (document.visibilityState === "visible") refrescar();
  }, REFRESCO);

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") refrescar();
  });

  window.addEventListener("pagehide", function () { clearInterval(reloj); });
})();

#!/bin/bash
# ==========================================================================
#  Publica una carrera nueva en la web, preguntando los datos por consola.
#
#    ./nueva-carrera.sh
#
#  Pide la imagen (se arrastra a la ventana del Terminal), el nombre, la fecha
#  y, si quieres, los resultados. Luego la añade arriba del todo en la
#  sección de resultados de index.html, hace commit y la sube a GitHub.
# ==========================================================================
set -u -o pipefail
export LC_ALL="en_US.UTF-8"

cd "$(dirname "$0")" || exit 1

verde() { printf '\033[32m%s\033[0m\n' "$*"; }
error() { printf '\033[31m%s\033[0m\n' "$*" >&2; exit 1; }

rama="$(git symbolic-ref --short HEAD 2>/dev/null)"
[ "$rama" = "main" ] || error "El repo está en la rama '$rama'. Cámbiate a main antes (git switch main)."

# Escapa lo que se escribe para meterlo en el HTML sin romperlo
html() { printf '%s' "$1" | sed -e 's/&/\&amp;/g' -e 's/</\&lt;/g' -e 's/>/\&gt;/g' -e 's/"/\&quot;/g'; }

# "Spa-Francorchamps" → "spa-francorchamps"; "Nürburgring" → "nurburgring"
slug() {
  printf '%s' "$1" | iconv -f UTF-8 -t ASCII//TRANSLIT 2>/dev/null | tr -d "\"'^\`~" \
    | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//'
}

MESES=(enero febrero marzo abril mayo junio julio agosto septiembre octubre noviembre diciembre)

# ── Preguntas ─────────────────────────────────────────────────────────────
echo
echo "Nueva carrera para xallasmotorsport.com"
echo

while :; do
  read -r -p "Imagen (arrástrala aquí): " imagen
  # El Terminal la pega entre comillas o con las barras de los espacios (\ )
  imagen="$(printf '%s' "$imagen" | sed -E "s/^[[:space:]]+//; s/[[:space:]]+$//; s/^['\"]//; s/['\"]$//; s/\\\\(.)/\\1/g")"
  imagen="${imagen/#\~/$HOME}"
  [ -f "$imagen" ] && break
  echo "  No encuentro ese archivo, prueba otra vez."
done

while :; do
  read -r -p "Nombre de la carrera (p. ej. 12 Horas de Spa): " nombre
  [ -n "$nombre" ] && break
done

while :; do
  read -r -p "Fecha (dd/mm/aaaa, Enter = hoy): " fecha_txt
  if [ -z "$fecha_txt" ]; then fecha="$(date +%F)"; break; fi
  fecha="$(date -j -f %d/%m/%Y "$fecha_txt" +%F 2>/dev/null)" && break
  echo "  No entiendo esa fecha. Escríbela así: 20/11/2026"
done

read -r -p "Categoría (p. ej. GT3, Enter para saltar): " serie

echo
echo "Resultados, un coche cada vez. Enter en la posición para terminar."
marcas=""
resumen=""
while :; do
  read -r -p "  Posición (p. ej. 3, DNF, DSQ): " pos
  [ -z "$pos" ] && break
  pos="$(printf '%s' "$pos" | tr '[:lower:]' '[:upper:]')"
  [[ "$pos" =~ ^[0-9]+$ ]] && pos="P$pos"
  read -r -p "  Coche o equipo (Enter para saltar): " coche
  read -r -p "  Pilotos: " pilotos

  clase="marca"
  pos_html="$(html "$pos")"
  if ! [[ "$pos" =~ ^P[0-9]+$ ]]; then
    clase="marca marca--ret"
    case "$(printf '%s' "$pos" | tr '[:lower:]' '[:upper:]')" in
      DNF|RET|RET.) lector="Retirada" ;;
      DSQ)          lector="Descalificado" ;;
      DNS)          lector="No tomó la salida" ;;
      *)            lector="" ;;
    esac
    [ -n "$lector" ] && pos_html="<span aria-hidden=\"true\">$pos_html</span><span class=\"sr-only\">$lector</span>"
  fi
  equipo=""
  [ -n "$coche" ] && equipo="
              <span class=\"marca__equipo\">$(html "$coche")</span>"
  marcas="$marcas
          <li class=\"$clase\">
            <b class=\"marca__pos\">$pos_html</b>
            <span class=\"marca__texto\">$equipo
              $(html "$pilotos")
            </span>
          </li>"
  resumen="$resumen${resumen:+, }$pos"
  echo
done

# ── Resumen y confirmación ────────────────────────────────────────────────
IFS=- read -r a m d <<<"$fecha"
cuando="$((10#$d)) de ${MESES[$((10#$m - 1))]} de $a"

echo
echo "  Carrera:    $nombre"
echo "  Fecha:      $cuando"
[ -n "$serie" ]   && echo "  Categoría:  $serie"
[ -n "$resumen" ] && echo "  Resultado:  $resumen"
echo "  Imagen:     $(basename "$imagen")"
echo
read -r -p "¿Seguimos? Antes de publicar verás cómo queda [S/n] " ok
case "$ok" in [nN]*) echo "Cancelado, no se ha tocado nada."; exit 0 ;; esac

# ── El repo al día ────────────────────────────────────────────────────────
echo
echo "Actualizando el repo…"
git pull -q --rebase --autostash origin main || error "No se pudo actualizar el repo (git pull)."

# Copia de lo que se va a tocar, para dejarlo como estaba si al final no se
# publica (o se corta con Ctrl+C).
copia="$(mktemp -d)"
cp index.html sitemap.xml "$copia/"
servidor=""
parar_servidor() {
  [ -n "$servidor" ] || return 0
  kill "$servidor" 2>/dev/null
  wait "$servidor" 2>/dev/null   # sin esto bash avisa con un "Terminated"
  servidor=""
}
deshacer() {
  parar_servidor
  cp "$copia/index.html" "$copia/sitemap.xml" .
  rm -f "${destino:-}" index.html.tmp sitemap.xml.tmp
  rm -rf "$copia"
}
trap 'echo; deshacer; echo "Cortado, la web no ha cambiado."; exit 1' INT TERM

# ── La imagen ─────────────────────────────────────────────────────────────
destino="assets/img/resultados-$(slug "$nombre")-$fecha.jpg"
n=2
while [ -e "$destino" ]; do destino="assets/img/resultados-$(slug "$nombre")-$fecha-$n.jpg"; n=$((n + 1)); done

# Se reduce a 1600 px solo si es más grande: -Z también agrandaría las pequeñas
lado="$(sips -g pixelWidth -g pixelHeight "$imagen" 2>/dev/null | awk '/pixel(Width|Height)/ { if ($2 > m) m = $2 } END { print m + 0 }')"
reducir=()
[ "$lado" -gt 1600 ] && reducir=(-Z 1600)
sips -s format jpeg -s formatOptions 85 ${reducir[@]+"${reducir[@]}"} "$imagen" --out "$destino" >/dev/null \
  || error "No se pudo convertir la imagen."
ancho="$(sips -g pixelWidth "$destino" | awk '/pixelWidth/ {print $2}')"
alto="$(sips -g pixelHeight "$destino" | awk '/pixelHeight/ {print $2}')"

# ── La ficha en index.html ────────────────────────────────────────────────
linea_cuando="$cuando"
[ -n "$serie" ] && linea_cuando="$linea_cuando · $serie"
alt="${resumen:+$resumen, }resultado de $nombre en iRacing, $cuando. Xallas MotorSport."
lista=""
[ -n "$marcas" ] && lista="
        <ul class=\"marcas\">$marcas
        </ul>"

ficha="$(mktemp)"
cat >"$ficha" <<EOF
    <!-- ── $(html "$nombre") ── (añadida con nueva-carrera.sh) -->
    <article class="carrera">
      <div class="carrera__cabecera reveal">
        <div>
          <p class="carrera__cuando">$(html "$linea_cuando")</p>
          <h3 class="carrera__nombre">$(html "$nombre")</h3>
        </div>$lista
      </div>

      <img class="podio reveal" style="--d:120ms"
           src="$destino"
           width="$ancho" height="$alto" loading="lazy" decoding="async"
           alt="$(html "$alt")">
    </article>

EOF

# Va justo antes de la primera carrera de la sección: así queda la primera.
awk -v ficha="$ficha" '
  /id="resultado"/ { en_resultados = 1 }
  en_resultados && !hecho && /^    <!-- ── / {
    while ((getline l < ficha) > 0) print l
    hecho = 1
  }
  { print }
  END { if (!hecho) exit 1 }
' index.html >index.html.tmp || { rm -f index.html.tmp "$ficha" "$destino"; error "No encuentro dónde meter la carrera en index.html."; }
mv index.html.tmp index.html
rm -f "$ficha"

# La fecha del sitemap y la imagen nueva en él
sed -i '' -E "s#<lastmod>[0-9-]+</lastmod>#<lastmod>$(date +%F)</lastmod>#" sitemap.xml
awk -v l="    <image:image><image:loc>https://xallasmotorsport.com/$destino</image:loc></image:image>" \
  '/<\/url>/ && !h { print l; h = 1 } { print }' sitemap.xml >sitemap.xml.tmp && mv sitemap.xml.tmp sitemap.xml

# ── Vista previa ──────────────────────────────────────────────────────────
# La web tal cual quedaría, servida solo en este Mac: nadie más la ve.
echo
if command -v python3 >/dev/null 2>&1; then
  puerto=8765
  while lsof -nP -iTCP:"$puerto" -sTCP:LISTEN >/dev/null 2>&1; do puerto=$((puerto + 1)); done
  python3 -m http.server "$puerto" --bind 127.0.0.1 >/dev/null 2>&1 &
  servidor=$!
  sleep 1
  open "http://localhost:$puerto/#resultado"
  echo "Vista previa abierta en el navegador (http://localhost:$puerto/#resultado)."
else
  echo "No hay python3 para la vista previa; se publica sin ella."
fi

read -r -p "¿Se ve bien? ¿Lo publico? [S/n] " ok
parar_servidor
servidor=""
case "$ok" in
  [nN]*) deshacer; echo "Cancelado, la web no ha cambiado."; exit 0 ;;
esac
trap - INT TERM
rm -rf "$copia"

# ── Commit y push ─────────────────────────────────────────────────────────
mensaje="Añadir el resultado de $nombre"
git add -- "$destino" index.html sitemap.xml
git commit -q -m "$mensaje" -- "$destino" index.html sitemap.xml || error "No se pudo hacer el commit."
echo "Subiendo a GitHub…"
git push -q origin main || error "El commit está hecho pero no se pudo subir. Prueba luego con: git push"

echo
verde "Publicado. En un par de minutos estará en https://xallasmotorsport.com/#resultado"

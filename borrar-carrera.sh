#!/bin/bash
# ==========================================================================
#  Quita una carrera de la web.
#
#    ./borrar-carrera.sh
#
#  Enseña las carreras de la sección de resultados, preguntas cuál quitar y,
#  tras confirmarlo, la borra de index.html junto con sus imágenes (las que
#  no use ninguna otra carrera), hace commit y la sube a GitHub.
#  Nada se pierde del todo: sigue en el historial de git.
# ==========================================================================
set -u -o pipefail
export LC_ALL="en_US.UTF-8"

cd "$(dirname "$0")" || exit 1

verde() { printf '\033[32m%s\033[0m\n' "$*"; }
error() { printf '\033[31m%s\033[0m\n' "$*" >&2; exit 1; }

rama="$(git symbolic-ref --short HEAD 2>/dev/null)"
[ "$rama" = "main" ] || error "El repo está en la rama '$rama'. Cámbiate a main antes (git switch main)."

echo "Actualizando el repo…"
git pull -q --rebase --autostash origin main || error "No se pudo actualizar el repo (git pull)."

# Cada carrera va de su comentario "<!-- ── Nombre ──" a su "</article>".
# Sale una línea por carrera: inicio, fin, nombre y fecha, separados por tabs.
carreras="$(awk '
  function texto(s, clase) {
    sub(".*" clase "\">", "", s); sub("</.*", "", s)
    gsub("&amp;", "\\&", s); gsub("&lt;", "<", s); gsub("&gt;", ">", s); gsub("&quot;", "\"", s)
    return s
  }
  /id="resultado"/                      { dentro = 1 }
  dentro && /^<\/section>/              { dentro = 0 }
  dentro && !abierta && /^    <!-- ── / { abierta = 1; ini = NR; nombre = ""; cuando = "" }
  abierta && /carrera__nombre/          { nombre = texto($0, "carrera__nombre") }
  abierta && /carrera__cuando/          { cuando = texto($0, "carrera__cuando") }
  abierta && /^    <\/article>/         { print ini "\t" NR "\t" nombre "\t" cuando; abierta = 0 }
' index.html)"

[ -n "$carreras" ] || error "No encuentro ninguna carrera en index.html."

echo
echo "Carreras en la web (la más reciente, arriba):"
echo
i=0
while IFS=$'\t' read -r _ _ nombre cuando; do
  i=$((i + 1))
  printf '  %2d) %s  ·  %s\n' "$i" "$nombre" "$cuando"
done <<<"$carreras"
total=$i
echo

while :; do
  read -r -p "¿Cuál quitas? (número, Enter para salir): " num
  [ -z "$num" ] && { echo "No se ha tocado nada."; exit 0; }
  [[ "$num" =~ ^[0-9]+$ ]] && [ "$num" -ge 1 ] && [ "$num" -le "$total" ] && break
  echo "  Escribe un número del 1 al $total."
done

IFS=$'\t' read -r ini fin nombre cuando <<<"$(sed -n "${num}p" <<<"$carreras")"

read -r -p "¿Quitar «${nombre}» ($cuando) de la web? [s/N] " ok
case "$ok" in [sS]*) ;; *) echo "No se ha tocado nada."; exit 0 ;; esac

# Las imágenes de esa carrera, antes de quitarla
imagenes="$(sed -n "${ini},${fin}p" index.html | grep -o 'src="assets/img/[^"]*"' | sed 's/^src="//; s/"$//' | sort -u)"

# Fuera el bloque, y la línea en blanco que lo separaba del siguiente
awk -v ini="$ini" -v fin="$fin" '
  NR >= ini && NR <= fin { next }
  NR == fin + 1 && /^[[:space:]]*$/ { next }
  { print }
' index.html >index.html.tmp && mv index.html.tmp index.html

archivos=(index.html)
borradas=0
for img in $imagenes; do
  # Solo si ninguna otra parte de la web la usa
  grep -qF "$img" index.html && continue
  if git ls-files --error-unmatch "$img" >/dev/null 2>&1; then
    git rm -q -- "$img"
  else
    rm -f -- "$img"
  fi
  archivos+=("$img")
  borradas=$((borradas + 1))
  grep -vF "/$img<" sitemap.xml >sitemap.xml.tmp && mv sitemap.xml.tmp sitemap.xml
done

sed -i '' -E "s#<lastmod>[0-9-]+</lastmod>#<lastmod>$(date +%F)</lastmod>#" sitemap.xml
archivos+=(sitemap.xml)

git add -- index.html sitemap.xml   # las imágenes ya las ha quitado git rm
git commit -q -m "Quitar el resultado de $nombre" -- "${archivos[@]}" || error "No se pudo hacer el commit."
echo "Subiendo a GitHub…"
git push -q origin main || error "El commit está hecho pero no se pudo subir. Prueba luego con: git push"

echo
verde "Quitada «${nombre}» ($borradas imagen(es) borradas). En un par de minutos desaparece de la web."
echo "Si fue un error, se recupera con: git revert HEAD && git push"

# Identidad visual — Xallas MotorSport

Toda la paleta de la web procede de un muestreo del archivo del logo
(`WhatsApp Image 2026-08-10 at 16.26.33.jpeg`, 1227×795 px). No se ha elegido
ningún color por gusto, tendencia ni plantilla.

## 1. Cómo se analizó

Se cuantificó la imagen con Pillow en tres pasadas:

1. **Cuantización global** (median-cut, 16 colores) sobre la imagen completa.
2. **Cuantización sólo de la tinta**: se descartaron los píxeles casi blancos
   del fondo (84,8 % del archivo) y se cuantificó el 15,2 % restante.
3. **Muestreo por zonas**: promedios de parches de 12×12 px sobre los brazos
   del aspa, el casco, la visera, la bandera de cuadros y el logotipo.

## 2. Lo que dice el logo

El resultado más importante: **el verde de marca es de una consistencia
altísima**. Medido en el aspa, el casco, la visera y el texto, el tono se
mantiene siempre en **H ≈ 145–147°** (verde bosque / British racing green).
Eso es lo que hace reconocible la marca, y es el eje de todo el sistema.

| Zona del logo | HEX | HSL |
|---|---|---|
| Brazo superior del aspa (claro) | `#347B53` | H146 S41 L34 |
| Verde dominante de la tinta (15,9 %) | `#1E5A37` | H145 S50 L24 |
| Valor exacto más repetido | `#276B44` | H146 S47 L29 |
| Brazo inferior del aspa (oscuro) | `#174C2F` | H147 S54 L19 |
| Visera del casco | `#25603F` | H146 S44 L26 |
| Mezcla casco/bandera (apagado) | `#6A917B` | H146 S16 L49 |
| Negro del logotipo | `#1A1A19` | neutro L10 |
| Media del contorno oscuro | `#1C2520` | H147 S14 L13 |
| Brillo del casco (blanco verdoso) | `#CDD8D1` | H142 S12 L83 |
| Lienzo del archivo | `#FDFEFD` | blanco |

El aspa no es plana: lleva un **degradado de claro (arriba-izquierda) a oscuro
(abajo-derecha)**. Ese degradado se reutiliza en `--grad-x` (botones primarios,
primer cajón del podio, subrayados).

## 3. La paleta

Los tonos marcados *derivado* no son colores nuevos: son aclarados u
oscurecidos **sobre el mismo tono 146°**, generados para conseguir contraste
donde el verde original resultaba demasiado oscuro sobre fondo negro.

```
Verdes    950 #0A160F ·  900 #0F2418 ·  850 #123320   (derivados)
          800 #174C2F ·  700 #1E5A37 ·  600 #276B44 ·  500 #347B53   ← LOGO
          400 #3F8F62 ·  300 #55A87A ·  200 #74C79A            (derivados)
          100 #A3DFBD ·  050 #D8F0E2                           (derivados)
          sage #6A917B                                              ← LOGO

Neutros   950 #0B100D · 900 #0F1612 · 850 #141D18         (derivados)
          800 #181B19 · 750 #1C2520 · 700 #232C27              ← LOGO
          600 #2E3A33                                      (derivado)
          mist #CDD8D2 · paper #FDFEFD                         ← LOGO
```

Los neutros **no son grises puros**: llevan el mismo tono 146° con saturación
muy baja, igual que el contorno del propio logo (`#1C2520`). Es lo que evita
que la web se sienta como una plantilla oscura genérica con un logo encima.

### Roles semánticos (`assets/css/styles.css`)

| Token | Valor | Origen |
|---|---|---|
| `--primary` | `#1E5A37` | verde dominante del logo |
| `--secondary` | `#174C2F` | brazo oscuro del aspa |
| `--accent` | `#74C79A` | aclarado del mismo tono, para contraste sobre negro |
| `--background` | `#0B100D` | negro del logo, oscurecido |
| `--background-secondary` | `#0F1612` | derivado |
| `--surface` | `#141D18` | derivado |
| `--text` | `#FDFEFD` | blanco del logo |
| `--text-secondary` | `#CDD8D2` | brillo del casco |
| `--border` | `#232C27` | agrupación oscura del logo |

## 4. Contraste (WCAG AA)

Comprobado sobre los fondos reales de la web:

| Combinación | Ratio | |
|---|---|---|
| `paper` sobre fondo | 18,98 | AAA |
| `mist` sobre fondo | 13,10 | AAA |
| `accent` (200) sobre fondo | 9,49 | AAA |
| `green-300` sobre fondo | 6,64 | AA |
| `sage` sobre fondo | 5,44 | AA |
| `paper` sobre botón primario | 8,07 | AAA |
| `ink-950` sobre botón acento | 9,49 | AAA |
| `green-800` sobre banda clara | 9,84 | AAA |

Por eso el acento es un verde aclarado y no el verde original del logo: a
`#1E5A37` sobre negro le sobra marca pero le falta legibilidad (2,0:1).

## 5. Cómo se traduce el logo a interfaz

| Elemento del logo | Dónde aparece en la web |
|---|---|
| El aspa (X) | Marca de agua del hero y del CTA, fondo de las tarjetas de piloto, esquina cortada de las tarjetas |
| Ángulo del aspa (≈31° de la vertical) | `--x-skew: -14deg` en chips, badges, separadores y subrayados del menú |
| Degradado del aspa | Botón primario, primer cajón del podio, cifras de estadísticas |
| Bandera de cuadros | Bandas separadoras, línea del navbar al fijarse, pie de las tarjetas de piloto, riel de la hoja de ruta, **paradas en boxes** de la barra de carrera y franja de la tarjeta social |
| Tres barras de la visera | Marcador de los antetítulos (`///`), visera de los cascos y viñetas de las fases de carrera |
| Trazos de velocidad | Líneas animadas del hero, barrido diagonal al pasar por los botones |
| Contorno negro de cada forma | Borde oscuro de todas las tarjetas y contorno de los SVG |
| Lienzo blanco del archivo | Sección **Hoja de ruta**, planteada como un plan impreso |
| Versalitas del logotipo | Logotipo del navbar, compuesto en HTML (inicial grande + caja menor) |

## 6. Tipografía

- **Archivo** (700–900), en mayúsculas y con tracking cerrado, para titulares:
  es la grotesca pesada y ligeramente cuadrada que más se acerca al logotipo.
- **Barlow** para el texto corrido y los datos, con cifras tabulares en tablas
  y estadísticas.

## 7. Archivos del logo

**El archivo original no se ha modificado** (sigue en la raíz, intacto). En
`assets/img/` hay derivados generados a partir de él:

| Archivo | Uso |
|---|---|
| `logo-mark.png` | Emblema (aspa + casco) con fondo transparente. Navbar, hero, pie |
| `logo-full.png` | Lockup completo transparente |
| `logo-wordmark.png` | Sólo el logotipo |
| `favicon.ico`, `favicon-512.png`, `apple-touch-icon.png` | Iconos |
| `og-card.png` | Tarjeta 1200×630 al compartir el enlace |
| `logo-original.jpg` | Copia del original |

La tarjeta social se compone con el emblema sobre el fondo de marca, el mismo
resplandor verde del hero, el aspa de marca de agua y la franja de cuadros. El
cuerpo del logotipo se calcula solo para que nunca toque el borde derecho.

> **Sin dominio todavía:** las rutas de `og:image`, `twitter:image` y el JSON-LD
> son **relativas** a propósito. Un dominio inventado haría que la miniatura no
> cargase en ningún sitio, así que es mejor esto: casi todos los rastreadores
> actuales resuelven la ruta relativa contra la URL de la página. Ver §10.

El fondo se recortó con relleno por inundación desde los bordes, de modo que
los blancos **interiores** (brillos del casco, cuadros de la bandera) siguen
siendo opacos, y los bordes conservan el antialiasing.

> Nota: en `logo-full.png` la palabra «Sport» y «Since 2026» son negras, así que
> ese archivo sólo funciona sobre fondo claro. Por eso el navbar usa el emblema
> más el logotipo compuesto en HTML, y no la imagen completa.

## 8. Estructura y contenido pendiente

La web está planteada para una escudería que **arranca sin palmarés**, que
**sólo corre resistencia** y **sólo en iRacing (PC)**. Tres consecuencias de
fondo:

- No hay cifras de carreras, podios ni victorias en ninguna parte, porque
  todavía no existen.
- No hay captación: el equipo está cerrado. No aparece ningún «únete»,
  «plaza abierta» ni proceso de selección.
- No se menciona ninguna otra plataforma ni ninguna categoría de sprint.

Secciones: Hero → Cifras de arranque → Equipo → Pilotos → Resistencia →
Hoja de ruta → Contacto.

Contenido **de ejemplo**, marcado con comentarios en `index.html`:

- **Pilotos**: los 8 nombres, dorsales y etiquetas. La rejilla está calculada
  (`minmax(262px, 1fr)`) para que los 8 caigan en dos filas exactas a ancho
  completo; si cambia el número de pilotos, revisa ese valor. Para poner foto,
  sustituye el bloque `.driver__photo` por una `<img>` con la misma proporción.
- **Cifras**: `data-count` en las dos primeras `.stat` (año y pilotos). La
  tercera es `.stat--text`: muestra «iRacing» en vez de un número, con cuerpo
  reducido para que quepa en la columna, y por eso no lleva contador.
- **Resistencia**: el coche, su ficha técnica y los cuatro datos de
  `.facts` (duración, stint, pilotos por coche, objetivo).
- **Anatomía de una carrera**: el ejemplo es una prueba de seis horas. El ancho
  de cada stint sale de `style="--w:25"`; los valores son proporciones entre sí,
  no horas, así que basta con que sumen algo coherente. Si cambias el número de
  stints, revisa también las etiquetas de `.race__hours`.
- **Síguenos**: los tres `.follow__item` y los iconos del pie llevan `href="#"`.
  **Hay que poner las URLs reales de Discord, Twitch y YouTube** o quitar los
  que no se usen.
- **Hoja de ruta**: fechas y, sobre todo, el `data-state` de cada hito —
  `done` (tachado), `now` (el actual, con pulso) o `next`.
- **Contacto**: `info@xallasmotorsport.com` y los enlaces sociales (`href="#"`).

### Cuando lleguen los primeros resultados

La sección **Hoja de ruta** lleva un aviso (`.note`) que anticipa que ese será
el sitio de la hoja de tiempos. Cuando se dispute la primera carrera, ahí van
ronda, circuito, salida, posición final y mejor vuelta.

La galería se retiró por no tener fotos todavía; cuando las haya, es el momento
de volver a montarla.

## 9. Comprobación

`assets/js/main.js` no tiene dependencias. Comprobado en Chrome (1440 y 390 px):
navbar fija, contadores, scrollspy, menú móvil, 45/45 animaciones de entrada,
0 anclas rotas y 0 errores de consola. Sin JavaScript la web se ve entera: la
clase `js` del `<html>` es la que activa el ocultado inicial.

## 10. Publicación y URLs

La web vive en **GitHub Pages**, servida desde `main`:

    https://niicogarciiaaa.github.io/xallas-motorsport/

Pages sólo sirve archivos estáticos —no ejecuta Python ni ningún lenguaje de
servidor— y a esta web le sobra con eso: no tiene backend. El
`python -m http.server` del README es únicamente para verla en local.

Todas las rutas internas son **relativas**, así que el sitio funciona igual
colgando de la raíz de un dominio que del subdirectorio `/xallas-motorsport/`.
Comprobado sirviéndolo bajo ese subdirectorio: los seis recursos responden 200
y no hay ningún enlace roto.

Las URLs **absolutas** aparecen sólo donde los rastreadores las necesitan, y son
cinco:

| Dónde | Etiqueta |
|---|---|
| `<head>` | `<link rel="canonical">` |
| `<head>` | `og:url` |
| `<head>` | `og:image` |
| `<head>` | `twitter:image` |
| JSON-LD | `url`, `logo` e `image` |

### Si algún día hay dominio propio

Cambiar esas cinco por el dominio nuevo y, en GitHub, **Settings → Pages →
Custom domain**. Nada más: el resto del sitio no sabe dónde está alojado.

Para comprobar que la miniatura sale bien, pega el enlace en un canal de
Discord: es el rastreador más rápido de los tres. Si ya lo habías compartido
antes de un cambio, usa el depurador de Facebook o `?v=2` al final de la URL
para saltarte su caché.

### Correo pendiente

`info@xallasmotorsport.com` aparece en el botón «Escríbenos» y en el pie, pero
**ese buzón no existe** mientras no haya dominio. Hasta entonces conviene poner
un correo real o sustituir el botón por el enlace de Discord. Está marcado con
comentarios `OJO:` en el HTML. Por eso también se ha quitado el campo `email`
del JSON-LD: mejor no declarar un contacto que rebota.

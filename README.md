# Xallas MotorSport

Web de la escudería **Xallas MotorSport** — simracing de resistencia y sprint en iRacing,
fundada en 2026 en la comarca del Xallas (Galicia).

HTML, CSS y JavaScript sin dependencias ni compilación: no hay `npm install` ni
paso de build. Se abre y funciona.

**→ [Ver la web](https://xallasmotorsport.com/)**

## Verla en local

Basta con abrir `index.html` en el navegador, sin más.

Si prefieres servirla como en producción, cualquier servidor estático vale:

```bash
python -m http.server 5173
```

Y entrar en `http://localhost:5173`.

> Ese Python es **solo una comodidad para desarrollo**. La web no ejecuta nada
> en el servidor: son archivos estáticos. Por eso funciona en GitHub Pages, que
> no ejecuta Python ni ningún otro lenguaje de servidor.

## Publicación

Está en GitHub Pages, servida desde la rama `main`, con el dominio propio
**xallasmotorsport.com** (archivo `CNAME`). La dirección antigua de github.io
redirige sola al dominio. Cualquier `push` a `main` se publica en un par de
minutos.

Para activarlo (una única vez): **Settings → Pages → Source: Deploy from a
branch → Branch: `main` / `(root)` → Save**.

Todas las rutas del proyecto son relativas, así que funciona igual en la raíz
de un dominio que en el subdirectorio `/xallas-motorsport/` de Pages.

## Visitas

Las cuenta [GoatCounter](https://www.goatcounter.com), gratis para webs sin
ánimo de lucro. El panel es privado:
**<https://xallasmotorsport.goatcounter.com>**. Ahí salen las visitas por día,
el país, desde qué enlace llegan (Instagram, X…) y el dispositivo. En la web no
se muestra ningún contador.

No usa cookies ni guarda datos personales, así que no hace falta banner de
consentimiento. Las visitas desde `localhost` o abriendo el archivo no cuentan.

## Estructura

```
index.html                 Toda la página
404.html                   Página de error de GitHub Pages
site.webmanifest           Icono y color al guardar en el móvil
robots.txt, sitemap.xml    Para buscadores
CNAME                      Dominio propio de GitHub Pages
BRANDING.md                De dónde sale cada color, y qué queda pendiente
assets/
  css/styles.css           Sistema visual completo, con los tokens arriba
  css/fonts.css            Archivo y Barlow, servidas desde aquí
  fonts/                   Las tipografías (.woff2) y su licencia OFL
  js/main.js               Navbar, contadores, scrollspy y menú móvil
  js/directos.js           Aviso de quién está en directo en Twitch
  img/                     Logo, iconos, tarjeta social, patrocinadores
                           y los carteles y fotos de cada carrera
WhatsApp Image 2026-…jpeg  Logo original, sin modificar
```

Las imágenes en bruto (capturas de iRacing, carteles a tamaño completo,
logos recibidos) van en `originales/`, que **no se sube**: está en el
`.gitignore`. Ahí se guardan por carrera; a la web solo pasan las versiones
convertidas.

## Añadir una carrera

**Lo rápido**, solo con la imagen del resultado:

```bash
./nueva-carrera.sh
```

Pregunta por consola la imagen (se arrastra a la ventana), el nombre, la
fecha, la categoría y los resultados; la pone la primera en la sección y la
sube a GitHub. Se ejecuta desde el repo, en `main`.

**Con fotos y galería**, a mano:

1. Guardar el cartel y las capturas en `originales/<carrera>/`.
2. Convertirlos a JPG en `assets/img/`: el cartel con su tamaño
   (`resultados-<carrera>-<año>.jpg`) y las fotos a 1400 px de ancho
   (`<carrera>-<coche>-<algo>.jpg`). En macOS vale `sips`:

   ```bash
   sips -s format jpeg -s formatOptions 80 -Z 1400 originales/nurburgring/foto.webp --out assets/img/nurburgring-porsche-foto.jpg
   ```

3. En `index.html`, sección `#resultado`, copiar la `<article class="carrera">`
   más reciente, pegarla la primera y cambiar fecha, nombre, posiciones,
   pilotos, imágenes (con su `width`/`height` reales y un `alt` que diga el
   resultado) y el enlace a la noticia.
4. Actualizar la entradilla de la sección y el `lastmod` de `sitemap.xml`.

## Identidad visual

**Todos los colores salen de un muestreo del archivo del logo**, no de una
plantilla. El verde de marca es de una consistencia notable — tono H ≈ 146° en
el aspa, el casco, la visera y el logotipo — y ese tono es el eje de toda la
paleta, incluidos los neutros.

El detalle del análisis, la paleta, los contrastes comprobados y cómo se
traduce cada elemento del logo a la interfaz están en
**[BRANDING.md](BRANDING.md)**.

## Pendiente

- [ ] Nombres, dorsales y fotos reales de los 8 pilotos (ahora son de ejemplo)
- [ ] Ficha técnica real del coche
- [ ] Duración y formato de las carreras sprint (las cuatro cifras de `.facts`
      son de resistencia y van etiquetadas como tales)
- [ ] Saber qué canal de Twitch es de cada piloto, para enlazarlos desde su
      ficha en vez de sueltos en el bloque de contacto

## Accesibilidad y rendimiento

Contraste AA comprobado sobre los fondos reales, navegación por teclado con
foco visible, `prefers-reduced-motion` respetado y la web es legible aunque el
JavaScript no llegue a ejecutarse.

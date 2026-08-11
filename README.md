# Xallas MotorSport

Web de la escudería **Xallas MotorSport** — simracing de resistencia en iRacing,
fundada en 2026 en la comarca del Xallas (Galicia).

HTML, CSS y JavaScript sin dependencias ni compilación: no hay `npm install` ni
paso de build. Se abre y funciona.

**→ [Ver la web](https://niicogarciiaaa.github.io/xallas-motorsport/)**

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

Está en GitHub Pages, servida desde la rama `main`. Cualquier `push` a `main`
se publica solo en un par de minutos.

Para activarlo (una única vez): **Settings → Pages → Source: Deploy from a
branch → Branch: `main` / `(root)` → Save**.

Todas las rutas del proyecto son relativas, así que funciona igual en la raíz
de un dominio que en el subdirectorio `/xallas-motorsport/` de Pages.

## Estructura

```
index.html                 Toda la página
site.webmanifest           Icono y color al guardar en el móvil
BRANDING.md                De dónde sale cada color, y qué queda pendiente
assets/
  css/styles.css           Sistema visual completo, con los tokens arriba
  js/main.js               Navbar, contadores, scrollspy y menú móvil
  img/                     Logo recortado, iconos y tarjeta social
WhatsApp Image 2026-…jpeg  Logo original, sin modificar
```

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
- [ ] URLs de Discord, Twitch y YouTube (ahora `href="#"`)
- [ ] Correo de contacto que exista — `info@xallasmotorsport.com` aún no
- [ ] Si se compra dominio: cambiar las cuatro URLs del `<head>` y la del
      JSON-LD (ver BRANDING.md §10)

## Accesibilidad y rendimiento

Contraste AA comprobado sobre los fondos reales, navegación por teclado con
foco visible, `prefers-reduced-motion` respetado y la web es legible aunque el
JavaScript no llegue a ejecutarse.

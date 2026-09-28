# El Viaje Seguro

Blog de viajes hecho con [Astro](https://astro.build) y desplegado en Netlify. Dominio: **elviajeseguro.com**.

La web tiene **las 1.364 URLs** de la arquitectura SEO (home → hubs → continentes → países → ciudades → satélites) y **cada página tiene su propio archivo** en `src/content/`:

- **21 guías ya redactadas** (Portugal, el silo completo de Oporto, octubre, noviembre, seguro de viaje, maleta, hubs y páginas legales). Se publican normales y entran en el `sitemap.xml`.
- **1.341 borradores** con `draft: true`, que ya traen título, meta description, keyword y el esquema de encabezados con los enlaces internos obligatorios. En la web salen como "Próximamente", con `noindex` y fuera del sitemap. Así el enlazado interno existe desde el primer día sin que Google vea contenido vacío.

---

## 1. Subir el proyecto a GitHub con GitHub Desktop

Son unos 1.400 archivos, y la subida desde la web de GitHub solo admite 100 por vez. Por eso lo más fácil es **GitHub Desktop** (gratis, no hace falta saber Git):

1. Descarga e instala GitHub Desktop desde [desktop.github.com](https://desktop.github.com) e inicia sesión con tu cuenta de GitHub.
2. Descomprime el ZIP, por ejemplo en `Documentos\elviajeseguro`.
3. En GitHub Desktop: **File → Add local repository** → elige la carpeta `elviajeseguro`.
   - El proyecto ya viene con el historial de Git preparado, así que lo reconoce directamente.
4. Pulsa **Publish repository**:
   - Nombre: `elviajeseguro`.
   - Marca o desmarca "Keep this code private", como prefieras.
   - Pulsa **Publish repository**.
5. Listo: el repositorio completo está en tu GitHub.

A partir de ahí, cada vez que cambies un archivo en tu ordenador: GitHub Desktop → escribe un resumen → **Commit to main** → **Push origin**. Netlify publica los cambios en 1-2 minutos.

## 2. Publicar en Netlify

1. Entra en [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project** → **GitHub**.
2. Autoriza a Netlify y elige el repositorio `elviajeseguro`.
3. La configuración se detecta sola gracias a `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Pulsa **Deploy**. En 1-2 minutos tendrás la web en una dirección tipo `xxxx.netlify.app`.

## 3. Conectar el dominio (ya comprado en Netlify)

1. En el sitio de Netlify: **Domain management** → **Add a domain** → escribe `elviajeseguro.com`. Como lo compraste en Netlify, lo reconoce y lo conecta solo (DNS incluido).
2. Marca `elviajeseguro.com` como **primary domain**. La versión `www` redirige sola a la principal.
3. En **HTTPS**, pulsa **Verify DNS configuration** y después **Provision certificate** (Let's Encrypt, gratis). Puede tardar unos minutos en activarse.
4. Si más adelante compras `elviajeseguro.es` en un registrador español, añádelo como *domain alias* para que redirija al `.com`.
5. El dominio caduca el **28/09/2027**. Activa la renovación automática en Netlify → *Domains*.

## 4. Después de publicar

- **Google Search Console**: añade `elviajeseguro.com` y envía `https://elviajeseguro.com/sitemap.xml`.
- **Formulario de contacto**: funciona con Netlify Forms. Los mensajes aparecen en Netlify → *Forms*. Activa ahí las notificaciones por email.
- **Textos legales**: rellena los datos entre corchetes (`[NOMBRE Y APELLIDOS]`, `[NIF]`, `[DIRECCIÓN]`, `[EMAIL]`) en:
  - `src/content/aviso-legal.md`
  - `src/content/politica-de-privacidad.md`

---

## Cómo publicar una guía

Todas las páginas ya tienen su archivo. La **ruta del archivo es la URL**:

| URL | Archivo |
|---|---|
| `/europa/portugal/lisboa/` | `src/content/europa/portugal/lisboa/index.md` |
| `/europa/portugal/lisboa/que-ver/` | `src/content/europa/portugal/lisboa/que-ver.md` |
| `/cuando-viajar/diciembre/` | `src/content/cuando-viajar/diciembre.md` |

Cada borrador empieza así:

```markdown
---
title: "Qué ver en Lisboa: imprescindibles"
description: "Meta description ya redactada con la keyword."
summary: ""
keyword: "que ver en lisboa"
updated: ""
draft: true
---
```

Para publicarla:

1. Abre el archivo (en GitHub: botón del lápiz ✏️; en tu ordenador: con el Bloc de notas o VS Code).
2. Sustituye el esquema de encabezados por el artículo, manteniendo los enlaces internos que trae.
3. Rellena `summary` (entradilla) y `updated` (fecha `AAAA-MM-DD`).
4. Cambia `draft: true` por `draft: false`.
5. Guarda y haz commit. Netlify republica la web solo.

En cuanto `draft` es `false`:

- La página deja de ser "Próximamente".
- Se quita el `noindex`.
- Entra en el sitemap.
- Aparece en "Recién actualizadas" de la home.

Otros campos opcionales:

```markdown
featured: true      # aparece en "Guías destacadas" de la home (para pilares)
facts:              # la "Ficha clara" de la columna lateral
  - { label: "Días ideales", value: "3–4 días" }
  - { label: "Mejor época", value: "Primavera y otoño" }
```

El enlazado interno obligatorio se genera solo:

- Breadcrumbs con schema.
- Bloque "Planifica [ciudad]".
- Guías del país.
- "Antes de viajar" (seguro, eSIM, requisitos, maleta).
- Meses anteriores y siguientes.

Tú solo añades los enlaces contextuales dentro del texto.

## Imágenes: cómo añadirlas optimizadas

La web optimiza las fotos sola al compilar:

- Genera versiones **AVIF y WebP** en varios tamaños.
- Añade `width` y `height` para evitar saltos de maquetación (CLS).
- Aplica **carga diferida** (`lazy`) a las imágenes del cuerpo.
- Da **carga prioritaria** a la foto de portada, que es la que cuenta para el LCP.

Sube las fotos originales (JPG, cualquier tamaño razonable, idealmente de 1600 px de ancho o más) y no te preocupes por comprimirlas.

**Foto de portada** (aparece bajo el título, en las tarjetas, al compartir en redes y en los datos estructurados):

1. Guarda la foto en `src/assets/images/`, con la misma ruta que la guía y un nombre descriptivo, por ejemplo `src/assets/images/europa/portugal/oporto/ribeira-oporto-atardecer.jpg`.
2. En el frontmatter de la guía:
   ```markdown
   image: "europa/portugal/oporto/ribeira-oporto-atardecer.jpg"
   imageAlt: "Casas de colores de la Ribeira de Oporto junto al río Duero al atardecer"
   imageCaption: "La Ribeira desde el puente Luís I"   # opcional
   ```

**Fotos dentro del artículo**: guárdalas en la misma carpeta que el `.md` y enlázalas así:

```markdown
![Vestíbulo de la estación de São Bento cubierto de azulejos azules](./estacion-sao-bento-azulejos.jpg)
```

**Cómo escribir un buen texto alternativo (alt):**

- Describe lo que se ve y dónde: *"Tranvía amarillo 28 subiendo por una calle de Alfama, en Lisboa"*.
- Incluye el destino de forma natural, sin repetir la keyword ni meter listas de palabras.
- Máximo unos 125 caracteres. No empieces por "Imagen de…" ni "Foto de…".
- Nombre de archivo en minúsculas, sin acentos y con guiones: `alfama-tranvia-28-lisboa.jpg`.

Si falta la foto o el `imageAlt`, la compilación se detiene y te dice qué falta, para que nunca se publique una imagen sin alt.

Usa **fotos propias** o con licencia que permita su uso (y cita al autor si la licencia lo exige). Las fotos propias son además lo que más pesa en Google para demostrar experiencia real.

## SEO técnico incluido

- **Title**: se añade " | El Viaje Seguro" solo si el título cabe en 60 caracteres. Si no, usa `seoTitle` (versión corta) o el título solo.
- **Meta description** entre 120 y 160 caracteres en todas las páginas (ya redactada en los borradores).
- **Canonical**, `hreflang="es"`, `robots` con `max-image-preview:large` en las páginas publicadas y `noindex, follow` en los borradores.
- **Open Graph y Twitter Card** con imagen de 1200 px (la portada de la guía o, si no tiene, la imagen de marca `public/og-default.jpg`), fechas de publicación y modificación, y sección.
- **Datos estructurados (schema.org)** en un único `@graph` por página:

| Página | Schema |
|---|---|
| Todas | `Organization` (con logo), `WebSite`, `BreadcrumbList`, `ImageObject` |
| Home | `WebPage` + `ItemList` de guías destacadas |
| Hubs y destinos sin guía | `CollectionPage` + `ItemList` de sus páginas |
| Guías de país, comunidad y ciudad | `Article` + `about: TouristDestination` (con su país) + `ItemList` |
| Guías prácticas (qué ver, comer, dormir…) | `Article` + `about: TouristDestination` |
| Calendario, consejos y rankings | `Article` |
| Sobre mí / Contacto | `AboutPage` / `ContactPage` |

No se usa `FAQPage` ni `HowTo` porque Google ya no muestra esos resultados enriquecidos para webs de este tipo.

**Autor (importante para E-E-A-T):** en `src/lib/site.ts` rellena:

```ts
author: { name: 'Tu nombre', url: '/sobre-mi/', sameAs: ['https://www.instagram.com/tu_cuenta'] },
```

Así cada guía mostrará "Por [tu nombre]" y el schema `Article` tendrá un autor `Person` en lugar de la marca.

Después de publicar, comprueba algunas URLs en la [prueba de resultados enriquecidos de Google](https://search.google.com/test/rich-results).

## Enlaces a los seguros de Iris Global

Se enlazan **dentro del texto, con enlace normal (*follow*)**, solo cuando el tema lo pide, como haría cualquier blog de viajes al recomendar un seguro.

| Seguro | URL | Cuándo enlazarlo |
|---|---|---|
| Seguro de viaje | https://www.irisglobal.es/particulares/seguros-viajes/seguro-viaje | Guías de país (apartado "Antes de viajar"), requisitos, seguro de cancelación, qué llevar en la maleta, viajar con niños, seguro de viaje por país |
| Deportivo | https://www.irisglobal.es/particulares/seguros-viajes/deportivo | Seguro para deportes y aventura; destinos de nieve, montaña o buceo (Dolomitas, Andorra, Azores, Reikiavik, Khao Sok, Palawan, Cusco, Auckland) |
| Estudiantes | https://www.irisglobal.es/particulares/seguros-viajes/para-estudiantes | Estudiar en el extranjero |
| Mascotas | https://www.irisglobal.es/particulares/seguros-viajes/seguro-viaje-mascotas | Viajar con mascotas |

**Dónde están ya:**

- Seguro de viaje: los cuatro, en "Seguro de viaje según tu tipo de viaje".
- Guía de Portugal: en "Antes de viajar".
- Qué llevar en la maleta: al final.
- Borradores: los 120 donde aplica llevan en la cabecera la nota con el enlace a incluir al redactarlos.

**Pautas para que queden naturales:**

- **Un enlace por guía**, en la frase donde se habla del seguro. Nunca en menú, pie de página ni bloques repetidos.
- **Anchors variados**: alterna marca, genérico y descriptivo. Por ejemplo:
  - "seguro de viaje de Iris Global"
  - "un seguro con asistencia 24 horas"
  - "seguro para viajar al extranjero"

  Tienes la lista de anchors por producto en `src/lib/partners.ts`.
- **No lo enlaces en guías donde no se habla de seguros** (qué ver, dónde comer…). Ahí el enlace no aporta y parece forzado.

## Cómo añadir un destino que no está en la arquitectura

La lista de URLs está en `src/data/architecture.json`. Copia un bloque de una ciudad parecida, cambia `url`, `name`, `title`, `keyword` y `parent`, y añade también sus 5 satélites (`que-ver`, `en-3-dias`, `donde-comer`, `donde-alojarse`, `cuando-ir`). Después crea sus archivos `.md` en `src/content/` copiando un borrador parecido.

## Estructura del proyecto

```
src/
  content/        ← artículos en Markdown (la ruta = la URL)
  data/           ← architecture.json: las 1.364 URLs de la web
  lib/site.ts     ← lógica de enlazado interno, indexación y sitemap
  pages/          ← plantillas (home, catch-all de guías, contacto, 404, sitemap, robots)
  components/     ← cabecera, pie, tarjetas, ficha clara, bloques de enlaces
  styles/         ← estilos globales
public/           ← favicon y archivos estáticos (aquí irán las fotos)
netlify.toml      ← configuración de Netlify (build, redirecciones, cabeceras)
```

## Trabajar en local (opcional)

Solo si algún día instalas Node.js 22 o superior:

```
npm install
npm run dev      # http://localhost:4321
npm run build    # genera /dist
```

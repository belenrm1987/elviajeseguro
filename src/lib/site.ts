// Núcleo de la web: arquitectura de URLs, contenido y reglas de enlazado.
import arch from '../data/architecture.json';

export const SITE = {
  name: 'El Viaje Seguro',
  url: 'https://elviajeseguro.com',
  tagline: 'Guías de viaje claras: qué ver, cuándo ir y cómo organizarlo, sin rodeos.',
  lang: 'es-ES',
  /** Autor de las guías (E-E-A-T). Si dejas name vacío, el autor en los datos estructurados será la marca. */
  author: { name: '', url: '/sobre-mi/', sameAs: [] as string[] },
  logo: '/logo.png',
  ogDefault: { src: '/og-default.jpg', width: 1200, height: 630, alt: 'El Viaje Seguro: guías de viaje prácticas para viajar sobre seguro' },
};

export type Node = {
  url: string;
  name: string;
  title: string;
  keyword: string;
  type: string;
  parent: string;
  silo: string;
  level: number;
  phase: number;
};

export type Entry = {
  url: string;
  frontmatter: {
    title?: string;
    description?: string;
    updated?: string;
    summary?: string;
    facts?: { label: string; value: string }[];
    featured?: boolean;
    draft?: boolean;
    keyword?: string;
    seoTitle?: string;
    published?: string;
    image?: string;
    imageAlt?: string;
    imageCaption?: string;
  };
  Content: any;
};

export const NODES: Node[] = arch as Node[];
const BY_URL = new Map(NODES.map((n) => [n.url, n]));
const CHILDREN = new Map<string, Node[]>();
for (const n of NODES) {
  if (!CHILDREN.has(n.parent)) CHILDREN.set(n.parent, []);
  CHILDREN.get(n.parent)!.push(n);
}

// ---------- Contenido (Markdown en src/content, espejo de las URLs) ----------
const modules = import.meta.glob('../content/**/*.md', { eager: true }) as Record<string, any>;
// Los archivos con `draft: true` son borradores: la página sale como "Próximamente" y con noindex.
const CONTENT = new Map<string, Entry>();
const DRAFTS = new Map<string, Entry>();
for (const [path, mod] of Object.entries(modules)) {
  let rel = path.replace('../content/', '').replace(/\.md$/, '');
  rel = rel.replace(/(^|\/)index$/, '');
  const url = rel ? `/${rel}/` : '/';
  const entry = { url, frontmatter: mod.frontmatter ?? {}, Content: mod.Content };
  (mod.frontmatter?.draft ? DRAFTS : CONTENT).set(url, entry);
}
export const getDraft = (url: string) => DRAFTS.get(url);

// ---------- Imágenes (src/assets/images, optimizadas por Astro a AVIF/WebP) ----------
const IMAGES = import.meta.glob('../assets/images/**/*.{jpg,jpeg,png,webp,avif}', { eager: true, import: 'default' }) as Record<string, ImageMetadata>;
export function imageFor(url: string): { src: ImageMetadata; alt: string; caption?: string } | undefined {
  const fm = CONTENT.get(url)?.frontmatter;
  if (!fm?.image) return undefined;
  const src = IMAGES[`../assets/images/${fm.image.replace(/^\/+/, '')}`];
  if (!src) throw new Error(`Imagen no encontrada: src/assets/images/${fm.image} (usada en ${url})`);
  if (!fm.imageAlt) throw new Error(`Falta imageAlt (texto alternativo) en ${url}`);
  return { src, alt: fm.imageAlt, caption: fm.imageCaption };
}

export const getNode = (url: string) => BY_URL.get(url);
export const getContent = (url: string) => CONTENT.get(url);
export const hasContent = (url: string) => CONTENT.has(url);
export const children = (url: string) => CHILDREN.get(url) ?? [];

/** Una página se indexa solo cuando tiene contenido redactado (o es la home). */
export const isIndexable = (url: string) => url === '/' || CONTENT.has(url);

export function ancestors(url: string): Node[] {
  const chain: Node[] = [];
  let cur = BY_URL.get(url);
  while (cur && cur.parent && cur.parent !== '—') {
    const p = BY_URL.get(cur.parent);
    if (!p) break;
    chain.unshift(p);
    cur = p;
  }
  return chain;
}

export const siblings = (url: string) => {
  const n = BY_URL.get(url);
  if (!n) return [];
  return children(n.parent).filter((s) => s.url !== url);
};

/** Pilar de país/comunidad al que pertenece una URL de destino. */
export function countryOf(url: string): Node | undefined {
  return [...ancestors(url), BY_URL.get(url)!].find(
    (n) => n && (n.type === 'Pilar país' || n.type === 'Pilar comunidad'),
  );
}
/** Pilar de ciudad al que pertenece una URL. */
export function cityOf(url: string): Node | undefined {
  return [...ancestors(url), BY_URL.get(url)!].find((n) => n && n.type === 'Pilar ciudad/destino');
}

/** Enlaces transversales "Antes de viajar" hacia el silo Consejos. */
export function beforeYouGo(url: string): Node[] {
  const country = countryOf(url);
  const slug = country?.url.split('/').filter(Boolean).pop();
  const pick = (base: string) => {
    const specific = slug ? BY_URL.get(`${base}${slug}/`) : undefined;
    return specific ?? BY_URL.get(base);
  };
  return [
    pick('/consejos/seguro-de-viaje/'),
    pick('/consejos/esim-para-viajar/'),
    BY_URL.get('/consejos/requisitos-y-visados/'),
    BY_URL.get('/consejos/que-llevar-en-la-maleta/'),
  ].filter(Boolean) as Node[];
}

export const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];
/** Mes actual (en el momento de la compilación; Netlify recompila en cada publicación). */
export function currentMonthNode(): Node | undefined {
  const now = new Date().getMonth();
  // Primer mes (desde el actual) que ya tenga guía publicada; si no hay ninguno, el mes actual.
  for (let i = 0; i < 12; i++) {
    const url = `/cuando-viajar/${MONTHS[(now + i) % 12]}/`;
    if (CONTENT.has(url)) return BY_URL.get(url);
  }
  return BY_URL.get(`/cuando-viajar/${MONTHS[now]}/`);
}

export function cleanTitle(n: Node) {
  const e = CONTENT.get(n.url);
  return e?.frontmatter.title ?? n.title;
}
export function descriptionFor(n: Node) {
  const e = CONTENT.get(n.url) ?? DRAFTS.get(n.url);
  if (e?.frontmatter.description) return e.frontmatter.description;
  return `${n.title}. Guía práctica de El Viaje Seguro con consejos claros y útiles para organizar tu viaje.`;
}

/** Artículos publicados, del más reciente al más antiguo. */
export function latest(limit = 6): Node[] {
  return [...CONTENT.values()]
    .filter((e) => e.frontmatter.updated)
    .sort((a, b) => (b.frontmatter.updated! > a.frontmatter.updated! ? 1 : -1))
    .map((e) => BY_URL.get(e.url))
    .filter((n): n is Node => !!n && n.level >= 2)
    .slice(0, limit);
}

export const featuredDestinations = () =>
  [...CONTENT.values()]
    .filter((e) => e.frontmatter.featured)
    .map((e) => BY_URL.get(e.url))
    .filter(Boolean) as Node[];

/** Color de acento estable por destino (para las tarjetas sin foto). */
const HUES = [196, 168, 28, 212, 340, 140, 44, 262];
export function hueFor(text: string) {
  let h = 0;
  for (const c of text) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return HUES[h % HUES.length];
}

export const CONTINENTS = ['/espana/', '/europa/', '/asia/', '/america/', '/africa/', '/oceania/'];

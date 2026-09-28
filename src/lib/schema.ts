// Datos estructurados (schema.org) por tipo de plantilla, en un único @graph por página.
import { SITE, getNode, children, ancestors, countryOf, type Node } from './site';

const abs = (u: string) => new URL(u, SITE.url).href;
export const ORG_ID = `${SITE.url}/#organization`;
export const WEBSITE_ID = `${SITE.url}/#website`;

export function organization() {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE.name,
    url: `${SITE.url}/`,
    logo: { '@type': 'ImageObject', url: abs(SITE.logo), width: 512, height: 512 },
  };
}
export function website() {
  return { '@type': 'WebSite', '@id': WEBSITE_ID, name: SITE.name, url: `${SITE.url}/`, inLanguage: 'es-ES', description: SITE.tagline, publisher: { '@id': ORG_ID } };
}
export function author() {
  if (!SITE.author.name) return { '@id': ORG_ID };
  return { '@type': 'Person', name: SITE.author.name, url: abs(SITE.author.url), ...(SITE.author.sameAs.length ? { sameAs: SITE.author.sameAs } : {}) };
}
export function breadcrumb(trail: Node[], pageUrl: string) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${abs(pageUrl)}#breadcrumb`,
    itemListElement: trail.map((n, i) => ({ '@type': 'ListItem', position: i + 1, name: n.name, item: abs(n.url) })),
  };
}
function itemList(items: Node[], pageUrl: string) {
  return {
    '@type': 'ItemList',
    '@id': `${abs(pageUrl)}#list`,
    numberOfItems: items.length,
    itemListElement: items.map((n, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(n.url), name: n.name })),
  };
}

/** Lugar turístico (para las guías de destino): ciudad o país, con su país contenedor. */
function place(url: string) {
  const n = getNode(url)!;
  const country = countryOf(url);
  const isCountry = n.type === 'Pilar país';
  const isRegion = n.type === 'Pilar comunidad';
  if (isCountry) return { '@type': ['TouristDestination', 'Country'], name: n.name, url: abs(n.url) };
  if (isRegion) return { '@type': ['TouristDestination', 'AdministrativeArea'], name: n.name, url: abs(n.url), containedInPlace: { '@type': 'Country', name: 'España' } };
  const containedIn = country
    ? country.type === 'Pilar comunidad'
      ? { '@type': 'AdministrativeArea', name: country.name, containedInPlace: { '@type': 'Country', name: 'España' } }
      : { '@type': 'Country', name: country.name }
    : undefined;
  return { '@type': 'TouristDestination', name: n.name, url: abs(n.url), ...(containedIn ? { containedInPlace: containedIn } : {}) };
}

type Img = { url: string; width: number; height: number; alt: string };
type PageArgs = {
  node: Node;
  title: string;
  description: string;
  hasArticle: boolean;
  image: Img;
  published?: string;
  modified?: string;
};

export function pageGraph({ node, title, description, hasArticle, image, published, modified }: PageArgs) {
  const url = abs(node.url);
  const t = node.type;
  const trail = [...ancestors(node.url), node];
  const kids = children(node.url);
  const isHub = t.startsWith('Hub') || t === 'Sub-hub estacional';
  const isDest = ['Pilar país', 'Pilar comunidad', 'Pilar ciudad/destino'].includes(t);
  const cityOrCountry = t === 'Satélite ciudad' || t === 'Satélite país' ? getNode(node.parent) : undefined;
  const imageObj = { '@type': 'ImageObject', '@id': `${url}#primaryimage`, url: image.url, width: image.width, height: image.height, caption: image.alt };

  let pageType: string | string[] = 'WebPage';
  if (isHub || (isDest && !hasArticle)) pageType = 'CollectionPage';
  if (node.url === '/sobre-mi/') pageType = 'AboutPage';
  if (node.url === '/contacto/') pageType = 'ContactPage';

  const webpage: Record<string, unknown> = {
    '@type': pageType,
    '@id': `${url}#webpage`,
    url,
    name: title,
    description,
    inLanguage: 'es-ES',
    isPartOf: { '@id': WEBSITE_ID },
    breadcrumb: { '@id': `${url}#breadcrumb` },
    primaryImageOfPage: { '@id': `${url}#primaryimage` },
    ...(modified ? { dateModified: modified } : {}),
  };

  const graph: Record<string, unknown>[] = [organization(), website(), webpage, imageObj, breadcrumb(trail, node.url)];

  // Hubs, rankings y pilares: lista de las guías que contienen
  const listItems = t === 'Satélite ranking' ? [] : kids;
  if (listItems.length > 0) {
    graph.push(itemList(listItems, node.url));
    webpage.mainEntity = { '@id': `${url}#list` };
  }

  if (hasArticle && node.url !== '/sobre-mi/' && t !== 'Página corporativa (footer)' && !isHub) {
    const article: Record<string, unknown> = {
      '@type': 'Article',
      '@id': `${url}#article`,
      headline: title.slice(0, 110),
      description,
      image: { '@id': `${url}#primaryimage` },
      datePublished: published ?? modified,
      dateModified: modified ?? published,
      author: author(),
      publisher: { '@id': ORG_ID },
      mainEntityOfPage: { '@id': `${url}#webpage` },
      isPartOf: { '@id': `${url}#webpage` },
      inLanguage: 'es-ES',
      articleSection: node.silo,
      ...(node.keyword ? { keywords: node.keyword } : {}),
    };
    if (isDest) article.about = place(node.url);
    else if (cityOrCountry) article.about = place(cityOrCountry.url);
    graph.push(article);
    webpage.mainEntity = { '@id': `${url}#article` };
  } else if (isDest) {
    webpage.about = place(node.url);
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

export function homeGraph(image: Img, featured: Node[]) {
  const url = `${SITE.url}/`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organization(),
      website(),
      {
        '@type': 'WebPage', '@id': `${url}#webpage`, url, name: SITE.name, description: SITE.tagline, inLanguage: 'es-ES',
        isPartOf: { '@id': WEBSITE_ID }, about: { '@id': ORG_ID }, primaryImageOfPage: { '@id': `${url}#primaryimage` },
        ...(featured.length ? { mainEntity: { '@id': `${url}#list` } } : {}),
      },
      { '@type': 'ImageObject', '@id': `${url}#primaryimage`, url: image.url, width: image.width, height: image.height, caption: image.alt },
      ...(featured.length ? [itemList(featured, '/')] : []),
    ],
  };
}

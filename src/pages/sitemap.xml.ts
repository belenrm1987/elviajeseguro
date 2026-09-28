import { NODES, SITE, isIndexable, getContent } from '../lib/site';

// Solo se incluyen las páginas con contenido redactado (las "próximamente" van con noindex).
export function GET() {
  const urls = NODES.filter((n) => isIndexable(n.url)).map((n) => {
    const updated = getContent(n.url)?.frontmatter.updated;
    return `  <url><loc>${new URL(n.url, SITE.url).href}</loc>${updated ? `<lastmod>${updated}</lastmod>` : ''}</url>`;
  });
  urls.push(`  <url><loc>${SITE.url}/contacto/</loc></url>`);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}

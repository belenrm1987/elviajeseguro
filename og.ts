import { getImage } from 'astro:assets';
import { SITE, imageFor } from './site';

export type OgImage = { url: string; width: number; height: number; alt: string };

/** Imagen para redes sociales y datos estructurados: la portada de la página o, si no tiene, la imagen de marca. */
export async function ogImageFor(url: string): Promise<OgImage> {
  const img = imageFor(url);
  if (!img) {
    const d = SITE.ogDefault;
    return { url: new URL(d.src, SITE.url).href, width: d.width, height: d.height, alt: d.alt };
  }
  const width = Math.min(1200, img.src.width);
  const out = await getImage({ src: img.src, width, format: 'jpeg', quality: 80 });
  const height = Math.round((img.src.height / img.src.width) * width);
  return { url: new URL(out.src, SITE.url).href, width, height, alt: img.alt };
}

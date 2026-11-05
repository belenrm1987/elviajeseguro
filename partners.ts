// Enlaces a los seguros de Iris Global (link building contextual).
// Reglas: enlaces follow dentro del texto, solo en las páginas donde el seguro es relevante y con anchors variados.
// Este archivo es la referencia de qué seguro enlazar en cada página al redactarla.
import { getNode, countryOf, type Node } from './site';

export const IRIS = {
  products: {
    viaje: {
      url: 'https://www.irisglobal.es/particulares/seguros-viajes/seguro-viaje',
      name: 'Seguro de viaje de Iris Global',
      anchors: ['seguro de viaje de Iris Global', 'contratar un seguro de viaje', 'seguro de viaje con asistencia 24 horas', 'seguro para viajar al extranjero'],
      pitch: 'Asistencia médica en el extranjero, repatriación y equipaje para viajes de ocio.',
    },
    deportivo: {
      url: 'https://www.irisglobal.es/particulares/seguros-viajes/deportivo',
      name: 'Seguro deportivo de Iris Global',
      anchors: ['seguro de viaje para deportes', 'seguro deportivo de Iris Global', 'seguro para deportes de aventura'],
      pitch: 'Para viajes con esquí, buceo, senderismo u otras actividades deportivas.',
    },
    estudiantes: {
      url: 'https://www.irisglobal.es/particulares/seguros-viajes/para-estudiantes',
      name: 'Seguro para estudiantes de Iris Global',
      anchors: ['seguro para estudiantes en el extranjero', 'seguro de viaje para estudiantes', 'seguro para Erasmus y estancias de estudios'],
      pitch: 'Pensado para estancias de estudios, Erasmus y cursos en el extranjero.',
    },
    mascotas: {
      url: 'https://www.irisglobal.es/particulares/seguros-viajes/seguro-viaje-mascotas',
      name: 'Seguro de viaje para mascotas de Iris Global',
      anchors: ['seguro de viaje para mascotas', 'seguro para viajar con tu perro o gato', 'seguro de viaje con mascota'],
      pitch: 'Cobertura para viajar con tu perro o tu gato.',
    },
  },
} as const;

export type ProductKey = keyof typeof IRIS.products;

/** Qué seguro(s) corresponde enlazar en cada URL. Vacío = ninguno (la mayoría de páginas). */
export function productsFor(url: string): ProductKey[] {
  const n = getNode(url);
  if (!n) return [];
  if (url === '/consejos/seguro-de-viaje/') return ['viaje', 'deportivo', 'estudiantes', 'mascotas'];
  if (url === '/consejos/seguro-de-viaje/deportes-y-aventura/') return ['deportivo'];
  if (url === '/consejos/viajar-con-mascotas/') return ['mascotas'];
  if (url === '/consejos/estudiar-en-el-extranjero/') return ['estudiantes'];
  if (url.startsWith('/consejos/seguro-de-viaje/')) return ['viaje'];
  if (['/consejos/seguro-de-cancelacion/', '/consejos/requisitos-y-visados/', '/consejos/que-llevar-en-la-maleta/', '/consejos/viajar-con-ninos/'].includes(url)) return ['viaje'];
  if (n.type === 'Pilar país') return ['viaje'];
  if (n.type === 'Satélite país' && /\/requisitos\/$/.test(url)) return ['viaje'];
  // Destinos de nieve, montaña o buceo: seguro deportivo en su guía principal
  if (n.type === 'Pilar ciudad/destino' && SPORT_DESTINATIONS.some((s) => url.includes(s))) return ['deportivo'];
  return [];
}
const SPORT_DESTINATIONS = ['/dolomitas/', '/andorra-la-vella/', '/khao-sok/', '/azores/', '/reikiavik/', '/palawan/', '/auckland/', '/cusco/'];

/** Anchor estable pero variado según la página (evita repetir siempre la misma keyword exacta). */
export function anchorFor(key: ProductKey, url: string) {
  const a = IRIS.products[key].anchors;
  let h = 0;
  for (const c of url) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return a[h % a.length];
}

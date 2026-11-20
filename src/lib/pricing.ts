import { pakete, zonen, extraChildPrice, type Paket, type Zone } from '../data/site';

export function zoneForPlz(plz: string): Zone | null {
  if (!/^\d{5}$/.test(plz)) return null;
  const n = Number(plz);
  return zonen.find((z) => z.plz.some(([from, to]) => n >= from && n <= to)) ?? null;
}

export function findPaket(id: string): Paket | undefined {
  return pakete.find((p) => p.id === id);
}

export type Estimate = {
  paket: Paket;
  extraKids: number;
  extraKidsCost: number;
  zone: Zone | null;
  /** null, wenn die PLZ keiner Zone zugeordnet ist (Anfahrt nach Absprache). */
  travel: number | null;
  /** Summe ohne Anfahrt, wenn travel null ist. */
  total: number;
};

export function estimate(paketId: string, kinder: number, plz: string): Estimate | null {
  const paket = findPaket(paketId);
  if (!paket) return null;
  const extraKids = Math.max(0, Math.floor(kinder) - paket.kids);
  const extraKidsCost = extraKids * extraChildPrice;
  const zone = zoneForPlz(plz);
  const travel = zone ? zone.price : null;
  return { paket, extraKids, extraKidsCost, zone, travel, total: paket.price + extraKidsCost + (travel ?? 0) };
}

import { pakete, figuren } from '../data/site';
import { estimate, type Estimate } from './pricing';

export type Anfrage = {
  datum: string;
  uhrzeit: string;
  plz: string;
  kinder: number;
  paket: string;
  figur: string;
  kind: string;
  name: string;
  email: string;
  telefon: string;
  nachricht: string;
};

export type Errors = Partial<Record<keyof Anfrage | 'datenschutz' | 'form', string>>;

const PAKET_IDS = [...pakete.map((p) => p.id), 'event'];
const FIGUR_IDS = [...figuren.map((f) => f.slug), 'andere'];

const clean = (v: unknown, max: number) =>
  String(v ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, max);

/** Datum als YYYY-MM-DD in Europe/Berlin. */
export function todayBerlin(now = new Date()): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin' }).format(now);
}

export function validate(
  input: Record<string, unknown>,
  now = new Date(),
): { data: Anfrage; errors: Errors } {
  const errors: Errors = {};
  const data: Anfrage = {
    datum: clean(input.datum, 10),
    uhrzeit: clean(input.uhrzeit, 5),
    plz: clean(input.plz, 5),
    kinder: Number.parseInt(clean(input.kinder, 3), 10),
    paket: clean(input.paket, 20),
    figur: clean(input.figur, 30),
    kind: clean(input.kind, 100),
    name: clean(input.name, 100),
    email: clean(input.email, 200).toLowerCase(),
    telefon: clean(input.telefon, 40),
    nachricht: clean(input.nachricht, 2000),
  };

  const today = todayBerlin(now);
  const max = new Date(now);
  max.setFullYear(max.getFullYear() + 2);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.datum) || Number.isNaN(Date.parse(data.datum))) {
    errors.datum = 'Bitte ein Wunschdatum angeben.';
  } else if (data.datum < today) {
    errors.datum = 'Das Datum liegt in der Vergangenheit.';
  } else if (data.datum > todayBerlin(max)) {
    errors.datum = 'Bitte ein Datum innerhalb der nächsten zwei Jahre wählen.';
  }

  if (data.uhrzeit && !/^([01]\d|2[0-3]):[0-5]\d$/.test(data.uhrzeit)) {
    errors.uhrzeit = 'Bitte eine gültige Uhrzeit angeben.';
  }
  if (!/^\d{5}$/.test(data.plz)) errors.plz = 'Bitte eine fünfstellige PLZ angeben.';
  if (!Number.isInteger(data.kinder) || data.kinder < 1 || data.kinder > 30) {
    errors.kinder = 'Bitte eine Kinderanzahl zwischen 1 und 30 angeben.';
  }
  if (!PAKET_IDS.includes(data.paket)) errors.paket = 'Bitte ein Paket wählen.';
  if (!FIGUR_IDS.includes(data.figur)) errors.figur = 'Bitte eine Figur wählen.';
  if (data.name.length < 2) errors.name = 'Bitte deinen Namen angeben.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) errors.email = 'Bitte eine gültige E-Mail-Adresse angeben.';
  if (data.telefon && !/^[+\d][\d\s/()-]{5,}$/.test(data.telefon)) errors.telefon = 'Bitte eine gültige Telefonnummer angeben.';

  const ds = input.datenschutz;
  if (!(ds === 'on' || ds === 'true' || ds === true)) {
    errors.datenschutz = 'Bitte die Datenschutzerklärung bestätigen.';
  }

  return { data, errors };
}

const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
};

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function paketLabel(id: string) {
  return pakete.find((p) => p.id === id)?.name ?? (id === 'event' ? 'Event / Walk-Act' : id);
}

export function figurLabel(id: string) {
  return figuren.find((f) => f.slug === id)?.name ?? (id === 'andere' ? 'Andere Wunschfigur' : id);
}

export function priceLines(e: Estimate | null): string[] {
  if (!e) return ['Preis: nach Absprache (Event)'];
  const lines = [`${e.paket.name}: ${e.paket.price} €`];
  if (e.extraKids > 0) lines.push(`${e.extraKids} weitere Kinder: ${e.extraKidsCost} €`);
  lines.push(e.travel === null ? 'Anfahrt: nach Absprache (PLZ keiner Zone zugeordnet)' : `Anfahrt (${e.zone!.name}): ${e.travel} €`);
  lines.push(`Summe${e.travel === null ? ' ohne Anfahrt' : ''}: ${e.total} €`);
  return lines;
}

/** E-Mail an dich mit allen Angaben. */
export function ownerMail(a: Anfrage) {
  const e = estimate(a.paket, a.kinder, a.plz);
  const subject = `Neue Anfrage: ${fmtDate(a.datum)} · ${paketLabel(a.paket)} · ${a.plz}`;
  const rows: [string, string][] = [
    ['Datum', `${fmtDate(a.datum)}${a.uhrzeit ? `, ca. ${a.uhrzeit} Uhr` : ''}`],
    ['PLZ', `${a.plz}${e?.zone ? ` (${e.zone.name})` : ''}`],
    ['Kinder', String(a.kinder)],
    ['Paket', paketLabel(a.paket)],
    ['Figur', figurLabel(a.figur)],
    ['Geburtstagskind', a.kind || '–'],
    ['Name', a.name],
    ['E-Mail', a.email],
    ['Telefon', a.telefon || '–'],
    ['Nachricht', a.nachricht || '–'],
  ];
  const prices = priceLines(e);
  const text = [
    ...rows.map(([k, v]) => `${k}: ${v}`),
    '',
    'Preisschätzung',
    ...prices,
    '',
    'Antworten: einfach auf diese E-Mail antworten.',
  ].join('\n');
  const html = `<table cellpadding="6" style="border-collapse:collapse;font:15px/1.5 system-ui,sans-serif">${rows
    .map(([k, v]) => `<tr><th align="left" valign="top">${esc(k)}</th><td style="white-space:pre-wrap">${esc(v)}</td></tr>`)
    .join('')}</table><h3 style="font:600 16px system-ui,sans-serif">Preisschätzung</h3><p style="font:15px/1.5 system-ui,sans-serif">${prices
    .map(esc)
    .join('<br>')}</p>`;
  return { subject, text, html };
}

/** Kurze Push-Nachricht ohne personenbezogene Daten. */
export function pushText(a: Anfrage) {
  return `Neue Anfrage: ${fmtDate(a.datum)} · ${paketLabel(a.paket)} · PLZ ${a.plz} · ${a.kinder} Kinder`;
}

/**
 * Alle Inhalte der Website an einer Stelle.
 * Platzhalter in [eckigen Klammern] bzw. mit TODO vor dem Launch ersetzen.
 */

export const business = {
  name: 'Partyprinzessin',
  city: 'Bremen',
  region: 'Bremen, Cloppenburg & Vechta',
  // TODO: echte Nummer im internationalen Format ohne +, z. B. 4915112345678
  whatsapp: '49XXXXXXXXXXX',
  // TODO: echte Adresse
  email: 'hallo@partyprinzessin.de',
  instagram: 'https://www.instagram.com/',
  areaServed: [
    'Bremen', 'Delmenhorst', 'Stuhr', 'Weyhe', 'Achim', 'Lilienthal',
    'Oldenburg', 'Cloppenburg', 'Vechta',
  ],
  responseTime: '24 Stunden',
};

export const whatsappUrl = (text = 'Hallo! Ich möchte eine Prinzessin für einen Kindergeburtstag anfragen.') =>
  `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(text)}`;

/** Für den A/B-Vergleich: Umschalter unten links einblenden. Vor dem Launch auf false. */
export const showThemeSwitch = true;

export const extraChildPrice = 8;

export type Paket = {
  id: string;
  name: string;
  price: number;
  minutes: number;
  kids: number;
  text: string;
  featured?: boolean;
};

/** Reihenfolge = Anzeige. Teuerstes zuerst als Preisanker. */
export const pakete: Paket[] = [
  { id: 'ball', name: 'Großer Ball', price: 289, minutes: 120, kids: 12,
    text: 'Alles aus „Königliche Party“ plus Glitzer-Tattoos, Tanz-Choreo und Gruppenfoto.' },
  { id: 'party', name: 'Königliche Party', price: 219, minutes: 90, kids: 10, featured: true,
    text: 'Begrüßung, Kennenlernen, Prinzessinnentanz, zwei Spiele, Fotos und Krönung.' },
  { id: 'mini', name: 'Mini-Audienz', price: 179, minutes: 60, kids: 8,
    text: 'Für die Kleinsten: Begrüßung, Tanz, Fotos und Krönung.' },
];

export const minPrice = Math.min(...pakete.map((p) => p.price));

export type Zone = {
  id: 'bremen' | 'umland' | 'fern';
  name: string;
  price: number;
  note?: string;
  /** PLZ-Bereiche [von, bis] inklusive. Annahme – vor dem Launch prüfen. */
  plz: [number, number][];
};

export const zonen: Zone[] = [
  { id: 'bremen', name: 'Bremen', price: 0, note: 'Anfahrt inklusive',
    plz: [[28195, 28779]] },
  { id: 'umland', name: 'Umland (Delmenhorst, Stuhr, Achim …)', price: 15,
    // Ritterhude–Ganderkesee/Delmenhorst, Schwanewede–Oyten/Stuhr/Weyhe/Syke, Oldenburg
    plz: [[27721, 27777], [28780, 28879], [26121, 26135]] },
  // TODO: Preis prüfen – ca. 70 km einfache Strecke ab Bremen.
  { id: 'fern', name: 'Cloppenburg & Vechta', price: 29,
    // Landkreis Vechta, Landkreis Cloppenburg, Friesoythe, Saterland
    plz: [[49377, 49456], [49624, 49699], [26169, 26169], [26683, 26683]] },
];

export const figuren = [
  { slug: 'schneekoenigin', name: 'Schneekönigin', line: 'Eis, Glitzer, große Gefühle', tag: 'Prinzessin' },
  { slug: 'meerjungfrau', name: 'Meerjungfrau', line: 'Wellen, Muscheln, Singen', tag: 'Prinzessin' },
  { slug: 'rapunzel', name: 'Rapunzel', line: 'Turm, Zöpfe, Abenteuer', tag: 'Prinzessin' },
  { slug: 'aschenputtel', name: 'Aschenputtel', line: 'Ball, Schuh, Mitternacht', tag: 'Prinzessin' },
  { slug: 'sternenheldin', name: 'Sternenheldin', line: 'Eigene Figur – für Mutige', tag: 'Heldin' },
];

export const schritte = [
  { t: 'Termin prüfen', d: 'Datum und PLZ angeben – du bekommst in 24 Stunden eine Zusage.' },
  { t: 'Paket & Figur wählen', d: 'Festpreis inklusive Anfahrtszone, ohne versteckte Kosten.' },
  { t: 'Krönung genießen', d: 'Ich bringe alles mit. Ihr schneidet nur den Kuchen an.' },
];

export const ablauf = [
  { t: '0:00', a: 'Große Ankunft', b: 'Auftritt' },
  { t: '0:10', a: 'Kennenlernrunde', b: 'Kennenlernen' },
  { t: '0:25', a: 'Prinzessinnentanz', b: 'Dance-Battle' },
  { t: '0:45', a: 'Spiele', b: 'Spiele' },
  { t: '1:10', a: 'Fotos', b: 'Fotoshooting' },
  { t: '1:20', a: 'Krönung', b: 'Krönung' },
];

/** Nur echte Google-Bewertungen eintragen. Leer = Abschnitt wird ausgeblendet. */
export const bewertungen: { name: string; text: string }[] = [];

export const faq = [
  { q: 'Was müssen wir vorbereiten?', a: 'Nichts außer etwas Platz zum Tanzen. Musik, Spiele, Krone und Urkunde bringe ich mit.' },
  { q: 'Wie viele Kinder dürfen dabei sein?', a: `Je nach Paket 8 bis 12 Kinder inklusive, jedes weitere Kind kostet ${extraChildPrice} €.` },
  { q: 'Kommst du auch nach Cloppenburg und Vechta?', a: 'Ja. Bremen ist inklusive, für Cloppenburg und Vechta berechne ich eine feste Anfahrtspauschale.' },
  { q: 'Wie weit im Voraus sollten wir buchen?', a: 'Samstage sind schnell vergeben – am besten 4 bis 6 Wochen vorher anfragen.' },
  { q: 'Für welches Alter ist das Programm?', a: 'Ideal für 3 bis 9 Jahre. Das Programm passe ich an das Alter des Geburtstagskindes an.' },
  { q: 'Wie wird bezahlt?', a: 'Nach meiner Zusage reservierst du den Termin mit einer Anzahlung von 50 €. Den Rest zahlst du nach der Party.' },
];

/** Texte, die sich je Theme unterscheiden. */
export const copy = {
  a: {
    heroTitle: 'Die Prinzessin kommt zu eurer Party.',
    heroLead: '90 Minuten Tanz, Spiele, Fotos und eine echte Krönung – bei euch zu Hause. Ihr müsst nichts vorbereiten.',
    ctaCheck: 'Freien Termin prüfen',
    figurenTitle: 'Wer kommt zu euch?',
    paketeTitle: 'Pakete',
    ablaufTitle: '90 Minuten, die wie im Flug vergehen',
    aboutTitle: 'Hinter der Krone: ich.',
    faqTitle: 'Häufige Fragen',
    finalTitle: 'Samstage sind schnell weg.',
  },
  b: {
    heroTitle: 'Krone auf.|Party an.',
    heroLead: 'Prinzessin, Heldin oder K-Pop-Star kommt zum Kindergeburtstag – in Bremen, Cloppenburg und Vechta.',
    ctaCheck: 'Freien Termin checken',
    figurenTitle: 'Wähl deine Crew.',
    paketeTitle: 'Pakete. Festpreis.',
    ablaufTitle: 'So läuft die Show',
    aboutTitle: 'Hi, ich bin [Name].',
    faqTitle: 'Fragen?',
    finalTitle: 'Samstage sind|schnell weg.',
  },
} as const;

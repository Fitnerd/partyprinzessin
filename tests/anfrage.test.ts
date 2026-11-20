import { describe, it, expect, vi, afterEach } from 'vitest';
import { zoneForPlz, estimate } from '../src/lib/pricing';
import { validate, ownerMail, pushText, todayBerlin } from '../src/lib/anfrage';
import { onRequestPost } from '../functions/api/anfrage';

const NOW = new Date('2026-11-19T12:00:00Z');

const validBase = {
  datum: '2026-12-12',
  uhrzeit: '15:00',
  plz: '28195',
  kinder: '10',
  paket: 'party',
  figur: 'schneekoenigin',
  kind: 'Mila, 5',
  name: 'Eva Muster',
  email: 'Eva@Example.org',
  telefon: '+49 151 2345678',
  nachricht: 'Hallo <b>!</b>',
  datenschutz: 'on',
};

const valid = validBase;

describe('zoneForPlz', () => {
  it('ordnet PLZ den Zonen zu', () => {
    expect(zoneForPlz('28195')?.id).toBe('bremen');
    expect(zoneForPlz('28779')?.id).toBe('bremen');
    expect(zoneForPlz('27749')?.id).toBe('umland'); // Delmenhorst
    expect(zoneForPlz('28816')?.id).toBe('umland'); // Stuhr
    expect(zoneForPlz('26121')?.id).toBe('umland'); // Oldenburg
    expect(zoneForPlz('49661')?.id).toBe('fern'); // Cloppenburg
    expect(zoneForPlz('49377')?.id).toBe('fern'); // Vechta
    expect(zoneForPlz('10115')).toBeNull(); // Berlin
    expect(zoneForPlz('2819')).toBeNull();
  });
});

describe('estimate', () => {
  it('rechnet Paket + weitere Kinder + Anfahrt', () => {
    const e = estimate('party', 12, '49661')!;
    expect(e.extraKids).toBe(2);
    expect(e.extraKidsCost).toBe(16);
    expect(e.travel).toBe(29);
    expect(e.total).toBe(219 + 16 + 29);
  });
  it('ohne Zone: travel null, Summe ohne Anfahrt', () => {
    const e = estimate('mini', 5, '10115')!;
    expect(e.travel).toBeNull();
    expect(e.total).toBe(179);
  });
  it('unbekanntes Paket → null', () => {
    expect(estimate('event', 8, '28195')).toBeNull();
  });
});

describe('validate', () => {
  it('akzeptiert eine gültige Anfrage und normalisiert', () => {
    const { data, errors } = validate(valid, NOW);
    expect(errors).toEqual({});
    expect(data.email).toBe('eva@example.org');
    expect(data.kinder).toBe(10);
  });

  it('meldet Pflichtfelder', () => {
    const { errors } = validate({}, NOW);
    expect(Object.keys(errors).sort()).toEqual(
      ['datenschutz', 'datum', 'email', 'figur', 'kinder', 'name', 'paket', 'plz'].sort(),
    );
  });

  it('lehnt Vergangenheit und ferne Zukunft ab', () => {
    expect(validate({ ...valid, datum: '2026-11-18' }, NOW).errors.datum).toMatch(/Vergangenheit/);
    expect(validate({ ...valid, datum: '2029-01-01' }, NOW).errors.datum).toMatch(/zwei Jahre/);
    expect(validate({ ...valid, datum: todayBerlin(NOW) }, NOW).errors.datum).toBeUndefined();
  });

  it('lehnt unbekannte Pakete/Figuren und kaputte Werte ab', () => {
    const { errors } = validate({ ...valid, paket: 'x', figur: 'elsa', plz: 'abcde', kinder: '99', uhrzeit: '25:00', telefon: 'abc' }, NOW);
    expect(errors).toHaveProperty('paket');
    expect(errors).toHaveProperty('figur');
    expect(errors).toHaveProperty('plz');
    expect(errors).toHaveProperty('kinder');
    expect(errors).toHaveProperty('uhrzeit');
    expect(errors).toHaveProperty('telefon');
  });

  it('kürzt überlange Eingaben', () => {
    const { data } = validate({ ...valid, nachricht: 'x'.repeat(5000) }, NOW);
    expect(data.nachricht.length).toBe(2000);
  });
});

describe('ownerMail / pushText', () => {
  it('escaped HTML und enthält Preisschätzung', () => {
    const { data } = validate(valid, NOW);
    const m = ownerMail(data);
    expect(m.subject).toBe('Neue Anfrage: 12.12.2026 · Königliche Party · 28195');
    expect(m.html).toContain('Hallo &lt;b&gt;!&lt;/b&gt;');
    expect(m.html).not.toContain('<b>!</b>');
    expect(m.text).toContain('Anfahrt (Bremen): 0 €');
    expect(m.text).toContain('Summe: 219 €');
  });
  it('Push enthält keine Personendaten', () => {
    const { data } = validate(valid, NOW);
    const t = pushText(data);
    expect(t).not.toContain('Eva');
    expect(t).not.toContain('example.org');
  });
});

describe('POST /api/anfrage', () => {
  afterEach(() => vi.unstubAllGlobals());

  const call = (body: Record<string, string>, env: Record<string, string> = {}, json = true) => {
    const fd = new FormData();
    for (const [k, v] of Object.entries(body)) fd.append(k, v);
    const request = new Request('https://example.test/api/anfrage', {
      method: 'POST',
      body: fd,
      headers: json ? { accept: 'application/json' } : {},
    });
    return onRequestPost({ request, env, waitUntil: () => {} });
  };

  // Der Endpoint prüft gegen das echte Heute: Datum relativ setzen, damit der Test nicht veraltet.
  const valid = { ...validBase, datum: todayBerlin(new Date(Date.now() + 14 * 864e5)) };

  it('422 mit Feldfehlern bei ungültigen Daten', async () => {
    const res = await call({ ...valid, email: 'nope' });
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.errors.email).toBeTruthy();
  });

  it('Honeypot: stilles ok ohne Mailversand', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const res = await call({ ...valid, website: 'http://spam' }, { RESEND_API_KEY: 'k', MAIL_TO: 'a@b.de', MAIL_FROM: 'x@y.de' });
    expect(res.status).toBe(200);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('sendet über Resend mit reply_to', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchSpy);
    const res = await call(valid, { RESEND_API_KEY: 'k', MAIL_TO: 'ich@pp.de', MAIL_FROM: 'PP <anfrage@pp.de>' });
    expect(res.status).toBe(200);
    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe('https://api.resend.com/emails');
    const payload = JSON.parse(init.body);
    expect(payload.to).toEqual(['ich@pp.de']);
    expect(payload.reply_to).toBe('eva@example.org');
  });

  it('502, wenn Resend scheitert', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('fail', { status: 500 })));
    const res = await call(valid, { RESEND_API_KEY: 'k', MAIL_TO: 'a@b.de', MAIL_FROM: 'x@y.de' });
    expect(res.status).toBe(502);
  });

  it('ohne JS: 303-Redirect auf /danke', async () => {
    const res = await call(valid, {}, false);
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe('https://example.test/danke');
  });

  it('Turnstile-Fehler → 403', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: false }))));
    const res = await call({ ...valid, 'cf-turnstile-response': 'tok' }, { TURNSTILE_SECRET: 's' });
    expect(res.status).toBe(403);
  });
});

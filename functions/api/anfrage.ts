/**
 * Cloudflare Pages Function: POST /api/anfrage
 *
 * Umgebungsvariablen (Cloudflare Dashboard → Pages → Settings → Variables, lokal: .dev.vars):
 *   RESEND_API_KEY      API-Key von resend.com. Fehlt er, wird nur geloggt (Entwicklung).
 *   MAIL_TO             Empfängeradresse für Anfragen.
 *   MAIL_FROM           Absender, z. B. "Kronenmoment <anfrage@kronenmoment.de>" (Domain bei Resend verifiziert).
 *   TURNSTILE_SECRET    Optional. Wenn gesetzt, wird das Turnstile-Token geprüft.
 *   NTFY_TOPIC          Optional. Push aufs Handy über ntfy (nur Datum/Paket/PLZ, keine Namen).
 *   NTFY_SERVER         Optional, Standard https://ntfy.sh
 */
import { validate, ownerMail, pushText, type Errors } from '../../src/lib/anfrage';

interface Env {
  RESEND_API_KEY?: string;
  MAIL_TO?: string;
  MAIL_FROM?: string;
  TURNSTILE_SECRET?: string;
  NTFY_TOPIC?: string;
  NTFY_SERVER?: string;
}

type Ctx = { request: Request; env: Env; waitUntil: (p: Promise<unknown>) => void };

const MAX_BODY = 20_000;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

const wantsJson = (req: Request) => (req.headers.get('accept') ?? '').includes('application/json');

function htmlError(errors: Errors, status: number) {
  const items = Object.values(errors).map((m) => `<li>${String(m).replace(/</g, '&lt;')}</li>`).join('');
  return new Response(
    `<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Anfrage nicht gesendet</title><body style="font:17px/1.6 system-ui,sans-serif;max-width:640px;margin:48px auto;padding:0 16px"><h1>Anfrage nicht gesendet</h1><ul>${items}</ul><p><a href="/#anfrage">Zurück zum Formular</a></p></body></html>`,
    { status, headers: { 'content-type': 'text/html; charset=utf-8' } },
  );
}

async function readBody(req: Request): Promise<Record<string, unknown> | null> {
  const len = Number(req.headers.get('content-length') ?? 0);
  if (len > MAX_BODY) return null;
  const type = req.headers.get('content-type') ?? '';
  try {
    if (type.includes('application/json')) return (await req.json()) as Record<string, unknown>;
    if (type.includes('form')) return Object.fromEntries((await req.formData()).entries()) as Record<string, unknown>;
  } catch {
    return null;
  }
  return null;
}

async function verifyTurnstile(secret: string, token: string, ip: string | null) {
  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  const out = (await res.json()) as { success?: boolean };
  return out.success === true;
}

export const onRequestPost = async ({ request, env, waitUntil }: Ctx) => {
  const fail = (errors: Errors, status = 400) => (wantsJson(request) ? json({ ok: false, errors }, status) : htmlError(errors, status));

  const input = await readBody(request);
  if (!input) return fail({ form: 'Die Anfrage konnte nicht gelesen werden.' });

  // Honeypot: echte Menschen sehen das Feld nicht. Bots bekommen ein stilles "ok".
  if (String(input.website ?? '').trim() !== '') {
    return wantsJson(request) ? json({ ok: true }) : Response.redirect(new URL('/danke', request.url).href, 303);
  }

  if (env.TURNSTILE_SECRET) {
    const token = String(input['cf-turnstile-response'] ?? '');
    const ok = token && (await verifyTurnstile(env.TURNSTILE_SECRET, token, request.headers.get('cf-connecting-ip')));
    if (!ok) return fail({ form: 'Die Sicherheitsprüfung ist fehlgeschlagen. Bitte Seite neu laden.' }, 403);
  }

  const { data, errors } = validate(input);
  if (Object.keys(errors).length > 0) return fail(errors, 422);

  const mail = ownerMail(data);

  if (!env.RESEND_API_KEY || !env.MAIL_TO || !env.MAIL_FROM) {
    // Entwicklungsmodus: nichts versenden, nur loggen.
    console.log('[anfrage] DEV – keine Mail-Konfiguration. Würde senden:', mail.subject, '\n' + mail.text);
  } else {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from: env.MAIL_FROM,
        to: [env.MAIL_TO],
        reply_to: data.email,
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
      }),
    });
    if (!res.ok) {
      console.error('[anfrage] Resend-Fehler', res.status, await res.text());
      return fail({ form: 'Die Anfrage konnte gerade nicht gesendet werden. Bitte schreib mir per WhatsApp.' }, 502);
    }
  }

  if (env.NTFY_TOPIC) {
    const server = env.NTFY_SERVER ?? 'https://ntfy.sh';
    waitUntil(
      fetch(server, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ topic: env.NTFY_TOPIC, title: 'Kronenmoment', message: pushText(data), tags: ['crown'] }),
      }).catch((e) => console.error('[anfrage] ntfy-Fehler', e)),
    );
  }

  return wantsJson(request) ? json({ ok: true }) : Response.redirect(new URL('/danke', request.url).href, 303);
};

export const onRequest = () => new Response('Method Not Allowed', { status: 405, headers: { allow: 'POST' } });

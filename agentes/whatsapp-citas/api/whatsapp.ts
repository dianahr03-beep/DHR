// Función de Vercel que recibe los mensajes de WhatsApp (webhook de Meta) y contesta con el agente.
//
// Variables en Vercel → Settings → Environment Variables:
//   ANTHROPIC_API_KEY          llave de la consola de Claude
//   SUPABASE_URL               URL del proyecto de Supabase
//   SUPABASE_SERVICE_ROLE_KEY  llave secreta (service role) de Supabase
//   WHATSAPP_TOKEN             token permanente del usuario del sistema en Meta
//   WHATSAPP_PHONE_NUMBER_ID   id del número (Meta → WhatsApp → API Setup)
//   WHATSAPP_APP_SECRET        App Secret (Meta → App settings → Basic)
//   WHATSAPP_VERIFY_TOKEN      una palabra secreta que tú inventas y pegas también en Meta al configurar el webhook
//   WHATSAPP_API_VERSION       versión de la Graph API que muestra Meta, ej. v23.0
import type { IncomingMessage, ServerResponse } from 'node:http'
import { waitUntil } from '@vercel/functions'
import { responder } from '../lib/agente.js'
import { obtenerAlmacen, obtenerClienteIA } from '../lib/config.js'
import { enviarTexto, firmaValida, leerMensajes, type MensajeEntrante } from '../lib/whatsapp.js'

const leerCuerpo = async (req: IncomingMessage) => {
  const partes: Buffer[] = []
  for await (const parte of req) partes.push(parte as Buffer)
  return Buffer.concat(partes).toString('utf8')
}

const enviar = (res: ServerResponse, estado: number, cuerpo = '') => {
  res.statusCode = estado
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.end(cuerpo)
}

async function atender(m: MensajeEntrante) {
  const env = process.env
  const texto = m.texto ?? '[La clienta mandó un audio, foto u otro archivo que no puedo ver]'
  const respuesta = await responder({
    cliente: obtenerClienteIA(), almacen: obtenerAlmacen(), telefono: m.de, waId: m.waId, texto,
  })
  if (respuesta === null) return // ya se había contestado
  await enviarTexto({
    para: m.de, texto: respuesta,
    idNumero: env.WHATSAPP_PHONE_NUMBER_ID!, token: env.WHATSAPP_TOKEN!, versionApi: env.WHATSAPP_API_VERSION || 'v23.0',
  })
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? '/', 'http://x')

  // 1) Meta comprueba el webhook una vez, al configurarlo
  if (req.method === 'GET') {
    const ok = url.searchParams.get('hub.mode') === 'subscribe' &&
      !!process.env.WHATSAPP_VERIFY_TOKEN && url.searchParams.get('hub.verify_token') === process.env.WHATSAPP_VERIFY_TOKEN
    return ok ? enviar(res, 200, url.searchParams.get('hub.challenge') ?? '') : enviar(res, 403)
  }
  if (req.method !== 'POST') return enviar(res, 405)

  // 2) Llega un mensaje: revisar que venga de Meta
  const cuerpo = await leerCuerpo(req)
  const secreto = process.env.WHATSAPP_APP_SECRET
  const firma = req.headers['x-hub-signature-256']
  if (!secreto || !firmaValida(cuerpo, Array.isArray(firma) ? firma[0] : firma, secreto)) return enviar(res, 401)

  let aviso: unknown
  try { aviso = JSON.parse(cuerpo) } catch { return enviar(res, 400) }

  // 3) Contestar 200 de inmediato a Meta y procesar después (si no, Meta reintenta)
  const mensajes = leerMensajes(aviso)
  waitUntil(Promise.all(mensajes.map((m) => atender(m).catch((e) => console.error('No se pudo atender', m.waId, e)))))
  return enviar(res, 200, 'ok')
}

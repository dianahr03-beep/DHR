// Vercel la ejecuta solita todos los días a las 10:00 am (hora del centro de México): ver vercel.json.
// Manda el recordatorio a las clientas que tienen cita mañana.
//
// Variables extra en Vercel:
//   CRON_SECRET                       palabra secreta; Vercel la manda al ejecutar el aviso programado
//   WHATSAPP_PLANTILLA_RECORDATORIO   nombre de la plantilla aprobada en Meta (ej. recordatorio_cita)
//   WHATSAPP_PLANTILLA_IDIOMA         idioma de la plantilla (ej. es_MX)
import type { IncomingMessage, ServerResponse } from 'node:http'
import { obtenerAlmacen } from '../lib/config.js'
import { enviarRecordatorios } from '../lib/recordatorios.js'
import { enviarPlantilla } from '../lib/whatsapp.js'

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const responder = (estado: number, cuerpo: unknown) => {
    res.statusCode = estado
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify(cuerpo))
  }
  const secreto = process.env.CRON_SECRET
  if (!secreto || req.headers.authorization !== `Bearer ${secreto}`) return responder(401, { error: 'No autorizado' })

  const env = process.env
  if (!env.WHATSAPP_PLANTILLA_RECORDATORIO || !env.WHATSAPP_TOKEN || !env.WHATSAPP_PHONE_NUMBER_ID) {
    return responder(500, { error: 'Faltan variables de WhatsApp para los recordatorios' })
  }
  const resultado = await enviarRecordatorios({
    almacen: obtenerAlmacen(),
    enviar: (cita, variables) => enviarPlantilla({
      para: cita.cliente_tel, plantilla: env.WHATSAPP_PLANTILLA_RECORDATORIO!, idioma: env.WHATSAPP_PLANTILLA_IDIOMA || 'es_MX',
      variables, idNumero: env.WHATSAPP_PHONE_NUMBER_ID!, token: env.WHATSAPP_TOKEN!, versionApi: env.WHATSAPP_API_VERSION || 'v23.0',
    }),
  })
  return responder(200, resultado)
}

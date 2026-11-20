// Entrada para la VISTA PREVIA del proyecto dhr (sin Supabase ni WhatsApp):
// se empaqueta en ../../api/agente-simulador.js con `npm run empaquetar-demo`.
// Usa el salón de ejemplo en memoria; la conversación la manda el navegador por si la memoria se reinicia.
import Anthropic from '@anthropic-ai/sdk'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { responder } from './lib/agente.js'
import { crearAlmacenMemoria } from './lib/almacen-memoria.js'
import type { Mensaje } from './lib/tipos.js'

const almacen = crearAlmacenMemoria()
let cliente: Anthropic | undefined

const json = (res: ServerResponse, estado: number, cuerpo: unknown) => {
  res.statusCode = estado
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(cuerpo))
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Solo POST' })
  const clave = process.env.CLAVE_SIMULADOR
  if (!clave || req.headers['x-clave-simulador'] !== clave) return json(res, 401, { error: 'Clave del simulador incorrecta' })
  if (!process.env.ANTHROPIC_API_KEY) return json(res, 500, { error: 'Falta ANTHROPIC_API_KEY en Vercel' })

  const partes: Buffer[] = []
  for await (const parte of req) partes.push(parte as Buffer)
  let datos: { telefono?: unknown; texto?: unknown; historial?: unknown }
  try { datos = JSON.parse(Buffer.concat(partes).toString('utf8') || '{}') } catch { return json(res, 400, { error: 'JSON inválido' }) }

  const telefono = `sim-${String(datos.telefono ?? 'prueba').replace(/[^\w-]/g, '').slice(0, 30)}`
  const texto = String(datos.texto ?? '').trim()
  if (!texto) return json(res, 400, { error: 'Mensaje vacío' })

  // Si Vercel arrancó una copia nueva (memoria vacía), recuperar la plática que trae el navegador
  const historial = Array.isArray(datos.historial) ? (datos.historial as Mensaje[]).slice(-20) : []
  if ((await almacen.historial(telefono, 1)).length === 0) {
    for (const m of historial) {
      if ((m.rol === 'cliente' || m.rol === 'agente') && typeof m.texto === 'string') {
        await almacen.guardarMensaje(telefono, { rol: m.rol, texto: m.texto.slice(0, 2000) })
      }
    }
  }

  try {
    cliente ??= new Anthropic()
    const respuesta = await responder({ cliente, almacen, telefono, texto })
    return json(res, 200, { respuesta })
  } catch (e) {
    console.error(e)
    return json(res, 500, { error: 'El agente no pudo responder' })
  }
}

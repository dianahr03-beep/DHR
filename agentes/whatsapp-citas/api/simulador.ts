// Función de Vercel para el simulador: platicar con el agente desde el navegador, sin WhatsApp.
// Está protegida con CLAVE_SIMULADOR (variable en Vercel) para que nadie gaste tus créditos de IA.
import type { IncomingMessage, ServerResponse } from 'node:http'
import { responder } from '../lib/agente.js'
import { obtenerAlmacen, obtenerClienteIA } from '../lib/config.js'

const json = (res: ServerResponse, estado: number, cuerpo: unknown) => {
  res.statusCode = estado
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(cuerpo))
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Solo POST' })
  const clave = process.env.CLAVE_SIMULADOR
  if (!clave || req.headers['x-clave-simulador'] !== clave) return json(res, 401, { error: 'Clave del simulador incorrecta' })

  const partes: Buffer[] = []
  for await (const parte of req) partes.push(parte as Buffer)
  let datos: { telefono?: unknown; texto?: unknown }
  try { datos = JSON.parse(Buffer.concat(partes).toString('utf8') || '{}') } catch { return json(res, 400, { error: 'JSON inválido' }) }

  const telefono = `sim-${String(datos.telefono ?? 'prueba').replace(/[^\w-]/g, '').slice(0, 30)}`
  const texto = String(datos.texto ?? '').trim()
  if (!texto) return json(res, 400, { error: 'Mensaje vacío' })

  try {
    const respuesta = await responder({ cliente: obtenerClienteIA(), almacen: obtenerAlmacen(), telefono, texto })
    return json(res, 200, { respuesta })
  } catch (e) {
    console.error(e)
    return json(res, 500, { error: 'El agente no pudo responder' })
  }
}

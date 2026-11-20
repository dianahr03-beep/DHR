// Entrada para la VISTA PREVIA del proyecto dhr (sin Supabase ni WhatsApp):
// se empaqueta en ../../api/agente-simulador.js con `npm run empaquetar-demo`.
// Usa el salón de ejemplo en memoria; la conversación la manda el navegador por si la memoria se reinicia.
// La misma función atiende a la clienta (chat) y a la dueña (agenda), para que ambas vean la misma memoria.
import Anthropic from '@anthropic-ai/sdk'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { ahoraEn, fechaBonita, horaBonita, sumarDias } from './lib/agenda.js'
import { responder } from './lib/agente.js'
import { crearAlmacenMemoria } from './lib/almacen-memoria.js'
import { ejecutarHerramienta } from './lib/herramientas.js'
import type { Mensaje } from './lib/tipos.js'

const almacen = crearAlmacenMemoria()
let cliente: Anthropic | undefined

// Unas citas de ejemplo para que la agenda de la dueña no empiece vacía
const ejemplo = (async () => {
  const hoy = ahoraEn('America/Mexico_City').fecha
  const pedidos = [
    { nombre: 'Mariana López', servicio_id: 2, dia: 0, hora: '17:00' },
    { nombre: 'Sofía Ramírez', servicio_id: 3, dia: 1, hora: '11:00' },
    { nombre: 'Daniela Cruz', servicio_id: 5, dia: 1, hora: '13:00' },
    { nombre: 'Lupe García', servicio_id: 1, dia: 2, hora: '10:00' },
  ]
  for (const [i, p] of pedidos.entries()) {
    // si ese día está cerrado o la hora ya pasó, se intenta con los días siguientes
    for (let extra = 0; extra < 4; extra++) {
      const r = await ejecutarHerramienta('agendar_cita',
        { servicio_id: p.servicio_id, fecha: sumarDias(hoy, p.dia + extra), hora: p.hora, nombre_cliente: p.nombre },
        { almacen, telefono: `ejemplo-${i}` })
      if (!r.esError) break
    }
  }
})()

/** Citas de hoy en adelante y avisos, para la pantalla de la dueña. */
async function agendaDelSalon() {
  const salon = await almacen.salon()
  const ahora = ahoraEn(salon.zona_horaria)
  const [servicios, empleadas] = await Promise.all([almacen.servicios(), almacen.empleadas()])
  const citas = almacen._citas
    .filter((c) => c.fecha >= ahora.fecha)
    .sort((a, b) => (a.fecha + a.inicio).localeCompare(b.fecha + b.inicio))
    .map((c) => ({
      id: c.id, dia: c.fecha, inicio: c.inicio,
      fecha: fechaBonita(c.fecha), hora: horaBonita(c.inicio), horaFin: horaBonita(c.fin), clienta: c.cliente_nombre,
      servicio: servicios.find((s) => s.id === c.servicio_id)?.nombre ?? '',
      precio: servicios.find((s) => s.id === c.servicio_id)?.precio ?? 0,
      atiende: empleadas.find((e) => e.id === c.empleada_id)?.nombre ?? '',
    }))
  return { hoy: ahora.fecha, salon: salon.nombre, citas, avisos: almacen._avisos.map((a) => a.motivo).slice(-20).reverse() }
}

const json = (res: ServerResponse, estado: number, cuerpo: unknown) => {
  res.statusCode = estado
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(cuerpo))
}

/** Acciones de la dueña. Reusa las mismas reglas del agente (horas libres, empalmes) con el teléfono de la clienta. */
async function accionDuena(accion: string, datos: Record<string, unknown>) {
  if (accion === 'agenda') return { ok: true, ...(await agendaDelSalon()) }
  const cita = almacen._citas.find((c) => c.id === Number(datos.cita_id))
  if (!cita) return { error: 'No encontré esa cita' }
  const ctx = { almacen, telefono: cita.cliente_tel }
  let r: { resultado: string; esError?: boolean }
  if (accion === 'horas') {
    r = await ejecutarHerramienta('ver_disponibilidad', { servicio_id: cita.servicio_id, fecha: datos.fecha }, ctx)
  } else if (accion === 'mover') {
    r = await ejecutarHerramienta('cambiar_cita', { cita_id: cita.id, fecha: datos.fecha, hora: datos.hora }, ctx)
  } else if (accion === 'cancelar') {
    r = await ejecutarHerramienta('cancelar_cita', { cita_id: cita.id }, ctx)
  } else {
    return { error: 'Acción desconocida' }
  }
  const resultado = JSON.parse(r.resultado)
  if (r.esError) return { error: resultado.error }
  return { ok: true, resultado, ...(await agendaDelSalon()) }
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Solo POST' })
  await ejemplo
  const clave = process.env.CLAVE_SIMULADOR
  if (!clave || req.headers['x-clave-simulador'] !== clave) return json(res, 401, { error: 'Contraseña incorrecta' })

  const partes: Buffer[] = []
  for await (const parte of req) partes.push(parte as Buffer)
  let datos: { telefono?: unknown; texto?: unknown; historial?: unknown; accion?: unknown }
  try { datos = JSON.parse(Buffer.concat(partes).toString('utf8') || '{}') } catch { return json(res, 400, { error: 'JSON inválido' }) }

  if (typeof datos.accion === 'string') {
    try {
      const r = await accionDuena(datos.accion, datos as Record<string, unknown>)
      return json(res, 'error' in r ? 400 : 200, r)
    } catch (e) {
      console.error(e)
      return json(res, 500, { error: 'No se pudo completar' })
    }
  }

  if (!process.env.ANTHROPIC_API_KEY) return json(res, 500, { error: 'Falta ANTHROPIC_API_KEY en Vercel' })
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
    return json(res, 200, { respuesta, agenda: (await agendaDelSalon()).citas })
  } catch (e) {
    console.error(e)
    return json(res, 500, { error: 'El agente no pudo responder' })
  }
}

// Almacén real en Supabase. Usa la llave secreta (service role), que solo vive en Vercel.
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { HorarioOcupadoError, type Almacen, type Cita } from './tipos.js'

const hhmm = (t: string) => t.slice(0, 5) // Postgres devuelve "10:00:00"

const aCita = (r: Record<string, unknown>): Cita => ({
  id: r.id as number,
  fecha: r.fecha as string,
  inicio: hhmm(r.inicio as string),
  fin: hhmm(r.fin as string),
  servicio_id: r.servicio_id as number,
  empleada_id: r.empleada_id as number,
  cliente_nombre: r.cliente_nombre as string,
  cliente_tel: r.cliente_tel as string,
})

function revisar<T>(r: { data: T | null; error: { message: string; code?: string } | null }): T {
  if (r.error) throw new Error(`Supabase: ${r.error.message}`)
  return r.data as T
}

export function crearAlmacenSupabase(url: string, llaveServicio: string): Almacen {
  const db: SupabaseClient = createClient(url, llaveServicio, { auth: { persistSession: false } })

  return {
    async salon() {
      return revisar(await db.from('salon').select('nombre, direccion, zona_horaria, notas').eq('id', 1).single())
    },
    async servicios() {
      const filas = revisar(await db.from('servicios').select('id, nombre, duracion_min, precio, descripcion').eq('activo', true).order('id'))
      return filas.map((s) => ({ ...s, precio: Number(s.precio) }))
    },
    async empleadas() {
      return revisar(await db.from('empleadas').select('id, nombre').eq('activa', true).order('id'))
    },
    async horarios() {
      const filas = revisar(await db.from('horarios').select('dia_semana, abre, cierra'))
      return filas.map((h) => ({ dia_semana: h.dia_semana, abre: hhmm(h.abre), cierra: hhmm(h.cierra) }))
    },
    async citasConfirmadasDelDia(fecha) {
      return revisar(await db.from('citas').select('*').eq('fecha', fecha).eq('estado', 'confirmada')).map(aCita)
    },
    async crearCita(n) {
      const r = await db.from('citas').insert(n).select('*').single()
      // 23P01 = el candado "sin_empalmes" detectó que la empleada ya tiene cita a esa hora
      if (r.error?.code === '23P01') throw new HorarioOcupadoError()
      return aCita(revisar(r))
    },
    async citasDeCliente(tel, desde) {
      return revisar(await db.from('citas').select('*').eq('cliente_tel', tel).eq('estado', 'confirmada')
        .gte('fecha', desde).order('fecha').order('inicio')).map(aCita)
    },
    async cancelarCita(id, tel) {
      const filas = revisar(await db.from('citas').update({ estado: 'cancelada' })
        .eq('id', id).eq('cliente_tel', tel).eq('estado', 'confirmada').select('id'))
      return filas.length > 0
    },
    async moverCita(id, tel, cambios) {
      const r = await db.from('citas').update({ ...cambios, recordatorio_enviado: false })
        .eq('id', id).eq('cliente_tel', tel).eq('estado', 'confirmada').select('*')
      if (r.error?.code === '23P01') throw new HorarioOcupadoError()
      const filas = revisar(r)
      return filas.length ? aCita(filas[0]) : null
    },
    async reclamarRecordatorios(fecha) {
      // Un solo UPDATE: si el aviso programado corre dos veces, la segunda ya no encuentra nada.
      return revisar(await db.from('citas').update({ recordatorio_enviado: true })
        .eq('fecha', fecha).eq('estado', 'confirmada').eq('recordatorio_enviado', false).select('*')).map(aCita)
    },
    async historial(tel, limite) {
      const filas = revisar(await db.from('mensajes').select('rol, texto').eq('telefono', tel)
        .order('creado', { ascending: false }).limit(limite))
      return filas.reverse()
    },
    async guardarMensaje(tel, m, waId) {
      const r = await db.from('mensajes').insert({ telefono: tel, rol: m.rol, texto: m.texto, wa_id: waId ?? null })
      if (r.error?.code === '23505') return false // ese mensaje de WhatsApp ya estaba guardado
      revisar(r)
      return true
    },
    async crearAviso(telefono, nombre, motivo) {
      revisar(await db.from('avisos').insert({ telefono, nombre, motivo }))
    },
  }
}

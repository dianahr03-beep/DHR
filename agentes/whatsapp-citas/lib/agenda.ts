// Cálculo de horarios libres. Sin internet ni base de datos: fácil de probar.
import type { Cita, Empleada, Horario, Servicio } from './tipos.js'

export const aMinutos = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export const aHora = (min: number): string =>
  `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`

/** 0 = domingo ... 6 = sábado, para una fecha "AAAA-MM-DD". */
export const diaSemana = (fecha: string): number => new Date(`${fecha}T12:00:00Z`).getUTCDay()

export const esFechaValida = (fecha: string): boolean =>
  /^\d{4}-\d{2}-\d{2}$/.test(fecha) && new Date(`${fecha}T12:00:00Z`).toISOString().slice(0, 10) === fecha

export const esHoraValida = (hora: string): boolean => /^([01]\d|2[0-3]):[0-5]\d$/.test(hora)

/** Fecha y hora actuales en la zona horaria del salón. */
export function ahoraEn(zona: string, ahora = new Date()): { fecha: string; hora: string; texto: string } {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: zona, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(ahora)
  const p = (t: string) => partes.find((x) => x.type === t)?.value ?? '00'
  const texto = new Intl.DateTimeFormat('es-MX', {
    timeZone: zona, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(ahora)
  return { fecha: `${p('year')}-${p('month')}-${p('day')}`, hora: `${p('hour')}:${p('minute')}`, texto }
}

export interface EspacioLibre {
  hora: string
  empleadas: Empleada[]
}

/**
 * Horas en las que cabe el servicio completo con al menos una empleada libre.
 * Revisa cada `paso` minutos dentro del horario del día y no ofrece horas que ya pasaron.
 */
export function horariosLibres(p: {
  fecha: string
  servicio: Servicio
  empleadas: Empleada[]
  horarios: Horario[]
  citas: Cita[]
  ahora: { fecha: string; hora: string }
  paso?: number
}): EspacioLibre[] {
  const paso = p.paso ?? 30
  if (p.fecha < p.ahora.fecha) return []
  const horario = p.horarios.find((h) => h.dia_semana === diaSemana(p.fecha))
  if (!horario) return []

  const abre = aMinutos(horario.abre)
  const cierra = aMinutos(horario.cierra)
  const minimo = p.fecha === p.ahora.fecha ? aMinutos(p.ahora.hora) + 30 : 0 // al menos 30 min de anticipación

  const libres: EspacioLibre[] = []
  for (let inicio = abre; inicio + p.servicio.duracion_min <= cierra; inicio += paso) {
    if (inicio < minimo) continue
    const fin = inicio + p.servicio.duracion_min
    const disponibles = p.empleadas.filter((e) =>
      !p.citas.some((c) => c.empleada_id === e.id && aMinutos(c.inicio) < fin && aMinutos(c.fin) > inicio),
    )
    if (disponibles.length) libres.push({ hora: aHora(inicio), empleadas: disponibles })
  }
  return libres
}

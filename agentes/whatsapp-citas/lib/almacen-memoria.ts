// Almacén en memoria: para pruebas y para el simulador sin base de datos.
// Se borra al reiniciar. En producción se usa almacen-supabase.ts.
import { aMinutos } from './agenda.js'
import { HorarioOcupadoError, type Almacen, type Cita, type Empleada, type Horario, type Mensaje, type NuevaCita, type Salon, type Servicio } from './tipos.js'

export function crearAlmacenMemoria(datos?: Partial<{
  salon: Salon; servicios: Servicio[]; empleadas: Empleada[]; horarios: Horario[]; citas: Cita[]
}>): Almacen & { _citas: Cita[]; _avisos: { telefono: string; motivo: string }[] } {
  const salon: Salon = datos?.salon ?? {
    nombre: 'Salón de Uñas Demo',
    direccion: 'Av. Ejemplo 123, Col. Centro',
    zona_horaria: 'America/Mexico_City',
    notas: 'Tolerancia de 10 minutos. Para cancelar, avisar con al menos 3 horas. Pago en efectivo o tarjeta.',
  }
  const servicios: Servicio[] = datos?.servicios ?? [
    { id: 1, nombre: 'Manicure clásico', duracion_min: 45, precio: 250, descripcion: 'Limado, cutícula, hidratación y esmalte normal' },
    { id: 2, nombre: 'Gelish en manos', duracion_min: 60, precio: 350, descripcion: 'Esmalte semipermanente, dura 2 a 3 semanas' },
    { id: 3, nombre: 'Uñas acrílicas (set)', duracion_min: 120, precio: 650, descripcion: 'Set completo de acrílico con diseño sencillo' },
    { id: 4, nombre: 'Retoque de acrílico', duracion_min: 90, precio: 450, descripcion: 'Relleno de acrílico de 2 a 3 semanas' },
    { id: 5, nombre: 'Pedicure spa', duracion_min: 60, precio: 380, descripcion: 'Exfoliación, masaje y esmalte' },
  ]
  const empleadas: Empleada[] = datos?.empleadas ?? [{ id: 1, nombre: 'Karla' }, { id: 2, nombre: 'Lupita' }, { id: 3, nombre: 'Fer' }]
  const horarios: Horario[] = datos?.horarios ?? [1, 2, 3, 4, 5].map((d) => ({ dia_semana: d, abre: '10:00', cierra: '20:00' }))
    .concat([{ dia_semana: 6, abre: '09:00', cierra: '18:00' }])
  const citas: Cita[] = [...(datos?.citas ?? [])]
  const mensajes = new Map<string, Mensaje[]>()
  const vistos = new Set<string>()
  const recordados = new Set<number>()
  const avisos: { telefono: string; motivo: string }[] = []
  let siguienteId = citas.reduce((m, c) => Math.max(m, c.id), 0) + 1

  return {
    _citas: citas,
    _avisos: avisos,
    salon: async () => salon,
    servicios: async () => servicios,
    empleadas: async () => empleadas,
    horarios: async () => horarios,
    citasConfirmadasDelDia: async (fecha) => citas.filter((c) => c.fecha === fecha),
    async crearCita(n: NuevaCita) {
      const empalme = citas.some((c) => c.empleada_id === n.empleada_id && c.fecha === n.fecha &&
        aMinutos(c.inicio) < aMinutos(n.fin) && aMinutos(c.fin) > aMinutos(n.inicio))
      if (empalme) throw new HorarioOcupadoError()
      const cita = { ...n, id: siguienteId++ }
      citas.push(cita)
      return cita
    },
    citasDeCliente: async (tel, desde) => citas.filter((c) => c.cliente_tel === tel && c.fecha >= desde)
      .sort((a, b) => (a.fecha + a.inicio).localeCompare(b.fecha + b.inicio)),
    async cancelarCita(id, tel) {
      const i = citas.findIndex((c) => c.id === id && c.cliente_tel === tel)
      if (i < 0) return false
      citas.splice(i, 1)
      return true
    },
    async moverCita(id, tel, cambios) {
      const cita = citas.find((c) => c.id === id && c.cliente_tel === tel)
      if (!cita) return null
      const empalme = citas.some((c) => c !== cita && c.empleada_id === cambios.empleada_id && c.fecha === cambios.fecha &&
        aMinutos(c.inicio) < aMinutos(cambios.fin) && aMinutos(c.fin) > aMinutos(cambios.inicio))
      if (empalme) throw new HorarioOcupadoError()
      Object.assign(cita, cambios)
      recordados.delete(id) // nueva fecha: nuevo recordatorio
      return cita
    },
    async reclamarRecordatorios(fecha) {
      const pendientes = citas.filter((c) => c.fecha === fecha && !recordados.has(c.id))
      pendientes.forEach((c) => recordados.add(c.id))
      return pendientes
    },
    historial: async (tel, limite) => (mensajes.get(tel) ?? []).slice(-limite),
    async guardarMensaje(tel, m, waId) {
      if (waId) {
        if (vistos.has(waId)) return false
        vistos.add(waId)
      }
      mensajes.set(tel, [...(mensajes.get(tel) ?? []), m])
      return true
    },
    async crearAviso(telefono, _nombre, motivo) {
      avisos.push({ telefono, motivo })
    },
  }
}

// Tipos compartidos de la agenda.

export interface Salon {
  nombre: string
  direccion: string | null
  zona_horaria: string
  notas: string | null
}

export interface Servicio {
  id: number
  nombre: string
  duracion_min: number
  precio: number
  descripcion: string | null
}

export interface Empleada {
  id: number
  nombre: string
}

/** dia_semana: 0 = domingo ... 6 = sábado. Horas "HH:MM". */
export interface Horario {
  dia_semana: number
  abre: string
  cierra: string
}

export interface Cita {
  id: number
  fecha: string // "AAAA-MM-DD"
  inicio: string // "HH:MM"
  fin: string // "HH:MM"
  servicio_id: number
  empleada_id: number
  cliente_nombre: string
  cliente_tel: string
}

export type NuevaCita = Omit<Cita, 'id'>

export interface Mensaje {
  rol: 'cliente' | 'agente'
  texto: string
}

/** Se lanza cuando el horario ya se ocupó (otra clienta ganó el lugar). */
export class HorarioOcupadoError extends Error {
  constructor() {
    super('Ese horario se acaba de ocupar')
  }
}

/** Todo lo que el agente necesita leer o guardar. Hay dos versiones: en memoria (pruebas) y Supabase (real). */
export interface Almacen {
  salon(): Promise<Salon>
  servicios(): Promise<Servicio[]>
  empleadas(): Promise<Empleada[]>
  horarios(): Promise<Horario[]>
  citasConfirmadasDelDia(fecha: string): Promise<Cita[]>
  crearCita(c: NuevaCita): Promise<Cita>
  citasDeCliente(telefono: string, desdeFecha: string): Promise<Cita[]>
  cancelarCita(id: number, telefono: string): Promise<boolean>
  /** Cambia fecha/hora/empleada de una cita de esa clienta. null si no es suya. Lanza HorarioOcupadoError si ya se ocupó. */
  moverCita(id: number, telefono: string, cambios: Pick<Cita, 'fecha' | 'inicio' | 'fin' | 'empleada_id'>): Promise<Cita | null>
  /** Citas confirmadas de esa fecha a las que aún no se manda recordatorio; las marca como enviadas (así nunca se manda doble). */
  reclamarRecordatorios(fecha: string): Promise<Cita[]>
  historial(telefono: string, limite: number): Promise<Mensaje[]>
  /** Devuelve false si ese mensaje de WhatsApp (waId) ya se había guardado: así no contestamos doble. */
  guardarMensaje(telefono: string, m: Mensaje, waId?: string): Promise<boolean>
  crearAviso(telefono: string, nombre: string | null, motivo: string): Promise<void>
}

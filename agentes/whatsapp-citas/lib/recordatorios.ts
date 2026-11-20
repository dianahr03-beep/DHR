// Recordatorio automático un día antes de cada cita.
import { ahoraEn, fechaBonita, horaBonita, sumarDias } from './agenda.js'
import type { Almacen, Cita } from './tipos.js'

/** Texto del recordatorio. Debe coincidir con la plantilla aprobada en Meta (ver LEEME). */
export const textoRecordatorio = (v: string[]) =>
  `Hola ${v[0]} 💅 Te recordamos tu cita de ${v[1]} mañana ${v[2]} a las ${v[3]} en ${v[4]}. ` +
  `Responde a este mensaje si necesitas cambiarla o cancelarla.`

export async function enviarRecordatorios(p: {
  almacen: Almacen
  enviar: (cita: Cita, variables: string[]) => Promise<void>
  ahora?: Date
}): Promise<{ enviados: number; fallidos: number }> {
  const { almacen } = p
  const salon = await almacen.salon()
  const manana = sumarDias(ahoraEn(salon.zona_horaria, p.ahora).fecha, 1)
  const [citas, servicios] = await Promise.all([almacen.reclamarRecordatorios(manana), almacen.servicios()])

  let enviados = 0
  let fallidos = 0
  for (const cita of citas) {
    if (cita.cliente_tel.startsWith('sim-')) continue // citas hechas en el simulador: no son números reales
    const variables = [
      cita.cliente_nombre,
      servicios.find((s) => s.id === cita.servicio_id)?.nombre ?? 'tu servicio',
      fechaBonita(cita.fecha),
      horaBonita(cita.inicio),
      salon.nombre,
    ]
    try {
      await p.enviar(cita, variables)
      // Se guarda en la conversación para que el agente entienda si la clienta contesta
      await almacen.guardarMensaje(cita.cliente_tel, { rol: 'agente', texto: textoRecordatorio(variables) })
      enviados++
    } catch (e) {
      fallidos++
      console.error('No se pudo mandar recordatorio', cita.id, e)
      await almacen.crearAviso(cita.cliente_tel, cita.cliente_nombre,
        `No se pudo mandar el recordatorio de la cita del ${fechaBonita(cita.fecha)} a las ${horaBonita(cita.inicio)}`).catch(() => {})
    }
  }
  return { enviados, fallidos }
}

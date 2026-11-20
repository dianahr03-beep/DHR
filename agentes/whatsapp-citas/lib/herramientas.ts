// Las "herramientas" que el agente puede usar. El agente decide cuándo usarlas;
// el código revisa todo (fechas, horarios, que la cita sea de quien escribe).
import type Anthropic from '@anthropic-ai/sdk'
import { aHora, aMinutos, ahoraEn, esFechaValida, esHoraValida, horariosLibres } from './agenda.js'
import { HorarioOcupadoError, type Almacen } from './tipos.js'

export const definicionHerramientas: Anthropic.Tool[] = [
  {
    name: 'ver_servicios',
    description: 'Lista los servicios del salón con su id, duración en minutos y precio en pesos. Úsala antes de dar precios o agendar.',
    input_schema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'ver_disponibilidad',
    description: 'Devuelve las horas libres de un día para un servicio, y qué empleadas pueden atender a cada hora. Úsala siempre antes de ofrecer o confirmar una hora.',
    input_schema: {
      type: 'object',
      properties: {
        servicio_id: { type: 'integer', description: 'id del servicio (de ver_servicios)' },
        fecha: { type: 'string', description: 'Fecha en formato AAAA-MM-DD' },
      },
      required: ['servicio_id', 'fecha'],
      additionalProperties: false,
    },
  },
  {
    name: 'agendar_cita',
    description: 'Agenda la cita para la persona que está escribiendo. Úsala solo cuando la clienta ya confirmó servicio, fecha, hora y su nombre.',
    input_schema: {
      type: 'object',
      properties: {
        servicio_id: { type: 'integer' },
        fecha: { type: 'string', description: 'AAAA-MM-DD' },
        hora: { type: 'string', description: 'HH:MM en formato de 24 horas, una de las horas libres' },
        nombre_cliente: { type: 'string' },
        empleada_id: { type: 'integer', description: 'Opcional: solo si la clienta pidió a una empleada en particular' },
      },
      required: ['servicio_id', 'fecha', 'hora', 'nombre_cliente'],
      additionalProperties: false,
    },
  },
  {
    name: 'mis_citas',
    description: 'Muestra las próximas citas confirmadas de la persona que está escribiendo.',
    input_schema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'cambiar_cita',
    description: 'Cambia la fecha u hora de una cita de la persona que está escribiendo (mismo servicio). Antes consulta ver_disponibilidad y confirma con ella la nueva hora.',
    input_schema: {
      type: 'object',
      properties: {
        cita_id: { type: 'integer', description: 'id de la cita (de mis_citas)' },
        fecha: { type: 'string', description: 'Nueva fecha AAAA-MM-DD' },
        hora: { type: 'string', description: 'Nueva hora HH:MM en formato de 24 horas' },
      },
      required: ['cita_id', 'fecha', 'hora'],
      additionalProperties: false,
    },
  },
  {
    name: 'cancelar_cita',
    description: 'Cancela una cita de la persona que está escribiendo. Confirma con ella antes de cancelar.',
    input_schema: {
      type: 'object',
      properties: { cita_id: { type: 'integer' } },
      required: ['cita_id'],
      additionalProperties: false,
    },
  },
  {
    name: 'pasar_con_persona',
    description: 'Avisa a la dueña para que una persona atienda: quejas, cambios de precio, dudas que no puedes resolver con la información que tienes, o si la clienta pide hablar con alguien.',
    input_schema: {
      type: 'object',
      properties: {
        motivo: { type: 'string', description: 'Resumen corto de lo que necesita la clienta' },
        nombre_cliente: { type: 'string', description: 'Si ya lo sabes' },
      },
      required: ['motivo'],
      additionalProperties: false,
    },
  },
]

type Entrada = Record<string, unknown>
const entero = (v: unknown) => (typeof v === 'number' && Number.isInteger(v) ? v : Number.NaN)
const texto = (v: unknown, max = 120) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

/** Ejecuta una herramienta y devuelve el resultado en texto (JSON) para el agente. */
export async function ejecutarHerramienta(
  nombre: string,
  entrada: Entrada,
  ctx: { almacen: Almacen; telefono: string; ahora?: Date },
): Promise<{ resultado: string; esError?: boolean }> {
  const { almacen, telefono } = ctx
  const salon = await almacen.salon()
  const ahora = ahoraEn(salon.zona_horaria, ctx.ahora)
  const ok = (x: unknown) => ({ resultado: JSON.stringify(x) })
  const error = (mensaje: string) => ({ resultado: JSON.stringify({ error: mensaje }), esError: true })

  switch (nombre) {
    case 'ver_servicios':
      return ok(await almacen.servicios())

    case 'ver_disponibilidad': {
      const fecha = texto(entrada.fecha)
      if (!esFechaValida(fecha)) return error('Fecha inválida, usa AAAA-MM-DD')
      const servicio = (await almacen.servicios()).find((s) => s.id === entero(entrada.servicio_id))
      if (!servicio) return error('No existe ese servicio')
      const libres = horariosLibres({
        fecha, servicio, ahora,
        empleadas: await almacen.empleadas(),
        horarios: await almacen.horarios(),
        citas: await almacen.citasConfirmadasDelDia(fecha),
      })
      return ok({
        fecha, servicio: servicio.nombre, duracion_min: servicio.duracion_min,
        horas_libres: libres.map((l) => ({ hora: l.hora, empleadas: l.empleadas.map((e) => ({ id: e.id, nombre: e.nombre })) })),
        nota: libres.length ? undefined : 'No hay horas libres ese día (cerrado, lleno o ya pasó).',
      })
    }

    case 'agendar_cita': {
      const fecha = texto(entrada.fecha)
      const hora = texto(entrada.hora)
      const nombreCliente = texto(entrada.nombre_cliente, 80)
      if (!esFechaValida(fecha) || !esHoraValida(hora)) return error('Fecha u hora inválida')
      if (!nombreCliente) return error('Falta el nombre de la clienta')
      const servicio = (await almacen.servicios()).find((s) => s.id === entero(entrada.servicio_id))
      if (!servicio) return error('No existe ese servicio')

      const libres = horariosLibres({
        fecha, servicio, ahora,
        empleadas: await almacen.empleadas(),
        horarios: await almacen.horarios(),
        citas: await almacen.citasConfirmadasDelDia(fecha),
      })
      const espacio = libres.find((l) => l.hora === hora)
      if (!espacio) return error('Esa hora no está libre. Vuelve a consultar ver_disponibilidad.')
      const pedida = entrada.empleada_id === undefined ? undefined : entero(entrada.empleada_id)
      const candidatas = pedida === undefined ? espacio.empleadas : espacio.empleadas.filter((e) => e.id === pedida)
      if (!candidatas.length) return error('Esa empleada no está libre a esa hora')

      for (const empleada of candidatas) {
        try {
          const cita = await almacen.crearCita({
            fecha, inicio: hora, fin: aHora(aMinutos(hora) + servicio.duracion_min),
            servicio_id: servicio.id, empleada_id: empleada.id, cliente_nombre: nombreCliente, cliente_tel: telefono,
          })
          return ok({ confirmada: true, cita_id: cita.id, fecha, hora, servicio: servicio.nombre, precio: servicio.precio, atiende: empleada.nombre })
        } catch (e) {
          if (!(e instanceof HorarioOcupadoError)) throw e // si otra clienta ganó el lugar, probamos con la siguiente empleada
        }
      }
      return error('Esa hora se acaba de ocupar. Ofrece otra hora.')
    }

    case 'mis_citas': {
      const [citas, servicios, empleadas] = await Promise.all([
        almacen.citasDeCliente(telefono, ahora.fecha), almacen.servicios(), almacen.empleadas(),
      ])
      return ok(citas.map((c) => ({
        cita_id: c.id, fecha: c.fecha, hora: c.inicio,
        servicio: servicios.find((s) => s.id === c.servicio_id)?.nombre,
        atiende: empleadas.find((e) => e.id === c.empleada_id)?.nombre,
      })))
    }

    case 'cambiar_cita': {
      const fecha = texto(entrada.fecha)
      const hora = texto(entrada.hora)
      if (!esFechaValida(fecha) || !esHoraValida(hora)) return error('Fecha u hora inválida')
      const id = entero(entrada.cita_id)
      const cita = (await almacen.citasDeCliente(telefono, ahora.fecha)).find((c) => c.id === id)
      if (!cita) return error('No encontré esa cita a nombre de este número')
      const servicio = (await almacen.servicios()).find((s) => s.id === cita.servicio_id)
      if (!servicio) return error('El servicio de esa cita ya no existe; pasa con una persona')

      // Para calcular horas libres no cuenta la propia cita que se va a mover
      const libres = horariosLibres({
        fecha, servicio, ahora,
        empleadas: await almacen.empleadas(),
        horarios: await almacen.horarios(),
        citas: (await almacen.citasConfirmadasDelDia(fecha)).filter((c) => c.id !== cita.id),
      })
      const espacio = libres.find((l) => l.hora === hora)
      if (!espacio) return error('Esa hora no está libre. Vuelve a consultar ver_disponibilidad.')
      // Si su misma empleada puede, se queda con ella
      const orden = [...espacio.empleadas].sort((a, b) => Number(b.id === cita.empleada_id) - Number(a.id === cita.empleada_id))
      for (const empleada of orden) {
        try {
          const movida = await almacen.moverCita(cita.id, telefono, {
            fecha, inicio: hora, fin: aHora(aMinutos(hora) + servicio.duracion_min), empleada_id: empleada.id,
          })
          if (!movida) return error('No encontré esa cita a nombre de este número')
          return ok({ cambiada: true, cita_id: movida.id, fecha, hora, servicio: servicio.nombre, atiende: empleada.nombre })
        } catch (e) {
          if (!(e instanceof HorarioOcupadoError)) throw e
        }
      }
      return error('Esa hora se acaba de ocupar. Ofrece otra hora.')
    }

    case 'cancelar_cita': {
      const cancelada = await almacen.cancelarCita(entero(entrada.cita_id), telefono)
      return cancelada ? ok({ cancelada: true }) : error('No encontré esa cita a nombre de este número')
    }

    case 'pasar_con_persona': {
      const motivo = texto(entrada.motivo, 500)
      if (!motivo) return error('Falta el motivo')
      await almacen.crearAviso(telefono, texto(entrada.nombre_cliente, 80) || null, motivo)
      return ok({ avisado: true, mensaje: 'La dueña ya recibió el aviso y responderá personalmente.' })
    }

    default:
      return error(`Herramienta desconocida: ${nombre}`)
  }
}

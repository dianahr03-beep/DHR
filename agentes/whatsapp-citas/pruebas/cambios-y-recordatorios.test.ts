import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fechaBonita, horaBonita, sumarDias } from '../lib/agenda.js'
import { crearAlmacenMemoria } from '../lib/almacen-memoria.js'
import { ejecutarHerramienta } from '../lib/herramientas.js'
import { enviarRecordatorios, textoRecordatorio } from '../lib/recordatorios.js'

const empleadas = [{ id: 1, nombre: 'Karla' }, { id: 2, nombre: 'Lupita' }]
const horarios = [{ dia_semana: 5, abre: '10:00', cierra: '13:00' }, { dia_semana: 6, abre: '10:00', cierra: '13:00' }]
const ahora = new Date('2026-11-19T15:00:00Z') // jueves 19, 9:00 am CDMX

async function conCita(tel = '521', hora = '10:00') {
  const almacen = crearAlmacenMemoria({ empleadas, horarios })
  await ejecutarHerramienta('agendar_cita', { servicio_id: 2, fecha: '2026-11-20', hora, nombre_cliente: 'Ana' }, { almacen, telefono: tel, ahora })
  return almacen
}

test('formatos para la clienta', () => {
  assert.equal(fechaBonita('2026-11-21'), 'sábado, 21 de noviembre')
  assert.equal(horaBonita('16:30'), '4:30 pm')
  assert.equal(horaBonita('12:00'), '12:00 pm')
  assert.equal(horaBonita('09:05'), '9:05 am')
  assert.equal(sumarDias('2026-12-31', 1), '2027-01-01')
})

test('cambiar cita: se mueve conservando a la misma empleada si puede', async () => {
  const almacen = await conCita()
  const id = almacen._citas[0].id
  // 10:30 se encima con su propia cita de 10:00-11:00: debe permitirse porque es la misma
  const r = JSON.parse((await ejecutarHerramienta('cambiar_cita', { cita_id: id, fecha: '2026-11-20', hora: '10:30' }, { almacen, telefono: '521', ahora })).resultado)
  assert.equal(r.cambiada, true)
  assert.equal(r.atiende, 'Karla')
  assert.deepEqual([almacen._citas.length, almacen._citas[0].inicio, almacen._citas[0].fin], [1, '10:30', '11:30'])
})

test('cambiar cita: a otro día y respetando a las demás clientas', async () => {
  const almacen = await conCita()
  await ejecutarHerramienta('agendar_cita', { servicio_id: 2, fecha: '2026-11-21', hora: '11:00', nombre_cliente: 'Bety' }, { almacen, telefono: '522', ahora })
  await ejecutarHerramienta('agendar_cita', { servicio_id: 2, fecha: '2026-11-21', hora: '11:00', nombre_cliente: 'Caro' }, { almacen, telefono: '523', ahora })
  const id = almacen._citas[0].id
  const lleno = await ejecutarHerramienta('cambiar_cita', { cita_id: id, fecha: '2026-11-21', hora: '11:00' }, { almacen, telefono: '521', ahora })
  assert.ok(lleno.esError, 'a las 11 del sábado ya están las dos empleadas ocupadas')
  const ok = JSON.parse((await ejecutarHerramienta('cambiar_cita', { cita_id: id, fecha: '2026-11-21', hora: '12:00' }, { almacen, telefono: '521', ahora })).resultado)
  assert.equal(ok.fecha, '2026-11-21')
})

test('cambiar cita: nadie puede mover la cita de otra persona', async () => {
  const almacen = await conCita()
  const r = await ejecutarHerramienta('cambiar_cita', { cita_id: almacen._citas[0].id, fecha: '2026-11-20', hora: '12:00' }, { almacen, telefono: '999', ahora })
  assert.ok(r.esError)
  assert.equal(almacen._citas[0].inicio, '10:00')
})

test('recordatorios: solo citas de mañana, una sola vez, y quedan en la conversación', async () => {
  const almacen = await conCita('521')
  await ejecutarHerramienta('agendar_cita', { servicio_id: 2, fecha: '2026-11-21', hora: '10:00', nombre_cliente: 'Bety' }, { almacen, telefono: '522', ahora })
  await ejecutarHerramienta('agendar_cita', { servicio_id: 2, fecha: '2026-11-20', hora: '11:00', nombre_cliente: 'Sim' }, { almacen, telefono: 'sim-abc', ahora })
  const enviados: { tel: string; variables: string[] }[] = []
  const enviar = async (c: { cliente_tel: string }, variables: string[]) => { enviados.push({ tel: c.cliente_tel, variables }) }

  assert.deepEqual(await enviarRecordatorios({ almacen, enviar, ahora }), { enviados: 1, fallidos: 0 })
  assert.deepEqual(enviados, [{ tel: '521', variables: ['Ana', 'Gelish en manos', 'viernes, 20 de noviembre', '10:00 am', 'Salón de Uñas Demo'] }])
  assert.deepEqual(await enviarRecordatorios({ almacen, enviar, ahora }), { enviados: 0, fallidos: 0 }, 'no se manda doble')
  assert.deepEqual(await almacen.historial('521', 5), [{ rol: 'agente', texto: textoRecordatorio(enviados[0].variables) }])
})

test('recordatorios: si WhatsApp falla, se avisa a la dueña', async () => {
  const almacen = await conCita('521')
  const r = await enviarRecordatorios({ almacen, enviar: async () => { throw new Error('sin saldo') }, ahora })
  assert.deepEqual(r, { enviados: 0, fallidos: 1 })
  assert.equal(almacen._avisos.length, 1)
})

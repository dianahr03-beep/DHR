import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ahoraEn, diaSemana, esFechaValida, horariosLibres } from '../lib/agenda.js'
import { crearAlmacenMemoria } from '../lib/almacen-memoria.js'
import { ejecutarHerramienta } from '../lib/herramientas.js'
import { firmaValida, leerMensajes } from '../lib/whatsapp.js'
import { createHmac } from 'node:crypto'

const gelish = { id: 2, nombre: 'Gelish', duracion_min: 60, precio: 350, descripcion: null }
const empleadas = [{ id: 1, nombre: 'Karla' }, { id: 2, nombre: 'Lupita' }]
const horarios = [{ dia_semana: 5, abre: '10:00', cierra: '13:00' }] // solo viernes
const ayer = { fecha: '2026-11-19', hora: '09:00' }

test('fechas y días de la semana', () => {
  assert.equal(diaSemana('2026-11-21'), 6) // sábado
  assert.equal(diaSemana('2026-11-20'), 5) // viernes
  assert.ok(esFechaValida('2026-02-28'))
  assert.ok(!esFechaValida('2026-02-30'))
  assert.ok(!esFechaValida('21/11/2026'))
})

test('hora de México sin horario de verano', () => {
  const a = ahoraEn('America/Mexico_City', new Date('2026-11-20T23:30:00Z'))
  assert.equal(a.fecha, '2026-11-20')
  assert.equal(a.hora, '17:30')
})

test('el servicio debe caber completo antes de cerrar', () => {
  const libres = horariosLibres({ fecha: '2026-11-20', servicio: gelish, empleadas, horarios, citas: [], ahora: ayer })
  assert.deepEqual(libres.map((l) => l.hora), ['10:00', '10:30', '11:00', '11:30', '12:00'])
})

test('día cerrado y fechas pasadas no tienen horas', () => {
  assert.equal(horariosLibres({ fecha: '2026-11-22', servicio: gelish, empleadas, horarios, citas: [], ahora: ayer }).length, 0)
  assert.equal(horariosLibres({ fecha: '2026-11-13', servicio: gelish, empleadas, horarios, citas: [], ahora: ayer }).length, 0)
})

test('hoy solo ofrece horas con 30 minutos de anticipación', () => {
  const libres = horariosLibres({ fecha: '2026-11-20', servicio: gelish, empleadas, horarios, citas: [], ahora: { fecha: '2026-11-20', hora: '10:10' } })
  assert.equal(libres[0].hora, '11:00')
})

test('una hora se ocupa solo cuando todas las empleadas tienen cita', () => {
  const cita = (id: number, empleada_id: number) => ({ id, fecha: '2026-11-20', inicio: '10:00', fin: '11:00', servicio_id: 2, empleada_id, cliente_nombre: 'X', cliente_tel: '1' })
  const una = horariosLibres({ fecha: '2026-11-20', servicio: gelish, empleadas, horarios, citas: [cita(1, 1)], ahora: ayer })
  assert.deepEqual(una[0], { hora: '10:00', empleadas: [{ id: 2, nombre: 'Lupita' }] })
  const dos = horariosLibres({ fecha: '2026-11-20', servicio: gelish, empleadas, horarios, citas: [cita(1, 1), cita(2, 2)], ahora: ayer })
  assert.equal(dos[0].hora, '11:00')
})

test('agendar: no permite empalmes y reparte entre empleadas', async () => {
  const almacen = crearAlmacenMemoria({ empleadas, horarios })
  const ctx = (telefono: string) => ({ almacen, telefono, ahora: new Date('2026-11-19T15:00:00Z') })
  const pedir = (tel: string, nombre: string) =>
    ejecutarHerramienta('agendar_cita', { servicio_id: 2, fecha: '2026-11-20', hora: '10:00', nombre_cliente: nombre }, ctx(tel))

  const a = JSON.parse((await pedir('521', 'Ana')).resultado)
  const b = JSON.parse((await pedir('522', 'Bety')).resultado)
  const c = await pedir('523', 'Caro')
  assert.equal(a.atiende, 'Karla')
  assert.equal(b.atiende, 'Lupita')
  assert.ok(c.esError, 'la tercera ya no cabe: solo hay dos empleadas')
  assert.equal(almacen._citas.length, 2)
})

test('solo puedes ver y cancelar tus propias citas', async () => {
  const almacen = crearAlmacenMemoria({ empleadas, horarios })
  const ahora = new Date('2026-11-19T15:00:00Z')
  await ejecutarHerramienta('agendar_cita', { servicio_id: 2, fecha: '2026-11-20', hora: '11:00', nombre_cliente: 'Ana' }, { almacen, telefono: '521', ahora })
  const id = almacen._citas[0].id
  const ajenas = JSON.parse((await ejecutarHerramienta('mis_citas', {}, { almacen, telefono: '999', ahora })).resultado)
  assert.equal(ajenas.length, 0)
  assert.ok((await ejecutarHerramienta('cancelar_cita', { cita_id: id }, { almacen, telefono: '999', ahora })).esError)
  assert.equal(almacen._citas.length, 1)
  assert.ok(!(await ejecutarHerramienta('cancelar_cita', { cita_id: id }, { almacen, telefono: '521', ahora })).esError)
  assert.equal(almacen._citas.length, 0)
})

test('agendar rechaza horas que no están libres o fuera de horario', async () => {
  const almacen = crearAlmacenMemoria({ empleadas, horarios })
  const ctx = { almacen, telefono: '521', ahora: new Date('2026-11-19T15:00:00Z') }
  assert.ok((await ejecutarHerramienta('agendar_cita', { servicio_id: 2, fecha: '2026-11-20', hora: '12:30', nombre_cliente: 'Ana' }, ctx)).esError)
  assert.ok((await ejecutarHerramienta('agendar_cita', { servicio_id: 2, fecha: '2026-11-22', hora: '10:00', nombre_cliente: 'Ana' }, ctx)).esError)
  assert.ok((await ejecutarHerramienta('agendar_cita', { servicio_id: 99, fecha: '2026-11-20', hora: '10:00', nombre_cliente: 'Ana' }, ctx)).esError)
})

test('WhatsApp: firma de Meta y lectura de mensajes', () => {
  const cuerpo = JSON.stringify({ entry: [{ changes: [{ value: {
    contacts: [{ wa_id: '5215511112222', profile: { name: 'Ana' } }],
    messages: [{ id: 'wamid.1', from: '5215511112222', type: 'text', text: { body: 'Hola' } }, { id: 'wamid.2', from: '5215511112222', type: 'image' }],
  } }] }] })
  const firma = 'sha256=' + createHmac('sha256', 'secreto').update(cuerpo).digest('hex')
  assert.ok(firmaValida(cuerpo, firma, 'secreto'))
  assert.ok(!firmaValida(cuerpo, firma, 'otro'))
  assert.ok(!firmaValida(cuerpo, undefined, 'secreto'))
  assert.deepEqual(leerMensajes(JSON.parse(cuerpo)), [
    { waId: 'wamid.1', de: '5215511112222', nombre: 'Ana', texto: 'Hola' },
    { waId: 'wamid.2', de: '5215511112222', nombre: 'Ana', texto: null },
  ])
})

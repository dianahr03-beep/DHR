// Prueba el ciclo del agente con un "modelo falso" que sigue un guion.
// Así se revisa que el código use bien las herramientas, sin gastar créditos de IA.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import type Anthropic from '@anthropic-ai/sdk'
import { responder, type ClienteIA } from '../lib/agente.js'
import { crearAlmacenMemoria } from '../lib/almacen-memoria.js'

type Paso = { herramienta: string; entrada: Record<string, unknown> } | { texto: string }

function modeloFalso(guion: Paso[]) {
  const pedidos: Anthropic.Beta.MessageCreateParamsNonStreaming[] = []
  const cliente: ClienteIA = {
    beta: {
      messages: {
        async create(p) {
          pedidos.push(structuredClone(p))
          const paso = guion.shift()
          if (!paso) throw new Error('El guion se acabó')
          const content = 'texto' in paso
            ? [{ type: 'text', text: paso.texto }]
            : [{ type: 'tool_use', id: `t${pedidos.length}`, name: paso.herramienta, input: paso.entrada }]
          return { content, stop_reason: 'texto' in paso ? 'end_turn' : 'tool_use' } as unknown as Anthropic.Beta.BetaMessage
        },
      },
    },
  }
  return { cliente, pedidos }
}

const ahora = new Date('2026-11-19T15:00:00Z') // jueves 9:00 am en CDMX

test('conversación completa: consulta horas y agenda', async () => {
  const almacen = crearAlmacenMemoria()
  const { cliente, pedidos } = modeloFalso([
    { herramienta: 'ver_disponibilidad', entrada: { servicio_id: 2, fecha: '2026-11-20' } },
    { texto: 'Tengo 10:00 am, 11:00 am y 4:00 pm. ¿Cuál te acomoda?' },
    { herramienta: 'agendar_cita', entrada: { servicio_id: 2, fecha: '2026-11-20', hora: '11:00', nombre_cliente: 'Ana' } },
    { texto: '¡Listo, Ana! Te espero el viernes 20 a las 11:00 am.' },
  ])

  const r1 = await responder({ cliente, almacen, telefono: '5215511112222', texto: 'Quiero gelish mañana', ahora })
  assert.match(r1!, /10:00/)
  // El agente recibió el resultado real de disponibilidad
  const resultado = (pedidos[1].messages.at(-1)!.content as Anthropic.Beta.BetaToolResultBlockParam[])[0]
  assert.equal(resultado.type, 'tool_result')
  assert.match(String(resultado.content), /"hora":"11:00"/)
  // Configuración del pedido a la API
  assert.equal(pedidos[0].model, 'claude-opus-5-5')
  assert.deepEqual(pedidos[0].betas, ['server-side-fallback-2026-07-01'])
  assert.match(JSON.stringify(pedidos[0].system), /hoy es 2026-11-19/)

  const r2 = await responder({ cliente, almacen, telefono: '5215511112222', texto: 'A las 11, soy Ana', ahora })
  assert.match(r2!, /Listo/)
  assert.equal(almacen._citas.length, 1)
  assert.equal(almacen._citas[0].cliente_tel, '5215511112222') // el teléfono lo pone el código, no la IA
  // El segundo turno recuerda la conversación anterior
  assert.deepEqual(pedidos[2].messages.slice(0, 3).map((m) => m.role), ['user', 'assistant', 'user'])
})

test('no contesta dos veces el mismo mensaje de WhatsApp', async () => {
  const almacen = crearAlmacenMemoria()
  const { cliente } = modeloFalso([{ texto: '¡Hola! ¿En qué te ayudo?' }])
  assert.ok(await responder({ cliente, almacen, telefono: '521', texto: 'Hola', waId: 'wamid.X', ahora }))
  assert.equal(await responder({ cliente, almacen, telefono: '521', texto: 'Hola', waId: 'wamid.X', ahora }), null)
})

test('si la IA falla, contesta un mensaje amable y avisa a la dueña', async () => {
  const almacen = crearAlmacenMemoria()
  const cliente: ClienteIA = { beta: { messages: { create: async () => { throw new Error('sin conexión') } } } }
  const r = await responder({ cliente, almacen, telefono: '521', texto: 'Hola', ahora })
  assert.match(r!, /dueña/)
  assert.equal(almacen._avisos.length, 1)
})

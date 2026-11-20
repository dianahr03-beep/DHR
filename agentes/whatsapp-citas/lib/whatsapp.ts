// Conexión con WhatsApp Cloud API (Meta).
import { createHmac, timingSafeEqual } from 'node:crypto'

/** Revisa que el aviso de verdad venga de Meta (firma X-Hub-Signature-256 con el App Secret). */
export function firmaValida(cuerpo: string, firma: string | undefined, secretoApp: string): boolean {
  if (!firma?.startsWith('sha256=')) return false
  const esperada = createHmac('sha256', secretoApp).update(cuerpo).digest('hex')
  const a = Buffer.from(firma.slice(7), 'hex')
  const b = Buffer.from(esperada, 'hex')
  return a.length === b.length && timingSafeEqual(a, b)
}

export interface MensajeEntrante {
  waId: string
  de: string // número de la clienta, con código de país
  nombre: string | null
  texto: string | null // null si mandó audio, foto, sticker, etc.
}

/** Saca los mensajes de texto del aviso (webhook) que manda Meta. Ignora avisos de "entregado/leído". */
export function leerMensajes(aviso: unknown): MensajeEntrante[] {
  const salida: MensajeEntrante[] = []
  const entradas = (aviso as { entry?: unknown[] })?.entry ?? []
  for (const entrada of entradas as { changes?: { value?: Record<string, unknown> }[] }[]) {
    for (const cambio of entrada.changes ?? []) {
      const valor = cambio.value ?? {}
      const contactos = (valor.contacts as { wa_id?: string; profile?: { name?: string } }[] | undefined) ?? []
      for (const m of (valor.messages as Record<string, unknown>[] | undefined) ?? []) {
        const de = String(m.from ?? '')
        if (!m.id || !de) continue
        salida.push({
          waId: String(m.id),
          de,
          nombre: contactos.find((c) => c.wa_id === de)?.profile?.name ?? null,
          texto: m.type === 'text' ? String((m.text as { body?: string })?.body ?? '') : null,
        })
      }
    }
  }
  return salida
}

/** Envía un mensaje de texto. Solo funciona dentro de las 24 horas desde el último mensaje de la clienta. */
export async function enviarTexto(p: { para: string; texto: string; idNumero: string; token: string; versionApi: string }) {
  const r = await fetch(`https://graph.facebook.com/${p.versionApi}/${p.idNumero}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${p.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to: p.para, type: 'text', text: { body: p.texto.slice(0, 4096) } }),
  })
  if (!r.ok) throw new Error(`WhatsApp respondió ${r.status}: ${await r.text()}`)
}

/**
 * Envía una plantilla aprobada por Meta (obligatorio para escribirle a la clienta primero,
 * por ejemplo el recordatorio del día anterior). Los {{1}}, {{2}}... se llenan con `variables`.
 */
export async function enviarPlantilla(p: {
  para: string; plantilla: string; idioma: string; variables: string[]; idNumero: string; token: string; versionApi: string
}) {
  const r = await fetch(`https://graph.facebook.com/${p.versionApi}/${p.idNumero}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${p.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp', to: p.para, type: 'template',
      template: {
        name: p.plantilla, language: { code: p.idioma },
        components: [{ type: 'body', parameters: p.variables.map((text) => ({ type: 'text', text })) }],
      },
    }),
  })
  if (!r.ok) throw new Error(`WhatsApp respondió ${r.status}: ${await r.text()}`)
}

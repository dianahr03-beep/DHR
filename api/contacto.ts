// Función de Vercel: recibe el formulario y te avisa por WhatsApp.
// Tu número y tus claves viven en las "Environment Variables" de Vercel,
// nunca en el código de la página, así que los visitantes no los pueden ver.
//
//   CALLMEBOT_TELEFONO  → tu WhatsApp con código de país, ej. 5215512345678
//   CALLMEBOT_APIKEY    → la clave que te manda CallMeBot por WhatsApp
// (La copia por correo la manda la página directamente con la clave de web3forms en src/config.ts)

type Datos = Record<string, string | undefined>

const limpiar = (v: unknown, max = 600) => String(v ?? '').replace(/[<>]/g, '').trim().slice(0, max)

export default async function handler(req: { method?: string; body?: unknown; headers?: Record<string, string | string[] | undefined> }, res: {
  status: (n: number) => { json: (b: unknown) => void }
}) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false })

  const b = (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body ?? {}) as Datos
  const d = {
    nombre: limpiar(b.nombre, 100),
    telefono: limpiar(b.telefono, 40),
    correo: limpiar(b.correo, 120),
    empresa: limpiar(b.empresa, 120),
    necesita: limpiar(b.necesita, 40),
    giro: limpiar(b.giro, 60),
    pais: limpiar(b.pais, 60),
    mensaje: limpiar(b.mensaje),
    origen: limpiar(b.origen, 40),
  }
  if (!d.nombre || !d.telefono) return res.status(400).json({ ok: false, error: 'Faltan nombre o WhatsApp' })

  const fecha = new Intl.DateTimeFormat('es-MX', {
    timeZone: 'America/Mexico_City', weekday: 'long', day: 'numeric', month: 'long',
    hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(new Date())

  // Ubicación aproximada y dispositivo (Vercel los da por la conexión del visitante)
  const h = (k: string) => {
    const v = req.headers?.[k]
    return limpiar(decodeURIComponent(String(Array.isArray(v) ? v[0] : v ?? '')), 80)
  }
  const codigoPais = h('x-vercel-ip-country')
  let paisIp = codigoPais
  try {
    if (codigoPais) paisIp = new Intl.DisplayNames(['es'], { type: 'region' }).of(codigoPais) ?? codigoPais
  } catch { /* deja el código */ }
  const ubicacion = [h('x-vercel-ip-city'), h('x-vercel-ip-country-region'), paisIp].filter(Boolean).join(', ')
  const ua = h('user-agent').toLowerCase()
  const dispositivo = !ua ? '' : /ipad|tablet/.test(ua) ? 'Tableta'
    : /iphone/.test(ua) ? 'Celular (iPhone)'
    : /android.*mobile|mobile/.test(ua) ? 'Celular (Android)'
    : /android/.test(ua) ? 'Tableta (Android)'
    : /mac os/.test(ua) ? 'Computadora (Mac)'
    : /windows/.test(ua) ? 'Computadora (Windows)' : 'Computadora'

  const SEP = '<sep>'
  const texto = [
    '🔔 *Nuevo cliente interesado*',
    `🕒 ${fecha}`,
    d.origen && `📍 Llegó por: ${d.origen}`,
    ubicacion && `🗺️ Desde: ${ubicacion} (aprox.)`,
    dispositivo && `💻 Dispositivo: ${dispositivo}`,
    SEP,
    `👤 *Nombre:* ${d.nombre}`,
    `📱 *WhatsApp:* ${d.telefono}`,
    d.correo && `✉️ *Correo:* ${d.correo}`,
    d.empresa && `🏢 *Empresa:* ${d.empresa}`,
    d.necesita && `🎯 *Necesita:* ${d.necesita}`,
    d.giro && `💼 *Giro:* ${d.giro}`,
    d.pais && `🌎 *País (lo escribió):* ${d.pais}`,
    d.mensaje && `\n💬 *Mensaje:*\n${d.mensaje}`,
    SEP,
    `👉 Responder: https://wa.me/${d.telefono.replace(/\D/g, '')}`,
  ].filter(Boolean).map((x) => (x === SEP ? '' : x)).join('\n')

  const envios: Promise<boolean>[] = []
  const { CALLMEBOT_TELEFONO, CALLMEBOT_APIKEY } = process.env

  if (CALLMEBOT_TELEFONO && CALLMEBOT_APIKEY) {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(CALLMEBOT_TELEFONO)}&apikey=${encodeURIComponent(CALLMEBOT_APIKEY)}&text=${encodeURIComponent(texto)}`
    envios.push(
      fetch(url)
        .then(async (r) => {
          const t = await r.text()
          console.log('CallMeBot respondió:', r.status, t.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 300))
          return r.ok && !/error|invalid|not/i.test(t)
        })
        .catch((e) => {
          console.log('CallMeBot falló:', String(e))
          return false
        }),
    )
  } else {
    console.log('Faltan CALLMEBOT_TELEFONO o CALLMEBOT_APIKEY en Vercel')
  }
  const resultados = await Promise.all(envios)
  if (!resultados.some(Boolean)) return res.status(502).json({ ok: false })
  return res.status(200).json({ ok: true })
}

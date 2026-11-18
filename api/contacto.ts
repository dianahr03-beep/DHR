// Función de Vercel: recibe el formulario y te avisa por WhatsApp.
// Tu número y tus claves viven en las "Environment Variables" de Vercel,
// nunca en el código de la página, así que los visitantes no los pueden ver.
//
//   CALLMEBOT_TELEFONO  → tu WhatsApp con código de país, ej. 5215512345678
//   CALLMEBOT_APIKEY    → la clave que te manda CallMeBot por WhatsApp
// (La copia por correo la manda la página directamente con la clave de web3forms en src/config.ts)

type Datos = Record<string, string | undefined>

const limpiar = (v: unknown, max = 600) => String(v ?? '').replace(/[<>]/g, '').trim().slice(0, max)

export default async function handler(req: { method?: string; body?: unknown }, res: {
  status: (n: number) => { json: (b: unknown) => void }
}) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false })

  const b = (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body ?? {}) as Datos
  const d = {
    nombre: limpiar(b.nombre, 100),
    telefono: limpiar(b.telefono, 40),
    correo: limpiar(b.correo, 120),
    empresa: limpiar(b.empresa, 120),
    giro: limpiar(b.giro, 60),
    pais: limpiar(b.pais, 60),
    mensaje: limpiar(b.mensaje),
  }
  if (!d.nombre || !d.telefono) return res.status(400).json({ ok: false, error: 'Faltan nombre o WhatsApp' })

  const texto = [
    '🔔 Nuevo cliente interesado',
    `Nombre: ${d.nombre}`,
    `WhatsApp: ${d.telefono}`,
    d.correo && `Correo: ${d.correo}`,
    d.empresa && `Empresa: ${d.empresa}`,
    `Giro: ${d.giro}`,
    d.pais && `País: ${d.pais}`,
    d.mensaje && `Mensaje: ${d.mensaje}`,
    `Responder: https://wa.me/${d.telefono.replace(/\D/g, '')}`,
  ].filter(Boolean).join('\n')

  const envios: Promise<boolean>[] = []
  const { CALLMEBOT_TELEFONO, CALLMEBOT_APIKEY } = process.env

  if (CALLMEBOT_TELEFONO && CALLMEBOT_APIKEY) {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(CALLMEBOT_TELEFONO)}&apikey=${encodeURIComponent(CALLMEBOT_APIKEY)}&text=${encodeURIComponent(texto)}`
    envios.push(fetch(url).then((r) => r.ok).catch(() => false))
  }
  const resultados = await Promise.all(envios)
  if (!resultados.some(Boolean)) return res.status(502).json({ ok: false })
  return res.status(200).json({ ok: true })
}

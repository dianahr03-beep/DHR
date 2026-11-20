// Para probar en tu computadora: npm run simulador  →  abre http://localhost:3001
// Necesita ANTHROPIC_API_KEY y CLAVE_SIMULADOR en el entorno. Sin Supabase usa una agenda de prueba en memoria.
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import simulador from './api/simulador.js'

const puerto = Number(process.env.PORT || 3001)
createServer(async (req, res) => {
  if (req.url?.startsWith('/api/simulador')) return simulador(req, res)
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.end(await readFile(new URL('./public/index.html', import.meta.url)))
}).listen(puerto, () => console.log(`Simulador en http://localhost:${puerto}`))

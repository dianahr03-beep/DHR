// Mete el HTML ya armado dentro de dist/index.html (lo lee Google; el navegador lo "despierta" con hydrateRoot).
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const raiz = path.resolve(import.meta.dirname, '..')
const { render } = await import(pathToFileURL(path.join(raiz, 'dist-ssr/entry-server.js')).href)
const archivo = path.join(raiz, 'dist/index.html')
const html = fs.readFileSync(archivo, 'utf8')
if (!html.includes('<div id="root"></div>')) throw new Error('No encontré <div id="root"></div>')
fs.writeFileSync(archivo, html.replace('<div id="root"></div>', `<div id="root">${render()}</div>`))
fs.rmSync(path.join(raiz, 'dist-ssr'), { recursive: true, force: true })
console.log('Página pre-armada para Google ✓')

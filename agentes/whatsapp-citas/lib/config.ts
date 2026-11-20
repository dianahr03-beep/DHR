// Lee las claves de las "Environment Variables" de Vercel. Nunca se escriben en el código.
import Anthropic from '@anthropic-ai/sdk'
import { crearAlmacenMemoria } from './almacen-memoria.js'
import { crearAlmacenSupabase } from './almacen-supabase.js'
import type { Almacen } from './tipos.js'

let almacen: Almacen | undefined
let cliente: Anthropic | undefined

/** Supabase si están sus claves; si no, memoria (solo para pruebas: se borra al reiniciar). */
export function obtenerAlmacen(): Almacen {
  if (!almacen) {
    const url = process.env.SUPABASE_URL
    const llave = process.env.SUPABASE_SERVICE_ROLE_KEY
    almacen = url && llave ? crearAlmacenSupabase(url, llave) : crearAlmacenMemoria()
    if (!(url && llave)) console.warn('Sin SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY: usando agenda de prueba en memoria')
  }
  return almacen
}

/** Usa ANTHROPIC_API_KEY de las variables de entorno. */
export function obtenerClienteIA(): Anthropic {
  cliente ??= new Anthropic()
  return cliente
}

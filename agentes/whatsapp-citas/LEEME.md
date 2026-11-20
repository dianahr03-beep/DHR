# Agente de WhatsApp para agendar citas (salón de uñas)

Un asistente que contesta por WhatsApp las 24 horas: da precios, revisa qué horas hay libres,
agenda, muestra, cambia y cancela citas, manda un recordatorio un día antes de cada cita, y le avisa a la dueña cuando hace falta una persona.

Va en esta carpeta aparte, así que **no cambia la página de DHR Calidad**.

## Cómo funciona

1. La clienta escribe al WhatsApp del salón.
2. Meta (WhatsApp) le pasa el mensaje a `api/whatsapp.ts`, que corre en Vercel.
3. El agente (Claude) lee la conversación y usa sus "herramientas":
   ver servicios, ver horas libres, agendar, ver mis citas, cambiar, cancelar y pasar con una persona.
4. Las citas se guardan en Supabase. Un candado en la base de datos impide que una empleada
   tenga dos citas encimadas, aunque dos clientas escriban al mismo tiempo.
5. La respuesta regresa a la clienta por WhatsApp.
6. Todos los días a las 10:00 am (hora del centro de México) `api/recordatorios.ts` manda el recordatorio
   a quien tiene cita al día siguiente. Si la clienta contesta, el agente ya sabe de qué cita se trata.

Reglas que cuida el código (no la IA): precios y horarios salen solo de la base de datos,
cada clienta solo puede ver, cambiar y cancelar **sus** citas, y no se contesta dos veces el mismo mensaje.

## Archivos

| Archivo | Qué es |
|---|---|
| `supabase/1-crear-base-de-datos.sql` | Tablas: salón, servicios, empleadas, horarios, citas, mensajes, avisos |
| `supabase/2-datos-de-ejemplo.sql` | Servicios, precios y horario de ejemplo (cambiar por los reales) |
| `lib/agente.ts` | El cerebro: instrucciones del agente y conversación con Claude |
| `lib/herramientas.ts` | Lo que el agente puede hacer en la agenda |
| `lib/agenda.ts` | Cálculo de horas libres |
| `api/whatsapp.ts` | Recibe y contesta mensajes de WhatsApp |
| `api/simulador.ts` + `public/index.html` | Simulador para platicar con el agente en el navegador |
| `lib/recordatorios.ts` + `api/recordatorios.ts` + `vercel.json` | Recordatorio diario un día antes de la cita |
| `pruebas/` | Pruebas automáticas (19) |

## Lo que se necesita para ponerlo a funcionar

1. **Supabase:** crear un proyecto, pegar los dos archivos `.sql` en el SQL Editor y ejecutarlos.
2. **Claude:** una llave en la consola de Claude (platform.claude.com).
3. **Meta / WhatsApp:** cuenta de desarrollador, portafolio de negocio y un número nuevo que no tenga WhatsApp.
4. **Vercel:** un proyecto nuevo con *Root Directory* = `agentes/whatsapp-citas` y estas variables:

| Variable | De dónde sale |
|---|---|
| `ANTHROPIC_API_KEY` | Consola de Claude → API Keys |
| `MODELO` | Opcional. Por defecto `claude-opus-5-5` |
| `SUPABASE_URL` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (llave secreta, nunca en la página) |
| `CLAVE_SIMULADOR` | Una contraseña que tú inventas para usar el simulador |
| `WHATSAPP_TOKEN` | Meta → token permanente de un usuario del sistema |
| `WHATSAPP_PHONE_NUMBER_ID` | Meta → WhatsApp → API Setup |
| `WHATSAPP_APP_SECRET` | Meta → App settings → Basic → App Secret |
| `WHATSAPP_VERIFY_TOKEN` | Una palabra que tú inventas; la misma se pega en Meta al configurar el webhook |
| `WHATSAPP_API_VERSION` | La versión que muestra Meta en API Setup (ej. `v23.0`) |
| `CRON_SECRET` | Una palabra secreta que tú inventas; Vercel la usa al correr el recordatorio diario |
| `WHATSAPP_PLANTILLA_RECORDATORIO` | Nombre de la plantilla del recordatorio aprobada en Meta (ej. `recordatorio_cita`) |
| `WHATSAPP_PLANTILLA_IDIOMA` | Idioma de esa plantilla (ej. `es_MX`) |

5. En Meta → WhatsApp → Configuration → Webhook: URL `https://TU-PROYECTO.vercel.app/api/whatsapp`,
   el mismo `WHATSAPP_VERIFY_TOKEN`, y suscribirse a `messages`.

6. **Plantilla del recordatorio:** WhatsApp no deja que el negocio escriba primero con texto libre;
   hay que crear en Meta → WhatsApp Manager → Plantillas una plantilla de categoría *Utilidad* con este texto
   y esperar a que la aprueben:

   > Hola {{1}} 💅 Te recordamos tu cita de {{2}} mañana {{3}} a las {{4}} en {{5}}. Responde a este mensaje si necesitas cambiarla o cancelarla.

   ({{1}} nombre, {{2}} servicio, {{3}} fecha, {{4}} hora, {{5}} nombre del salón). Cada recordatorio es un mensaje
   que Meta cobra según la tabla de precios por país.

El recordatorio diario usa *Vercel Schedules* (`vercel.json`), que hoy está en beta pública:
[Vercel Schedules](https://vercel.com/docs/schedules/migrate-from-cron-jobs).

Referencias oficiales: [Cloud API, primeros pasos](https://developers.facebook.com/documentation/business-messaging/whatsapp/get-started) ·
[Números de teléfono](https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/phone-numbers) ·
[Precios de WhatsApp](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing) ·
[Precios de Claude](https://platform.claude.com/docs/en/about-claude/pricing)

## Probar el agente en la vista previa (sin WhatsApp ni Supabase)

La vista previa del proyecto **dhr** incluye `/agente-demo`, una pantalla tipo WhatsApp con el salón de ejemplo.
Necesita dos variables en Vercel → proyecto dhr → Environment Variables, marcadas solo en **Preview**:
`ANTHROPIC_API_KEY` y `CLAVE_SIMULADOR`. La página publicada no la usa.
Los archivos `api/agente-simulador.js` y `public/agente-demo.html` de la raíz se generan con `npm run empaquetar-demo`.

## Para programadores

```bash
cd agentes/whatsapp-citas
npm install
npm run pruebas          # pruebas automáticas, sin gastar créditos de IA
npm run revisar-tipos
ANTHROPIC_API_KEY=... CLAVE_SIMULADOR=... npm run simulador   # http://localhost:3001
```

Sin variables de Supabase, el agente usa una agenda de prueba en memoria (se borra al reiniciar).

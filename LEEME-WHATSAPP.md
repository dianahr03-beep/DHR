# Recibir clientes por WhatsApp sin mostrar tu número

Cuando alguien llena el formulario, la página te manda un WhatsApp **a ti** (y una copia a tu correo)
con su nombre y su WhatsApp. Tu número nunca aparece en la página: se guarda escondido en Vercel.

## 1. WhatsApp (CallMeBot, gratis)
1. Guarda en tus contactos el número de CallMeBot que aparece en https://www.callmebot.com/blog/free-api-whatsapp-messages/
2. Mándale por WhatsApp el mensaje que indica esa página ("I allow callmebot to send me messages").
3. Te responde con tu **apikey** (un número).

## 2. Correo (Web3Forms, gratis) — YA ACTIVADO
La clave pública de Web3Forms ya está en `src/config.ts` (web3formsKey). Cada formulario te llega a dianahr03@gmail.com.

## 3. Guardar los datos en Vercel
En tu proyecto de Vercel → Settings → Environment Variables, agrega:

| Nombre               | Valor                                   |
|----------------------|-----------------------------------------|
| CALLMEBOT_TELEFONO   | tu WhatsApp con código de país, ej. +52XXXXXXXXXX (si no llega, prueba con +521XXXXXXXXXX) |
| CALLMEBOT_APIKEY     | la apikey de CallMeBot                  |

Después haz "Redeploy". Llena el formulario tú misma para probar.

Para contestarle al cliente, el mensaje trae un enlace "Responder" que abre WhatsApp con su número.
Ojo: cuando tú le escribas, el cliente sí verá el número desde el que contestes. Si quieres que nunca vea
tu número personal, usa un segundo número (por ejemplo WhatsApp Business con un chip aparte).

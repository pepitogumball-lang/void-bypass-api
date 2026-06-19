# Shadow Panel

Shadow Panel es un panel de control mobile-first para operar un bot de Discord desde una interfaz web oscura, minimalista y preparada para Vercel.

## Variables de entorno

Configura la variable solo en el servidor, por ejemplo en Vercel Project Settings:

```bash
token_BOT=tu_token_de_bot
```

No uses prefijos `NEXT_PUBLIC_` para el token. La app también acepta `TOKEN_BOT` o `DISCORD_TOKEN` como fallback, pero `token_BOT` es la variable recomendada. Todas las llamadas a Discord pasan por Route Handlers bajo `/api`, así que el navegador nunca recibe el secreto.

## Scripts

```bash
npm run dev
npm run build
npm run lint
```

## API MVP

- `GET /api/guilds`: lista los servidores donde está el bot.
- `GET /api/guilds/:guildId/channels`: lista canales de texto compatibles del servidor.
- `POST /api/channels/:channelId/messages`: envía un mensaje al canal indicado.
- `GET /api/health`: endpoint ligero para healthchecks y GitHub Actions.

## GitHub Actions: bot_alive.yml

El workflow `.github/workflows/bot_alive.yml` se ejecuta manualmente o cada 30 minutos. Usa el secret `token_BOT` para verificar el token contra Discord y luego hace ping a `/api/health` en el deployment. Define la variable de repositorio `SHADOW_PANEL_URL` si el dominio no es `https://void-bypass-api.vercel.app`.

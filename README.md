# Shadow Panel

Shadow Panel es un panel de control mobile-first para operar un bot de Discord desde una interfaz web oscura, minimalista y preparada para Vercel.

## Variables de entorno

Configura la variable solo en el servidor, por ejemplo en Vercel Project Settings:

```bash
DISCORD_TOKEN=tu_token_de_bot
```

No uses prefijos `NEXT_PUBLIC_` para el token. Todas las llamadas a Discord pasan por Route Handlers bajo `/api`, así que el navegador nunca recibe el secreto.

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

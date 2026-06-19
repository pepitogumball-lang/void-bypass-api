const DISCORD_API_BASE = 'https://discord.com/api/v10';

function getBotToken() {
  const token = process.env.token_BOT || process.env.TOKEN_BOT || process.env.DISCORD_TOKEN;

  if (!token) {
    throw new Error('Configura token_BOT en el entorno del servidor para autorizar al bot de Discord.');
  }

  return token;
}

export async function discordRequest(path, options = {}) {
  const response = await fetch(`${DISCORD_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bot ${getBotToken()}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    cache: 'no-store',
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = payload?.message || response.statusText || 'Error desconocido de Discord';
    throw new Error(`Discord API ${response.status}: ${message}`);
  }

  return payload;
}

export function toSafeGuild(guild) {
  return {
    id: guild.id,
    name: guild.name,
    icon: guild.icon,
    owner: guild.owner,
    permissions: guild.permissions,
  };
}

export function toSafeChannel(channel) {
  return {
    id: channel.id,
    guildId: channel.guild_id,
    name: channel.name,
    type: channel.type,
    position: channel.position,
    parentId: channel.parent_id,
    topic: channel.topic,
  };
}

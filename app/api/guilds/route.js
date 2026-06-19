import { NextResponse } from 'next/server';
import { discordRequest, toSafeGuild } from '@/lib/discord';

export async function GET() {
  try {
    const guilds = await discordRequest('/users/@me/guilds');
    return NextResponse.json({ guilds: guilds.map(toSafeGuild) });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

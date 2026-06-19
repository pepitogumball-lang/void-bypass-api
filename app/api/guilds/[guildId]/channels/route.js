import { NextResponse } from 'next/server';
import { discordRequest, toSafeChannel } from '@/lib/discord';

const TEXT_CHANNEL_TYPES = new Set([0, 5, 10, 11, 12, 15]);

export async function GET(_request, { params }) {
  try {
    const { guildId } = await params;
    const channels = await discordRequest(`/guilds/${guildId}/channels`);
    const textChannels = channels
      .filter((channel) => TEXT_CHANNEL_TYPES.has(channel.type))
      .sort((a, b) => a.position - b.position)
      .map(toSafeChannel);

    return NextResponse.json({ channels: textChannels });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

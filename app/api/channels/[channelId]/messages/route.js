import { NextResponse } from 'next/server';
import { discordRequest } from '@/lib/discord';

export async function POST(request, { params }) {
  try {
    const { channelId } = await params;
    const { content } = await request.json();
    const trimmedContent = typeof content === 'string' ? content.trim() : '';

    if (!trimmedContent) {
      return NextResponse.json({ error: 'El mensaje no puede estar vacío.' }, { status: 400 });
    }

    if (trimmedContent.length > 2000) {
      return NextResponse.json({ error: 'Discord permite un máximo de 2000 caracteres.' }, { status: 400 });
    }

    const message = await discordRequest(`/channels/${channelId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content: trimmedContent }),
    });

    return NextResponse.json({ message });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

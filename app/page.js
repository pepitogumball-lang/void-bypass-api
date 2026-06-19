'use client';

import { useEffect, useMemo, useState } from 'react';

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Operación fallida');
  }

  return data;
}

export default function Home() {
  const [guilds, setGuilds] = useState([]);
  const [channels, setChannels] = useState([]);
  const [selectedGuildId, setSelectedGuildId] = useState('');
  const [selectedChannelId, setSelectedChannelId] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('Inicializando enlace seguro...');
  const [isLoadingGuilds, setIsLoadingGuilds] = useState(true);
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    let isMounted = true;

    fetchJson('/api/guilds')
      .then(({ guilds: nextGuilds }) => {
        if (!isMounted) return;
        setGuilds(nextGuilds);
        setSelectedGuildId(nextGuilds[0]?.id || '');
        setStatus(nextGuilds.length ? 'Servidores sincronizados.' : 'El bot no reportó servidores.');
      })
      .catch((error) => isMounted && setStatus(error.message))
      .finally(() => isMounted && setIsLoadingGuilds(false));

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedGuildId) {
      setChannels([]);
      setSelectedChannelId('');
      return;
    }

    let isMounted = true;
    setIsLoadingChannels(true);
    setStatus('Escaneando canales de texto...');

    fetchJson(`/api/guilds/${selectedGuildId}/channels`)
      .then(({ channels: nextChannels }) => {
        if (!isMounted) return;
        setChannels(nextChannels);
        setSelectedChannelId(nextChannels[0]?.id || '');
        setStatus(nextChannels.length ? 'Canales listos para transmisión.' : 'No hay canales de texto disponibles.');
      })
      .catch((error) => isMounted && setStatus(error.message))
      .finally(() => isMounted && setIsLoadingChannels(false));

    return () => {
      isMounted = false;
    };
  }, [selectedGuildId]);

  const selectedGuild = useMemo(
    () => guilds.find((guild) => guild.id === selectedGuildId),
    [guilds, selectedGuildId],
  );

  const selectedChannel = useMemo(
    () => channels.find((channel) => channel.id === selectedChannelId),
    [channels, selectedChannelId],
  );

  async function sendMessage(event) {
    event.preventDefault();

    if (!selectedChannelId || !message.trim()) return;

    setIsSending(true);
    setStatus('Inyectando mensaje en Discord...');

    try {
      await fetchJson(`/api/channels/${selectedChannelId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message }),
      });
      setMessage('');
      setStatus('Mensaje enviado. El bot acaba de hablar.');
    } catch (error) {
      setStatus(error.message);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(79,252,255,0.16),transparent_34%),linear-gradient(135deg,#050608,#080b12_45%,#10131f)] px-4 py-5 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-6xl flex-col gap-4 lg:flex-row">
        <aside className="rounded-[2rem] border border-cyan-300/10 bg-black/35 p-4 shadow-glow backdrop-blur-xl lg:w-80">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.35em] text-void-cyan">Shadow Panel</p>
              <h1 className="mt-2 text-2xl font-black tracking-tight">Control fantasma</h1>
            </div>
            <div className="h-3 w-3 rounded-full bg-void-green shadow-[0_0_16px_#7CFF6B]" />
          </div>

          <label className="mb-2 block font-mono text-xs uppercase tracking-[0.25em] text-slate-400" htmlFor="guild">
            Servidor
          </label>
          <select
            id="guild"
            className="mb-4 min-h-12 w-full rounded-2xl border border-white/10 bg-void-900 px-4 text-base text-white outline-none transition focus:border-void-cyan"
            disabled={isLoadingGuilds}
            value={selectedGuildId}
            onChange={(event) => setSelectedGuildId(event.target.value)}
          >
            {guilds.map((guild) => (
              <option key={guild.id} value={guild.id}>{guild.name}</option>
            ))}
          </select>

          <label className="mb-2 block font-mono text-xs uppercase tracking-[0.25em] text-slate-400" htmlFor="channel">
            Canal
          </label>
          <select
            id="channel"
            className="min-h-12 w-full rounded-2xl border border-white/10 bg-void-900 px-4 text-base text-white outline-none transition focus:border-void-cyan"
            disabled={isLoadingChannels || !channels.length}
            value={selectedChannelId}
            onChange={(event) => setSelectedChannelId(event.target.value)}
          >
            {channels.map((channel) => (
              <option key={channel.id} value={channel.id}>#{channel.name}</option>
            ))}
          </select>

          <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.03] p-4 font-mono text-xs leading-6 text-slate-300">
            <p className="text-void-green">● enlace servidor</p>
            <p>{selectedGuild?.name || 'sin servidor'}</p>
            <p className="mt-3 text-void-cyan">● canal activo</p>
            <p>#{selectedChannel?.name || 'sin canal'}</p>
          </div>
        </aside>

        <section className="flex flex-1 flex-col rounded-[2rem] border border-white/10 bg-void-950/70 p-4 shadow-glow backdrop-blur-xl sm:p-6">
          <div className="mb-5 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <p className="font-mono text-xs uppercase tracking-[0.35em] text-slate-500">Canal actual</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              #{selectedChannel?.name || 'elige-un-canal'}
            </h2>
            <p className="mt-3 text-sm text-slate-400">{status}</p>
          </div>

          <form onSubmit={sendMessage} className="flex flex-1 flex-col gap-4">
            <textarea
              className="min-h-72 flex-1 resize-none rounded-[1.75rem] border border-cyan-300/10 bg-black/45 p-5 text-lg leading-8 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-void-cyan focus:shadow-[0_0_35px_rgba(79,252,255,0.12)]"
              maxLength={2000}
              placeholder="Escribe aquí lo que el bot dirá como si hubiera cobrado vida..."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-mono text-xs text-slate-500">{message.length}/2000 caracteres · token protegido en servidor</p>
              <button
                className="min-h-14 rounded-2xl bg-void-cyan px-8 font-black uppercase tracking-[0.2em] text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                disabled={isSending || !selectedChannelId || !message.trim()}
                type="submit"
              >
                {isSending ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

/**
 * Extrae el ID de vídeo de una URL de Vimeo.
 * Ej: https://vimeo.com/123456789
 */
export function getVimeoVideoId(url: string): string | null {
  try {
    const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export function VimeoEmbed({ url }: { url: string }) {
  const videoId = getVimeoVideoId(url);
  if (!videoId) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] underline">
        Ver en Vimeo
      </a>
    );
  }
  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl border border-[var(--border)] bg-black">
      <iframe
        src={`https://player.vimeo.com/video/${videoId}`}
        title="Vimeo video"
        className="h-full w-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}

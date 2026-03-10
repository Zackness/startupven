/**
 * Extrae el ID de vídeo de una URL de YouTube.
 * Soporta: youtube.com/watch?v=ID, youtu.be/ID
 */
export function getYouTubeVideoId(url: string): string | null {
  try {
    if (/youtu\.be\/([a-zA-Z0-9_-]+)/.test(url)) return url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)?.[1] ?? null;
    const u = new URL(url);
    return u.searchParams.get("v");
  } catch {
    return null;
  }
}

export function YouTubeEmbed({ url }: { url: string }) {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] underline">
        Ver en YouTube
      </a>
    );
  }
  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl border border-[var(--border)] bg-black">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video"
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}

/** Tipos de ítem del portafolio de un proyecto (cómo se renderiza el enlace). */
export const PORTFOLIO_ITEM_TYPES = [
  "IMAGE",
  "VIDEO",
  "YOUTUBE",
  "VIMEO",
  "INSTAGRAM",
  "BEHANCE",
] as const;

export const PORTFOLIO_ITEM_TYPE_LABELS: Record<(typeof PORTFOLIO_ITEM_TYPES)[number], string> = {
  IMAGE: "Imagen (URL directa)",
  VIDEO: "Vídeo (URL directa)",
  YOUTUBE: "YouTube",
  VIMEO: "Vimeo",
  INSTAGRAM: "Instagram",
  BEHANCE: "Behance",
};

export type PortfolioItemType = (typeof PORTFOLIO_ITEM_TYPES)[number];

export function detectPortfolioTypeFromUrl(url: string): PortfolioItemType | null {
  const u = url.trim().toLowerCase();
  if (/youtube\.com\/watch|youtu\.be\//.test(u)) return "YOUTUBE";
  if (/vimeo\.com\//.test(u)) return "VIMEO";
  if (/instagram\.com\/(p|reel|reels)\//.test(u)) return "INSTAGRAM";
  if (/behance\.net\/gallery\//.test(u)) return "BEHANCE";
  if (/\.(mp4|webm|ogg|mov)(\?|$)/.test(u)) return "VIDEO";
  if (/\.(jpg|jpeg|png|gif|webp|avif)(\?|$)/.test(u)) return "IMAGE";
  return null;
}

import Image from "next/image";
import { InstagramEmbed } from "./instagram-embed";
import { BehanceEmbed } from "./behance-embed";
import { YouTubeEmbed } from "./youtube-embed";
import { VimeoEmbed } from "./vimeo-embed";
import type { PortfolioItemType } from "@/lib/portfolio-item-types";

type Item = {
  id: string;
  type: string;
  url: string;
  caption?: string;
};

export function PortfolioItemRenderer({ item }: { item: Item }) {
  const type = item.type as PortfolioItemType;

  switch (type) {
    case "IMAGE":
      return (
        <figure className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--muted)]/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.url}
            alt={item.caption ?? "Imagen del proyecto"}
            className="h-auto w-full object-contain"
            loading="lazy"
          />
          {item.caption && (
            <figcaption className="border-t border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm text-[var(--muted-foreground)]">
              {item.caption}
            </figcaption>
          )}
        </figure>
      );

    case "VIDEO":
      return (
        <figure className="overflow-hidden rounded-xl border border-[var(--border)] bg-black">
          <video
            src={item.url}
            controls
            className="h-auto w-full"
            playsInline
            preload="metadata"
          />
          {item.caption && (
            <figcaption className="border-t border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm text-[var(--muted-foreground)]">
              {item.caption}
            </figcaption>
          )}
        </figure>
      );

    case "YOUTUBE":
      return (
        <figure>
          <YouTubeEmbed url={item.url} />
          {item.caption && (
            <figcaption className="mt-2 text-sm text-[var(--muted-foreground)]">{item.caption}</figcaption>
          )}
        </figure>
      );

    case "VIMEO":
      return (
        <figure>
          <VimeoEmbed url={item.url} />
          {item.caption && (
            <figcaption className="mt-2 text-sm text-[var(--muted-foreground)]">{item.caption}</figcaption>
          )}
        </figure>
      );

    case "INSTAGRAM":
      return (
        <figure>
          <InstagramEmbed url={item.url} />
          {item.caption && (
            <figcaption className="mt-2 text-sm text-[var(--muted-foreground)]">{item.caption}</figcaption>
          )}
        </figure>
      );

    case "BEHANCE":
      return (
        <figure>
          <BehanceEmbed url={item.url} />
          {item.caption && (
            <figcaption className="mt-2 text-sm text-[var(--muted-foreground)]">{item.caption}</figcaption>
          )}
        </figure>
      );

    default:
      return (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-xl border border-[var(--border)] bg-[var(--muted)]/20 p-4 text-sm text-[var(--primary)] underline"
        >
          Ver enlace
        </a>
      );
  }
}

type BunnyConfig = {
    storageZoneName: string;
    apiKey: string;
    /**
     * Base URL para Bunny Storage.
     * Ej: https://storage.bunnycdn.com  (o un endpoint regional)
     */
    storageBaseUrl: string;
    /**
     * Base URL pública (CDN) para construir URLs.
     * Ej: https://<pullzone>.b-cdn.net  o https://<storageZone>.b-cdn.net
     */
    publicBaseUrl: string;
};

import { Buffer } from "node:buffer";

function getBunnyConfig(): BunnyConfig {
    const storageZoneName = process.env.BUNNY_STORAGE_ZONE_NAME ?? process.env.BUNNY_STORAGE_ZONE ?? "";
    const apiKey = process.env.BUNNY_API_KEY ?? process.env.BUNNY_STORAGE_ACCESS_KEY ?? "";
    const storageBaseUrl = process.env.BUNNY_BASE_URL ?? process.env.BUNNY_STORAGE_BASE_URL ?? "https://storage.bunnycdn.com";
    const publicBaseUrl =
        process.env.BUNNY_PUBLIC_BASE_URL ??
        (storageZoneName ? `https://${storageZoneName}.b-cdn.net` : "");

    if (!storageZoneName || !apiKey || !storageBaseUrl || !publicBaseUrl) {
        throw new Error(
            "Bunny.net configuration missing. Required envs: BUNNY_STORAGE_ZONE_NAME, BUNNY_API_KEY, BUNNY_BASE_URL (optional), BUNNY_PUBLIC_BASE_URL (optional).",
        );
    }

    return { storageZoneName, apiKey, storageBaseUrl, publicBaseUrl };
}

function sanitizeFilename(name: string) {
    return name
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9._-]/g, "");
}

export function bunnyPublicUrlForPath(path: string) {
    const cfg = getBunnyConfig();
    const clean = path.replace(/^\/+/, "");
    return `${cfg.publicBaseUrl}/${clean}`;
}

export function bunnyPathFromPublicUrl(url: string): string | null {
    try {
        const cfg = getBunnyConfig();
        const u = new URL(url);
        const publicBase = new URL(cfg.publicBaseUrl);

        // Solo intentamos extraer si coincide host (evita borrar cosas de terceros).
        if (u.host !== publicBase.host) return null;

        return u.pathname.replace(/^\/+/, "");
    } catch {
        return null;
    }
}

export async function bunnyUploadBytes(opts: {
    folder?: string;
    filename: string;
    bytes: Uint8Array;
    contentType?: string;
}) {
    const cfg = getBunnyConfig();
    const folder = (opts.folder ?? "uploads").replace(/^\/+|\/+$/g, "");
    const safe = sanitizeFilename(opts.filename) || `file-${Date.now()}`;
    const key = `${folder}/${Date.now()}-${safe}`.replace(/^\/+/, "");

    const uploadUrl = `${cfg.storageBaseUrl.replace(/\/+$/, "")}/${cfg.storageZoneName}/${key}`;

    const res = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
            AccessKey: cfg.apiKey,
            "Content-Type": opts.contentType ?? "application/octet-stream",
        },
        body: Buffer.from(opts.bytes),
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Bunny upload failed (${res.status}): ${text}`);
    }

    return {
        path: key,
        url: bunnyPublicUrlForPath(key),
    };
}

export async function bunnyDeleteByPath(path: string) {
    const cfg = getBunnyConfig();
    const key = path.replace(/^\/+/, "");
    const deleteUrl = `${cfg.storageBaseUrl.replace(/\/+$/, "")}/${cfg.storageZoneName}/${key}`;

    const res = await fetch(deleteUrl, {
        method: "DELETE",
        headers: { AccessKey: cfg.apiKey },
    });

    // Si no existe, Bunny a veces devuelve 404; no lo tratamos como fatal.
    if (res.status === 404) return { deleted: false };

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Bunny delete failed (${res.status}): ${text}`);
    }

    return { deleted: true };
}

export async function bunnyDeleteByPublicUrl(publicUrl: string) {
    const path = bunnyPathFromPublicUrl(publicUrl);
    if (!path) return { deleted: false };
    return await bunnyDeleteByPath(path);
}
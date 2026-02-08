"use server";

import { bunnyUploadBytes } from "@/lib/bunny";
import { auth } from "@/lib/auth";

export async function uploadHeaderImage(formData: FormData) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const file = formData.get("file") as File;
    if (!file) throw new Error("No file");

    const bytes = await file.arrayBuffer();
    const buffer = new Uint8Array(bytes);

    const result = await bunnyUploadBytes({
        filename: file.name,
        bytes: buffer,
        contentType: file.type,
        folder: "almuerzos",
    });

    return result.url;
}

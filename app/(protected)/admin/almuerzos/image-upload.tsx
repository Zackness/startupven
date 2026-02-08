"use region";
"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { uploadHeaderImage } from "@/lib/actions/upload";
import Image from "next/image";
import { toast } from "sonner";

interface ImageUploadProps {
    onUploadComplete: (url: string) => void;
    defaultImage?: string;
}

export function ImageUpload({ onUploadComplete, defaultImage }: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(defaultImage || null);
    const [isPending, startTransition] = useTransition();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Local preview
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);

        // Upload
        const formData = new FormData();
        formData.append("file", file);

        startTransition(async () => {
            try {
                const url = await uploadHeaderImage(formData);
                onUploadComplete(url);
                toast.success("Imagen subida correctamente");
            } catch (error) {
                toast.error("Error al subir imagen");
                console.error(error);
                setPreview(null); // Revert on failure
            }
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Button
                    type="button"
                    variant="outline"
                    className="relative overflow-hidden text-white bg-blue-800 hover:bg-blue-600"
                    disabled={isPending}
                >
                    {isPending ? "Subiendo..." : preview ? "Cambiar imagen" : "Subir imagen"}
                    <input
                        type="file"
                        className="absolute inset-0 cursor-pointer opacity-0"
                        onChange={handleFileChange}
                        accept="image/*"
                    />
                </Button>
                {preview && (
                    <div className="relative h-16 w-16 overflow-hidden rounded-md border border-zinc-200">
                        <Image
                            src={preview}
                            alt="Preview"
                            fill
                            className="object-cover"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

import { EscaneoQRPage } from "@/components/escaneo-qr-page";

export default function EditorEscaneoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black">Escanear código QR</h1>
        <p className="mt-1 text-zinc-600">
          Usa la cámara para escanear el QR del ticket y marcarlo como canjeado.
        </p>
      </div>
      <EscaneoQRPage />
    </div>
  );
}

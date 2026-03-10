"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteServicePackage } from "@/lib/actions/admin-service-packages";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function DeleteServicePackageButton({
  packageId,
  packageName,
}: {
  packageId: string;
  packageName: string;
}) {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (
      !confirm(
        `¿Eliminar el paquete "${packageName}" (${packageId})? Puede haber proyectos o usuarios que lo referencien.`
      )
    )
      return;
    setPending(true);
    try {
      await deleteServicePackage(packageId);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDelete}
      disabled={pending}
      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}

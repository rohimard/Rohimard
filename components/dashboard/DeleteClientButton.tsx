"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteClientAction } from "@/lib/actions/clients";
import { IconTrash } from "@/components/ui/icons";

export function DeleteClientButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (
      !window.confirm(
        `¿Eliminar a "${name}"? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      const res = await deleteClientAction(id);
      if (!res.ok) {
        window.alert(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="grid h-9 w-9 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
      aria-label={`Eliminar ${name}`}
    >
      <IconTrash width={17} height={17} />
    </button>
  );
}

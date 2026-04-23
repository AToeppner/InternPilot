"use client";

import { ApplicationStatus } from "@prisma/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export function StatusPicker(props: { id: string; value: ApplicationStatus }) {
  async function update(status: ApplicationStatus) {
    const res = await fetch(`/api/applications/${props.id}/status`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json().catch(() => null);
    if (!data?.ok) toast.error("Could not update status.");
    else toast.success("Status updated.");
  }

  return (
    <Select defaultValue={props.value} onValueChange={(v) => update(v as ApplicationStatus)}>
      <SelectTrigger className="h-9 w-[140px] rounded-xl">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.values(ApplicationStatus).map((s) => (
          <SelectItem key={s} value={s}>
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}


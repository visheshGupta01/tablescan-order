import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import QRCode from "qrcode";
import { Copy, Download, Plus, Trash2 } from "lucide-react";
import { useTableMutations, useTables } from "@/hooks/useAdminData";
import type { RestaurantTable } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_authenticated/admin/tables")({
  head: () => ({
    meta: [
      { title: "Tables & QR Codes — Coffee Dose Staff Console" },
      {
        name: "description",
        content: "Create tables and download printable QR codes that open the menu.",
      },
      { property: "og:title", content: "Tables & QR Codes — Coffee Dose Staff Console" },
      { property: "og:description", content: "Each table gets its own secure QR link." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TablesPage,
});

function TablesPage() {
  const { data: tables = [] } = useTables();
  const { create, update, remove } = useTableMutations();
  const [name, setName] = useState("");

  const add = () => {
    if (!name.trim()) return;
    create.mutate(name.trim(), {
      onSuccess: () => {
        setName("");
        toast.success("Table created with a fresh QR code");
      },
      onError: () => toast.error("Could not create the table."),
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl">Tables & QR codes</h2>
        <p className="text-sm text-muted-foreground">
          Print one QR per table. Scanning opens the menu with that table pre-selected.
        </p>
      </div>

      <Card className="flex flex-wrap gap-2 p-3">
        <Input
          placeholder="Table name (e.g. Table 8)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={add} disabled={create.isPending}>
          <Plus className="mr-2 h-4 w-4" /> Add table
        </Button>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tables.map((table) => (
          <TableCard
            key={table.id}
            table={table}
            onToggle={(v) => update.mutate({ id: table.id, patch: { is_active: v } })}
            onRename={(value) => update.mutate({ id: table.id, patch: { name: value } })}
            onDelete={() => {
              if (confirm(`Delete ${table.name}?`)) remove.mutate(table.id);
            }}
          />
        ))}
        {tables.length === 0 && (
          <p className="text-sm text-muted-foreground">No tables yet.</p>
        )}
      </div>
    </div>
  );
}

function TableCard({
  table,
  onToggle,
  onRename,
  onDelete,
}: {
  table: RestaurantTable;
  onToggle: (value: boolean) => void;
  onRename: (value: string) => void;
  onDelete: () => void;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [url, setUrl] = useState("");

  useEffect(() => {
    const link = `${window.location.origin}/menu/table/${table.qr_token}`;
    setUrl(link);
    void QRCode.toDataURL(link, { width: 512, margin: 1 }).then(setDataUrl);
  }, [table.qr_token]);

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${table.name.replace(/\s+/g, "-").toLowerCase()}-qr.png`;
    a.click();
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <Input
          defaultValue={table.name}
          className="max-w-[10rem]"
          onBlur={(e) => {
            const value = e.target.value.trim();
            if (value && value !== table.name) onRename(value);
          }}
        />
        <Button size="icon" variant="ghost" onClick={onDelete}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <div className="mt-3 flex justify-center rounded-md bg-white p-3">
        {dataUrl ? (
          <img src={dataUrl} alt={`QR code for ${table.name}`} className="h-40 w-40" />
        ) : (
          <div className="h-40 w-40 animate-pulse rounded bg-muted" />
        )}
      </div>

      <p className="mt-2 break-all text-[11px] text-muted-foreground">{url}</p>

      <div className="mt-3 flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={download} disabled={!dataUrl}>
          <Download className="mr-2 h-4 w-4" /> PNG
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            void navigator.clipboard.writeText(url);
            toast.success("Link copied");
          }}
        >
          <Copy className="mr-2 h-4 w-4" /> Link
        </Button>
        <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <Switch checked={table.is_active} onCheckedChange={onToggle} />
          {table.is_active ? "Active" : "Off"}
        </label>
      </div>
    </Card>
  );
}

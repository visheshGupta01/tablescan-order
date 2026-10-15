import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRestaurant, useRestaurantMutation } from "@/hooks/useAdminData";
import { DAYS } from "@/lib/hours";
import type { OpeningHours } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  head: () => ({
    meta: [
      { title: "Restaurant Settings — Coffee Dose Staff Console" },
      {
        name: "description",
        content: "Update branding, contact details and opening hours for the QR menu.",
      },
      { property: "og:title", content: "Restaurant Settings — Coffee Dose Staff Console" },
      { property: "og:description", content: "Control how the guest-facing menu looks." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SettingsPage,
});

const FIELDS = [
  ["name", "Restaurant name"],
  ["description", "Tagline / description"],
  ["logo", "Logo URL"],
  ["cover_image", "Cover image URL"],
  ["phone", "Phone"],
  ["email", "Email"],
  ["address", "Address"],
  ["maps_url", "Google Maps URL"],
  ["instagram_url", "Instagram URL"],
  ["website_url", "Website URL"],
  ["whatsapp_number", "WhatsApp number"],
] as const;

function SettingsPage() {
  const { data: restaurant } = useRestaurant();
  const save = useRestaurantMutation();
  const [form, setForm] = useState<Record<string, string>>({});
  const [hours, setHours] = useState<OpeningHours>({});
  const [active, setActive] = useState(true);
  const [taxRate, setTaxRate] = useState("0");
  const [taxLabel, setTaxLabel] = useState("GST");
  const [tipsEnabled, setTipsEnabled] = useState(true);

  useEffect(() => {
    if (!restaurant) return;
    const next: Record<string, string> = {};
    for (const [key] of FIELDS) next[key] = (restaurant[key] as string | null) ?? "";
    setForm(next);
    setHours(restaurant.opening_hours ?? {});
    setActive(restaurant.is_active);
    setTaxRate(String(restaurant.tax_rate ?? 0));
    setTaxLabel(restaurant.tax_label ?? "GST");
    setTipsEnabled(restaurant.tips_enabled !== false);
  }, [restaurant]);

  const submit = () => {
    if (!restaurant) return;
    save.mutate(
      {
        id: restaurant.id,
        patch: {
          ...form,
          opening_hours: hours,
          is_active: active,
          tax_rate: Math.max(0, Math.min(50, Number(taxRate) || 0)),
          tax_label: taxLabel.trim() || "Tax",
          tips_enabled: tipsEnabled,
        },
      },
      {
        onSuccess: () => toast.success("Settings saved"),
        onError: () => toast.error("Could not save settings."),
      },
    );
  };

  const setDay = (key: string, patch: Partial<{ open: string; close: string; closed: boolean }>) => {
    setHours((prev) => ({
      ...prev,
      [key]: { open: "09:00", close: "22:00", ...(prev[key] ?? {}), ...patch },
    }));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl">Restaurant settings</h2>
          <p className="text-sm text-muted-foreground">These details show on the guest menu.</p>
        </div>
        <Button onClick={submit} disabled={!restaurant || save.isPending}>
          Save changes
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3 p-4">
          <h3 className="text-lg">Brand & contact</h3>
          {FIELDS.map(([key, label]) => (
            <div key={key} className="space-y-1.5">
              <Label htmlFor={key}>{label}</Label>
              {key === "description" ? (
                <Textarea
                  id={key}
                  value={form[key] ?? ""}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              ) : (
                <Input
                  id={key}
                  value={form[key] ?? ""}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              )}
            </div>
          ))}
          <label className="flex items-center gap-2 pt-2 text-sm">
            <Switch checked={active} onCheckedChange={setActive} />
            Menu is live for guests
          </label>
        </Card>

        <Card className="space-y-3 p-4">
          <h3 className="text-lg">Billing</h3>
          <p className="text-sm text-muted-foreground">
            Tax is applied to every order subtotal. Tips are optional for guests.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="tax_label">Tax label</Label>
              <Input
                id="tax_label"
                value={taxLabel}
                onChange={(e) => setTaxLabel(e.target.value)}
                placeholder="GST"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tax_rate">Tax rate (%)</Label>
              <Input
                id="tax_rate"
                type="number"
                min={0}
                max={50}
                step="0.5"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 pt-1 text-sm">
            <Switch checked={tipsEnabled} onCheckedChange={setTipsEnabled} />
            Offer tipping at checkout
          </label>
        </Card>

        <Card className="space-y-3 p-4">
          <h3 className="text-lg">Opening hours</h3>
          {DAYS.map((day) => {
            const value = hours[day.key];
            const closed = value?.closed ?? false;
            return (
              <div key={day.key} className="flex flex-wrap items-center gap-2">
                <span className="w-24 text-sm">{day.label}</span>
                <Input
                  type="time"
                  className="w-28"
                  value={value?.open ?? "09:00"}
                  disabled={closed}
                  onChange={(e) => setDay(day.key, { open: e.target.value })}
                />
                <Input
                  type="time"
                  className="w-28"
                  value={value?.close ?? "22:00"}
                  disabled={closed}
                  onChange={(e) => setDay(day.key, { close: e.target.value })}
                />
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Switch
                    checked={closed}
                    onCheckedChange={(v) => setDay(day.key, { closed: v })}
                  />
                  Closed
                </label>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}

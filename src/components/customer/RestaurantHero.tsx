import { Instagram, MapPin, Phone, Clock, Globe } from "lucide-react";
import type { Restaurant } from "@/types";
import { isOpenNow, todayHoursLabel } from "@/lib/hours";

export function RestaurantHero({
  restaurant,
  tableName,
}: {
  restaurant: Restaurant;
  tableName: string;
}) {
  const open = isOpenNow(restaurant.opening_hours);

  return (
    <header>
      <div className="relative h-44 w-full overflow-hidden sm:h-64">
        {restaurant.cover_image ? (
          <img
            src={restaurant.cover_image}
            alt={`${restaurant.name} interior`}
            className="h-full w-full object-cover"
            loading="eager"
          />
        ) : (
          <div className="h-full w-full bg-secondary" />
        )}
        <div className="absolute inset-0 bg-foreground/35" />
      </div>

      <div className="mx-auto -mt-12 max-w-3xl px-4">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-start gap-4">
            {restaurant.logo ? (
              <img
                src={restaurant.logo}
                alt={`${restaurant.name} logo`}
                className="size-14 shrink-0 rounded-full object-cover"
                loading="lazy"
              />
            ) : null}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-2xl leading-tight">{restaurant.name}</h1>
                <span className="rounded-sm border border-border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {tableName}
                </span>
              </div>
              {restaurant.description ? (
                <p className="mt-1 text-sm text-muted-foreground">{restaurant.description}</p>
              ) : null}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span
                  className={`inline-flex items-center gap-1.5 font-medium ${
                    open ? "text-success" : "text-destructive"
                  }`}
                >
                  <span className="size-1.5 rounded-full bg-current" />
                  {open ? "Open Now" : "Closed"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3.5" /> {todayHoursLabel(restaurant.opening_hours)}
                </span>
                {restaurant.address ? (
                  <a
                    href={restaurant.maps_url ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-foreground"
                  >
                    <MapPin className="size-3.5" /> {restaurant.address}
                  </a>
                ) : null}
                {restaurant.phone ? (
                  <a
                    href={`tel:${restaurant.phone}`}
                    className="inline-flex items-center gap-1.5 hover:text-foreground"
                  >
                    <Phone className="size-3.5" /> {restaurant.phone}
                  </a>
                ) : null}
                {restaurant.instagram_url ? (
                  <a
                    href={restaurant.instagram_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-foreground"
                  >
                    <Instagram className="size-3.5" /> Instagram
                  </a>
                ) : null}
                {restaurant.website_url ? (
                  <a
                    href={restaurant.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-foreground"
                  >
                    <Globe className="size-3.5" /> Website
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

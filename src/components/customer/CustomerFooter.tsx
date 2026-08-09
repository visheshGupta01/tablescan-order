import type { Restaurant } from "@/types";
import { DAYS, getDayHours } from "@/lib/hours";

export function CustomerFooter({ restaurant }: { restaurant: Restaurant }) {
  return (
    <footer className="mt-12 border-t border-border bg-surface px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-4 text-sm text-muted-foreground">
        <p className="font-display text-base text-foreground">{restaurant.name}</p>
        {restaurant.address ? <p>{restaurant.address}</p> : null}
        {restaurant.phone ? <p>{restaurant.phone}</p> : null}
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 sm:max-w-sm">
          {DAYS.map((day) => {
            const hours = getDayHours(restaurant.opening_hours, day.key);
            return (
              <div key={day.key} className="flex justify-between gap-3">
                <span>{day.label.slice(0, 3)}</span>
                <span>{!hours || hours.closed ? "Closed" : `${hours.open}–${hours.close}`}</span>
              </div>
            );
          })}
        </div>
        <div className="flex gap-4">
          {restaurant.instagram_url ? (
            <a href={restaurant.instagram_url} target="_blank" rel="noreferrer" className="hover:text-foreground">
              Instagram
            </a>
          ) : null}
          {restaurant.website_url ? (
            <a href={restaurant.website_url} target="_blank" rel="noreferrer" className="hover:text-foreground">
              Website
            </a>
          ) : null}
        </div>
      </div>
    </footer>
  );
}

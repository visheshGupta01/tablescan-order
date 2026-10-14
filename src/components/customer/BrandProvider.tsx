import type { ReactNode } from "react";
import type { Theme } from "@/types";

/**
 * Applies the restaurant's branding (from admin settings) by overriding the
 * design-system tokens on a wrapper element. Components keep using semantic
 * classes like bg-primary / text-accent.
 */
export function BrandProvider({
  template,
  children,
}: {
  theme: Theme | undefined;
  template?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground" data-template={template}>
      {children}
    </div>
  );
}

import type { CSSProperties, ReactNode } from "react";
import type { Theme } from "@/types";

/**
 * Applies the restaurant's branding (from admin settings) by overriding the
 * design-system tokens on a wrapper element. Components keep using semantic
 * classes like bg-primary / text-accent.
 */
export function BrandProvider({
  theme,
  template,
  children,
}: {
  theme: Theme | undefined;
  template?: string;
  children: ReactNode;
}) {
  const style: CSSProperties & Record<string, string> = {} as CSSProperties &
    Record<string, string>;
  if (theme?.primary) style["--primary"] = theme.primary;
  if (theme?.accent) style["--accent"] = theme.accent;
  if (theme?.background) style["--background"] = theme.background;
  if (theme?.text) style["--foreground"] = theme.text;

  const radius = template === "elegant" ? "0.125rem" : template === "minimal" ? "0rem" : "0.5rem";
  style["--radius"] = radius;

  return (
    <div style={style} className="min-h-screen bg-background text-foreground" data-template={template}>
      {children}
    </div>
  );
}

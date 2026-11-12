import type { CSSProperties, ReactNode } from "react";
import type { Theme } from "@/types";

function safeColor(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return /^(#[\da-fA-F]{3,8}|rgba?\([\d\s.,%/]+\)|hsla?\([\d\s.,%deg]+\))$/.test(value) ? value : undefined;
}

export function BrandProvider({ theme, template, children }: {
  theme: Theme | undefined;
  template?: string;
  children: ReactNode;
}) {
  const style = {
    "--background": safeColor(theme?.background),
    "--foreground": safeColor(theme?.text),
    "--primary": safeColor(theme?.primary),
    "--accent": safeColor(theme?.accent),
  } as CSSProperties;

  return <div className="min-h-screen bg-background text-foreground" data-template={template} style={style}>{children}</div>;
}

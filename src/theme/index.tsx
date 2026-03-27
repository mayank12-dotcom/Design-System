import type { PropsWithChildren } from "react";
import { themeClassNames, type ThemeMode } from "../tokens";

export { themeClassNames, themeModes, type ThemeMode } from "../tokens";

export type ThemeRootProps = PropsWithChildren<{
  mode?: ThemeMode;
  className?: string;
}>;

export const ThemeRoot = ({
  mode = "light",
  className,
  children
}: ThemeRootProps) => (
  <div className={[themeClassNames[mode], className].filter(Boolean).join(" ")}>
    {children}
  </div>
);

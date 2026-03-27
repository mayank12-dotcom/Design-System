import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cx } from "../lib/cx";

export type LinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  size?: "md" | "sm";
  state?: "rest" | "hover" | "active" | "disabled";
  children?: ReactNode;
};

export const LinkButton = ({
  size = "md",
  state = "rest",
  children,
  className,
  ...props
}: LinkButtonProps) => (
  <a
    {...props}
    className={cx("eden-link-button", className)}
    data-size={size}
    data-state={state}
    aria-disabled={state === "disabled" ? "true" : undefined}
  >
    {children}
  </a>
);

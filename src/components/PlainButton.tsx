import type { ReactNode } from "react";
import { cx } from "../lib/cx";
import type { ButtonElementProps, InteractionState } from "./button.types";

export type PlainButtonProps = ButtonElementProps & {
  size?: "md" | "sm";
  state?: InteractionState;
  loading?: boolean;
  children?: ReactNode;
};

export const PlainButton = ({
  size = "md",
  state = "rest",
  loading = false,
  disabled,
  children,
  className,
  type = "button",
  ...props
}: PlainButtonProps) => (
  <button
    {...props}
    type={type}
    disabled={disabled || loading}
    className={cx("eden-plain-button", className)}
    data-size={size}
    data-state={loading ? "loading" : disabled ? "disabled" : state}
  >
    {loading ? "Loading" : children}
  </button>
);

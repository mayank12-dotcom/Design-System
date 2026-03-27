import type { ReactNode } from "react";
import { cx } from "../lib/cx";
import type {
  ButtonElementProps,
  ButtonSize,
  CommonButtonProps,
  InteractionState
} from "./button.types";

export type ButtonProps = ButtonElementProps &
  CommonButtonProps & {
    size?: ButtonSize;
    children?: ReactNode;
  };

const resolveState = (
  state: InteractionState | undefined,
  disabled: boolean | undefined,
  loading: boolean | undefined
) => {
  if (loading) {
    return "loading";
  }

  if (disabled) {
    return "disabled";
  }

  return state ?? "rest";
};

export const Button = ({
  variant = "primary",
  size = "md",
  state,
  loading = false,
  disabled,
  leadingIcon,
  trailingIcon,
  children,
  className,
  type = "button",
  ...props
}: ButtonProps) => {
  const visualState = resolveState(state, disabled, loading);

  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      className={cx("eden-button", className)}
      data-variant={variant}
      data-size={size}
      data-state={visualState}
    >
      {loading ? <span className="eden-button__spinner" aria-hidden="true" /> : null}
      {leadingIcon ? <span className="eden-button__icon">{leadingIcon}</span> : null}
      {children ? <span className="eden-button__label">{children}</span> : null}
      {trailingIcon ? <span className="eden-button__icon">{trailingIcon}</span> : null}
    </button>
  );
};

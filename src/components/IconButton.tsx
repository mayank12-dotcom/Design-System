import type { ReactNode } from "react";
import { Button } from "./Button";
import type {
  ButtonElementProps,
  CommonButtonProps,
  IconButtonSize
} from "./button.types";

export type IconButtonProps = ButtonElementProps &
  CommonButtonProps & {
    size?: IconButtonSize;
    icon: ReactNode;
    "aria-label": string;
  };

export const IconButton = ({
  size = "md",
  icon,
  className,
  ...props
}: IconButtonProps) => (
  <Button
    {...props}
    size={size === "xxs" || size === "xs" ? "sm" : size}
    className={className}
  >
    <span className="eden-button__icon-only" data-icon-size={size}>
      {icon}
    </span>
  </Button>
);

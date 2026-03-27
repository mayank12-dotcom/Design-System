import type { ReactNode } from "react";
import { cx } from "../lib/cx";
import type { ButtonSize } from "./button.types";

export type ButtonGroupProps = {
  children: ReactNode;
  size?: ButtonSize;
};

export const ButtonGroup = ({ children, size = "md" }: ButtonGroupProps) => (
  <div className={cx("eden-button-group")} data-size={size}>
    {children}
  </div>
);

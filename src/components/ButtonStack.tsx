import type { ReactNode } from "react";
import { cx } from "../lib/cx";
import type { ButtonSize } from "./button.types";

export type ButtonStackProps = {
  children: ReactNode;
  direction?: "horizontal" | "vertical";
  size?: ButtonSize;
};

export const ButtonStack = ({
  children,
  direction = "horizontal",
  size = "md"
}: ButtonStackProps) => (
  <div className={cx("eden-button-stack")} data-direction={direction} data-size={size}>
    {children}
  </div>
);

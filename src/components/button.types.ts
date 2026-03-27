import type { ButtonHTMLAttributes, ReactNode } from "react";

export const buttonVariants = [
  "primary",
  "secondary",
  "tertiary",
  "ghost",
  "critical",
  "white"
] as const;

export const buttonSizes = ["lg", "md", "sm"] as const;
export const iconButtonSizes = ["lg", "md", "sm", "xs", "xxs"] as const;
export const interactionStates = [
  "rest",
  "hover",
  "pressed",
  "disabled",
  "loading"
] as const;

export type ButtonVariant = (typeof buttonVariants)[number];
export type ButtonSize = (typeof buttonSizes)[number];
export type IconButtonSize = (typeof iconButtonSizes)[number];
export type InteractionState = (typeof interactionStates)[number];

export type CommonButtonProps = {
  variant?: ButtonVariant;
  state?: InteractionState;
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
};

export type ButtonElementProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "color"
>;

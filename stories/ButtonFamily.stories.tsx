import type { Meta, StoryObj } from "@storybook/react";
import {
  Button,
  ButtonGroup,
  ButtonStack,
  IconButton,
  LinkButton,
  PlainButton,
  ProgressiveButton,
  ThemeRoot,
  buttonSizes,
  buttonVariants,
  iconButtonSizes,
  interactionStates
} from "../src";

const meta = {
  title: "Buttons/Family",
  parameters: {
    layout: "padded"
  },
  decorators: [
    (Story, context) => (
      <ThemeRoot mode={context.globals.themeMode === "dark" ? "dark" : "light"}>
        <div style={{ padding: "24px" }}>
          <Story />
        </div>
      </ThemeRoot>
    )
  ]
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const iconGlyph = (
  <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 16 16" fill="none">
    <path
      d="M8 3v10M3 8h10"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export const ButtonsMatrix: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "28px" }}>
      {buttonVariants.map((variant) => (
        <div key={variant} style={{ display: "grid", gap: "12px" }}>
          <strong style={{ textTransform: "capitalize" }}>{variant}</strong>
          {interactionStates.map((state) => (
            <div key={state} style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {buttonSizes.map((size) => (
                <Button key={`${variant}-${state}-${size}`} variant={variant} size={size} state={state}>
                  {variant} {size}
                </Button>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
};

export const IconButtons: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "24px" }}>
      {buttonVariants.map((variant) => (
        <div key={variant} style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {iconButtonSizes.map((size) => (
            <IconButton
              key={`${variant}-${size}`}
              aria-label={`${variant}-${size}`}
              variant={variant}
              size={size}
              icon={iconGlyph}
            />
          ))}
        </div>
      ))}
    </div>
  )
};

export const SupportingButtons: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "24px" }}>
      <ButtonGroup>
        <Button>Primary action</Button>
        <Button variant="secondary">Secondary action</Button>
      </ButtonGroup>
      <ButtonStack direction="vertical">
        <Button>Primary action</Button>
        <Button variant="tertiary">Tertiary action</Button>
      </ButtonStack>
      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        <ProgressiveButton progressState="progress-1" />
        <ProgressiveButton progressState="progress-2" />
        <ProgressiveButton progressState="complete" />
      </div>
      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        <PlainButton>Plain action</PlainButton>
        <LinkButton href="https://example.com">Link action</LinkButton>
      </div>
    </div>
  )
};

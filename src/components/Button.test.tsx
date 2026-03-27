import { render, screen } from "@testing-library/react";
import { Button } from "./Button";
import { ButtonGroup } from "./ButtonGroup";
import { ButtonStack } from "./ButtonStack";
import { IconButton } from "./IconButton";
import "../index.css";

describe("Button", () => {
  it("renders the expected state contract", () => {
    render(
      <Button variant="secondary" size="lg" state="hover">
        Continue
      </Button>
    );

    const button = screen.getByRole("button", { name: "Continue" });
    expect(button).toHaveAttribute("data-variant", "secondary");
    expect(button).toHaveAttribute("data-size", "lg");
    expect(button).toHaveAttribute("data-state", "hover");
  });

  it("forces the loading state and disables interaction", () => {
    render(<Button loading>Save</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("data-state", "loading");
    expect(button).toBeDisabled();
  });

  it("renders icon-only sizing through the shared button primitive", () => {
    render(<IconButton aria-label="Search" size="xxs" icon={<span>+</span>} />);

    const button = screen.getByRole("button", { name: "Search" });
    const icon = screen.getByText("+").parentElement;

    expect(button).toHaveAttribute("data-size", "sm");
    expect(icon).toHaveAttribute("data-icon-size", "xxs");
  });
});

describe("Button layouts", () => {
  it("renders a button group with the expected size contract", () => {
    const { container } = render(
      <ButtonGroup size="sm">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
      </ButtonGroup>
    );

    expect(container.firstChild).toHaveAttribute("data-size", "sm");
  });

  it("renders a vertical button stack", () => {
    const { container } = render(
      <ButtonStack direction="vertical">
        <Button>One</Button>
        <Button>Two</Button>
      </ButtonStack>
    );

    expect(container.firstChild).toHaveAttribute("data-direction", "vertical");
  });
});

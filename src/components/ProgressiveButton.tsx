import { Button, type ButtonProps } from "./Button";

export type ProgressiveButtonState = "progress-1" | "progress-2" | "complete";

export type ProgressiveButtonProps = Omit<ButtonProps, "children"> & {
  progressState?: ProgressiveButtonState;
  labels?: Partial<Record<ProgressiveButtonState, string>>;
};

const defaultLabels: Record<ProgressiveButtonState, string> = {
  "progress-1": "Step 1",
  "progress-2": "Step 2",
  complete: "Complete"
};

export const ProgressiveButton = ({
  progressState = "progress-1",
  labels,
  ...props
}: ProgressiveButtonProps) => {
  const mergedLabels = {
    ...defaultLabels,
    ...labels
  };

  return (
    <Button {...props} data-progress-state={progressState}>
      {mergedLabels[progressState]}
    </Button>
  );
};

import type { Preview } from "@storybook/react";
import "../src/index.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },
    layout: "fullscreen"
  },
  globalTypes: {
    themeMode: {
      name: "Theme mode",
      description: "Global theme mode",
      defaultValue: "light",
      toolbar: {
        icon: "mirror",
        items: ["light", "dark"]
      }
    }
  }
};

export default preview;

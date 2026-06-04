import type { Decorator, Preview } from "@storybook/react-vite";
import "../src/tokens/tokens.css";

const withThemeAndDir: Decorator = (Story, context) => {
  const theme = (context.globals.theme as string) ?? "light";
  const dir = (context.globals.dir as string) ?? "ltr";
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.setAttribute("dir", dir);

  return (
    <div
      style={{
        background: "var(--th-color-bg)",
        color: "var(--th-color-text-1)",
        fontFamily: "var(--th-font-display)",
        fontSize: "var(--th-text-base)",
        lineHeight: "1.5",
        WebkitFontSmoothing: "antialiased",
        padding: "2rem",
        minHeight: "100%",
        boxSizing: "border-box",
      }}
      dir={dir}
    >
      <Story />
    </div>
  );
};

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Color theme",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
        ],
        dynamicTitle: true,
      },
      defaultValue: "light",
    },
    dir: {
      description: "Text direction",
      toolbar: {
        title: "Direction",
        icon: "paragraph",
        items: [
          { value: "ltr", title: "LTR" },
          { value: "rtl", title: "RTL" },
        ],
        dynamicTitle: true,
      },
      defaultValue: "ltr",
    },
  },
  decorators: [withThemeAndDir],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "todo",
    },
    backgrounds: { disable: true },
    options: {
      storySort: {
        order: [
          "Threads",
          [
            "Introduction",
            "Primitives",   ["Colours", "Typography", "Spacing"],
            "Atoms",        ["Button", "Badge", "AvailabilityPill"],
            "Layout",       ["Container", "Stack", "Cluster", "Grid", "Section", "Divider"],
            "Components",   ["Card", "OpCard", "Accordion", "PriceCard", "Testimonial", "StepCard", "ProjectCard", "ClientWorkRow", "EssayRow"],
            "Feedback",     ["Callout", "Banner", "Toast"],
            "Forms",        ["Input", "Textarea", "Select", "Checkbox", "Radio", "FileDropzone"],
            "Site",         ["SiteNav", "SiteFooter"],
          ],
        ],
      },
    },
  },
};

export default preview;

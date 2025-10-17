import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ServerActions } from "../ServerActions";
import { describe, test, expect } from "vitest";
import { useForm } from "react-hook-form";
import { UISettings, getDefaultUISettings } from "~/schemas/settings.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { UISettingsSchema } from "~/schemas/settings.schema";

// Test wrapper component that provides form context
function TestWrapper({
  children,
  initialSettings = getDefaultUISettings(),
}: {
  children: React.ReactElement<any>;
  initialSettings?: Partial<UISettings>;
}) {
  const form = useForm<UISettings>({
    resolver: zodResolver(UISettingsSchema) as any,
    defaultValues: { ...getDefaultUISettings(), ...initialSettings },
    mode: "onBlur",
  });

  const settings = form.watch();
  const errors = form.formState.errors;

  return <div>{React.cloneElement(children, { form, settings, errors })}</div>;
}

describe("ServerActions", () => {
  describe("Component Rendering", () => {
    test("renders with core UI elements", () => {
      const { container } = render(
        <TestWrapper>
          <ServerActions
            form={undefined as any}
            settings={undefined as any}
            errors={{}}
          />
        </TestWrapper>
      );

      expect(screen.getByText("Server Actions")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Configure server-side headers and WordPress integration settings"
        )
      ).toBeInTheDocument();
      expect(screen.getByText("Send Additional Headers")).toBeInTheDocument();
      expect(container.textContent).toContain(
        "Include extra browser information headers"
      );
    });

    test("shows info notice about server actions", () => {
      const { container } = render(
        <TestWrapper>
          <ServerActions
            form={undefined as any}
            settings={undefined as any}
            errors={{}}
          />
        </TestWrapper>
      );

      expect(container.textContent).toContain(
        "Server Actions control how Anura integrates with your WordPress server"
      );
    });
  });

  describe("Header Priority Visibility", () => {
    test("hides priority selector when headers are disabled", () => {
      render(
        <TestWrapper
          initialSettings={{
            addHeaders: false,
          }}
        >
          <ServerActions
            form={undefined as any}
            settings={undefined as any}
            errors={{}}
          />
        </TestWrapper>
      );

      expect(screen.queryByText("Header Priority")).not.toBeInTheDocument();
    });

    test("shows priority selector when headers are enabled", () => {
      render(
        <TestWrapper
          initialSettings={{
            addHeaders: true,
          }}
        >
          <ServerActions
            form={undefined as any}
            settings={undefined as any}
            errors={{}}
          />
        </TestWrapper>
      );

      expect(screen.getByText("Header Priority")).toBeInTheDocument();
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    test("reveals priority selector after enabling headers", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper
          initialSettings={{
            addHeaders: false,
          }}
        >
          <ServerActions
            form={undefined as any}
            settings={undefined as any}
            errors={{}}
          />
        </TestWrapper>
      );

      expect(screen.queryByText("Header Priority")).not.toBeInTheDocument();

      const toggle = screen.getByRole("checkbox", {
        name: /Send Additional Headers/i,
      });
      await user.click(toggle);

      await waitFor(() => {
        expect(screen.getByText("Header Priority")).toBeInTheDocument();
      });
    });
  });

  describe("Form Integration", () => {
    test("updates priority value when user changes selection", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper
          initialSettings={{
            addHeaders: true,
            headerPriority: "medium",
          }}
        >
          <ServerActions
            form={undefined as any}
            settings={undefined as any}
            errors={{}}
          />
        </TestWrapper>
      );

      const select = screen.getByRole("combobox");
      expect(select.value).toBe("medium");

      await user.selectOptions(select, "highest");

      await waitFor(() => {
        expect(select.value).toBe("highest");
      });
    });

    test("marks form as dirty when toggle is changed", async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const form = useForm<UISettings>({
          resolver: zodResolver(UISettingsSchema) as any,
          defaultValues: getDefaultUISettings(),
          mode: "onBlur",
        });

        const settings = form.watch();

        return (
          <div>
            <ServerActions
              form={form}
              settings={settings}
              errors={form.formState.errors}
            />
            <div data-testid="form-dirty">
              {form.formState.isDirty ? "dirty" : "clean"}
            </div>
          </div>
        );
      };

      render(<TestComponent />);

      expect(screen.getByTestId("form-dirty")).toHaveTextContent("clean");

      const toggle = screen.getByRole("checkbox", {
        name: /Send Additional Headers/i,
      });
      await user.click(toggle);

      await waitFor(() => {
        expect(screen.getByTestId("form-dirty")).toHaveTextContent("dirty");
      });
    });
  });

  describe("Error Display", () => {
    test("displays addHeaders validation error", () => {
      const TestWithError = () => {
        const form = useForm<UISettings>({
          resolver: zodResolver(UISettingsSchema) as any,
          defaultValues: getDefaultUISettings(),
          mode: "onBlur",
        });

        const settings = form.watch();
        const errors = {
          addHeaders: {
            message: "Headers configuration error",
          },
        };

        return (
          <ServerActions
            form={form}
            settings={settings}
            errors={errors as any}
          />
        );
      };

      const { container } = render(<TestWithError />);

      expect(container.textContent).toContain("Headers configuration error");
    });

    test("displays headerPriority validation error when headers enabled", () => {
      const TestWithError = () => {
        const form = useForm<UISettings>({
          resolver: zodResolver(UISettingsSchema) as any,
          defaultValues: {
            ...getDefaultUISettings(),
            addHeaders: true,
          },
          mode: "onBlur",
        });

        const settings = form.watch();
        const errors = {
          headerPriority: {
            message: "Invalid priority level",
          },
        };

        return (
          <ServerActions
            form={form}
            settings={settings}
            errors={errors as any}
          />
        );
      };

      const { container } = render(<TestWithError />);

      expect(container.textContent).toContain("Invalid priority level");
    });
  });

  describe("Technical Details Section", () => {
    test("renders technical details accordion", () => {
      render(
        <TestWrapper>
          <ServerActions
            form={undefined as any}
            settings={undefined as any}
            errors={{}}
          />
        </TestWrapper>
      );

      const summary = screen.getByText("What Gets Sent");
      expect(summary).toBeInTheDocument();

      // Details element should be present
      const details = summary.closest("details");
      expect(details).toBeInTheDocument();
    });

    test("technical details contains header information", () => {
      const { container } = render(
        <TestWrapper>
          <ServerActions
            form={undefined as any}
            settings={undefined as any}
            errors={{}}
          />
        </TestWrapper>
      );

      // Check for key technical information
      expect(container.textContent).toContain("Accept-CH");
      expect(container.textContent).toContain("Permissions-Policy");
      expect(container.textContent).toContain("Device memory");
    });
  });

  describe("Priority Options", () => {
    test("displays all priority levels in selector", () => {
      render(
        <TestWrapper
          initialSettings={{
            addHeaders: true,
          }}
        >
          <ServerActions
            form={undefined as any}
            settings={undefined as any}
            errors={{}}
          />
        </TestWrapper>
      );

      const select = screen.getByRole("combobox");
      const options = Array.from(select.querySelectorAll("option")).map(
        (opt) => opt.textContent
      );

      expect(options).toContain("Highest");
      expect(options).toContain("High");
      expect(options).toContain("Medium");
      expect(options).toContain("Low");
      expect(options).toContain("Lowest");
    });
  });
});

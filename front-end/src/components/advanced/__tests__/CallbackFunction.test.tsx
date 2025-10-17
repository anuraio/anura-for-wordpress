import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CallbackFunction } from "../CallbackFunction";
import { describe, test, expect, beforeEach } from "vitest";
import { useForm } from "react-hook-form";
import { UISettings, getDefaultUISettings } from "~/schemas/settings.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { UISettingsSchema } from "~/schemas/settings.schema";

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

describe("CallbackFunction", () => {
  describe("Component Rendering", () => {
    test("renders with all key elements", () => {
      const { container } = render(
        <TestWrapper>
          <CallbackFunction
            form={undefined as any}
            settings={undefined as any}
            errors={{}}
          />
        </TestWrapper>
      );

      // Card header
      expect(screen.getByText("Callback Function")).toBeInTheDocument();

      // Input field
      const input = screen.getByLabelText("JavaScript Function Name");
      expect(input).toBeInTheDocument();
      expect(input.placeholder).toBe("e.g., myAnuraCallback");

      // Help notices
      expect(container.textContent).toContain(
        "execute custom JavaScript code after Anura has finished analyzing"
      );
      expect(container.textContent).toContain(
        "Make sure your callback function is defined in the global scope"
      );
    });
  });

  describe("Functionality", () => {
    test("typing in input updates form", async () => {
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
            <CallbackFunction
              form={form}
              settings={settings}
              errors={form.formState.errors}
            />
            <div data-testid="form-dirty">
              {form.formState.isDirty ? "dirty" : "clean"}
            </div>
            <div data-testid="callback-value">{settings.callbackFunction}</div>
          </div>
        );
      };

      render(<TestComponent />);

      const input = screen.getByLabelText("JavaScript Function Name");

      // Type a callback name
      await user.type(input, "myCallback");

      // Form should update and be marked as dirty
      await waitFor(() => {
        expect(screen.getByTestId("callback-value")).toHaveTextContent("myCallback");
        expect(screen.getByTestId("form-dirty")).toHaveTextContent("dirty");
      });
    });

    test("clearing input updates form", async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const form = useForm<UISettings>({
          resolver: zodResolver(UISettingsSchema) as any,
          defaultValues: {
            ...getDefaultUISettings(),
            callbackFunction: "existingCallback",
          },
          mode: "onBlur",
        });

        const settings = form.watch();

        return (
          <div>
            <CallbackFunction
              form={form}
              settings={settings}
              errors={form.formState.errors}
            />
            <div data-testid="callback-value">{settings.callbackFunction}</div>
          </div>
        );
      };

      render(<TestComponent />);

      const input = screen.getByLabelText("JavaScript Function Name");

      expect(input.value).toBe("existingCallback");

      await user.clear(input);

      await waitFor(() => {
        expect(screen.getByTestId("callback-value")).toHaveTextContent("");
      });
    });

    test("displays validation errors", () => {
      const TestWithError = () => {
        const form = useForm<UISettings>({
          resolver: zodResolver(UISettingsSchema) as any,
          defaultValues: getDefaultUISettings(),
          mode: "onBlur",
        });

        const settings = form.watch();
        const errors = {
          callbackFunction: {
            message: "Invalid function name",
          },
        };

        return (
          <CallbackFunction
            form={form}
            settings={settings}
            errors={errors as any}
          />
        );
      };

      const { container } = render(<TestWithError />);

      expect(container.textContent).toContain("Invalid function name");
    });
  });
});

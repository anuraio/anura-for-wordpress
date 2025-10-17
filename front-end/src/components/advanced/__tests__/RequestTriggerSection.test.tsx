import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RequestTriggerSection } from "../RequestTriggerSection";
import { describe, test, expect } from "vitest";
import { useForm } from "react-hook-form";
import { UISettings, getDefaultUISettings } from "~/schemas/settings.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { UISettingsSchema } from "~/schemas/settings.schema";

describe("RequestTriggerSection", () => {
  describe("Component Rendering", () => {
    test("renders with key elements and toggles empty state", async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const form = useForm<UISettings>({
          resolver: zodResolver(UISettingsSchema) as any,
          defaultValues: {
            ...getDefaultUISettings(),
            requestTriggersEnabled: false,
          },
          mode: "onBlur",
        });

        const settings = form.watch();

        return (
          <RequestTriggerSection
            form={form}
            settings={settings}
            errors={form.formState.errors}
          />
        );
      };

      const { container } = render(<TestComponent />);

      // Card header
      expect(screen.getByText("Request Triggers")).toBeInTheDocument();

      // Toggle control
      expect(screen.getByLabelText("Enable Request Triggers")).toBeInTheDocument();

      // Subtitle
      expect(container.textContent).toContain(
        "Specify conditions for your Anura Script integration to be triggered"
      );

      // Initially not visible
      expect(screen.queryByText("Triggers")).not.toBeInTheDocument();

      // Enable it
      const toggle = screen.getByLabelText("Enable Request Triggers");
      await user.click(toggle);

      // Should show empty state
      await waitFor(() => {
        expect(screen.getByText("No request triggers configured")).toBeInTheDocument();
        expect(screen.getByText("Create Your First Trigger")).toBeInTheDocument();
      });
    });
  });

  describe("Trigger Management", () => {
    test("adding, updating, and deleting triggers", async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const form = useForm<UISettings>({
          resolver: zodResolver(UISettingsSchema) as any,
          defaultValues: {
            ...getDefaultUISettings(),
            requestTriggersEnabled: true,
            requestTriggers: [],
          },
          mode: "onBlur",
        });

        const settings = form.watch();

        return (
          <div>
            <RequestTriggerSection
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

      // Add trigger
      const createButton = screen.getByText("Create Your First Trigger");
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText("Enter value")).toBeInTheDocument();
        expect(screen.getByText("Triggers")).toBeInTheDocument();
        expect(screen.getByTestId("form-dirty")).toHaveTextContent("dirty");
      });

      // Update pattern
      const input = screen.getByPlaceholderText("Enter value");
      await user.type(input, "/checkout");

      await waitFor(() => {
        expect(input).toHaveValue("/checkout");
      });

      // Toggle enabled checkbox
      const checkboxes = screen.getAllByRole("checkbox");
      const triggerCheckbox = checkboxes.find(cb => cb.className.includes("rounded"));
      await user.click(triggerCheckbox!);

      await waitFor(() => {
        expect(triggerCheckbox).not.toBeChecked();
      });

      // Delete trigger
      const deleteButton = screen.getByRole("button", { name: "" });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText("No request triggers configured")).toBeInTheDocument();
      });
    });
  });

  describe("Validation Errors", () => {
    test("displays pattern validation errors", () => {
      const TestWithError = () => {
        const form = useForm<UISettings>({
          resolver: zodResolver(UISettingsSchema) as any,
          defaultValues: {
            ...getDefaultUISettings(),
            requestTriggersEnabled: true,
            requestTriggers: [
              {
                id: "1",
                type: "path",
                condition: "contains",
                pattern: "/checkout",
                enabled: true,
              },
            ],
          },
          mode: "onBlur",
        });

        const settings = form.watch();
        const errors = {
          requestTriggers: [
            {
              pattern: {
                message: "Invalid pattern",
              },
            },
          ],
        };

        return (
          <RequestTriggerSection
            form={form}
            settings={settings}
            errors={errors as any}
          />
        );
      };

      const { container } = render(<TestWithError />);

      expect(container.textContent).toContain("Invalid pattern");
    });
  });
});

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActionCard } from "../ActionCard";
import { describe, test, expect } from "vitest";
import { useForm } from "react-hook-form";
import { UISettings, getDefaultUISettings } from "~/schemas/settings.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { UISettingsSchema } from "~/schemas/settings.schema";
import { Shield } from "lucide-react";

describe("ActionCard", () => {
  describe("Toggle Coordination Logic", () => {
    test("disabling resets condition to noDisable", async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const form = useForm<UISettings>({
          resolver: zodResolver(UISettingsSchema) as any,
          defaultValues: {
            ...getDefaultUISettings(),
            disableFormsEnabled: true,
            disableFormsCondition: "onBad",
          },
          mode: "onBlur",
        });

        return (
          <div>
            <ActionCard
              form={form}
              enabledField="disableFormsEnabled"
              conditionField="disableFormsCondition"
              title="Disable Forms"
              description="Test action"
              icon={<Shield size={20} />}
            />
            <div data-testid="enabled-value">
              {String(form.watch("disableFormsEnabled"))}
            </div>
            <div data-testid="condition-value">
              {form.watch("disableFormsCondition")}
            </div>
          </div>
        );
      };

      render(<TestComponent />);

      expect(screen.getByTestId("enabled-value")).toHaveTextContent("true");
      expect(screen.getByTestId("condition-value")).toHaveTextContent("onBad");

      const toggle = screen.getByRole("checkbox");
      await user.click(toggle);

      await waitFor(() => {
        expect(screen.getByTestId("enabled-value")).toHaveTextContent("false");
        expect(screen.getByTestId("condition-value")).toHaveTextContent(
          "noDisable"
        );
      });
    });

    test("enabling with noDisable condition sets default to onBad", async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const form = useForm<UISettings>({
          resolver: zodResolver(UISettingsSchema) as any,
          defaultValues: {
            ...getDefaultUISettings(),
            disableFormsEnabled: false,
            disableFormsCondition: "noDisable",
          },
          mode: "onBlur",
        });

        return (
          <div>
            <ActionCard
              form={form}
              enabledField="disableFormsEnabled"
              conditionField="disableFormsCondition"
              title="Disable Forms"
              description="Test action"
              icon={<Shield size={20} />}
            />
            <div data-testid="enabled-value">
              {String(form.watch("disableFormsEnabled"))}
            </div>
            <div data-testid="condition-value">
              {form.watch("disableFormsCondition")}
            </div>
          </div>
        );
      };

      render(<TestComponent />);

      expect(screen.getByTestId("enabled-value")).toHaveTextContent("false");
      expect(screen.getByTestId("condition-value")).toHaveTextContent(
        "noDisable"
      );

      const toggle = screen.getByRole("checkbox");
      await user.click(toggle);

      await waitFor(() => {
        expect(screen.getByTestId("enabled-value")).toHaveTextContent("true");
        expect(screen.getByTestId("condition-value")).toHaveTextContent(
          "onBad"
        );
      });
    });

    test("enabling with valid condition keeps existing condition", async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const form = useForm<UISettings>({
          resolver: zodResolver(UISettingsSchema) as any,
          defaultValues: {
            ...getDefaultUISettings(),
            disableFormsEnabled: false,
            disableFormsCondition: "onWarning",
          },
          mode: "onBlur",
        });

        return (
          <div>
            <ActionCard
              form={form}
              enabledField="disableFormsEnabled"
              conditionField="disableFormsCondition"
              title="Disable Forms"
              description="Test action"
              icon={<Shield size={20} />}
            />
            <div data-testid="condition-value">
              {form.watch("disableFormsCondition")}
            </div>
          </div>
        );
      };

      render(<TestComponent />);

      expect(screen.getByTestId("condition-value")).toHaveTextContent(
        "onWarning"
      );

      const toggle = screen.getByRole("checkbox");
      await user.click(toggle);

      await waitFor(() => {
        expect(screen.getByTestId("condition-value")).toHaveTextContent(
          "onWarning"
        );
      });
    });
  });
});
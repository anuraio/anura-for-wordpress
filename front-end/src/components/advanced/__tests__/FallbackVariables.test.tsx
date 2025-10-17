import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FallbackVariables } from "../FallbackVariables";
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

describe("FallbackVariables", () => {
  describe("Component Rendering", () => {
    test("renders with all key elements", () => {
      const { container } = render(
        <TestWrapper>
          <FallbackVariables
            form={undefined as any}
            settings={undefined as any}
            errors={{}}
          />
        </TestWrapper>
      );

      // Card header
      expect(screen.getByText("Fallback Variables")).toBeInTheDocument();

      // Section headings
      expect(screen.getByText("Fallback Sources")).toBeInTheDocument();
      expect(screen.getByText("Fallback Campaigns")).toBeInTheDocument();

      // Info notice
      expect(container.textContent).toContain(
        "Fallback variables are used in the scenario your source/campaign variable is empty"
      );

      // Note at bottom
      expect(container.textContent).toContain(
        "If you're using a hard coded value, fallbacks are not needed"
      );
    });

    test("renders two source inputs and two campaign inputs", () => {
      render(
        <TestWrapper>
          <FallbackVariables
            form={undefined as any}
            settings={undefined as any}
            errors={{}}
          />
        </TestWrapper>
      );

      // Check for source inputs
      expect(screen.getByLabelText("Fallback Source 1")).toBeInTheDocument();
      expect(screen.getByLabelText("Fallback Source 2")).toBeInTheDocument();

      // Check for campaign inputs
      expect(screen.getByLabelText("Fallback Campaign 1")).toBeInTheDocument();
      expect(screen.getByLabelText("Fallback Campaign 2")).toBeInTheDocument();
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
            <FallbackVariables
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

      const sourceInput = screen.getByLabelText("Fallback Source 1");

      await user.type(sourceInput, "utm_source");

      await waitFor(() => {
        expect(sourceInput).toHaveValue("utm_source");
        expect(screen.getByTestId("form-dirty")).toHaveTextContent("dirty");
      });
    });

    test("displays pre-filled values", () => {
      render(
        <TestWrapper
          initialSettings={{
            fallbackSources: ["source1", "source2"],
            fallbackCampaigns: ["campaign1", "campaign2"],
          }}
        >
          <FallbackVariables
            form={undefined as any}
            settings={undefined as any}
            errors={{}}
          />
        </TestWrapper>
      );

      expect(screen.getByLabelText("Fallback Source 1")).toHaveValue("source1");
      expect(screen.getByLabelText("Fallback Campaign 1")).toHaveValue("campaign1");
    });
  });

  describe("Error Display", () => {
    test("displays validation errors under specific fields", () => {
      const TestWithError = () => {
        const form = useForm<UISettings>({
          resolver: zodResolver(UISettingsSchema) as any,
          defaultValues: getDefaultUISettings(),
          mode: "onBlur",
        });

        const settings = form.watch();
        const errors = {
          fallbackSources: [
            { message: "Invalid fallback source 1" },
            { message: "Invalid fallback source 2" },
          ],
          fallbackCampaigns: [
            { message: "Invalid fallback campaign 1" },
          ],
        };

        return (
          <FallbackVariables
            form={form}
            settings={settings}
            errors={errors as any}
          />
        );
      };

      const { container } = render(<TestWithError />);

      // Check that array-indexed errors appear
      expect(container.textContent).toContain("Invalid fallback source 1");
      expect(container.textContent).toContain("Invalid fallback source 2");
      expect(container.textContent).toContain("Invalid fallback campaign 1");
    });
  });

  describe("Accessibility", () => {
    test("sections have proper ARIA labels", () => {
      const { container } = render(
        <TestWrapper>
          <FallbackVariables
            form={undefined as any}
            settings={undefined as any}
            errors={{}}
          />
        </TestWrapper>
      );

      const sourcesSection = container.querySelector(
        '[aria-labelledby="fallback-sources-heading"]'
      );
      const campaignsSection = container.querySelector(
        '[aria-labelledby="fallback-campaigns-heading"]'
      );

      expect(sourcesSection).toBeInTheDocument();
      expect(campaignsSection).toBeInTheDocument();

      const sourcesHeading = container.querySelector(
        "#fallback-sources-heading"
      );
      const campaignsHeading = container.querySelector(
        "#fallback-campaigns-heading"
      );

      expect(sourcesHeading).toBeInTheDocument();
      expect(campaignsHeading).toBeInTheDocument();
    });
  });
});

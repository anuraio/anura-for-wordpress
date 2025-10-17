import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContentDeployment } from "../ContentDeployment";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { useForm } from "react-hook-form";
import { UISettings, getDefaultUISettings } from "~/schemas/settings.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { UISettingsSchema } from "~/schemas/settings.schema";
import Prism from "prismjs";

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

  const errors = form.formState.errors;

  return <div>{React.cloneElement(children, { form, errors })}</div>;
}

describe("ContentDeployment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Component Rendering", () => {
    test("renders card with title and description", () => {
      render(
        <TestWrapper>
          <ContentDeployment form={undefined as any} errors={{}} />
        </TestWrapper>
      );

      expect(screen.getByText("Content Deployment")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Deploy custom JavaScript code when legitimate traffic is detected"
        )
      ).toBeInTheDocument();
    });

    test("renders info notice with feature explanation", () => {
      const { container } = render(
        <TestWrapper>
          <ContentDeployment form={undefined as any} errors={{}} />
        </TestWrapper>
      );

      expect(container.textContent).toContain(
        "Content Deployment allows you to execute custom JavaScript code"
      );
      expect(container.textContent).toContain("legitimate (good) traffic");
    });

    test("renders enable toggle control", () => {
      render(
        <TestWrapper>
          <ContentDeployment form={undefined as any} errors={{}} />
        </TestWrapper>
      );

      expect(screen.getByText("Enable Content Deployment")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Automatically execute custom JavaScript code for verified legitimate traffic"
        )
      ).toBeInTheDocument();
    });
  });

  describe("Enable/Disable Functionality", () => {
    test("code editor is hidden when disabled", () => {
      render(
        <TestWrapper>
          <ContentDeployment form={undefined as any} errors={{}} />
        </TestWrapper>
      );

      expect(screen.queryByText("JavaScript Code")).not.toBeInTheDocument();
      expect(
        screen.queryByLabelText("JavaScript code editor for content deployment")
      ).not.toBeInTheDocument();
    });

    test("code editor appears when enabled", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ContentDeployment form={undefined as any} errors={{}} />
        </TestWrapper>
      );

      const toggle = screen.getByRole("checkbox", {
        name: /Enable Content Deployment/i,
      });

      await user.click(toggle);

      await waitFor(() => {
        expect(screen.getByText("JavaScript Code")).toBeInTheDocument();
      });

      expect(
        screen.getByLabelText("JavaScript code editor for content deployment")
      ).toBeInTheDocument();
    });

    test("toggling off hides code editor", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper
          initialSettings={{
            contentDeploymentEnabled: true,
          }}
        >
          <ContentDeployment form={undefined as any} errors={{}} />
        </TestWrapper>
      );

      expect(screen.getByText("JavaScript Code")).toBeInTheDocument();

      const toggle = screen.getByRole("checkbox", {
        name: /Enable Content Deployment/i,
      });

      await user.click(toggle);

      await waitFor(() => {
        expect(screen.queryByText("JavaScript Code")).not.toBeInTheDocument();
      });
    });
  });

  describe("Code Editor Interaction", () => {
    test("displays placeholder when empty", () => {
      render(
        <TestWrapper
          initialSettings={{
            contentDeploymentEnabled: true,
          }}
        >
          <ContentDeployment form={undefined as any} errors={{}} />
        </TestWrapper>
      );

      const textarea = screen.getByLabelText(
        "JavaScript code editor for content deployment"
      );

      expect(textarea.placeholder).toContain(
        "This code will execute when Anura detects legitimate traffic"
      );
    });

    test("updates code value when typing", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper
          initialSettings={{
            contentDeploymentEnabled: true,
          }}
        >
          <ContentDeployment form={undefined as any} errors={{}} />
        </TestWrapper>
      );

      const textarea = screen.getByLabelText(
        "JavaScript code editor for content deployment"
      );

      await user.clear(textarea);
      await user.type(textarea, "console.log('test');");

      await waitFor(() => {
        expect(textarea.value).toBe("console.log('test');");
      });
    });

    test("enforces max length of 10,000 characters", () => {
      render(
        <TestWrapper
          initialSettings={{
            contentDeploymentEnabled: true,
          }}
        >
          <ContentDeployment form={undefined as any} errors={{}} />
        </TestWrapper>
      );

      const textarea = screen.getByLabelText(
        "JavaScript code editor for content deployment"
      );

      expect(textarea.maxLength).toBe(10000);
    });

    test("displays character count with limit", () => {
      const { container } = render(
        <TestWrapper
          initialSettings={{
            contentDeploymentEnabled: true,
          }}
        >
          <ContentDeployment form={undefined as any} errors={{}} />
        </TestWrapper>
      );

      expect(container.textContent).toContain("10,000 characters");
      expect(container.textContent).toContain("0"); // Should show 0 characters when empty
    });

    test("character count changes to warning color above 9,000 characters", () => {
      const longCode = "a".repeat(9500);

      const { container } = render(
        <TestWrapper
          initialSettings={{
            contentDeploymentEnabled: true,
            contentDeploymentCode: longCode,
          }}
        >
          <ContentDeployment form={undefined as any} errors={{}} />
        </TestWrapper>
      );

      // Find the element containing the character count
      const characterCountElements = container.querySelectorAll(".text-orange-600");
      expect(characterCountElements.length).toBeGreaterThan(0);
      expect(container.textContent).toContain("9,500");
      expect(container.textContent).toContain("10,000 characters");
    });

    test("calls Prism.highlightElement when code changes", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper
          initialSettings={{
            contentDeploymentEnabled: true,
          }}
        >
          <ContentDeployment form={undefined as any} errors={{}} />
        </TestWrapper>
      );

      const textarea = screen.getByLabelText(
        "JavaScript code editor for content deployment"
      );

      await user.type(textarea, "test");

      await waitFor(() => {
        expect(Prism.highlightElement).toHaveBeenCalled();
      });
    });
  });

  describe("Additional UI Elements", () => {
    test("displays helper text about execution trigger", () => {
      const { container } = render(
        <TestWrapper
          initialSettings={{
            contentDeploymentEnabled: true,
          }}
        >
          <ContentDeployment form={undefined as any} errors={{}} />
        </TestWrapper>
      );

      expect(container.textContent).toContain("Code executes automatically when");
      expect(container.textContent).toContain("Anura.isGood()");
      expect(container.textContent).toContain("returns true");
    });

    test("displays security warning notice", () => {
      const { container } = render(
        <TestWrapper
          initialSettings={{
            contentDeploymentEnabled: true,
          }}
        >
          <ContentDeployment form={undefined as any} errors={{}} />
        </TestWrapper>
      );

      expect(container.textContent).toContain("Security Notice:");
      expect(container.textContent).toContain("Only add code from trusted sources");
      expect(container.textContent).toContain(
        "Always test your code thoroughly before deploying"
      );
    });
  });

  describe("Error Display", () => {
    test("displays contentDeploymentEnabled error", () => {
      const TestWithError = () => {
        const form = useForm<UISettings>({
          resolver: zodResolver(UISettingsSchema) as any,
          defaultValues: getDefaultUISettings(),
          mode: "onBlur",
        });

        const errors = {
          contentDeploymentEnabled: {
            message: "Enabled field error",
          },
        };

        return <ContentDeployment form={form} errors={errors as any} />;
      };

      const { container } = render(<TestWithError />);

      expect(container.textContent).toContain("Enabled field error");
    });

    test("displays contentDeploymentCode error", () => {
      const TestWithError = () => {
        const form = useForm<UISettings>({
          resolver: zodResolver(UISettingsSchema) as any,
          defaultValues: {
            ...getDefaultUISettings(),
            contentDeploymentEnabled: true,
          },
          mode: "onBlur",
        });

        const errors = {
          contentDeploymentCode: {
            message: "Code field error",
          },
        };

        return <ContentDeployment form={form} errors={errors as any} />;
      };

      const { container } = render(<TestWithError />);

      expect(container.textContent).toContain("Code field error");
    });

    test("displays multiple errors simultaneously", () => {
      const TestWithErrors = () => {
        const form = useForm<UISettings>({
          resolver: zodResolver(UISettingsSchema) as any,
          defaultValues: {
            ...getDefaultUISettings(),
            contentDeploymentEnabled: true,
          },
          mode: "onBlur",
        });

        const errors = {
          contentDeploymentEnabled: {
            message: "Enabled error",
          },
          contentDeploymentCode: {
            message: "Code error",
          },
        };

        return <ContentDeployment form={form} errors={errors as any} />;
      };

      const { container } = render(<TestWithErrors />);

      expect(container.textContent).toContain("Enabled error");
      expect(container.textContent).toContain("Code error");
    });
  });

  describe("Form Integration", () => {
    test("updates form with shouldDirty flag when enabling", async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const form = useForm<UISettings>({
          resolver: zodResolver(UISettingsSchema) as any,
          defaultValues: getDefaultUISettings(),
          mode: "onBlur",
        });

        return (
          <div>
            <ContentDeployment form={form} errors={form.formState.errors} />
            <div data-testid="dirty-state">
              {form.formState.isDirty ? "dirty" : "clean"}
            </div>
          </div>
        );
      };

      render(<TestComponent />);

      const toggle = screen.getByRole("checkbox", {
        name: /Enable Content Deployment/i,
      });

      await user.click(toggle);

      await waitFor(() => {
        expect(screen.getByTestId("dirty-state")).toHaveTextContent("dirty");
      });
    });

    test("updates form with shouldDirty flag when typing code", async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const form = useForm<UISettings>({
          resolver: zodResolver(UISettingsSchema) as any,
          defaultValues: {
            ...getDefaultUISettings(),
            contentDeploymentEnabled: true,
          },
          mode: "onBlur",
        });

        return (
          <div>
            <ContentDeployment form={form} errors={form.formState.errors} />
            <div data-testid="dirty-state">
              {form.formState.isDirty ? "dirty" : "clean"}
            </div>
          </div>
        );
      };

      render(<TestComponent />);

      const textarea = screen.getByLabelText(
        "JavaScript code editor for content deployment"
      );

      await user.type(textarea, "test");

      await waitFor(() => {
        expect(screen.getByTestId("dirty-state")).toHaveTextContent("dirty");
      });
    });
  });

  describe("Accessibility", () => {
    test("textarea has proper id and aria-label", () => {
      render(
        <TestWrapper
          initialSettings={{
            contentDeploymentEnabled: true,
          }}
        >
          <ContentDeployment form={undefined as any} errors={{}} />
        </TestWrapper>
      );

      const textarea = screen.getByLabelText(
        "JavaScript code editor for content deployment"
      );
      expect(textarea).toHaveAttribute("id", "content-deployment-code");
    });

    test("label is properly associated with textarea", () => {
      render(
        <TestWrapper
          initialSettings={{
            contentDeploymentEnabled: true,
          }}
        >
          <ContentDeployment form={undefined as any} errors={{}} />
        </TestWrapper>
      );

      const label = screen.getByText("JavaScript Code");
      expect(label).toHaveAttribute("for", "content-deployment-code");
    });
  });
});
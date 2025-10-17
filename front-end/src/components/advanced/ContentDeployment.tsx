import {
  ToggleControl,
  Notice,
  __experimentalText as Text,
  __experimentalSpacer as Spacer,
} from "@wordpress/components";
import React, { useEffect, useRef } from "react";
import { Code } from "lucide-react";
import { UseFormReturn, FieldErrors } from "react-hook-form";
import { UISettings } from "../../schemas/settings.schema";
import { AnuraCard } from "../ui/AnuraCard";
import { ErrorNotice } from "../ui/ErrorNotice";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism.css";

// Style constants for the code editor
const EDITOR_STYLES = {
  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, monospace',
  fontSize: "13px",
  lineHeight: "20px",
  padding: "12px",
} as const;

// Z-index layering for the editor
const Z_INDEX = {
  PLACEHOLDER: 0,
  HIGHLIGHT: 1,
  TEXTAREA: 2,
} as const;

// Character limit for the code editor
const MAX_CODE_LENGTH = 10000;

// Sync scroll between textarea and highlight layer
function syncScroll(
  textareaRef: React.RefObject<HTMLTextAreaElement>,
  highlightRef: React.RefObject<HTMLPreElement>
) {
  if (textareaRef.current && highlightRef.current) {
    highlightRef.current.scrollTop = textareaRef.current.scrollTop;
    highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
  }
}

interface ContentDeploymentProps {
  form: UseFormReturn<UISettings>;
  errors: FieldErrors<UISettings>;
}

export function ContentDeployment({ form, errors }: ContentDeploymentProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const codeRef = useRef<HTMLElement>(null);

  // Watch form values
  const enabled = form.watch("contentDeploymentEnabled");
  const code = form.watch("contentDeploymentCode");

  // Update syntax highlighting when code changes
  useEffect(() => {
    if (codeRef.current && enabled) {
      codeRef.current.textContent = code || "";
      Prism.highlightElement(codeRef.current);
    }
  }, [code, enabled]);

  const defaultPlaceholder = `// This code will execute when Anura detects legitimate traffic.\n// Example: console.log('Good traffic detected!');`;

  return (
    <AnuraCard
      title="Content Deployment"
      subtitle="Deploy custom JavaScript code when legitimate traffic is detected"
      icon={<Code size={20} />}
    >
      <Notice status="info" isDismissible={false}>
        <Text>
          Content Deployment allows you to execute custom JavaScript code
          automatically when Anura detects legitimate (good) traffic. Perfect
          for conversion tracking, personalization, or conditional content
          loading.
        </Text>
      </Notice>

      <Spacer marginBottom={4} />

      {/* Enable/Disable Toggle */}
      <div className="mb-6">
        <ToggleControl
          checked={enabled}
          label="Enable Content Deployment"
          help="Automatically execute custom JavaScript code for verified legitimate traffic"
          onChange={(value) =>
            form.setValue("contentDeploymentEnabled", value, {
              shouldDirty: true,
            })
          }
          __nextHasNoMarginBottom
        />

        {errors.contentDeploymentEnabled &&
          errors.contentDeploymentEnabled.message && (
            <ErrorNotice error={errors.contentDeploymentEnabled.message} />
          )}
      </div>

      {/* Code Editor */}
      {enabled && (
        <>
          <div className="mb-4">
            <label
              htmlFor="content-deployment-code"
              className="block font-medium text-gray-900 mb-2"
            >
              JavaScript Code
            </label>

            <div>
              {errors.contentDeploymentCode &&
                errors.contentDeploymentCode.message && (
                  <ErrorNotice error={errors.contentDeploymentCode.message} />
                )}
            </div>

            {/* Code editor container with Prism.js highlighting */}
            <div
              className="relative border border-gray-300 rounded-md overflow-hidden bg-white"
              style={{ minHeight: "256px" }}
            >
              {/* Prism syntax highlighting layer */}
              <pre
                ref={highlightRef}
                className="absolute top-[-0.4rem] left-0 w-full h-full m-0 pointer-events-none overflow-auto"
                style={{
                  ...EDITOR_STYLES,
                  background: "transparent",
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word",
                  zIndex: Z_INDEX.HIGHLIGHT,
                  border: "none",
                  outline: "none",
                }}
                aria-hidden="true"
              >
                <code
                  ref={codeRef}
                  className="language-javascript"
                  style={{
                    fontFamily: "inherit",
                    fontSize: "inherit",
                    lineHeight: "inherit",
                    background: "transparent",
                    padding: 0,
                    margin: 0,
                  }}
                />
              </pre>

              {/* Actual textarea - fully transparent text */}
              <textarea
                id="content-deployment-code"
                ref={textareaRef}
                value={code}
                onChange={(e) =>
                  form.setValue("contentDeploymentCode", e.target.value, {
                    shouldDirty: true,
                  })
                }
                onScroll={() => syncScroll(textareaRef, highlightRef)}
                placeholder={defaultPlaceholder}
                maxLength={MAX_CODE_LENGTH}
                aria-label="JavaScript code editor for content deployment"
                className="relative w-full h-64 resize-none border-0 outline-0 bg-transparent"
                style={{
                  ...EDITOR_STYLES,
                  margin: 0,
                  color: "transparent", // Make text invisible
                  background: "transparent",
                  zIndex: Z_INDEX.TEXTAREA,
                  caretColor: "#333", // Keep cursor visible
                  boxSizing: "border-box",
                }}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
              />

              {/* Placeholder overlay when empty */}
              {!code && (
                <div
                  className="absolute top-0 left-0 w-full h-full pointer-events-none"
                  style={{
                    ...EDITOR_STYLES,
                    margin: 0,
                    color: "#999",
                    whiteSpace: "pre-wrap",
                    zIndex: Z_INDEX.PLACEHOLDER,
                    boxSizing: "border-box",
                    WebkitFontSmoothing: "antialiased",
                    MozOsxFontSmoothing: "grayscale",
                    transform: "none",
                    textRendering: "optimizeLegibility",
                  }}
                >
                  {defaultPlaceholder}
                </div>
              )}
            </div>

            <div className="mt-2 flex justify-between items-center text-sm">
              <Text variant="muted" size="12px">
                Code executes automatically when{" "}
                <code className="bg-gray-100 px-1 rounded">Anura.isGood()</code>{" "}
                returns true
              </Text>
              <Text
                variant="muted"
                size="12px"
                className={`${
                  code.length > MAX_CODE_LENGTH * 0.9
                    ? "text-orange-600"
                    : "text-gray-500"
                }`}
              >
                {code.length.toLocaleString()} /{" "}
                {MAX_CODE_LENGTH.toLocaleString()} characters
              </Text>
            </div>
          </div>

          {/* Security Notice */}
          <Notice status="warning" isDismissible={false}>
            <Text size="13px">
              <strong>Security Notice:</strong> Only add code from trusted
              sources. This JavaScript will execute on your website for
              legitimate visitors. Always test your code thoroughly before
              deploying.
            </Text>
          </Notice>

          <Spacer marginBottom={4} />
        </>
      )}
    </AnuraCard>
  );
}

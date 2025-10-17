import {
  Card,
  CardBody,
  SelectControl,
  TextControl,
  ToggleControl,
} from "@wordpress/components";
import { UseFormReturn } from "react-hook-form";
import { UISettings } from "~/schemas/settings.schema";
import { ExternalLink } from "lucide-react";

interface RedirectActionCardProps {
  form: UseFormReturn<UISettings>;
}

const REDIRECT_CONDITION_OPTIONS = [
  { label: "On Warning Only", value: "onWarning" },
  { label: "On Bad Only", value: "onBad" },
  { label: "On Warning & Bad", value: "onBoth" },
];

export function RedirectActionCard({ form }: RedirectActionCardProps) {
  const redirectCondition = form.watch("redirectCondition");
  const redirectURL = form.watch("redirectURL");
  const webCrawlersAllowed = form.watch("webCrawlersAllowed");

  const enabled = redirectCondition !== "noRedirect";

  return (
    <Card
      className={`transition-all duration-300 ${
        enabled ? "border-blue-500" : ""
      }`}
      style={{
        marginBottom: "18px",
        boxShadow: enabled ? "0 0 0 2px rgba(59, 130, 246, 0.2)" : undefined,
      }}
    >
      <CardBody>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`
              w-8 h-8 rounded-md flex items-center justify-center
              transition-all duration-300 ease-in-out
              ${
                enabled ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-400"
              }
            `}
            >
              <ExternalLink size={20} />
            </div>
            <div>
              <h3 className="text-base font-medium text-gray-900 flex items-center m-0 leading-tight">
                Redirect Traffic
              </h3>
              <p className="text-sm text-gray-600 mt-1 mb-0 leading-normal">
                Automatically redirect suspicious visitors to another URL
              </p>
            </div>
          </div>

          <ToggleControl
            checked={enabled}
            onChange={(isEnabled) => {
              if (!isEnabled) {
                // When disabling, set to noRedirect
                form.setValue("redirectCondition", "noRedirect", {
                  shouldDirty: true,
                });
              } else {
                // When enabling, default to "onBad"
                form.setValue("redirectCondition", "onBad", {
                  shouldDirty: true,
                });
              }
            }}
            __nextHasNoMarginBottom
            label={undefined}
          />
        </div>

        {/* Configuration Options */}
        <div
          className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${enabled ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
        `}
        >
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
            {/* Trigger Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 mt-0">
                Trigger Condition
              </label>
              <SelectControl
                value={redirectCondition === "noRedirect" ? "onBad" : redirectCondition}
                options={REDIRECT_CONDITION_OPTIONS}
                onChange={(value) =>
                  form.setValue("redirectCondition", value as "onWarning" | "onBad" | "onBoth", {
                    shouldDirty: true,
                  })
                }
                __nextHasNoMarginBottom
              />
            </div>

            {/* Redirect URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 mt-0">
                Redirect URL
              </label>
              <TextControl
                value={redirectURL}
                onChange={(value) =>
                  form.setValue("redirectURL", value, { shouldDirty: true })
                }
                placeholder="https://example.com/blocked"
                help="Enter the full URL where suspicious visitors will be redirected"
                __nextHasNoMarginBottom
              />
            </div>

            {/* Web Crawlers Bypass */}
            <div className="flex items-start gap-3">
              <ToggleControl
                checked={webCrawlersAllowed}
                onChange={(value) =>
                  form.setValue("webCrawlersAllowed", value, {
                    shouldDirty: true,
                  })
                }
                label="Allow Web Crawlers to Bypass Redirect"
                help="When enabled, legitimate web crawlers (search engines, ad platforms) will not be redirected"
                __nextHasNoMarginBottom
              />
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

import {
  ToggleControl,
  SelectControl,
  Notice,
  __experimentalText as Text,
  __experimentalSpacer as Spacer,
} from "@wordpress/components";
import { Server } from "lucide-react";
import { UseFormReturn, FieldErrors } from "react-hook-form";
import { UISettings } from "../../schemas/settings.schema";
import { AnuraCard } from "../ui/AnuraCard";
import { ErrorNotice } from "../ui/ErrorNotice";

const PRIORITY_OPTIONS = [
  { label: "Highest", value: "highest" as const },
  { label: "High", value: "high" as const },
  { label: "Medium", value: "medium" as const },
  { label: "Low", value: "low" as const },
  { label: "Lowest", value: "lowest" as const },
];

interface ServerActionsProps {
  form: UseFormReturn<UISettings>;
  settings: UISettings;
  errors: FieldErrors<UISettings>;
}

export function ServerActions({ form, settings, errors }: ServerActionsProps) {
  const updateAddHeaders = (value: boolean) => {
    form.setValue("addHeaders", value, {
      shouldDirty: true,
      shouldValidate: true,
      shouldTouch: true,
    });
  };

  const updateHeaderPriority = (value: string) => {
    form.setValue("headerPriority", value as UISettings["headerPriority"], {
      shouldDirty: true,
      shouldValidate: true,
      shouldTouch: true,
    });
  };

  return (
    <AnuraCard
      title="Server Actions"
      subtitle="Configure server-side headers and WordPress integration settings"
      icon={<Server size={20} />}
    >
      <Notice status="info" isDismissible={false}>
        <Text>
          Server Actions control how Anura integrates with your WordPress
          server. Additional headers help Anura collect more detailed browser
          information for improved fraud detection accuracy.
        </Text>
      </Notice>

      <Spacer marginBottom={4} />

      <div className="space-y-4">
        {/* Add Headers Toggle */}
        <div>
          <ToggleControl
            checked={settings.addHeaders}
            label="Send Additional Headers"
            help="Include extra browser information headers to improve fraud detection accuracy"
            onChange={updateAddHeaders}
            __nextHasNoMarginBottom
          />

          {/* Show validation errors */}
          {errors.addHeaders?.message && (
            <>
              <ErrorNotice error={errors.addHeaders.message} />
              <Spacer marginBottom={4} />
            </>
          )}
        </div>

        {/* Header Priority - only show when headers are enabled */}
        {settings.addHeaders && (
          <div className="ml-6 pl-4 border-l-2 border-gray-200">
            <SelectControl
              label="Header Priority"
              value={settings.headerPriority}
              options={PRIORITY_OPTIONS}
              onChange={updateHeaderPriority}
              help="WordPress hook priority for sending headers (higher = earlier execution)"
              __nextHasNoMarginBottom
            />

            {errors.headerPriority?.message && (
              <>
                <ErrorNotice error={errors.headerPriority.message} />
                <Spacer marginBottom={4} />
              </>
            )}
          </div>
        )}
      </div>

      <Spacer marginBottom={4} />

      {/* Technical Details */}
      <details className="border border-gray-200 rounded-md">
        <summary className="p-3 cursor-pointer text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          What Gets Sent
        </summary>
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <div className="space-y-3 text-sm">
            <div>
              <Text weight="600" size="13px" className="text-gray-800">
                Additional Headers Include:
              </Text>
              <ul className="mt-1 text-xs text-gray-600 space-y-1 ml-4">
                <li>• Accept-CH: Client hints for device capabilities</li>
                <li>• Permissions-Policy: Browser feature permissions</li>
                <li>• Device memory, DPR, viewport data</li>
                <li>• User agent architecture and platform details</li>
              </ul>
            </div>
          </div>
        </div>
      </details>
    </AnuraCard>
  );
}

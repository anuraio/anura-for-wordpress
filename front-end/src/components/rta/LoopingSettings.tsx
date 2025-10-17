import { Card, CardBody, SelectControl, ToggleControl } from "@wordpress/components";
import { UseFormReturn } from "react-hook-form";
import { UISettings } from "~/schemas/settings.schema";
import { RefreshCw } from "lucide-react";

interface LoopingSettingsProps {
  form: UseFormReturn<UISettings>;
}

const RETRY_DURATION_OPTIONS = [
  { label: "Retry for 4 seconds", value: "4" },
  { label: "Retry for 30 seconds", value: "30" },
  { label: "Retry for 120 seconds", value: "120" },
];

export function LoopingSettings({ form }: LoopingSettingsProps) {
  const retryDuration = form.watch("retryDurationSeconds");
  const stopAtFirst = form.watch("stopAfterFirstElement");

  // Watch all action conditions (except protectLogin and redirect)
  const disableFormsCondition = form.watch("disableFormsCondition");
  const disableCommentSubmitsCondition = form.watch("disableCommentSubmitsCondition");
  const disableAllSubmitsCondition = form.watch("disableAllSubmitsCondition");
  const disableLinksCondition = form.watch("disableLinksCondition");
  const disableAllInputsCondition = form.watch("disableAllInputsCondition");

  // Check if any action (except protectLogin and redirect) is active
  const isActive =
    disableFormsCondition !== "noDisable" ||
    disableCommentSubmitsCondition !== "noDisable" ||
    disableAllSubmitsCondition !== "noDisable" ||
    disableLinksCondition !== "noDisable" ||
    disableAllInputsCondition !== "noDisable";

  return (
    <Card style={{ marginBottom: "18px" }}>
      <CardBody>
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div
            className={`
              w-8 h-8 rounded-md flex items-center justify-center
              transition-all duration-300 ease-in-out
              ${isActive ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"}
            `}
          >
            <RefreshCw size={20} />
          </div>
          <div>
            <h3 className="text-base font-medium text-gray-900 m-0 leading-tight">
              Looping Settings
            </h3>
            <p className="text-sm text-gray-600 mt-1 mb-0 leading-normal">
              Configure how often actions check for new page content
            </p>
          </div>
        </div>

        {/* Settings Fields */}
        <div className="space-y-4">
          {/* Retry Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 mt-0">
              Retry Duration
            </label>
            <SelectControl
              value={retryDuration}
              options={RETRY_DURATION_OPTIONS}
              onChange={(value) =>
                form.setValue("retryDurationSeconds", value, {
                  shouldDirty: true,
                })
              }
              help="How long to continuously check for new elements on the page before stopping"
              __nextHasNoMarginBottom
            />
          </div>

          {/* Stop At First Element */}
          <div>
            <ToggleControl
              checked={stopAtFirst}
              onChange={(value) =>
                form.setValue("stopAfterFirstElement", value, {
                  shouldDirty: true,
                })
              }
              label="Stop searching after the first element is found"
              help="When enabled, actions stop checking for new content after finding the first matching element"
              __nextHasNoMarginBottom
            />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

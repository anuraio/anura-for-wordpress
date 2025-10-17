import {
  Card,
  CardBody,
  SelectControl,
  TextControl,
  ToggleControl,
} from "@wordpress/components";
import { UseFormReturn } from "react-hook-form";
import { UISettings } from "~/schemas/settings.schema";
import { Keyboard } from "lucide-react";

interface LoginProtectionActionCardProps {
  form: UseFormReturn<UISettings>;
}

const CONDITION_OPTIONS = [
  { label: "On Warning Only", value: "onWarning" },
  { label: "On Bad Only", value: "onBad" },
  { label: "On Warning & Bad", value: "onBoth" },
];

export function LoginProtectionActionCard({
  form,
}: LoginProtectionActionCardProps) {
  const enabled = form.watch("protectLoginEnabled");
  const condition = form.watch("protectLoginCondition");
  const retentionDays = form.watch("blockedLoginRetentionDays");
  const retentionDaysError = form.formState.errors.blockedLoginRetentionDays;

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
              <Keyboard size={20} />
            </div>
            <div>
              <h3 className="text-base font-medium text-gray-900 flex items-center m-0 leading-tight">
                Protect Login
              </h3>
              <p className="text-sm text-gray-600 mt-1 mb-0 leading-normal">
                Prevent suspicious visitors from accessing your login form.
              </p>
            </div>
          </div>

          <ToggleControl
            checked={enabled}
            onChange={(isEnabled) => {
              form.setValue("protectLoginEnabled", isEnabled, {
                shouldDirty: true,
              });

              if (!isEnabled) {
                form.setValue("protectLoginCondition", "noDisable", {
                  shouldDirty: true,
                });
              } else if (condition === "noDisable") {
                form.setValue("protectLoginCondition", "onBad", {
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
                value={condition}
                options={CONDITION_OPTIONS}
                onChange={(value) =>
                  form.setValue("protectLoginCondition", value as "onWarning" | "onBad" | "onBoth", {
                    shouldDirty: true,
                  })
                }
                __nextHasNoMarginBottom
              />
            </div>

            {/* Retention Days */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 mt-0">
                Log Retention (Days)
              </label>
              <TextControl
                type="number"
                value={retentionDays}
                onChange={(value) =>
                  form.setValue("blockedLoginRetentionDays", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                min={1}
                max={365}
                help={
                  "Number of days to retain blocked login records (1-365 days)"
                }
                __nextHasNoMarginBottom
              />
              {retentionDaysError && (
                <p className="text-red-600 text-sm mt-1">
                  {retentionDaysError.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

import {
  Card,
  CardBody,
  SelectControl,
  ToggleControl,
} from "@wordpress/components";
import { UseFormReturn } from "react-hook-form";
import { UISettings } from "~/schemas/settings.schema";

interface ActionCardProps {
  enabledField: keyof UISettings;
  conditionField: keyof UISettings;
  title: string;
  description: string;
  beta?: boolean;
  form: UseFormReturn<UISettings>;
  icon: JSX.Element;
}

const CONDITION_OPTIONS = [
  { label: "On Warning Only", value: "onWarning" },
  { label: "On Bad Only", value: "onBad" },
  { label: "On Warning & Bad", value: "onBoth" },
];

export function ActionCard({
  enabledField,
  conditionField,
  title,
  description,
  beta = false,
  form,
  icon,
}: ActionCardProps) {
  const enabled = form.watch(enabledField) as boolean;
  const condition = form.watch(conditionField) as string;

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
              {icon}
            </div>
            <div>
              <h3 className="text-base font-medium text-gray-900 flex items-center m-0 leading-tight">
                {title}
                {beta && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-orange-100 text-orange-700 rounded-full">
                    BETA
                  </span>
                )}
              </h3>
              <p className="text-sm text-gray-600 mt-1 mb-0 leading-normal">
                {description}
              </p>
            </div>
          </div>

          <ToggleControl
            checked={enabled}
            onChange={(isEnabled) => {
              form.setValue(enabledField, isEnabled, { shouldDirty: true });

              if (!isEnabled) {
                // When disabling, reset condition to noDisable
                form.setValue(conditionField, "noDisable", { shouldDirty: true });
              } else if (condition === "noDisable") {
                // When enabling and no valid condition set, default to "onBad"
                form.setValue(conditionField, "onBad", { shouldDirty: true });
              }
            }}
            __nextHasNoMarginBottom
            label={undefined}
          />
        </div>

        {/* Condition Selector - animated reveal */}
        <div
          className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${enabled ? "max-h-32 opacity-100" : "max-h-0 opacity-0"}
        `}
        >
          <div className="mt-4 pt-4 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2 mt-0">
              Trigger Condition
            </label>
            <SelectControl
              value={condition}
              options={CONDITION_OPTIONS}
              onChange={(value) =>
                form.setValue(conditionField, value, { shouldDirty: true })
              }
              __nextHasNoMarginBottom
            />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

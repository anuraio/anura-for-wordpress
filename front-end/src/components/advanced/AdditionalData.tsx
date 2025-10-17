import {
  TextControl,
  SelectControl,
  Notice,
  __experimentalText as Text,
  __experimentalSpacer as Spacer,
} from "@wordpress/components";
import { Database, CheckCircle, AlertCircle } from "lucide-react";
import { UseFormReturn, FieldErrors } from "react-hook-form";
import { UISettings, AdditionalDataItem } from "../../schemas/settings.schema";
import { AnuraCard } from "../ui/AnuraCard";

interface AdditionalDataProps {
  form: UseFormReturn<UISettings>;
  settings: UISettings;
  errors: FieldErrors<UISettings>;
}

export function AdditionalData({
  form,
  settings,
  errors,
}: AdditionalDataProps) {
  // Always show 10 slots - get values from settings prop
  const slots = Array.from({ length: 10 }, (_, index) => {
    const formValue = settings.additionalData?.[index];
    return {
      index: index + 1,
      item: formValue || { method: "get", value: "" },
    };
  });

  const filledSlots = slots.filter((slot) => (slot.item.value || "").trim());
  const filledCount = filledSlots.length;

  // Get placeholder text based on method
  const getPlaceholder = (method: string, index: number) => {
    switch (method) {
      case "hardCoded":
        return `Enter static value ${index}`;
      case "get":
        return `Enter GET parameter ${index}`;
      case "post":
        return `Enter POST parameter ${index}`;
      default:
        return `Enter parameter ${index}`;
    }
  };

  // Method options for the select control
  const methodOptions = [
    { label: "Hard Coded", value: "hardCoded" },
    { label: "GET Parameter", value: "get" },
    { label: "POST Parameter", value: "post" },
  ];

  // Simple utility for error checking
  const getFieldError = (index: number) => {
    return (
      errors.additionalData?.[index]?.value ||
      errors.additionalData?.[index]?.method
    );
  };

  return (
    <AnuraCard
      title="Additional Data"
      subtitle="Configure additional data parameters to send with requests"
      icon={<Database size={20} />}
    >
      <Notice status="info" isDismissible={false}>
        <Text>
          Additional Data gives you the ability to pass select points of data
          with your requests. Effectively turning Anura into &ldquo;your database for
          transactional data&rdquo;.
        </Text>
      </Notice>

      <Spacer marginBottom={4} />

      {/* Show validation error if present */}
      {errors.additionalData?.message && (
        <>
          <Notice status="error" isDismissible={false}>
            {errors.additionalData.message}
          </Notice>
          <Spacer marginBottom={4} />
        </>
      )}

      {/* Enhanced table with visual feedback */}
      <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[70px_200px_1fr] bg-gray-50 border-b border-gray-200">
          <div className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
            Key
          </div>
          <div className="px-4 py-3 text-sm font-semibold text-gray-700">
            Method
          </div>
          <div className="px-4 py-3 text-sm font-semibold text-gray-700">
            Value
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-100">
          {slots.map((slot, index) => {
            const fieldError = getFieldError(slot.index - 1);
            const hasError = !!fieldError;
            const hasValue = slot.item.value.trim().length > 0;
            const status = hasError ? "error" : hasValue ? "filled" : "empty";

            return (
              <div
                key={slot.index}
                className={`
                  grid grid-cols-[70px_200px_1fr]
                  transition-colors duration-150
                  min-h-[52px]
                  ${
                    hasError
                      ? "bg-red-50 border-l-2 border-l-red-500"
                      : status === "filled"
                      ? "bg-blue-50 border-l-2 border-l-blue-500"
                      : index % 2 === 0
                      ? "bg-white"
                      : "bg-gray-25"
                  }
                  ${!hasError ? "hover:bg-gray-50" : ""}
                `}
              >
                {/* Key column */}
                <div className="px-4 py-4 flex items-center justify-center">
                  <span
                    className={`
                    text-sm font-semibold
                    ${
                      status === "filled" && !hasError
                        ? "text-blue-600"
                        : "text-gray-500"
                    }
                    ${hasError ? "text-red-600" : ""}
                  `}
                  >
                    {slot.index}
                  </span>
                </div>

                {/* Method column */}
                <div className="px-4 py-4 flex items-center">
                  <SelectControl
                    value={slot.item.method}
                    options={methodOptions}
                    onChange={(method) =>
                      form.setValue(
                        `additionalData.${slot.index - 1}.method`,
                        method as AdditionalDataItem["method"],
                        { shouldDirty: true }
                      )
                    }
                    __nextHasNoMarginBottom
                    className="w-full"
                  />
                </div>

                {/* Value column with clean error styling */}
                <div className="px-4 py-4 flex items-center">
                  <div className="flex-1 relative">
                    <TextControl
                      value={slot.item.value}
                      onChange={(value) =>
                        form.setValue(
                          `additionalData.${slot.index - 1}.value`,
                          value || "",
                          { shouldDirty: true }
                        )
                      }
                      placeholder={getPlaceholder(slot.item.method, slot.index)}
                      __nextHasNoMarginBottom
                      className={`${hasError ? "pr-8 border-red-500" : ""}`}
                    />
                    {hasError && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <AlertCircle size={16} className="text-red-500" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Spacer marginBottom={4} />

      {/* Error summary if there are any errors */}
      {(() => {
        const slotErrors = slots.reduce<{ index: number; message: string }[]>(
          (acc, slot) => {
            const fieldError = getFieldError(slot.index - 1);
            if (fieldError) {
              acc.push({
                index: slot.index,
                message: fieldError.message || "Invalid value",
              });
            }
            return acc;
          },
          []
        );

        return (
          slotErrors.length > 0 && (
            <>
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle
                    size={16}
                    className="text-red-500 mt-0.5 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <Text size="13px" className="text-red-700 font-medium mb-1">
                      Please fix the following errors:
                    </Text>
                    <div className="space-y-1">
                      {slotErrors.map((error) => (
                        <Text
                          key={error.index}
                          size="12px"
                          className="text-red-600 block"
                        >
                          Parameter {error.index}: {error.message}
                        </Text>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <Spacer marginBottom={4} />
            </>
          )
        );
      })()}

      {/* Enhanced footer with better statistics */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4 text-sm">
          <Text variant="muted" size="13px">
            <strong>{filledCount}</strong> of 10 parameters configured
          </Text>
          {filledCount > 0 && (
            <>
              <span className="text-gray-300">•</span>
              <div className="flex items-center gap-1">
                <CheckCircle size={14} className="text-blue-500" />
                <Text variant="muted" size="13px">
                  {
                    filledSlots.filter((slot) => !getFieldError(slot.index - 1))
                      .length
                  }{" "}
                  valid
                </Text>
              </div>
            </>
          )}
        </div>

        {filledCount > 0 && (
          <Text variant="muted" size="12px" className="text-blue-600">
            Parameters will be sent as key-value pairs (1: value1, 2: value2,
            ...)
          </Text>
        )}
      </div>
    </AnuraCard>
  );
}

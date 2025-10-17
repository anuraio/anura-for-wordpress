import {
  TextControl,
  Notice,
  __experimentalText as Text,
  __experimentalSpacer as Spacer,
} from "@wordpress/components";
import { Phone } from "lucide-react";
import { UseFormReturn, FieldErrors } from "react-hook-form";
import { UISettings } from "../../schemas/settings.schema";
import { AnuraCard } from "../ui/AnuraCard";

interface CallbackFunctionProps {
  form: UseFormReturn<UISettings>;
  settings: UISettings;
  errors: FieldErrors<UISettings>;
}

export function CallbackFunction({
  form,
  settings,
  errors,
}: CallbackFunctionProps) {
  const updateCallbackFunction = (value: string) => {
    form.setValue("callbackFunction", value, {
      shouldDirty: true,
      shouldValidate: true,
      shouldTouch: true,
    });
  };

  return (
    <AnuraCard
      title="Callback Function"
      subtitle="Execute custom JavaScript after Anura completes analysis"
      icon={<Phone size={20} />}
    >
      <Notice status="info" isDismissible={false}>
        <Text>
          The callback function allows you to execute custom JavaScript code
          after Anura has finished analyzing a visitor. This runs regardless of
          the analysis result (good, warning, or bad).
        </Text>
      </Notice>

      <Spacer marginBottom={4} />

      {/* Show validation error if present */}
      {errors.callbackFunction?.message && (
        <>
          <Notice status="error" isDismissible={false}>
            {errors.callbackFunction.message}
          </Notice>
          <Spacer marginBottom={4} />
        </>
      )}

      <div className="space-y-4">
        <TextControl
          label="JavaScript Function Name"
          value={settings.callbackFunction}
          onChange={updateCallbackFunction}
          placeholder="e.g., myAnuraCallback"
          help="Enter the name of a JavaScript function that exists in your page's global scope"
          __nextHasNoMarginBottom
        />
      </div>

      <Spacer marginBottom={4} />

      {/* Important Notes */}
      <Notice status="warning" isDismissible={false}>
        <Text size="12px">
          <strong>Important:</strong> Make sure your callback function is
          defined in the global scope before Anura loads. The function must
          exist when Anura tries to call it, or errors will occur.
        </Text>
      </Notice>
    </AnuraCard>
  );
}

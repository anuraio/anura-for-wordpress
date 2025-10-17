import { UseFormReturn, FieldErrors } from "react-hook-form";
import { UISettings } from "../../schemas/settings.schema";
import { AdditionalData } from "./AdditionalData";
import { ContentDeployment } from "./ContentDeployment";
import { RequestTriggerSection } from "./RequestTriggerSection";
import { FallbackVariables } from "./FallbackVariables";
import { ServerActions } from "./ServerActions";
import { CallbackFunction } from "./CallbackFunction";

interface AdvancedOptionsProps {
  form: UseFormReturn<UISettings>;
  settings: UISettings;
  errors: FieldErrors<UISettings>;
}

export function AdvancedOptions({
  form,
  settings,
  errors,
}: AdvancedOptionsProps) {
  return (
    <div className="space-y-8">
      <AdditionalData form={form} settings={settings} errors={errors} />

      <FallbackVariables form={form} settings={settings} errors={errors} />

      <RequestTriggerSection form={form} settings={settings} errors={errors} />

      <CallbackFunction form={form} settings={settings} errors={errors} />

      <ServerActions form={form} settings={settings} errors={errors} />

      <ContentDeployment form={form} errors={errors} />
    </div>
  );
}

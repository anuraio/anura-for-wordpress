import { ToggleControl, TextControl, SelectControl, Button, Icon } from "@wordpress/components";
import { Settings, Filter } from "lucide-react";
import { trash } from "@wordpress/icons";
import { UseFormReturn, FieldErrors } from "react-hook-form";
import { UISettings, RequestTrigger } from "../../schemas/settings.schema";
import { AnuraCard } from "../ui/AnuraCard";

const TYPE_OPTIONS = [
  { label: "Path", value: "path" as const },
  { label: "Full URL", value: "url" as const },
  { label: "Query Parameters", value: "queryParam" as const },
];

const CONDITION_OPTIONS = [
  { label: "Contains", value: "contains" as const },
  { label: "Does Not Contain", value: "doesNotContain" as const },
];

interface RequestTriggerSectionProps {
  form: UseFormReturn<UISettings>;
  settings: UISettings;
  errors: FieldErrors<UISettings>;
}

export function RequestTriggerSection({ form, settings, errors }: RequestTriggerSectionProps) {
  const triggers = settings.requestTriggers;
  const enabled = settings.requestTriggersEnabled;
  const enabledCount = triggers.filter(trigger => trigger.enabled).length;

  const addTrigger = () => {
    const newTrigger: RequestTrigger = {
      id: Date.now().toString(),
      type: "path",
      condition: "contains",
      pattern: "",
      enabled: true,
    };
    form.setValue('requestTriggers', [...triggers, newTrigger], {
      shouldDirty: true,
      shouldValidate: true,
      shouldTouch: true,
    });
  };

  const updateTrigger = (triggerId: string, updates: Partial<RequestTrigger>) => {
    const updated = triggers.map(trigger =>
      trigger.id === triggerId ? { ...trigger, ...updates } : trigger
    );
    form.setValue('requestTriggers', updated, {
      shouldDirty: true,
      shouldValidate: true,
      shouldTouch: true,
    });
  };

  const deleteTrigger = (triggerId: string) => {
    const updated = triggers.filter(trigger => trigger.id !== triggerId);
    form.setValue('requestTriggers', updated, {
      shouldDirty: true,
      shouldValidate: true,
      shouldTouch: true,
    });
  };

  return (
    <AnuraCard
      title="Request Triggers"
      icon={<Filter size={20} />}
      subtitle="Specify conditions for your Anura Script integration to be triggered"
    >
      <div className="space-y-3">
        <ToggleControl
          checked={enabled}
          label="Enable Request Triggers"
          help={`Only run Anura on pages matching specific patterns (${enabledCount} active)`}
          onChange={(value) => form.setValue('requestTriggersEnabled', value, { shouldDirty: true })}
          __nextHasNoMarginBottom
        />
        {enabled && (
          <div className="ml-6 pl-4 border-l-2 border-gray-200">
            {triggers.length === 0 ? (
              <div className="border-2 border-dashed border-gray-200 rounded-md p-6 text-center">
                <Settings size={24} className="mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500 mb-3">No request triggers configured</p>
                <Button variant="secondary" size="small" onClick={addTrigger}>
                  Create Your First Trigger
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900">Triggers</h4>
                  <Button variant="secondary" size="small" onClick={addTrigger}>Add Trigger</Button>
                </div>
                <div className="max-h-125 overflow-y-auto space-y-2 mb-4">
                  {triggers.map((trigger, index) => {
                    const triggerError = errors.requestTriggers?.[index]?.pattern;
                    return (
                      <div key={trigger.id} className="space-y-1">
                        <div className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-md shadow-sm">
                          <input
                            type="checkbox"
                            checked={trigger.enabled}
                            onChange={(e) => updateTrigger(trigger.id, { enabled: e.target.checked })}
                            className="rounded border-gray-300"
                          />

                          <SelectControl
                            value={trigger.type}
                            options={TYPE_OPTIONS}
                            onChange={(value) => updateTrigger(trigger.id, { type: value })}
                            __nextHasNoMarginBottom
                            className="w-40"
                          />

                          <SelectControl
                            value={trigger.condition}
                            options={CONDITION_OPTIONS}
                            onChange={(value) => updateTrigger(trigger.id, { condition: value })}
                            __nextHasNoMarginBottom
                            className="w-32"
                          />

                          <TextControl
                            value={trigger.pattern}
                            onChange={(value) => updateTrigger(trigger.id, { pattern: value || "" })}
                            placeholder="Enter value"
                            __nextHasNoMarginBottom
                            className="flex-1"
                          />

                          <Button
                            variant="secondary"
                            isDestructive
                            size="small"
                            onClick={() => deleteTrigger(trigger.id)}
                            className="p-1"
                          >
                            <Icon icon={trash} size={18} />
                          </Button>
                        </div>
                        {triggerError && (
                          <p className="text-sm text-red-600 ml-8">
                            {triggerError.message}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </AnuraCard>
  );
}
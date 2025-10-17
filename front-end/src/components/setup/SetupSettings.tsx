import {
  TextControl,
  SelectControl,
  ToggleControl,
} from "@wordpress/components";
import { Settings } from "lucide-react";
import { UseFormReturn, FieldErrors } from "react-hook-form";
import { UISettings } from "../../schemas/settings.schema";
import { AnuraCard } from "../ui/AnuraCard";
import { FormField } from "../ui/FormField";
import { BotDetectionSection } from "./bots/BotDetectionSection";

interface SetupSettingsProps {
  form: UseFormReturn<UISettings>;
  settings: UISettings;
  errors: FieldErrors<UISettings>;
}

export function SetupSettings({ form, settings, errors }: SetupSettingsProps) {
  // Helper to get error message for a field
  const getError = (fieldName: string) => {
    return errors[fieldName as keyof typeof errors]?.message || "";
  };

  const enabledBotsCount = settings.botWhitelist.filter(bot => bot.enabled).length;

  return (
    <AnuraCard
      title="Anura Script Integration"
      subtitle="Get started with integrating Anura Script on your WordPress site"
      icon={<Settings size={20} />}
    >
      <div className="space-y-4">
        <FormField
          label="Instance ID"
          required
          helpText="Your assigned Instance ID from Anura"
          error={getError("instanceId")}
        >
          <TextControl
            value={settings.instanceId}
            onChange={(value) => {
              form.setValue("instanceId", value || "", {
                shouldDirty: true,
                shouldValidate: true,
                shouldTouch: true,
              });
            }}
            placeholder="Enter Instance ID"
          />
        </FormField>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <FormField
              label="Source Method"
              helpText="How to capture source information"
              error={getError("sourceMethod")}
            >
              <SelectControl
                value={settings.sourceMethod}
                options={[
                  { label: "None", value: "none" },
                  { label: "GET Method", value: "get" },
                  { label: "POST Method", value: "post" },
                  { label: "Hard Coded", value: "hardCoded" },
                ]}
                onChange={(value) =>
                  form.setValue("sourceMethod", value || 'none', {
                    shouldDirty: true,
                  })
                }
              />
            </FormField>

            {settings.sourceMethod !== "none" && (
              <FormField
                label={
                  settings.sourceMethod === "hardCoded"
                    ? "Source Value"
                    : "Source Variable"
                }
                helpText={
                  settings.sourceMethod === "hardCoded"
                    ? "Value for source"
                    : "Variable name for source tracking"
                }
                error={getError("sourceValue")}
              >
                <TextControl
                  value={settings.sourceValue}
                  onChange={(value) =>
                    form.setValue("sourceValue", value || "", {
                      shouldDirty: true,
                    })
                  }
                  placeholder="e.g., utm_source"
                />
              </FormField>
            )}
          </div>

          <div>
            <FormField
              label="Campaign Method"
              helpText="How to capture campaign information"
              error={getError("campaignMethod")}
            >
              <SelectControl
                value={settings.campaignMethod}
                options={[
                  { label: "None", value: "none" },
                  { label: "GET Method", value: "get" },
                  { label: "POST Method", value: "post" },
                  { label: "Hard Coded", value: "hardCoded" },
                ]}
                onChange={(value) =>
                  form.setValue("campaignMethod", value || "none", {
                    shouldDirty: true,
                  })
                }
              />
            </FormField>

            {settings.campaignMethod !== "none" && (
              <FormField
                label={
                  settings.campaignMethod === "hardCoded"
                    ? "Campaign Value"
                    : "Campaign Variable"
                }
                helpText={
                  settings.campaignMethod === "hardCoded"
                    ? "Value for campaign"
                    : "Variable name for campaign tracking"
                }
                error={getError("campaignValue")}
              >
                <TextControl
                  value={settings.campaignValue}
                  onChange={(value) =>
                    form.setValue("campaignValue", value || "", {
                      shouldDirty: true,
                    })
                  }
                  placeholder="e.g., utm_campaign"
                />
              </FormField>
            )}
          </div>
        </div>

        {/* Bot Detection Section */}
        <FormField
          label="Bot & Crawler Handling"
          helpText="Configure how Anura handles known bots and crawlers"
          error={getError("ignoreBots")}
        >
          <div className="space-y-3">
            <ToggleControl
              checked={settings.ignoreBots}
              label="Ignore Common Bots and Crawlers"
              help={`Prevent known search engines and social bots from being analyzed (${enabledBotsCount} active)`}
              onChange={(enabled) => {
                form.setValue("ignoreBots", enabled, { shouldDirty: true });

                // Auto-enable all predefined bots when first enabling
                if (enabled && settings.botWhitelist.every((bot) => !bot.enabled)) {
                  const updatedBots = settings.botWhitelist.map((bot) => ({
                    ...bot,
                    enabled: !bot.isCustom, // Enable all predefined bots (not custom)
                  }));
                  form.setValue("botWhitelist", updatedBots, { shouldDirty: true });
                }
              }}
              __nextHasNoMarginBottom
            />

            {settings.ignoreBots && (
              <BotDetectionSection
                bots={settings.botWhitelist}
                enabledCount={enabledBotsCount}
                errors={errors.botWhitelist}
                onUpdateBots={(bots) => {
                  form.setValue("botWhitelist", bots, { shouldDirty: true });
                }}
              />
            )}
          </div>
        </FormField>
      </div>
    </AnuraCard>
  );
}
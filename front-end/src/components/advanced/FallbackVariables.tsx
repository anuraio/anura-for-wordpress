import React from "react";
import {
  TextControl,
  Notice,
  __experimentalText as Text,
  __experimentalSpacer as Spacer,
} from "@wordpress/components";
import { RefreshCw } from "lucide-react";
import { UseFormReturn, FieldErrors } from "react-hook-form";
import { UISettings } from "../../schemas/settings.schema";
import { AnuraCard } from "../ui/AnuraCard";
import { ErrorNotice } from "../ui/ErrorNotice";

// Constants for labels and examples
const FALLBACK_LABELS = ["Primary", "Secondary"] as const;
const FALLBACK_EXAMPLES = {
  source: ["utm_source", "ref"],
  campaign: ["utm_campaign", "cid"],
} as const;

interface FallbackVariablesProps {
  form: UseFormReturn<UISettings>;
  settings: UISettings;
  errors: FieldErrors<UISettings>;
}

export function FallbackVariables({
  form,
  settings,
  errors,
}: FallbackVariablesProps) {
  const updateFallbackSource = (index: number, value: string) => {
    const currentSources = [...settings.fallbackSources];
    currentSources[index] = value;
    form.setValue("fallbackSources", currentSources, {
      shouldDirty: true,
      shouldValidate: true,
      shouldTouch: true,
    });
  };

  const updateFallbackCampaign = (index: number, value: string) => {
    const currentCampaigns = [...settings.fallbackCampaigns];
    currentCampaigns[index] = value;
    form.setValue("fallbackCampaigns", currentCampaigns, {
      shouldDirty: true,
      shouldValidate: true,
      shouldTouch: true,
    });
  };

  return (
    <AnuraCard
      title="Fallback Variables"
      subtitle="Backup parameter names when primary source/campaigns fail"
      icon={<RefreshCw size={20} />}
    >
      <Notice status="info" isDismissible={false}>
        <Text>
          Fallback variables are used in the scenario your source/campaign
          variable is empty when using the <strong>GET</strong> or{" "}
          <strong>POST</strong> method. In those situations, your first fallback
          variable will be used. If that is also empty, your second fallback
          will be used.
        </Text>
      </Notice>

      <Spacer marginBottom={4} />

      <div className="grid md:grid-cols-2 gap-6">
        {/* Fallback Sources */}
        <section aria-labelledby="fallback-sources-heading">
          <h4
            id="fallback-sources-heading"
            className="text-sm font-medium text-gray-900 mb-3"
          >
            Fallback Sources
          </h4>
          <div className="space-y-3">
            {settings.fallbackSources.map((source, index) => (
              <React.Fragment key={`source-${index}`}>
                <TextControl
                  label={`Fallback Source ${index + 1}`}
                  value={source}
                  onChange={(value) => updateFallbackSource(index, value || "")}
                  placeholder={`e.g., ${
                    FALLBACK_EXAMPLES.source[index] || "source_param"
                  }`}
                  help={`${
                    FALLBACK_LABELS[index] || `Fallback #${index + 1}`
                  } fallback source parameter`}
                  __nextHasNoMarginBottom
                />

                {errors.fallbackSources && errors.fallbackSources[index]?.message && (
                  <ErrorNotice error={errors.fallbackSources[index]?.message} />
                )}
              </React.Fragment>
            ))}
          </div>
        </section>

        {/* Fallback Campaigns */}
        <section aria-labelledby="fallback-campaigns-heading">
          <h4
            id="fallback-campaigns-heading"
            className="text-sm font-medium text-gray-900 mb-3"
          >
            Fallback Campaigns
          </h4>
          <div className="space-y-3">
            {settings.fallbackCampaigns.map((campaign, index) => (
              <React.Fragment key={`campaign-${index}`}>
                <TextControl
                  label={`Fallback Campaign ${index + 1}`}
                  value={campaign}
                  onChange={(value) => updateFallbackCampaign(index, value || "")}
                  placeholder={`e.g., ${
                    FALLBACK_EXAMPLES.campaign[index] || "campaign_param"
                  }`}
                  help={`${
                    FALLBACK_LABELS[index] || `Fallback #${index + 1}`
                  } fallback campaign parameter`}
                  __nextHasNoMarginBottom
                />

                {errors.fallbackCampaigns && errors.fallbackCampaigns[index]?.message && (
                  <ErrorNotice error={errors.fallbackCampaigns[index].message} />
                )}
              </React.Fragment>
            ))}
          </div>
        </section>
      </div>

      <Spacer marginBottom={4} />

      <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
        <Text size="12px" className="text-gray-600">
          <strong>Note:</strong> If you&apos;re using a hard coded value, fallbacks
          are not needed.
        </Text>
      </div>
    </AnuraCard>
  );
}

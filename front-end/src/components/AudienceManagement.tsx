// src/components/AudienceManagement.tsx
import { Users } from "lucide-react";
import { UseFormReturn, FieldErrors } from 'react-hook-form';
import { UISettings } from "../schemas/settings.schema";
import { AnuraCard } from "./ui/AnuraCard";
import { TabPanel } from "@wordpress/components";
import { ExclusionAudiencesListView } from "./ssp/ExclusionAudiencesListView";

interface AudienceManagementProps {
  form: UseFormReturn<UISettings>;
  settings: UISettings;
  errors: FieldErrors<UISettings>;
}

export function AudienceManagement({ form, settings, _errors }: AudienceManagementProps) {
  // Helper function to update exclusion audiences
  const updateExclusionAudiences = (audiences: UISettings['exclusionAudiences']) => {
    form.setValue('exclusionAudiences', audiences, {
      shouldDirty: true,
      shouldValidate: true
    });
  };

  return (
    <AnuraCard
      title="Audience Management"
      subtitle="Configure and protect your platforms and audiences."
      icon={<Users size={20} />}
      className="h-full flex flex-col"
    >
      <TabPanel
        className="anura-tabs flex-1 flex flex-col"
        activeClass="is-active"
        tabs={[
          { name: "exclusion", title: "Exclusion Audiences" },
          { name: "retargeting", title: "Retargeting Protection" },
        ]}
      >
        {(tab) => (
          <div className="pt-4 flex-1 flex flex-col">
            {tab.name === "exclusion" && (
              <ExclusionAudiencesListView 
                audiences={settings.exclusionAudiences} 
                onUpdate={updateExclusionAudiences}
              />
            )}
            {tab.name === "retargeting" && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Users size={48} className="mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Retargeting Protection
                  </h3>
                  <p className="text-gray-600">
                    Coming soon! Advanced retargeting protection features.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </TabPanel>
    </AnuraCard>
  );
}
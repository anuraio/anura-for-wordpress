import { FieldErrors, UseFormReturn } from "react-hook-form";
import { UISettings } from "~/schemas/settings.schema";
import { AnuraCard } from "../ui/AnuraCard";
import { Users } from "lucide-react";
import { TabPanel } from "@wordpress/components";
import { ExclusionAudiencesListView } from "./ExclusionAudiencesListView";
import { RetargetingProtectionListView } from "./RetargetingProtectionListView";

interface SearchSocialOptionsProps {
  form: UseFormReturn<UISettings>;
  settings: UISettings;
  errors: FieldErrors<UISettings>;
}

export function SearchSocialOptions({
  form,
  settings,
  errors: _errors,
}: SearchSocialOptionsProps) {
  return (
    <AnuraCard
      title="Search & Social Protection"
      subtitle="Create exclusion audiences across ad platforms to protect your retargeting strategy"
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
                onUpdate={(audiences: UISettings["exclusionAudiences"]) =>
                  form.setValue("exclusionAudiences", audiences, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
            )}
            {tab.name === "retargeting" && (
              <RetargetingProtectionListView
                protectedTags={settings.retargetingProtection}
                onUpdate={(tags: UISettings["retargetingProtection"]) =>
                  form.setValue("retargetingProtection", tags, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
            )}
          </div>
        )}
      </TabPanel>
    </AnuraCard>
  );
}

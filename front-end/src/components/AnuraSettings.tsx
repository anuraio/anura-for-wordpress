import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Notice,
} from "@wordpress/components";
import { useAnuraSettings } from "../hooks/useAnuraSettings";
import { SetupSettings } from "./setup/SetupSettings";
import { AdvancedOptions } from "./advanced/AdvancedOptions";
import { DynamicTabPanel } from "./ui/DynamicTabPanel";
import { ConfirmModal } from "./ui/ConfirmModal";
import { RealTimeActions } from "./rta/RealTimeActions";
import { SearchSocialOptions } from "./ssp/SearchSocialOptions";
import { AnuraLogo } from "./ui/AnuraLogo";
import { BlockedLogins } from "./logs/BlockedLogins";
import type { UseFormReturn, FieldErrors } from "react-hook-form";
import type { UISettings } from "../schemas/settings.schema";

// Map tabs to their associated form fields
const TAB_FIELD_MAP: Record<string, string[]> = {
  setup: [
    "instanceId",
    "sourceMethod",
    "sourceValue",
    "campaignMethod",
    "campaignValue",
    "ignoreBots",
    "botWhitelist",
  ],
  rta: [
    "redirectCondition",
    "redirectURL",
    "webCrawlersAllowed",
    "disableFormsEnabled",
    "disableFormsCondition",
    "disableCommentSubmitsEnabled",
    "disableCommentSubmitsCondition",
    "disableAllSubmitsEnabled",
    "disableAllSubmitsCondition",
    "disableLinksEnabled",
    "disableLinksCondition",
    "disableAllInputsEnabled",
    "disableAllInputsCondition",
    "protectLoginEnabled",
    "protectLoginCondition",
    "retryDurationSeconds",
    "stopAfterFirstElement",
  ],
  ssp: ["exclusionAudiences", "retargetingProtection"],
  advanced: [
    "additionalData",
    "callbackFunction",
    "fallbackSources",
    "fallbackCampaigns",
    "addHeaders",
    "headerPriority",
    "contentDeploymentEnabled",
    "contentDeploymentCode",
    "requestTriggersEnabled",
    "requestTriggers",
  ],
};

// Check if a specific tab has any dirty fields
const hasTabChanges = (
  tabName: string,
  dirtyFields: Partial<Record<keyof UISettings, boolean>>
): boolean => {
  const tabFields = TAB_FIELD_MAP[tabName];
  if (!tabFields) return false;

  return tabFields.some((fieldName) => dirtyFields[fieldName] !== undefined);
};

// Render content for each tab
const renderTabContent = (
  tabName: string,
  form: UseFormReturn<UISettings>,
  settings: UISettings,
  errors: FieldErrors<UISettings>
) => {
  switch (tabName) {
    case "setup":
      return (
        <div className="pt-4">
          <SetupSettings form={form} settings={settings} errors={errors} />
        </div>
      );
    case "rta":
      return (
        <div className="pt-4">
          <RealTimeActions form={form} />
        </div>
      );
    case "ssp":
      return (
        <div className="pt-4">
          <SearchSocialOptions form={form} settings={settings} errors={errors} />
        </div>
      );
    case "advanced":
      return (
        <div className="pt-4">
          <AdvancedOptions form={form} settings={settings} errors={errors} />
        </div>
      );
    case "logs":
      return (
        <div className="pt-4">
          <BlockedLogins />
        </div>
      );
    default:
      return null;
  }
};

export function AnuraSettingsPage() {
  const [_activeTab, setActiveTab] = useState("basic");
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const {
    form,
    settings,
    errors,
    onReset,
    onSubmit,
    isLoading,
    isSaving,
    saveStatus,
    apiError,
    clearSaveStatus,
  } = useAnuraSettings();

  // Auto-dismiss success message after 3 seconds
  useEffect(() => {
    if (saveStatus === "success") {
      const timeoutId = setTimeout(clearSaveStatus, 3000);
      return () => clearTimeout(timeoutId);
    }
  }, [saveStatus, clearSaveStatus]);

  // Show loading state while fetching initial settings
  if (isLoading) {
    return (
      <div className="wrap">
        <Card>
          <CardBody>
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Loading settings...</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  const dirtyFields = form.formState.dirtyFields as Partial<Record<keyof UISettings, boolean>>;

  return (
    <div className="wrap">
      <Card>
        <CardHeader
          style={{ background: "#f6f7f7", borderBottom: "1px solid #c3c4c7" }}
        >
          <div className="flex items-center gap-3 p-4">
            <AnuraLogo className="flex-shrink-0" />
            <div>
              <h1 className="text-2xl font-normal text-gray-900 m-0">
                Anura For WordPress
              </h1>
            </div>
          </div>
        </CardHeader>

        <CardBody>
          {/* Success Notice */}
          {saveStatus === "success" && (
            <Notice
              status="success"
              isDismissible={true}
              onDismiss={clearSaveStatus}
            >
              Settings saved successfully!
            </Notice>
          )}

          {/* Error Notice */}
          {(saveStatus === "error" || apiError) && (
            <Notice
              status="error"
              isDismissible={true}
              onDismiss={clearSaveStatus}
            >
              {apiError || "Failed to save settings. Please try again."}
            </Notice>
          )}

          {/* Main Form */}
          <form onSubmit={(e) => { void onSubmit(e); }}>
            <DynamicTabPanel
              tabs={[
                {
                  name: "setup",
                  title: "Setup",
                  hasChanges: hasTabChanges("setup", dirtyFields),
                },
                {
                  name: "rta",
                  title: "Real-Time Actions",
                  hasChanges: hasTabChanges("rta", dirtyFields),
                },
                {
                  name: "ssp",
                  title: "Search & Social Protection",
                  hasChanges: hasTabChanges("ssp", dirtyFields),
                },
                {
                  name: "advanced",
                  title: "Advanced",
                  hasChanges: hasTabChanges("advanced", dirtyFields),
                },
                {
                  name: "logs",
                  title: "Blocked Logins",
                  hasChanges: false,
                },
              ]}
              onSelect={setActiveTab}
            >
              {(tab) => renderTabContent(tab.name, form, settings, errors)}
            </DynamicTabPanel>

            {/* Action Buttons */}
            <div className="flex justify-between items-center gap-3 pt-6 border-t mt-6">
              <div>
                {form.formState.isDirty && (
                  <p className="text-sm text-gray-600">
                    You have unsaved changes
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowResetConfirm(true)}
                  disabled={isSaving}
                >
                  Reset to Defaults
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSaving}
                  isBusy={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>

              <ConfirmModal
                isOpen={showResetConfirm}
                title="Reset Settings"
                message="Reset all settings to defaults? You will need to save to apply changes."
                confirmText="Reset"
                variant="destructive"
                onConfirm={() => {
                  onReset();
                  setShowResetConfirm(false);
                }}
                onCancel={() => setShowResetConfirm(false)}
              />
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

import {
  Modal,
  TextControl,
  Button,
  __experimentalVStack as VStack,
  __experimentalHStack as HStack,
  __experimentalText as Text,
} from "@wordpress/components";
import { PLATFORMS } from "../../config/platforms";
import { isAudienceFormValid } from "../../utils/audience";
import {
  PlatformOption,
  getPlatformOptions,
} from "~/utils/platform";
import { ExclusionAudience } from "~/schemas/settings.schema";
import { AudienceFormData } from "~/hooks/useModal";

export interface AudienceModalProps {
  isOpen: boolean;
  editingAudience: ExclusionAudience | null;
  formData: AudienceFormData;
  allAudiences: ExclusionAudience[];
  onClose: () => void;
  onSave: () => void;
  onFormChange: (updates: Partial<AudienceFormData>) => void;
}

export function AudienceModal({
  isOpen,
  editingAudience,
  formData,
  allAudiences,
  onClose,
  onSave,
  onFormChange,
}: AudienceModalProps) {
  if (!isOpen) return null;

  const platformOptions = getPlatformOptions(
    allAudiences,
    editingAudience?.id
  );

  const isFormValid = isAudienceFormValid(formData.platform, formData.fields);

  const handlePlatformChange = (platform: string) => {
    onFormChange({
      platform,
      fields: {}, // Reset fields when platform changes
    });
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    onFormChange({
      fields: { ...formData.fields, [fieldId]: value },
    });
  };

  // Get current platform restriction status
  const getCurrentPlatformRestriction = (): PlatformOption | null => {
    return (
      platformOptions.find((opt) => opt.value === formData.platform) ||
      null
    );
  };

  const currentPlatformRestriction = getCurrentPlatformRestriction();

  return (
    <Modal
      title={
        editingAudience
          ? "Edit Exclusion Audience"
          : "Create Exclusion Audience"
      }
      onRequestClose={onClose}
      className="exclusion-audience-modal"
    >
      <VStack spacing={4} style={{ minWidth: "500px", maxWidth: "500px" }}>
        {/* Platform Selection with Custom Styling */}
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            Platform
          </label>
          <select
            value={formData.platform}
            onChange={(e) => handlePlatformChange(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "4px",
              border: "1px solid #ddd",
              fontSize: "14px",
              backgroundColor: "white",
            }}
          >
            {platformOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
                style={{}}
                title={option.isRestricted ? option.tooltipMessage : ""}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Label Field */}
        <TextControl
          label="Label (Optional)"
          value={formData.label}
          onChange={(value) => onFormChange({ label: value || "" })}
          placeholder="e.g., Retargeting, Campaign A"
          help="Optional label to distinguish multiple audiences for the same platform"
          __nextHasNoMarginBottom
        />

        {/* Platform-specific Fields */}
        {formData.platform &&
          PLATFORMS[formData.platform as keyof typeof PLATFORMS] && (
            <>
              {PLATFORMS[
                formData.platform as keyof typeof PLATFORMS
              ].fields.map((field) => (
                <TextControl
                  key={field.id}
                  label={field.label}
                  value={formData.fields[field.id] || ""}
                  onChange={(value) => handleFieldChange(field.id, value || "")}
                  placeholder={field.placeholder}
                  __nextHasNoMarginBottom
                />
              ))}
            </>
          )}

        {/* Active Toggle */}
        <div style={{ marginTop: "8px" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            <input
              type="checkbox"
              checked={formData.enabled}
              onChange={(e) => onFormChange({ enabled: e.target.checked })}
              style={{
                margin: 0,
                opacity: currentPlatformRestriction?.isRestricted ? 0.5 : 1,
              }}
              disabled={currentPlatformRestriction?.isRestricted}
            />
            Active
          </label>
          <Text
            variant="muted"
            size="12px"
            style={{ marginLeft: "24px", marginTop: "4px" }}
          >
            Enable this exclusion audience
          </Text>

          {currentPlatformRestriction?.isRestricted && (
            <div className="bg-yellow-50 text-amber-500 p-2 rounded mt-2 max-w-full text-xs">
              <p className=""><strong>Platform Limitation:</strong></p>
              <p>{currentPlatformRestriction.tooltipMessage}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <HStack
          justify="flex-end"
          spacing={3}
          style={{
            marginTop: "8px",
            paddingTop: "16px",
            borderTop: "1px solid #ddd",
          }}
        >
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onSave} disabled={!isFormValid}>
            {editingAudience ? "Update" : "Create"}
          </Button>
        </HStack>
      </VStack>
    </Modal>
  );
}

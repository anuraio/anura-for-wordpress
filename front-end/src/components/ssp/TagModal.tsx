import {
  Modal,
  TextControl,
  Button,
  ToggleControl,
  __experimentalVStack as VStack,
  __experimentalHStack as HStack,
} from "@wordpress/components";
import { TAG_PLATFORMS } from "~/config/tagPlatforms";
import { isTagFormValid } from "./tagModal.utils";

const PLATFORM_OPTIONS = [
  { value: "", label: "Select platform..." },
  ...Object.entries(TAG_PLATFORMS).map(([value, config]) => ({
    value,
    label: config.label,
  })),
];

export interface ProtectedTag {
  id: string;
  platform: keyof typeof TAG_PLATFORMS;
  tagId: string;
  label?: string;
  enabled: boolean;
}

export interface TagFormData {
  platform: keyof typeof TAG_PLATFORMS | "";
  label: string;
  fields: Record<string, string>;
  enabled: boolean;
}

export interface TagModalProps {
  isOpen: boolean;
  editingTag: ProtectedTag | null;
  formData: TagFormData;
  onClose: () => void;
  onSave: () => void;
  onFormChange: (updates: Partial<TagFormData>) => void;
}

export function TagModal({
  isOpen,
  editingTag,
  formData,
  onClose,
  onSave,
  onFormChange,
}: TagModalProps) {
  if (!isOpen) return null;

  const isFormValid = isTagFormValid(formData.platform, formData.fields);

  const handlePlatformChange = (platform: keyof typeof TAG_PLATFORMS | "") => {
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

  return (
    <Modal
      title={editingTag ? "Edit Protected Tag" : "Create Protected Tag"}
      onRequestClose={onClose}
      className="protected-tag-modal"
    >
      <VStack spacing={4} className="min-w-[500px] max-w-[500px]">
        {/* Platform Selection */}
        <div>
          <label className="block mb-2 font-semibold text-sm">Platform</label>
          <select
            value={formData.platform}
            onChange={(e) => handlePlatformChange(e.target.value as keyof typeof TAG_PLATFORMS | "")}
            className="w-full px-3 py-2 rounded border border-gray-300 text-sm bg-white"
          >
            {PLATFORM_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
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
          placeholder="e.g., Main Site, Campaign A, Retargeting"
          help="Optional label to distinguish multiple tags for the same platform"
          __nextHasNoMarginBottom
        />

        {/* Platform-specific Fields */}
        {formData.platform &&
          TAG_PLATFORMS[
            formData.platform
          ]?.fields.map((field) => (
            <TextControl
              key={field.id}
              label={field.label}
              value={formData.fields[field.id] || ""}
              onChange={(value) => handleFieldChange(field.id, value || "")}
              placeholder={field.placeholder}
              __nextHasNoMarginBottom
            />
          ))}

        {/* Active Toggle */}
        <ToggleControl
          label="Active"
          help="Enable automatic tag deployment for legitimate traffic"
          checked={formData.enabled}
          onChange={(enabled) => onFormChange({ enabled })}
          __nextHasNoMarginBottom
        />

        {/* Action Buttons */}
        <HStack
          justify="flex-end"
          spacing={3}
          className="mt-2 pt-4 border-t border-gray-300"
        >
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onSave} disabled={!isFormValid}>
            {editingTag ? "Update" : "Create"}
          </Button>
        </HStack>
      </VStack>
    </Modal>
  );
}

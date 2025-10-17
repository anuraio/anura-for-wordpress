import { useState } from 'react';
import {
  Placeholder,
  Button,
  ToggleControl,
  DropdownMenu,
  __experimentalVStack as VStack,
  __experimentalHStack as HStack,
  __experimentalText as Text,
} from "@wordpress/components";
import {
  pencil,
  trash,
  moreHorizontal,
} from "@wordpress/icons";
import { Shield, Plus } from "lucide-react";
import { AnuraCard } from "../ui/AnuraCard";
import { TagModal, ProtectedTag, TagFormData } from "./TagModal";
import { TAG_PLATFORMS } from '~/config/tagPlatforms';

interface RetargetingProtectionListViewProps {
  protectedTags: ProtectedTag[];
  onUpdate: (tags: ProtectedTag[]) => void;
}

const getDisplayName = (tag: ProtectedTag): string => {
  const platformName = TAG_PLATFORMS[tag.platform]?.label || tag.platform;
  return tag.label ? `${platformName} - ${tag.label}` : platformName;
};

const removeTagById = (tags: ProtectedTag[], tagId: string): ProtectedTag[] => {
  return tags.filter((tag) => tag.id !== tagId);
};

const toggleTagEnabled = (tags: ProtectedTag[], tagId: string): ProtectedTag[] => {
  return tags.map((tag) =>
    tag.id === tagId ? { ...tag, enabled: !tag.enabled } : tag
  );
};

const saveTag = (tags: ProtectedTag[], tagData: ProtectedTag): ProtectedTag[] => {
  const existingIndex = tags.findIndex((tag) => tag.id === tagData.id);
  if (existingIndex >= 0) {
    return tags.map((tag) => tag.id === tagData.id ? tagData : tag);
  }
  return [...tags, tagData];
};

export function RetargetingProtectionListView({
  protectedTags,
  onUpdate,
}: RetargetingProtectionListViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<ProtectedTag | null>(null);
  const [formData, setFormData] = useState<TagFormData>({
    platform: "",
    label: "",
    fields: {},
    enabled: false,
  });

  const openCreateModal = () => {
    setEditingTag(null);
    setFormData({
      platform: "",
      label: "",
      fields: {},
      enabled: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (tag: ProtectedTag) => {
    setEditingTag(tag);
    setFormData({
      platform: tag.platform,
      label: tag.label || "",
      fields: { tagId: tag.tagId },
      enabled: tag.enabled,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTag(null);
    setFormData({
      platform: "",
      label: "",
      fields: {},
      enabled: false,
    });
  };

  const updateFormData = (updates: Partial<TagFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const deleteTag = (tagId: string) => {
    onUpdate(removeTagById(protectedTags, tagId));
  };

  const toggleTag = (tagId: string) => {
    onUpdate(toggleTagEnabled(protectedTags, tagId));
  };

  return (
    <>
      <AnuraCard>
        {protectedTags.length === 0 ? (
          <Placeholder
            icon={<Shield size={48} />}
            label="No retargeting protection configured"
            instructions="Configure advertising platform tags to automatically deploy when legitimate traffic is detected by Anura."
          >
            <Button variant="primary" onClick={openCreateModal}>
              Add Protected Tag
            </Button>
          </Placeholder>
        ) : (
          <>
            <div className="max-h-110 overflow-y-auto">
              <VStack spacing={3}>
                {protectedTags.map((tag) => (
                  <div
                    key={tag.id}
                    className={`px-4 py-3 border border-gray-300 bg-white flex items-center justify-between transition-opacity duration-200 ${
                      tag.enabled ? "opacity-100" : "opacity-50"
                    }`}
                  >
                    <HStack spacing={4} className="flex-1">
                      <div className="flex-1">
                        <Text weight="600" size="14px">
                          {getDisplayName(tag)}
                        </Text>
                        <Text
                          variant="muted"
                          size="12px"
                          style={{ marginLeft: "0.375rem" }}
                        >
                          {tag.tagId || "Not set"}
                        </Text>
                      </div>
                      <ToggleControl
                        checked={tag.enabled}
                        onChange={() => toggleTag(tag.id)}
                        __nextHasNoMarginBottom
                        label={tag.enabled ? "Active" : "Inactive"}
                      />
                    </HStack>
                    <DropdownMenu
                      icon={moreHorizontal}
                      label="Select a direction"
                      controls={[
                        {
                          title: "Edit",
                          icon: pencil,
                          onClick: () => openEditModal(tag),
                        },
                        {
                          title: "Delete",
                          icon: trash,
                          onClick: () => deleteTag(tag.id),
                        },
                      ]}
                    />
                  </div>
                ))}
              </VStack>
            </div>

            <div className="mt-4 border-gray-200 text-center flex items-center justify-center">
              <Button
                variant="secondary"
                icon={<Plus size={16} />}
                onClick={openCreateModal}
              >
                Add Another Protected Tag
              </Button>
            </div>
          </>
        )}

        {/* Modal for create/edit */}
        <TagModal
          isOpen={isModalOpen}
          editingTag={editingTag}
          formData={formData}
          onClose={closeModal}
          onSave={() => {
            const tagData: ProtectedTag = {
              id: editingTag?.id || Date.now().toString(),
              platform: formData.platform as keyof typeof TAG_PLATFORMS,
              tagId: (formData.fields.tagId || '').trim(),
              label: formData.label.trim() || undefined,
              enabled: formData.enabled,
            };
            onUpdate(saveTag(protectedTags, tagData));
            closeModal();
          }}
          onFormChange={updateFormData}
        />
      </AnuraCard>
    </>
  );
}
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
import { Users, Plus } from "lucide-react";
import { AnuraCard } from "../ui/AnuraCard";
import { AudienceModal } from "../advanced/AudienceModal";
import { useModal } from "../../hooks/useModal";
import { ConfirmModal } from '../ui/ConfirmModal';
import { PLATFORMS } from '~/config/platforms';
import {
  getDisplayName,
  getPrimaryId,
  createAudience,
} from "../../utils/audience";
import { PLATFORM_LIMITS } from '~/utils/platform';
import { ExclusionAudience } from '~/schemas/settings.schema';

interface ExclusionAudiencesListViewProps {
  audiences: ExclusionAudience[];
  onUpdate: (audiences: ExclusionAudience[]) => void;
}

// Pure helper functions
const getConflictMessage = (pendingToggle: {
  audienceName: string;
  conflictingAudiences: ExclusionAudience[];
}): string => {
  const platformName = PLATFORMS[pendingToggle.conflictingAudiences[0]?.platform as keyof typeof PLATFORMS]?.label || 'This platform';
  const conflictNames = pendingToggle.conflictingAudiences.map(getDisplayName).join(' and ');
  const isPlural = pendingToggle.conflictingAudiences.length > 1;

  return `${pendingToggle.audienceName} cannot be activated because ${conflictNames} ${isPlural ? 'are' : 'is'} already active. Only 1 ${platformName} audience can be active at a time.\n\nActivate ${pendingToggle.audienceName} and deactivate the ${isPlural ? 'others' : 'other'}?`;
};

const removeAudienceById = (audiences: ExclusionAudience[], audienceId: string): ExclusionAudience[] => {
  return audiences.filter((audience) => audience.id !== audienceId);
};

const setAudienceEnabled = (
  audiences: ExclusionAudience[],
  audienceId: string,
  enabled: boolean
): ExclusionAudience[] => {
  return audiences.map((audience) =>
    audience.id === audienceId ? { ...audience, enabled } : audience
  );
};

const resolveConflictAndActivate = (
  audiences: ExclusionAudience[],
  targetAudienceId: string,
  conflictingAudienceIds: string[]
): ExclusionAudience[] => {
  return audiences.map((audience) => {
    if (audience.id === targetAudienceId) {
      return { ...audience, enabled: true };
    }
    if (conflictingAudienceIds.includes(audience.id)) {
      return { ...audience, enabled: false };
    }
    return audience;
  });
};

const saveAudience = (
  audiences: ExclusionAudience[],
  audienceData: ExclusionAudience
): ExclusionAudience[] => {
  const existingIndex = audiences.findIndex((audience) => audience.id === audienceData.id);
  if (existingIndex >= 0) {
    return audiences.map((audience) => audience.id === audienceData.id ? audienceData : audience);
  }
  return [...audiences, audienceData];
};

export function ExclusionAudiencesListView({
  audiences,
  onUpdate,
}: ExclusionAudiencesListViewProps) {
  const modal = useModal<ExclusionAudience>();

  // State for conflict resolution
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [pendingToggle, setPendingToggle] = useState<{
    audienceId: string;
    audienceName: string;
    conflictingAudiences: ExclusionAudience[];
  } | null>(null);

  const deleteAudience = (audienceId: string) => {
    onUpdate(removeAudienceById(audiences, audienceId));
  };

  const toggleAudience = (audienceId: string) => {
    const audience = audiences.find((a) => a.id === audienceId);
    if (!audience) return;

    // If turning OFF, just do it normally
    if (audience.enabled) {
      onUpdate(setAudienceEnabled(audiences, audienceId, false));
      return;
    }

    // If turning ON, check for platform conflicts
    const platformLimit = PLATFORM_LIMITS[audience.platform as keyof typeof PLATFORM_LIMITS];

    if (platformLimit) {
      // Find conflicting active audiences for this platform
      const conflictingAudiences = audiences.filter(
        a => a.platform === audience.platform &&
             a.enabled &&
             a.id !== audienceId
      );

      if (conflictingAudiences.length >= platformLimit) {
        // Show conflict resolution modal
        setPendingToggle({
          audienceId,
          audienceName: getDisplayName(audience),
          conflictingAudiences
        });
        setShowConflictModal(true);
        return;
      }
    }

    // No conflicts, activate normally
    onUpdate(setAudienceEnabled(audiences, audienceId, true));
  };

  const handleConflictConfirm = () => {
    if (!pendingToggle) return;

    // Deactivate all conflicting audiences and activate the new one
    const conflictingIds = pendingToggle.conflictingAudiences.map(a => a.id);
    onUpdate(resolveConflictAndActivate(audiences, pendingToggle.audienceId, conflictingIds));

    // Clean up
    setShowConflictModal(false);
    setPendingToggle(null);
  };

  const handleConflictCancel = () => {
    setShowConflictModal(false);
    setPendingToggle(null);
    // Toggle stays in original position - no state change needed
  };

  return (
    <>
      <AnuraCard>
        {audiences.length === 0 ? (
          <Placeholder
            icon={<Users size={48} />}
            label="No exclusion audiences configured"
            instructions="Configure advertising platforms and their associated IDs to exclude specific audiences from fraud detection analysis."
          >
            <Button variant="primary" onClick={modal.openCreateModal}>
              Create Exclusion Audience
            </Button>
          </Placeholder>
        ) : (
          <>
            <div className="max-h-110 overflow-y-auto">
              <VStack spacing={3}>
                {audiences.map((audience) => (
                  <div
                    key={audience.id}
                    className={`px-4 py-3 border border-gray-300 bg-white flex items-center justify-between transition-opacity duration-200 ${
                      audience.enabled ? "opacity-100" : "opacity-50"
                    }`}
                  >
                    <HStack spacing={4} className="flex-1">
                      <div className="flex-1">
                        <Text weight="600" size="14px">
                          {getDisplayName(audience)}
                        </Text>
                        <Text
                          variant="muted"
                          size="12px"
                          style={{ marginLeft: "0.375rem" }}
                        >
                          {getPrimaryId(audience)}
                        </Text>
                      </div>
                      <ToggleControl
                        checked={audience.enabled}
                        onChange={() => toggleAudience(audience.id)}
                        __nextHasNoMarginBottom
                        label={audience.enabled ? "Active" : "Inactive"}
                      />
                    </HStack>
                    <DropdownMenu
                      icon={moreHorizontal}
                      label="Select a direction"
                      controls={[
                        {
                          title: "Edit",
                          icon: pencil,
                          onClick: () => modal.openEditModal(audience),
                        },
                        {
                          title: "Delete",
                          icon: trash,
                          onClick: () => deleteAudience(audience.id),
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
                onClick={modal.openCreateModal}
              >
                Add Another Exclusion Audience
              </Button>
            </div>
          </>
        )}

        {/* Modal for create/edit */}
        <AudienceModal
          isOpen={modal.isModalOpen}
          editingAudience={modal.editingEntity}
          allAudiences={audiences}
          formData={modal.formData}
          onClose={modal.closeModal}
          onSave={() => {
            const audienceData = createAudience(
              modal.formData.platform,
              modal.formData.label,
              modal.formData.fields,
              modal.formData.enabled
            );

            // Override ID if editing
            if (modal.editingEntity) {
              audienceData.id = modal.editingEntity.id;
            }

            onUpdate(saveAudience(audiences, audienceData));
            modal.closeModal();
          }}
          onFormChange={modal.updateFormData}
        />
      </AnuraCard>

      {/* Conflict Resolution Modal */}
      <ConfirmModal
        isOpen={showConflictModal}
        title="Platform Conflict"
        message={pendingToggle ? getConflictMessage(pendingToggle) : ""}
        confirmText="Switch Active Audience"
        cancelText="Keep Current"
        variant="default"
        onConfirm={handleConflictConfirm}
        onCancel={handleConflictCancel}
      />
    </>
  );
}
import { useState } from 'react';

export interface AudienceFormData {
  platform: string;
  label: string;
  fields: Record<string, string>;
  enabled: boolean;
}

// Alias for backward compatibility
// export type AudienceFormData = BaseFormData;

export interface BaseEntity {
  id: string;
  platform: string;
  label?: string;
  fields: Record<string, string>;
  enabled: boolean;
}

export function useModal<TEntity extends BaseEntity, TFormData extends AudienceFormData = AudienceFormData>() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<TEntity | null>(null);
  const [formData, setFormData] = useState<TFormData>({
    platform: "",
    label: "",
    fields: {},
    enabled: false,
  } as TFormData);

  const resetForm = () => {
    setFormData({
      platform: "",
      label: "",
      fields: {},
      enabled: false,
    } as TFormData);
  };

  const openCreateModal = () => {
    setEditingEntity(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (entity: TEntity) => {
    setEditingEntity(entity);
    setFormData({
      platform: entity.platform,
      label: entity.label || "",
      fields: entity.fields,
      enabled: entity.enabled,
    } as TFormData);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEntity(null);
    resetForm();
  };

  const updateFormData = (updates: Partial<TFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return {
    // State
    isModalOpen,
    editingEntity,
    formData,

    // Actions
    openCreateModal,
    openEditModal,
    closeModal,
    updateFormData,
    resetForm
  };
}
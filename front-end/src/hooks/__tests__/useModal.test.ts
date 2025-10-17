import { renderHook, act } from '@testing-library/react';
import { useModal } from '../useModal';
import { describe, test, expect } from 'vitest';

// Mock audience data for testing
const mockAudience = {
  id: '123',
  platform: 'meta',
  label: 'Test Campaign',
  fields: { pixelId: '456789' },
  enabled: true
};

describe('useModal', () => {
  test('initial state is closed with empty form', () => {
    const { result } = renderHook(() => useModal());

    expect(result.current.isModalOpen).toBe(false);
    expect(result.current.editingEntity).toBe(null);
    expect(result.current.formData).toEqual({
      platform: '',
      label: '',
      fields: {},
      enabled: false
    });
  });

  test('openCreateModal opens modal with empty form', () => {
    const { result } = renderHook(() => useModal());

    act(() => {
      result.current.openCreateModal();
    });

    expect(result.current.isModalOpen).toBe(true);
    expect(result.current.editingEntity).toBe(null);
    expect(result.current.formData).toEqual({
      platform: '',
      label: '',
      fields: {},
      enabled: false
    });
  });

  test('openEditModal opens modal with audience data', () => {
    const { result } = renderHook(() => useModal());

    act(() => {
      result.current.openEditModal(mockAudience);
    });

    expect(result.current.isModalOpen).toBe(true);
    expect(result.current.editingEntity).toEqual(mockAudience);
    expect(result.current.formData).toEqual({
      platform: 'meta',
      label: 'Test Campaign',
      fields: { pixelId: '456789' },
      enabled: true
    });
  });

  test('openEditModal handles audience without label', () => {
    const { result } = renderHook(() => useModal());
    const audienceWithoutLabel = { ...mockAudience, label: undefined };

    act(() => {
      result.current.openEditModal(audienceWithoutLabel);
    });

    expect(result.current.formData.label).toBe('');
  });

  test('closeModal resets all state', () => {
    const { result } = renderHook(() => useModal());

    // First open modal with data
    act(() => {
      result.current.openEditModal(mockAudience);
    });

    expect(result.current.isModalOpen).toBe(true);
    expect(result.current.editingEntity).toEqual(mockAudience);

    // Then close it
    act(() => {
      result.current.closeModal();
    });

    expect(result.current.isModalOpen).toBe(false);
    expect(result.current.editingEntity).toBe(null);
    expect(result.current.formData).toEqual({
      platform: '',
      label: '',
      fields: {},
      enabled: false
    });
  });

  test('updateFormData merges partial updates', () => {
    const { result } = renderHook(() => useModal());

    // Start with some initial data
    act(() => {
      result.current.openEditModal(mockAudience);
    });

    // Update platform only
    act(() => {
      result.current.updateFormData({ platform: 'google' });
    });

    expect(result.current.formData.platform).toBe('google');
    expect(result.current.formData.label).toBe('Test Campaign'); // unchanged
    expect(result.current.formData.fields).toEqual({ pixelId: '456789' }); // unchanged

    // Update multiple fields
    act(() => {
      result.current.updateFormData({
        label: 'Updated Campaign',
        enabled: false
      });
    });

    expect(result.current.formData.label).toBe('Updated Campaign');
    expect(result.current.formData.enabled).toBe(false);
    expect(result.current.formData.platform).toBe('google'); // still updated from before
  });

  test('updateFormData can update nested fields object', () => {
    const { result } = renderHook(() => useModal());

    act(() => {
      result.current.openCreateModal();
    });

    act(() => {
      result.current.updateFormData({
        fields: { adTagId: '123', campaignId: '456' }
      });
    });

    expect(result.current.formData.fields).toEqual({
      adTagId: '123',
      campaignId: '456'
    });

    // Update fields again - should replace, not merge
    act(() => {
      result.current.updateFormData({
        fields: { pixelId: '789' }
      });
    });

    expect(result.current.formData.fields).toEqual({
      pixelId: '789'
    });
  });

  test('resetForm clears form data without closing modal', () => {
    const { result } = renderHook(() => useModal());

    // Open with data
    act(() => {
      result.current.openEditModal(mockAudience);
    });

    expect(result.current.isModalOpen).toBe(true);
    expect(result.current.formData.platform).toBe('meta');

    // Reset form
    act(() => {
      result.current.resetForm();
    });

    // Modal should still be open but form cleared
    expect(result.current.isModalOpen).toBe(true);
    expect(result.current.formData).toEqual({
      platform: '',
      label: '',
      fields: {},
      enabled: false
    });
  });

  test('sequential modal operations work correctly', () => {
    const { result } = renderHook(() => useModal());

    // Open create modal
    act(() => {
      result.current.openCreateModal();
    });

    expect(result.current.editingEntity).toBe(null);

    // Switch to edit modal
    act(() => {
      result.current.openEditModal(mockAudience);
    });

    expect(result.current.editingEntity).toEqual(mockAudience);
    expect(result.current.formData.platform).toBe('meta');

    // Close and open create again
    act(() => {
      result.current.closeModal();
    });

    act(() => {
      result.current.openCreateModal();
    });

    expect(result.current.editingEntity).toBe(null);
    expect(result.current.formData).toEqual({
      platform: '',
      label: '',
      fields: {},
      enabled: false
    });
  });

  test('form data updates persist during modal session', () => {
    const { result } = renderHook(() => useModal());

    act(() => {
      result.current.openCreateModal();
    });

    // Make several updates
    act(() => {
      result.current.updateFormData({ platform: 'linkedin' });
    });

    act(() => {
      result.current.updateFormData({ 
        label: 'My Campaign',
        fields: { partnerId: '123' }
      });
    });

    act(() => {
      result.current.updateFormData({ enabled: true });
    });

    // All updates should be accumulated
    expect(result.current.formData).toEqual({
      platform: 'linkedin',
      label: 'My Campaign', 
      fields: { partnerId: '123' },
      enabled: true
    });
  });
});
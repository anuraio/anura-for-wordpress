import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AudienceModal } from '../AudienceModal';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { ExclusionAudience } from '~/schemas/settings.schema';
import { AudienceFormData } from '~/hooks/useModal';

describe('AudienceModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();
  const mockOnFormChange = vi.fn();

  const defaultFormData: AudienceFormData = {
    platform: '',
    fields: {},
    label: '',
    enabled: true,
  };

  const defaultProps = {
    isOpen: true,
    editingAudience: null,
    formData: defaultFormData,
    allAudiences: [] as ExclusionAudience[],
    onClose: mockOnClose,
    onSave: mockOnSave,
    onFormChange: mockOnFormChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Modal Display', () => {
    test('renders when open with create mode UI', () => {
      render(<AudienceModal {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Create Exclusion Audience')).toBeInTheDocument();
      expect(screen.getByText('Create')).toBeInTheDocument();
    });

    test('does not render when closed', () => {
      render(<AudienceModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    test('shows edit mode UI when editing existing audience', () => {
      const editingAudience: ExclusionAudience = {
        id: 'test-1',
        platform: 'meta',
        fields: { pixelId: '123456789' },
        enabled: true,
      };

      render(<AudienceModal {...defaultProps} editingAudience={editingAudience} />);

      expect(screen.getByText('Edit Exclusion Audience')).toBeInTheDocument();
      expect(screen.getByText('Update')).toBeInTheDocument();
    });
  });

  describe('Form Fields', () => {
    test('renders all form fields', () => {
      render(<AudienceModal {...defaultProps} />);

      expect(screen.getByText('Platform')).toBeInTheDocument();
      expect(screen.getByText('Meta Business')).toBeInTheDocument();
      expect(screen.getByText('Google Ads')).toBeInTheDocument();
      expect(screen.getByLabelText('Label (Optional)')).toBeInTheDocument();
      expect(screen.getByLabelText('Active')).toBeInTheDocument();
    });

    test('displays label value and enabled state from formData', () => {
      const formData = { ...defaultFormData, label: 'My Campaign', enabled: false };
      const { rerender } = render(<AudienceModal {...defaultProps} formData={formData} />);

      expect((screen.getByLabelText('Label (Optional)')).value).toBe('My Campaign');
      expect(screen.getByLabelText('Active')).not.toBeChecked();

      rerender(<AudienceModal {...defaultProps} formData={{ ...formData, enabled: true }} />);
      expect(screen.getByLabelText('Active')).toBeChecked();
    });
  });

  describe('Dynamic Platform Fields', () => {
    test('does not show platform fields when no platform selected', () => {
      render(<AudienceModal {...defaultProps} />);

      expect(screen.queryByLabelText('Pixel ID')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Ad Tag ID')).not.toBeInTheDocument();
    });

    test('renders platform-specific fields with values', () => {
      const metaForm = { ...defaultFormData, platform: 'meta', fields: { pixelId: '123' } };
      const { rerender } = render(<AudienceModal {...defaultProps} formData={metaForm} />);

      expect(screen.getByLabelText('Pixel ID')).toBeInTheDocument();
      expect((screen.getByLabelText('Pixel ID')).value).toBe('123');

      const googleForm = { ...defaultFormData, platform: 'google', fields: { adTagId: '456' } };
      rerender(<AudienceModal {...defaultProps} formData={googleForm} />);

      expect(screen.getByLabelText('Ad Tag ID')).toBeInTheDocument();
      expect((screen.getByLabelText('Ad Tag ID')).placeholder).toBe('Enter Ad Tag ID');
    });

    test('renders multiple fields for LinkedIn', () => {
      const formData = { ...defaultFormData, platform: 'linkedin', fields: {} };
      render(<AudienceModal {...defaultProps} formData={formData} />);

      expect(screen.getByLabelText('Partner ID')).toBeInTheDocument();
      expect(screen.getByLabelText('Custom Event Code')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    test('disables save when form is invalid', () => {
      render(<AudienceModal {...defaultProps} />);
      expect(screen.getByText('Create')).toBeDisabled();
    });

    test('disables save when platform selected but fields empty', () => {
      const formData = { ...defaultFormData, platform: 'meta', fields: {} };
      render(<AudienceModal {...defaultProps} formData={formData} />);

      expect(screen.getByText('Create')).toBeDisabled();
    });

    test('enables save when all required fields filled', () => {
      const formData = { ...defaultFormData, platform: 'meta', fields: { pixelId: '123' } };
      render(<AudienceModal {...defaultProps} formData={formData} />);

      expect(screen.getByText('Create')).toBeEnabled();
    });
  });

  describe('User Interactions', () => {
    test('calls onClose when cancel clicked', async () => {
      const user = userEvent.setup();
      render(<AudienceModal {...defaultProps} />);

      await user.click(screen.getByText('Cancel'));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    test('calls onSave when save clicked with valid form', async () => {
      const user = userEvent.setup();
      const formData = { ...defaultFormData, platform: 'meta', fields: { pixelId: '123' } };
      render(<AudienceModal {...defaultProps} formData={formData} />);

      await user.click(screen.getByText('Create'));

      expect(mockOnSave).toHaveBeenCalledTimes(1);
    });

    test('calls onFormChange when fields change', async () => {
      const user = userEvent.setup();
      render(<AudienceModal {...defaultProps} />);

      await user.type(screen.getByLabelText('Label (Optional)'), 'Test');

      expect(mockOnFormChange).toHaveBeenCalled();
      expect(mockOnFormChange).toHaveBeenCalledWith({ label: expect.any(String) });
    });

    test('calls onFormChange when checkbox toggled', async () => {
      const user = userEvent.setup();
      render(<AudienceModal {...defaultProps} />);

      await user.click(screen.getByLabelText('Active'));

      expect(mockOnFormChange).toHaveBeenCalledWith({ enabled: false });
    });
  });

  describe('Platform Restrictions', () => {
    test('shows warning and disables checkbox when LinkedIn platform restricted', () => {
      const existingAudiences: ExclusionAudience[] = [
        { id: 'existing-1', platform: 'linkedin', fields: { partnerId: '123', event: 'test' }, enabled: true },
      ];
      const formData = { ...defaultFormData, platform: 'linkedin', fields: { partnerId: '456', event: 'test2' } };

      render(
        <AudienceModal
          {...defaultProps}
          allAudiences={existingAudiences}
          formData={formData}
          editingAudience={null}
        />
      );

      expect(screen.getByText(/Platform Limitation:/i)).toBeInTheDocument();
      expect(screen.getByLabelText('Active')).toBeDisabled();
    });

    test('does not show warning when editing same audience', () => {
      const audience: ExclusionAudience = {
        id: 'audience-1',
        platform: 'linkedin',
        fields: { partnerId: '123', event: 'test' },
        enabled: true,
      };
      const formData = { ...defaultFormData, platform: 'linkedin', fields: { partnerId: '123', event: 'test' } };

      render(
        <AudienceModal
          {...defaultProps}
          allAudiences={[audience]}
          editingAudience={audience}
          formData={formData}
        />
      );

      expect(screen.queryByText(/Platform Limitation:/i)).not.toBeInTheDocument();
    });

    test('does not show warning for unrestricted platforms', () => {
      const existingAudiences: ExclusionAudience[] = [
        { id: 'existing-1', platform: 'meta', fields: { pixelId: '123' }, enabled: true },
      ];
      const formData = { ...defaultFormData, platform: 'google', fields: { adTagId: '456' } };

      render(
        <AudienceModal
          {...defaultProps}
          allAudiences={existingAudiences}
          formData={formData}
        />
      );

      expect(screen.queryByText(/Platform Limitation:/i)).not.toBeInTheDocument();
    });
  });
});
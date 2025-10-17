// src/components/ui/__tests__/ConfirmModal.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmModal } from '../ConfirmModal';
import { describe, test, expect, vi, beforeEach } from 'vitest';

describe('ConfirmModal', () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  const defaultProps = {
    isOpen: true,
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    onConfirm: mockOnConfirm,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders modal when isOpen is true', () => {
    render(<ConfirmModal {...defaultProps} />);

    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
  });

  test('does not render modal when isOpen is false', () => {
    render(<ConfirmModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument();
    expect(screen.queryByText('Are you sure you want to proceed?')).not.toBeInTheDocument();
  });

  test('renders default button text', () => {
    render(<ConfirmModal {...defaultProps} />);

    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  test('renders custom button text', () => {
    render(
      <ConfirmModal
        {...defaultProps}
        confirmText="Delete"
        cancelText="Keep"
      />
    );

    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Keep')).toBeInTheDocument();
    expect(screen.queryByText('Confirm')).not.toBeInTheDocument();
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
  });

  test('calls onConfirm when confirm button is clicked', () => {
    render(<ConfirmModal {...defaultProps} />);

    fireEvent.click(screen.getByText('Confirm'));

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  test('calls onCancel when cancel button is clicked', () => {
    render(<ConfirmModal {...defaultProps} />);

    fireEvent.click(screen.getByText('Cancel'));

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  test('renders without warning icon for default variant', () => {
    render(<ConfirmModal {...defaultProps} variant="default" />);

    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
    // Should not have any AlertTriangle icons from lucide-react
    expect(document.querySelector('[data-lucide="alert-triangle"]')).not.toBeInTheDocument();
  });

  test('renders warning icon for destructive variant', () => {
    render(<ConfirmModal {...defaultProps} variant="destructive" />);

    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
    // Should have AlertTriangle icon visible for destructive variant
    // We can check for the presence of the lucide-react AlertTriangle component
    const svgElements = document.querySelectorAll('svg');
    expect(svgElements.length).toBeGreaterThan(1); // Modal close button + AlertTriangle
  });

  test('applies destructive styling for destructive variant', () => {
    render(<ConfirmModal {...defaultProps} variant="destructive" />);

    const confirmButton = screen.getByText('Confirm');
    expect(confirmButton).toHaveStyle('background-color: #d63638');
    expect(confirmButton).toHaveStyle('border-color: #d63638');
  });

  test('does not apply destructive styling for default variant', () => {
    render(<ConfirmModal {...defaultProps} variant="default" />);

    const confirmButton = screen.getByText('Confirm');
    expect(confirmButton).not.toHaveStyle('background-color: #d63638');
  });

  test('handles long messages correctly', () => {
    const longMessage = 'This is a very long confirmation message that should still be displayed properly within the modal component regardless of its length and content.';

    render(<ConfirmModal {...defaultProps} message={longMessage} />);

    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });

  test('handles empty message gracefully', () => {
    render(<ConfirmModal {...defaultProps} message="" />);

    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    // Should still render confirm/cancel buttons
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  test('supports different confirmation scenarios', () => {
    const scenarios = [
      {
        title: 'Delete Item',
        message: 'This action cannot be undone.',
        confirmText: 'Delete',
        variant: 'destructive' as const,
      },
      {
        title: 'Save Changes',
        message: 'Do you want to save your changes?',
        confirmText: 'Save',
        variant: 'default' as const,
      },
      {
        title: 'Logout',
        message: 'Are you sure you want to log out?',
        confirmText: 'Logout',
        cancelText: 'Stay',
        variant: 'default' as const,
      },
    ];

    scenarios.forEach((scenario, index) => {
      const { unmount } = render(
        <ConfirmModal
          {...defaultProps}
          title={scenario.title}
          message={scenario.message}
          confirmText={scenario.confirmText}
          cancelText={scenario.cancelText || 'Cancel'}
          variant={scenario.variant}
        />
      );

      // Use more specific queries to avoid text collision issues
      expect(screen.getByRole('dialog', { name: scenario.title })).toBeInTheDocument();
      expect(screen.getByText(scenario.message)).toBeInTheDocument();

      // Find the confirm button specifically
      const buttons = screen.getAllByRole('button');
      const confirmButton = buttons.find(button => button.textContent === scenario.confirmText);
      expect(confirmButton).toBeInTheDocument();

      unmount();
    });
  });

  test('maintains button functionality after multiple interactions', () => {
    render(<ConfirmModal {...defaultProps} />);

    // Click confirm multiple times
    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);
    fireEvent.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(2);

    // Click cancel
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).toHaveBeenCalledTimes(2);
  });

  test('modal state changes work correctly', () => {
    const { rerender } = render(<ConfirmModal {...defaultProps} isOpen={true} />);

    expect(screen.getByText('Confirm Action')).toBeInTheDocument();

    rerender(<ConfirmModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument();

    rerender(<ConfirmModal {...defaultProps} isOpen={true} />);

    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
  });

  test('handles prop updates correctly', () => {
    const { rerender } = render(<ConfirmModal {...defaultProps} />);

    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();

    // Update props
    rerender(
      <ConfirmModal
        {...defaultProps}
        title="Updated Title"
        confirmText="Updated Confirm"
        variant="destructive"
      />
    );

    expect(screen.getByText('Updated Title')).toBeInTheDocument();
    expect(screen.getByText('Updated Confirm')).toBeInTheDocument();
    expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument();
    expect(screen.queryByText('Confirm')).not.toBeInTheDocument();
  });

  test('renders with all required accessibility attributes', () => {
    render(<ConfirmModal {...defaultProps} />);

    // Modal should have proper title
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();

    // Buttons should be clickable
    const confirmButton = screen.getByText('Confirm');
    const cancelButton = screen.getByText('Cancel');

    expect(confirmButton).toBeEnabled();
    expect(cancelButton).toBeEnabled();
  });

  test('variant defaults to default when not specified', () => {
    render(<ConfirmModal {...defaultProps} />);

    const confirmButton = screen.getByText('Confirm');
    expect(confirmButton).not.toHaveStyle('background-color: #d63638');

    // Should not show AlertTriangle icon (only modal close button SVG should be present)
    const svgElements = document.querySelectorAll('svg');
    expect(svgElements.length).toBe(1); // Only modal close button
  });
});
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RetargetingProtectionListView } from '../RetargetingProtectionListView';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { ProtectedTag } from '../TagModal';

describe('RetargetingProtectionListView', () => {
  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering States', () => {
    test('shows empty state with create button', () => {
      render(<RetargetingProtectionListView protectedTags={[]} onUpdate={mockOnUpdate} />);

      expect(screen.getByText('No retargeting protection configured')).toBeInTheDocument();
      expect(screen.getByText('Add Protected Tag')).toBeInTheDocument();
    });

    test('shows list view with tags and toggle states', () => {
      const tags: ProtectedTag[] = [
        { id: '1', platform: 'google', tagId: 'G-123456', label: 'Main Site', enabled: true },
        { id: '2', platform: 'meta', tagId: '987654321', enabled: false },
      ];

      render(<RetargetingProtectionListView protectedTags={tags} onUpdate={mockOnUpdate} />);

      expect(screen.getByText('Google Ads - Main Site')).toBeInTheDocument();
      expect(screen.getByText('Meta Business')).toBeInTheDocument();
      expect(screen.getByText('Add Another Protected Tag')).toBeInTheDocument();

      const toggles = screen.getAllByRole('checkbox');
      expect(toggles[0]).toBeChecked();
      expect(toggles[1]).not.toBeChecked();
    });
  });

  describe('CRUD Operations', () => {
    test('creates new tag with form submission', async () => {
      const user = userEvent.setup();
      render(<RetargetingProtectionListView protectedTags={[]} onUpdate={mockOnUpdate} />);

      await user.click(screen.getByText('Add Protected Tag'));

      const selects = document.querySelectorAll('select');
      await user.selectOptions(selects[0], 'google');

      await waitFor(() => {
        expect(screen.getByLabelText('Tag ID')).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText('Tag ID'), 'G-123456789');
      await user.click(screen.getByRole('button', { name: 'Create' }));

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalled();
        const updated = mockOnUpdate.mock.calls[0][0];
        expect(updated[0].platform).toBe('google');
        expect(updated[0].tagId).toBe('G-123456789');
      });

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    test('edits existing tag', async () => {
      const user = userEvent.setup();
      const tags: ProtectedTag[] = [
        { id: '1', platform: 'meta', tagId: '123456', enabled: true },
      ];

      render(<RetargetingProtectionListView protectedTags={tags} onUpdate={mockOnUpdate} />);

      const menuButtons = screen.getAllByLabelText('Select a direction');
      await user.click(menuButtons[0]);
      await user.click(screen.getByText('Edit'));

      expect((screen.getByLabelText('Pixel ID')).value).toBe('123456');

      const tagInput = screen.getByLabelText('Pixel ID');
      await user.clear(tagInput);
      await user.type(tagInput, '999999999');
      await user.click(screen.getByRole('button', { name: 'Update' }));

      await waitFor(() => {
        expect(mockOnUpdate.mock.calls[0][0][0].tagId).toBe('999999999');
      });
    });
  });

  describe('Toggle Tag', () => {
    test('toggles tag on and off', async () => {
      const user = userEvent.setup();

      // Test toggling off
      const tagsOn: ProtectedTag[] = [
        { id: '1', platform: 'google', tagId: 'G-123', enabled: true },
      ];
      const { unmount } = render(<RetargetingProtectionListView protectedTags={tagsOn} onUpdate={mockOnUpdate} />);

      await user.click(screen.getByRole('checkbox'));
      expect(mockOnUpdate).toHaveBeenCalledWith([
        expect.objectContaining({ id: '1', enabled: false })
      ]);

      unmount();

      // Test toggling on
      const tagsOff: ProtectedTag[] = [
        { id: '1', platform: 'google', tagId: 'G-123', enabled: false },
      ];
      render(<RetargetingProtectionListView protectedTags={tagsOff} onUpdate={mockOnUpdate} />);

      await user.click(screen.getByRole('checkbox'));
      expect(mockOnUpdate).toHaveBeenCalledWith([
        expect.objectContaining({ id: '1', enabled: true })
      ]);
    });
  });
});

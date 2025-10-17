import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExclusionAudiencesListView } from '../ExclusionAudiencesListView';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { ExclusionAudience } from '~/schemas/settings.schema';

describe('ExclusionAudiencesListView', () => {
  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering States', () => {
    test('shows empty state with create button', () => {
      render(<ExclusionAudiencesListView audiences={[]} onUpdate={mockOnUpdate} />);

      expect(screen.getByText('No exclusion audiences configured')).toBeInTheDocument();
      expect(screen.getByText('Create Exclusion Audience')).toBeInTheDocument();
    });

    test('shows list view with audiences and toggle states', () => {
      const audiences: ExclusionAudience[] = [
        { id: '1', platform: 'meta', label: 'Campaign A', fields: { pixelId: '123' }, enabled: true },
        { id: '2', platform: 'google', fields: { adTagId: '456' }, enabled: false },
      ];

      render(<ExclusionAudiencesListView audiences={audiences} onUpdate={mockOnUpdate} />);

      expect(screen.getByText('Meta Business - Campaign A')).toBeInTheDocument();
      expect(screen.getByText('Google Ads')).toBeInTheDocument();
      expect(screen.getByText('Add Another Exclusion Audience')).toBeInTheDocument();

      const toggles = screen.getAllByRole('checkbox');
      expect(toggles[0]).toBeChecked();
      expect(toggles[1]).not.toBeChecked();
    });
  });

  describe('CRUD Operations', () => {
    test('creates new audience with form submission', async () => {
      const user = userEvent.setup();
      render(<ExclusionAudiencesListView audiences={[]} onUpdate={mockOnUpdate} />);

      await user.click(screen.getByText('Create Exclusion Audience'));

      const selects = document.querySelectorAll('select');
      await user.selectOptions(selects[0], 'meta');

      await waitFor(() => {
        expect(screen.getByLabelText('Pixel ID')).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText('Pixel ID'), '123456789');
      await user.click(screen.getByRole('button', { name: 'Create' }));

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalled();
        const updated = mockOnUpdate.mock.calls[0][0];
        expect(updated[0].platform).toBe('meta');
        expect(updated[0].fields.pixelId).toBe('123456789');
      });

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    test('edits existing audience', async () => {
      const user = userEvent.setup();
      const audiences: ExclusionAudience[] = [
        { id: '1', platform: 'meta', fields: { pixelId: '123' }, enabled: true },
      ];

      render(<ExclusionAudiencesListView audiences={audiences} onUpdate={mockOnUpdate} />);

      const menuButtons = screen.getAllByLabelText('Select a direction');
      await user.click(menuButtons[0]);
      await user.click(screen.getByText('Edit'));

      expect((screen.getByLabelText('Pixel ID')).value).toBe('123');

      const pixelInput = screen.getByLabelText('Pixel ID');
      await user.clear(pixelInput);
      await user.type(pixelInput, '999999999');
      await user.click(screen.getByRole('button', { name: 'Update' }));

      await waitFor(() => {
        expect(mockOnUpdate.mock.calls[0][0][0].fields.pixelId).toBe('999999999');
      });
    });
  });

  describe('Toggle Audience', () => {
    test('toggles audience on and off', async () => {
      const user = userEvent.setup();

      // Test toggling off
      const audiencesOn: ExclusionAudience[] = [
        { id: '1', platform: 'meta', fields: { pixelId: '123' }, enabled: true },
      ];
      const { unmount } = render(<ExclusionAudiencesListView audiences={audiencesOn} onUpdate={mockOnUpdate} />);

      await user.click(screen.getByRole('checkbox'));
      expect(mockOnUpdate).toHaveBeenCalledWith([
        expect.objectContaining({ id: '1', enabled: false })
      ]);

      unmount();

      // Test toggling on
      const audiencesOff: ExclusionAudience[] = [
        { id: '1', platform: 'meta', fields: { pixelId: '123' }, enabled: false },
      ];
      render(<ExclusionAudiencesListView audiences={audiencesOff} onUpdate={mockOnUpdate} />);

      await user.click(screen.getByRole('checkbox'));
      expect(mockOnUpdate).toHaveBeenCalledWith([
        expect.objectContaining({ id: '1', enabled: true })
      ]);
    });
  });

  describe('Platform Conflicts', () => {
    test('shows conflict modal and switches LinkedIn audiences', async () => {
      const user = userEvent.setup();
      const audiences: ExclusionAudience[] = [
        { id: '1', platform: 'linkedin', fields: { partnerId: '123', event: 'test' }, enabled: true },
        { id: '2', platform: 'linkedin', fields: { partnerId: '456', event: 'test2' }, enabled: false },
      ];

      render(<ExclusionAudiencesListView audiences={audiences} onUpdate={mockOnUpdate} />);

      const toggles = screen.getAllByRole('checkbox');
      await user.click(toggles[1]);

      await waitFor(() => {
        expect(screen.getByText('Platform Conflict')).toBeInTheDocument();
        expect(screen.getByText(/cannot be activated/i)).toBeInTheDocument();
      });

      await user.click(screen.getByText('Switch Active Audience'));

      expect(mockOnUpdate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: '1', enabled: false }),
          expect.objectContaining({ id: '2', enabled: true }),
        ])
      );
    });

    test('allows activating unrestricted platforms without conflicts', async () => {
      const user = userEvent.setup();
      const audiences: ExclusionAudience[] = [
        { id: '1', platform: 'meta', fields: { pixelId: '123' }, enabled: true },
        { id: '2', platform: 'meta', fields: { pixelId: '456' }, enabled: false },
      ];

      render(<ExclusionAudiencesListView audiences={audiences} onUpdate={mockOnUpdate} />);

      const toggles = screen.getAllByRole('checkbox');
      await user.click(toggles[1]);

      expect(mockOnUpdate).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ id: '2', enabled: true })])
      );
      expect(screen.queryByText('Platform Conflict')).not.toBeInTheDocument();
    });
  });
});
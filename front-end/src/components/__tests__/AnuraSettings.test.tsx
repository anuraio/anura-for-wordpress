import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import { AnuraSettingsPage } from '../AnuraSettings';
import * as anuraApiService from '../../services/anura-api.service';
import { getDefaultUISettings } from '../../schemas/settings.schema';

// Mock the API service
vi.mock('../../services/anura-api.service', () => ({
  getSettings: vi.fn(),
  saveSettings: vi.fn(),
}));

describe('AnuraSettingsPage', () => {
  const mockGetSettings = anuraApiService.getSettings as Mock;
  const mockSaveSettings = anuraApiService.saveSettings as Mock;
  const defaultSettings = getDefaultUISettings();

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSettings.mockResolvedValue(defaultSettings);
    mockSaveSettings.mockResolvedValue(undefined);
  });

  describe('Component Rendering', () => {
    it('shows loading state initially', () => {
      render(<AnuraSettingsPage />);

      expect(screen.getByText('Loading settings...')).toBeInTheDocument();
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('renders main UI elements after loading', async () => {
      render(<AnuraSettingsPage />);

      await waitFor(() => {
        // Header elements
        expect(screen.getByText('Anura For WordPress')).toBeInTheDocument();

        // Tab options
        expect(screen.getByText('Setup')).toBeInTheDocument();
        expect(screen.getByText('Real-Time Actions')).toBeInTheDocument();
        expect(screen.getByText('Search & Social Protection')).toBeInTheDocument();
        expect(screen.getByText('Advanced')).toBeInTheDocument();

        // Action buttons
        expect(screen.getByRole('button', { name: /reset to defaults/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
      });
    });
  });

  describe('Hook Integration', () => {
    it('loads and populates settings from API on mount', async () => {
      const customSettings = {
        ...defaultSettings,
        instanceId: '12345',
      };
      mockGetSettings.mockResolvedValue(customSettings);

      render(<AnuraSettingsPage />);

      // Verify API call was made
      await waitFor(() => {
        expect(mockGetSettings).toHaveBeenCalledTimes(1);
      });

      // Verify form is populated with loaded settings
      await waitFor(() => {
        const input = screen.getByPlaceholderText('Enter Instance ID');
        expect(input.value).toBe('12345');
      });
    });

    it('displays error when settings fail to load', async () => {
      const errorMessage = 'Failed to load settings';
      mockGetSettings.mockRejectedValue(new Error(errorMessage));

      render(<AnuraSettingsPage />);

      // Loading should complete and show the main form (even with error)
      await waitFor(() => {
        expect(screen.queryByText('Loading settings...')).not.toBeInTheDocument();
        expect(screen.getByText('Anura For WordPress')).toBeInTheDocument();
      });

      // Error should appear in the Notice component
      await waitFor(() => {
        const noticeContent = document.querySelector('.components-notice__content');
        expect(noticeContent).toHaveTextContent(errorMessage);
      });
    });
  });

  describe('Tab Navigation', () => {
    it('shows basic settings tab by default', async () => {
      render(<AnuraSettingsPage />);

      await waitFor(() => {
        expect(screen.getByText('Anura Script Integration')).toBeInTheDocument();
        expect(screen.getByText('Instance ID')).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('successfully saves settings when form is submitted', async () => {
      const user = userEvent.setup();
      render(<AnuraSettingsPage />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter Instance ID')).toBeInTheDocument();
      });

      // Modify a field to make form dirty
      const input = screen.getByPlaceholderText('Enter Instance ID');
      await user.clear(input);
      await user.type(input, '54321');

      // Submit form
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      // Verify save was called (saving happens too fast to catch disabled state reliably)
      // Just check that the save process initiated

      // Wait for save to complete
      await waitFor(() => {
        expect(mockSaveSettings).toHaveBeenCalledWith(
          expect.objectContaining({
            instanceId: '54321',
          })
        );
      });

      // Verify success message appears in Notice component
      await waitFor(() => {
        const noticeContent = document.querySelector('.components-notice__content');
        expect(noticeContent).toHaveTextContent('Settings saved successfully!');
      });
    });

    it('shows error message when save fails', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Save failed';
      mockSaveSettings.mockRejectedValue(new Error(errorMessage));

      render(<AnuraSettingsPage />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter Instance ID')).toBeInTheDocument();
      });

      // Modify form and submit
      const input = screen.getByPlaceholderText('Enter Instance ID');
      await user.clear(input);
      await user.type(input, '54321');

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      await waitFor(() => {
        // Look for the error notice in Notice component
        const noticeContent = document.querySelector('.components-notice__content');
        expect(noticeContent).toHaveTextContent(errorMessage);
      });
    });

    it('disables buttons during save operation', async () => {
      const user = userEvent.setup();
      // Make save take some time
      mockSaveSettings.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<AnuraSettingsPage />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter Instance ID')).toBeInTheDocument();
      });

      // Modify form and submit
      const input = screen.getByPlaceholderText('Enter Instance ID');
      await user.clear(input);
      await user.type(input, '54321');

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      const resetButton = screen.getByRole('button', { name: /reset to defaults/i });

      await user.click(saveButton);

      // Check buttons are disabled during save
      expect(saveButton).toBeDisabled();
      expect(resetButton).toBeDisabled();

      // Wait for save to complete
      await waitFor(() => {
        expect(saveButton).not.toBeDisabled();
        expect(resetButton).not.toBeDisabled();
      });
    });
  });

  describe('Reset Functionality', () => {
    it('shows confirmation modal when reset is clicked', async () => {
      const user = userEvent.setup();
      render(<AnuraSettingsPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /reset to defaults/i })).toBeInTheDocument();
      });

      const resetButton = screen.getByRole('button', { name: /reset to defaults/i });
      await user.click(resetButton);

      expect(screen.getByText('Reset Settings')).toBeInTheDocument();
      expect(screen.getByText(/Reset all settings to defaults/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    });

    it('resets form when confirmed', async () => {
      const user = userEvent.setup();
      render(<AnuraSettingsPage />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter Instance ID')).toBeInTheDocument();
      });

      // Modify a field
      const input = screen.getByPlaceholderText('Enter Instance ID');
      await user.clear(input);
      await user.type(input, '54321');
      expect(input).toHaveValue('54321');

      // Reset
      const resetButton = screen.getByRole('button', { name: /reset to defaults/i });
      await user.click(resetButton);

      const confirmButton = screen.getByRole('button', { name: /reset/i });
      await user.click(confirmButton);

      // Wait for reset to complete
      await waitFor(() => {
        expect(input).toHaveValue(defaultSettings.instanceId);
      });
    });

    it('cancels reset when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<AnuraSettingsPage />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter Instance ID')).toBeInTheDocument();
      });

      // Modify a field
      const input = screen.getByPlaceholderText('Enter Instance ID');
      await user.clear(input);
      await user.type(input, '54321');

      // Try to reset but cancel
      const resetButton = screen.getByRole('button', { name: /reset to defaults/i });
      await user.click(resetButton);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // Value should remain changed
      expect(input).toHaveValue('54321');
      expect(screen.queryByText('Reset Settings')).not.toBeInTheDocument();
    });
  });

  describe('Dirty State Management', () => {
    it('shows unsaved changes message when form is dirty', async () => {
      const user = userEvent.setup();
      render(<AnuraSettingsPage />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter Instance ID')).toBeInTheDocument();
      });

      // Initially no unsaved changes message
      expect(screen.queryByText('You have unsaved changes')).not.toBeInTheDocument();

      // Modify a field
      const input = screen.getByPlaceholderText('Enter Instance ID');
      await user.clear(input);
      await user.type(input, '54321');

      // Should show unsaved changes message
      expect(screen.getByText('You have unsaved changes')).toBeInTheDocument();
    });

    it('clears dirty state after successful save', async () => {
      const user = userEvent.setup();
      render(<AnuraSettingsPage />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter Instance ID')).toBeInTheDocument();
      });

      // Modify and save
      const input = screen.getByPlaceholderText('Enter Instance ID');
      await user.clear(input);
      await user.type(input, '54321');

      expect(screen.getByText('You have unsaved changes')).toBeInTheDocument();

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.queryByText('You have unsaved changes')).not.toBeInTheDocument();
      });
    });
  });
});
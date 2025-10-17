import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import { useForm, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SetupSettings } from '../SetupSettings';
import { UISettings, UISettingsSchema, getDefaultUISettings } from '../../../schemas/settings.schema';

// Mock BotDetectionSection since we're focusing on BasicSettings integration
vi.mock('../bots/BotDetectionSection', () => ({
  BotDetectionSection: ({ bots, enabledCount, onUpdateBots }: any) => (
    <div data-testid="bot-detection-section">
      <span data-testid="enabled-count">{enabledCount}</span>
      <button
        data-testid="update-bots"
        onClick={() => onUpdateBots([...bots, { id: 'new', enabled: true }])}
      >
        Update Bots
      </button>
    </div>
  )
}));

// Test wrapper component that provides form context
function TestWrapper({ children, initialSettings = getDefaultUISettings() }: {
  children: React.ReactElement<any>;
  initialSettings?: UISettings;
}) {
  const form = useForm<UISettings>({
    resolver: zodResolver(UISettingsSchema) as any,
    defaultValues: initialSettings,
    mode: "onBlur",
  });

  const settings = form.watch();
  const errors = form.formState.errors;

  return (
    <div>
      {React.cloneElement(children, { form, settings, errors })}
    </div>
  );
}

describe('BasicSettings Integration', () => {
  const defaultSettings = getDefaultUISettings();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders all basic form fields with default values', () => {
      render(
        <TestWrapper>
          <SetupSettings form={undefined as any} settings={undefined as any} errors={undefined as any} />
        </TestWrapper>
      );

      // Check main title and subtitle
      expect(screen.getByText('Anura Script Integration')).toBeInTheDocument();
      expect(screen.getByText('Get started with integrating Anura Script on your WordPress site')).toBeInTheDocument();

      // Check Instance ID field
      expect(screen.getByText('Instance ID')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter Instance ID')).toBeInTheDocument();

      // Check dropdowns
      expect(screen.getByText('Source Method')).toBeInTheDocument();
      expect(screen.getByText('Campaign Method')).toBeInTheDocument();

      // Check bot toggle
      expect(screen.getByText('Ignore Common Bots and Crawlers')).toBeInTheDocument();
    });

    it('shows initial Instance ID value from settings', () => {
      const customSettings = { ...defaultSettings, instanceId: '12345' };

      render(
        <TestWrapper initialSettings={customSettings}>
          <SetupSettings form={undefined as any} settings={undefined as any} errors={undefined as any} />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText('Enter Instance ID');
      expect(input.value).toBe('12345');
    });

    it('displays correct bot count in toggle help text', () => {
      const customSettings = {
        ...defaultSettings,
        botWhitelist: [
          { id: '1', name: 'Bot 1', enabled: true, isCustom: false, pattern: '', type: 'userAgent' as const },
          { id: '2', name: 'Bot 2', enabled: false, isCustom: false, pattern: '', type: 'userAgent' as const },
          { id: '3', name: 'Bot 3', enabled: true, isCustom: false, pattern: '', type: 'userAgent' as const }
        ]
      };

      render(
        <TestWrapper initialSettings={customSettings}>
          <SetupSettings form={undefined as any} settings={undefined as any} errors={undefined as any} />
        </TestWrapper>
      );

      expect(screen.getByText(/2 active/)).toBeInTheDocument();
    });
  });

  describe('Form Field Interactions', () => {
    it('updates Instance ID when user types', async () => {
      const user = userEvent.setup();
      let capturedFormData: any = null;

      const TestComponent = () => {
        const form = useForm<UISettings>({
          resolver: zodResolver(UISettingsSchema) as any,
          defaultValues: defaultSettings,
          mode: "onBlur",
        });

        // Capture form changes
        React.useEffect(() => {
          const subscription = form.watch((data) => {
            capturedFormData = data;
          });
          return () => subscription.unsubscribe();
        }, [form]);

        const settings = form.watch();
        const errors = form.formState.errors;

        return <SetupSettings form={form} settings={settings} errors={errors} />;
      };

      render(<TestComponent />);

      const input = screen.getByPlaceholderText('Enter Instance ID');
      await user.clear(input);
      await user.type(input, '54321');

      await waitFor(() => {
        expect(capturedFormData?.instanceId).toBe('54321');
      });
    });

    it('updates source method selection', async () => {
      const user = userEvent.setup();
      let capturedFormData: any = null;

      const TestComponent = () => {
        const form = useForm<UISettings>({
          resolver: zodResolver(UISettingsSchema) as any,
          defaultValues: defaultSettings,
          mode: "onBlur",
        });

        React.useEffect(() => {
          const subscription = form.watch((data) => {
            capturedFormData = data;
          });
          return () => subscription.unsubscribe();
        }, [form]);

        const settings = form.watch();
        const errors = form.formState.errors;

        return <SetupSettings form={form} settings={settings} errors={errors} />;
      };

      render(<TestComponent />);

      // Get the first select element (Source Method) by finding its parent with the label
      const sourceMethodSection = screen.getByText('Source Method').closest('.mb-4') || screen.getByText('Source Method').closest('div');
      const sourceSelect = sourceMethodSection?.querySelector('select') as HTMLSelectElement;

      await user.selectOptions(sourceSelect, 'get');

      await waitFor(() => {
        expect(capturedFormData?.sourceMethod).toBe('get');
      });
    });

    it('toggles bot detection and shows BotDetectionSection', async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const form = useForm<UISettings>({
          resolver: zodResolver(UISettingsSchema) as any,
          defaultValues: defaultSettings,
          mode: "onBlur",
        });

        const settings = form.watch();
        const errors = form.formState.errors;

        return <SetupSettings form={form} settings={settings} errors={errors} />;
      };

      render(<TestComponent />);

      // Initially bot detection should be off
      expect(screen.queryByTestId('bot-detection-section')).not.toBeInTheDocument();

      // Toggle bot detection on
      const toggle = screen.getByRole('checkbox', { name: /ignore common bots/i });
      await user.click(toggle);

      // Should now show bot detection section
      await waitFor(() => {
        expect(screen.getByTestId('bot-detection-section')).toBeInTheDocument();
      });
    });
  });

  describe('Conditional Field Display', () => {
    it('shows correct label for hard coded source method', () => {
      const customSettings = { ...defaultSettings, sourceMethod: 'hardCoded' as const };
      const mockForm = { setValue: vi.fn() } as any;
      const emptyErrors: FieldErrors<UISettings> = {};

      render(
        <SetupSettings form={mockForm} settings={customSettings} errors={emptyErrors} />
      );

      expect(screen.getByText('Source Value')).toBeInTheDocument();
    });

    it('shows campaign value field when campaign method is not "none"', () => {
      const customSettings = { ...defaultSettings, campaignMethod: 'post' as const };
      const mockForm = { setValue: vi.fn() } as any;
      const emptyErrors: FieldErrors<UISettings> = {};

      render(
        <SetupSettings form={mockForm} settings={customSettings} errors={emptyErrors} />
      );

      expect(screen.getByText('Campaign Variable')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g., utm_campaign')).toBeInTheDocument();
    });
  });

  describe('Error Display Integration', () => {
    it('displays validation errors for Instance ID', () => {
      const errors: FieldErrors<UISettings> = {
        instanceId: { message: 'Instance ID is required', type: 'required' }
      };
      const mockForm = { setValue: vi.fn() } as any;

      render(
        <SetupSettings form={mockForm} settings={defaultSettings} errors={errors} />
      );

      expect(screen.getByText('Instance ID is required')).toBeInTheDocument();
    });

    it('displays validation errors for source fields', () => {
      const errors: FieldErrors<UISettings> = {
        sourceMethod: { message: 'Source method is invalid', type: 'invalid' },
        sourceValue: { message: 'Source value is too long', type: 'maxLength' }
      };
      const mockForm = { setValue: vi.fn() } as any;
      // Use settings where source method is not "none" so source value field is rendered
      const settingsWithSourceMethod = { ...defaultSettings, sourceMethod: 'get' as const };

      render(
        <SetupSettings form={mockForm} settings={settingsWithSourceMethod} errors={errors} />
      );

      expect(screen.getByText('Source method is invalid')).toBeInTheDocument();
      expect(screen.getByText('Source value is too long')).toBeInTheDocument();
    });
  });

  describe('Bot Management Integration', () => {
    it('auto-enables predefined bots when bot detection is first enabled', async () => {
      const user = userEvent.setup();
      let capturedFormData: any = null;

      const TestComponent = () => {
        const form = useForm<UISettings>({
          resolver: zodResolver(UISettingsSchema) as any,
          defaultValues: {
            ...defaultSettings,
            botWhitelist: [
              { id: '1', name: 'Predefined Bot', enabled: false, isCustom: false, pattern: '', type: 'userAgent' as const },
              { id: '2', name: 'Custom Bot', enabled: false, isCustom: true, pattern: '', type: 'userAgent' as const }
            ]
          },
          mode: "onBlur",
        });

        React.useEffect(() => {
          const subscription = form.watch((data) => {
            capturedFormData = data;
          });
          return () => subscription.unsubscribe();
        }, [form]);

        const settings = form.watch();
        const errors = form.formState.errors;

        return <SetupSettings form={form} settings={settings} errors={errors} />;
      };

      render(<TestComponent />);

      // Toggle bot detection on
      const toggle = screen.getByRole('checkbox', { name: /ignore common bots/i });
      await user.click(toggle);

      await waitFor(() => {
        // Should have enabled predefined bots but not custom ones
        const predefinedBot = capturedFormData?.botWhitelist.find((bot: any) => bot.id === '1');
        const customBot = capturedFormData?.botWhitelist.find((bot: any) => bot.id === '2');

        expect(predefinedBot?.enabled).toBe(true);
        expect(customBot?.enabled).toBe(false);
      });
    });

    it('integrates with BotDetectionSection for bot updates', async () => {
      const user = userEvent.setup();
      let capturedFormData: any = null;

      const TestComponent = () => {
        const form = useForm<UISettings>({
          resolver: zodResolver(UISettingsSchema) as any,
          defaultValues: { ...defaultSettings, ignoreBots: true },
          mode: "onBlur",
        });

        React.useEffect(() => {
          const subscription = form.watch((data) => {
            capturedFormData = data;
          });
          return () => subscription.unsubscribe();
        }, [form]);

        const settings = form.watch();
        const errors = form.formState.errors;

        return <SetupSettings form={form} settings={settings} errors={errors} />;
      };

      render(<TestComponent />);

      // Should show bot detection section
      const updateButton = screen.getByTestId('update-bots');
      await user.click(updateButton);

      await waitFor(() => {
        // Should have added a new bot
        expect(capturedFormData?.botWhitelist.length).toBeGreaterThan(defaultSettings.botWhitelist.length);
      });
    });
  });
});
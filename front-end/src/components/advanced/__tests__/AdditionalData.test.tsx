import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdditionalData } from '../AdditionalData';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { useForm } from 'react-hook-form';
import { UISettings, getDefaultUISettings } from '~/schemas/settings.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { UISettingsSchema } from '~/schemas/settings.schema';

// Test wrapper component that provides form context
function TestWrapper({ children, initialSettings = getDefaultUISettings() }: {
  children: React.ReactElement<any>;
  initialSettings?: Partial<UISettings>;
}) {
  const form = useForm<UISettings>({
    resolver: zodResolver(UISettingsSchema) as any,
    defaultValues: { ...getDefaultUISettings(), ...initialSettings },
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

describe('AdditionalData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders card with title and description', () => {
      const { container } = render(
        <TestWrapper>
          <AdditionalData form={undefined as any} settings={undefined as any} errors={undefined as any} />
        </TestWrapper>
      );

      expect(screen.getByText('Additional Data')).toBeInTheDocument();
      expect(screen.getByText('Configure additional data parameters to send with requests')).toBeInTheDocument();
      expect(container.textContent).toContain('Additional Data gives you the ability');
    });

    test('renders exactly 10 parameter slots', () => {
      render(
        <TestWrapper>
          <AdditionalData form={undefined as any} settings={undefined as any} errors={undefined as any} />
        </TestWrapper>
      );

      // Check for numbered keys 1-10
      for (let i = 1; i <= 10; i++) {
        expect(screen.getByText(i.toString())).toBeInTheDocument();
      }

      // Verify table headers
      expect(screen.getByText('Key')).toBeInTheDocument();
      expect(screen.getByText('Method')).toBeInTheDocument();
      expect(screen.getByText('Value')).toBeInTheDocument();
    });

    test('shows default statistics for empty state', () => {
      const { container } = render(
        <TestWrapper>
          <AdditionalData form={undefined as any} settings={undefined as any} errors={undefined as any} />
        </TestWrapper>
      );

      expect(container.textContent).toContain('of 10 parameters configured');
    });
  });

  describe('Method Selection', () => {
    test('all slots default to GET method', () => {
      render(
        <TestWrapper>
          <AdditionalData form={undefined as any} settings={undefined as any} errors={undefined as any} />
        </TestWrapper>
      );

      const selects = screen.getAllByRole('combobox');
      expect(selects).toHaveLength(10);

      selects.forEach(select => {
        expect(select).toHaveValue('get');
      });
    });

    test('changes method from GET to POST', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AdditionalData form={undefined as any} settings={undefined as any} errors={undefined as any} />
        </TestWrapper>
      );

      const firstSelect = screen.getAllByRole('combobox')[0];
      await user.selectOptions(firstSelect, 'post');

      expect(firstSelect).toHaveValue('post');
    });

    test('changes method to hardCoded', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AdditionalData form={undefined as any} settings={undefined as any} errors={undefined as any} />
        </TestWrapper>
      );

      const firstSelect = screen.getAllByRole('combobox')[0];
      await user.selectOptions(firstSelect, 'hardCoded');

      expect(firstSelect).toHaveValue('hardCoded');
    });
  });

  describe('Value Input', () => {
    test('updates value when typing', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AdditionalData form={undefined as any} settings={undefined as any} errors={undefined as any} />
        </TestWrapper>
      );

      const inputs = screen.getAllByRole('textbox');
      await user.type(inputs[0], 'test_value');

      expect(inputs[0]).toHaveValue('test_value');
    });

    test('shows correct placeholder for GET method', () => {
      render(
        <TestWrapper>
          <AdditionalData form={undefined as any} settings={undefined as any} errors={undefined as any} />
        </TestWrapper>
      );

      const firstInput = screen.getAllByRole('textbox')[0];
      expect(firstInput).toHaveAttribute('placeholder', 'Enter GET parameter 1');
    });

    test('updates placeholder when method changes to POST', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AdditionalData form={undefined as any} settings={undefined as any} errors={undefined as any} />
        </TestWrapper>
      );

      const firstSelect = screen.getAllByRole('combobox')[0];
      await user.selectOptions(firstSelect, 'post');

      const firstInput = screen.getAllByRole('textbox')[0];
      expect(firstInput).toHaveAttribute('placeholder', 'Enter POST parameter 1');
    });

    test('updates placeholder when method changes to hardCoded', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AdditionalData form={undefined as any} settings={undefined as any} errors={undefined as any} />
        </TestWrapper>
      );

      const firstSelect = screen.getAllByRole('combobox')[0];
      await user.selectOptions(firstSelect, 'hardCoded');

      const firstInput = screen.getAllByRole('textbox')[0];
      expect(firstInput).toHaveAttribute('placeholder', 'Enter static value 1');
    });
  });

  describe('Statistics', () => {
    test('updates count when parameters are filled', async () => {
      const user = userEvent.setup();

      const { container } = render(
        <TestWrapper>
          <AdditionalData form={undefined as any} settings={undefined as any} errors={undefined as any} />
        </TestWrapper>
      );

      const inputs = screen.getAllByRole('textbox');

      await user.type(inputs[0], 'value1');
      await waitFor(() => {
        expect(container.textContent).toContain('1');
        expect(container.textContent).toContain('of 10 parameters configured');
      });
    });

    test('shows valid count when parameters are filled without errors', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AdditionalData form={undefined as any} settings={undefined as any} errors={undefined as any} />
        </TestWrapper>
      );

      const inputs = screen.getAllByRole('textbox');
      await user.type(inputs[0], 'valid_value');

      await waitFor(() => {
        expect(screen.getByText(/1 valid/i)).toBeInTheDocument();
      });
    });

    test('shows info message when parameters are configured', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AdditionalData form={undefined as any} settings={undefined as any} errors={undefined as any} />
        </TestWrapper>
      );

      const inputs = screen.getAllByRole('textbox');
      await user.type(inputs[0], 'test');

      await waitFor(() => {
        expect(screen.getByText(/Parameters will be sent as key-value pairs/i)).toBeInTheDocument();
      });
    });
  });

  describe('Pre-filled Values', () => {
    test('renders with pre-filled values from settings', () => {
      const initialSettings = {
        additionalData: [
          { method: 'get' as const, value: 'utm_source' },
          { method: 'post' as const, value: 'form_data' },
          { method: 'hardCoded' as const, value: 'static_value' },
        ]
      };

      render(
        <TestWrapper initialSettings={initialSettings}>
          <AdditionalData form={undefined as any} settings={undefined as any} errors={undefined as any} />
        </TestWrapper>
      );

      const inputs = screen.getAllByRole('textbox');
      expect(inputs[0]).toHaveValue('utm_source');
      expect(inputs[1]).toHaveValue('form_data');
      expect(inputs[2]).toHaveValue('static_value');

      const selects = screen.getAllByRole('combobox');
      expect(selects[0]).toHaveValue('get');
      expect(selects[1]).toHaveValue('post');
      expect(selects[2]).toHaveValue('hardCoded');
    });

    test('shows correct statistics for pre-filled values', () => {
      const initialSettings = {
        additionalData: [
          { method: 'get' as const, value: 'param1' },
          { method: 'post' as const, value: 'param2' },
        ]
      };

      const { container } = render(
        <TestWrapper initialSettings={initialSettings}>
          <AdditionalData form={undefined as any} settings={undefined as any} errors={undefined as any} />
        </TestWrapper>
      );

      expect(container.textContent).toContain('2');
      expect(container.textContent).toContain('of 10 parameters configured');
    });
  });

  describe('Multiple Slots', () => {
    test('allows filling multiple slots independently', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AdditionalData form={undefined as any} settings={undefined as any} errors={undefined as any} />
        </TestWrapper>
      );

      const inputs = screen.getAllByRole('textbox');
      const selects = screen.getAllByRole('combobox');

      // Fill slot 1
      await user.type(inputs[0], 'value1');
      await user.selectOptions(selects[0], 'get');

      // Fill slot 5
      await user.type(inputs[4], 'value5');
      await user.selectOptions(selects[4], 'post');

      // Fill slot 10
      await user.type(inputs[9], 'value10');
      await user.selectOptions(selects[9], 'hardCoded');

      expect(inputs[0]).toHaveValue('value1');
      expect(inputs[4]).toHaveValue('value5');
      expect(inputs[9]).toHaveValue('value10');

      expect(selects[0]).toHaveValue('get');
      expect(selects[4]).toHaveValue('post');
      expect(selects[9]).toHaveValue('hardCoded');
    });

    test('updates statistics correctly with non-sequential fills', async () => {
      const user = userEvent.setup();

      const { container } = render(
        <TestWrapper>
          <AdditionalData form={undefined as any} settings={undefined as any} errors={undefined as any} />
        </TestWrapper>
      );

      const inputs = screen.getAllByRole('textbox');

      await user.type(inputs[0], 'first');
      await user.type(inputs[5], 'sixth');
      await user.type(inputs[9], 'tenth');

      await waitFor(() => {
        expect(container.textContent).toContain('3');
        expect(container.textContent).toContain('of 10 parameters configured');
      });
    });
  });

  describe('Empty Value Handling', () => {
    test('renders correctly with empty initial state', () => {
      const { container } = render(
        <TestWrapper>
          <AdditionalData form={undefined as any} settings={undefined as any} errors={undefined as any} />
        </TestWrapper>
      );

      // All inputs should be empty
      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        expect(input).toHaveValue('');
      });

      // Should show 0 configured
      expect(container.textContent).toContain('of 10 parameters configured');
    });
  });
});
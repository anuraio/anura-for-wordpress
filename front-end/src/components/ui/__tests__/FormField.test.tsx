// src/components/ui/__tests__/FormField.test.tsx
import { render, screen } from '@testing-library/react';
import { FormField } from '../FormField';
import { describe, test, expect } from 'vitest';

describe('FormField', () => {
  test('renders label and children', () => {
    render(
      <FormField label="Email Address">
        <input type="email" placeholder="Enter email" />
      </FormField>
    );

    expect(screen.getByText('Email Address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
  });

  test('renders required asterisk when required prop is true', () => {
    render(
      <FormField label="Password" required>
        <input type="password" />
      </FormField>
    );

    expect(screen.getByText('Password')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  test('does not render asterisk when required is false', () => {
    render(
      <FormField label="Optional Field" required={false}>
        <input type="text" />
      </FormField>
    );

    expect(screen.getByText('Optional Field')).toBeInTheDocument();
    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });

  test('renders error message when error is provided', () => {
    render(
      <FormField label="Username" error="Username is required">
        <input type="text" />
      </FormField>
    );

    expect(screen.getByText('Username is required')).toBeInTheDocument();
  });

  test('renders help text when no error is present', () => {
    render(
      <FormField label="Username" helpText="Must be at least 3 characters">
        <input type="text" />
      </FormField>
    );

    expect(screen.getByText('Must be at least 3 characters')).toBeInTheDocument();
  });

  test('shows error instead of help text when both are provided', () => {
    render(
      <FormField 
        label="Username" 
        error="Username is taken"
        helpText="Must be at least 3 characters"
      >
        <input type="text" />
      </FormField>
    );

    expect(screen.getByText('Username is taken')).toBeInTheDocument();
    expect(screen.queryByText('Must be at least 3 characters')).not.toBeInTheDocument();
  });

  test('renders neither error nor help text when neither is provided', () => {
    const { container } = render(
      <FormField label="Simple Field">
        <input type="text" />
      </FormField>
    );

    // Check that no paragraphs with error/help text exist
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs).toHaveLength(0);
  });
});
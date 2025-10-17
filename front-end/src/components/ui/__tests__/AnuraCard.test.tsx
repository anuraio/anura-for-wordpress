import { render, screen } from '@testing-library/react';
import { AnuraCard } from '../AnuraCard';
import { describe, test, expect, vi } from 'vitest';

// Using real WordPress components with React 18

describe('AnuraCard', () => {
  test('renders children content', () => {
    render(
      <AnuraCard>
        <p>Test content</p>
      </AnuraCard>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  test('renders without header when no header props provided', () => {
    render(
      <AnuraCard>
        <p>Content only</p>
      </AnuraCard>
    );

    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
    expect(screen.getByText('Content only')).toBeInTheDocument();
  });

  test('renders header with title only', () => {
    render(
      <AnuraCard title="Test Title">
        <p>Content</p>
      </AnuraCard>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  test('renders header with subtitle only', () => {
    render(
      <AnuraCard subtitle="Test subtitle">
        <p>Content</p>
      </AnuraCard>
    );

    expect(screen.getByText('Test subtitle')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  test('renders header with icon only', () => {
    const TestIcon = () => <span data-testid="test-icon">📊</span>;
    
    render(
      <AnuraCard icon={<TestIcon />}>
        <p>Content</p>
      </AnuraCard>
    );

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  test('renders complete header with all props', () => {
    const TestIcon = () => <span data-testid="complete-icon">⚙️</span>;
    
    render(
      <AnuraCard 
        title="Complete Title" 
        subtitle="Complete subtitle" 
        icon={<TestIcon />}
      >
        <p>Complete content</p>
      </AnuraCard>
    );

    expect(screen.getByText('Complete Title')).toBeInTheDocument();
    expect(screen.getByText('Complete subtitle')).toBeInTheDocument();
    expect(screen.getByTestId('complete-icon')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  test('applies custom className', () => {
    const { container } = render(
      <AnuraCard className="custom-class">
        <p>Content</p>
      </AnuraCard>
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  test('applies default className', () => {
    const { container } = render(
      <AnuraCard>
        <p>Content</p>
      </AnuraCard>
    );

    expect(container.firstChild).toHaveClass('mb-6');
  });

  test('content has correct CSS class with header', () => {
    render(
      <AnuraCard title="With Header">
        <div data-testid="content">Content</div>
      </AnuraCard>
    );

    const content = screen.getByTestId('content').parentElement;
    expect(content).toHaveClass('anura-card-content', 'has-header');
  });

  test('content has correct CSS class without header', () => {
    render(
      <AnuraCard>
        <div data-testid="content">Content</div>
      </AnuraCard>
    );

    const content = screen.getByTestId('content').parentElement;
    expect(content).toHaveClass('anura-card-content', 'no-header');
  });

  test('header has correct structure and CSS classes', () => {
    const TestIcon = () => <span data-testid="structure-icon">🎯</span>;
    
    render(
      <AnuraCard title="Structured Title" subtitle="Structured subtitle" icon={<TestIcon />}>
        <p>Content</p>
      </AnuraCard>
    );

    // Check header structure
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('anura-card-header');
    
    // Check title element and class
    const title = screen.getByRole('heading', { level: 3 });
    expect(title).toHaveTextContent('Structured Title');
    expect(title).toHaveClass('anura-card-title');
    
    // Check subtitle styling
    const subtitle = screen.getByText('Structured subtitle');
    expect(subtitle).toHaveClass('anura-card-subtitle');

    // Check icon container
    const icon = screen.getByTestId('structure-icon');
    expect(icon.parentElement).toHaveClass('anura-card-icon');
  });

  describe('edge cases', () => {
    test('handles empty string props', () => {
      render(
        <AnuraCard title="" subtitle="">
          <p>Empty strings</p>
        </AnuraCard>
      );

      // Empty strings should not trigger header
      expect(screen.queryByRole('banner')).not.toBeInTheDocument();
    });

    test('handles whitespace-only props', () => {
      render(
        <AnuraCard title="   " subtitle="   ">
          <p>Whitespace content</p>
        </AnuraCard>
      );

      // Whitespace should still show header (truthy values)
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    test('renders with mixed empty and valid props', () => {
      render(
        <AnuraCard title="Valid Title" subtitle="">
          <p>Mixed props</p>
        </AnuraCard>
      );

      expect(screen.getByText('Valid Title')).toBeInTheDocument();
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });
  });
});
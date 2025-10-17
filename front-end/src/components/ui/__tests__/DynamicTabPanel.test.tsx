// src/components/ui/__tests__/DynamicTabPanel.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { DynamicTabPanel } from '../DynamicTabPanel';
import { describe, test, expect, vi, beforeEach } from 'vitest';

// Mock WordPress components
interface MockTabPanelProps {
  tabs: Array<{ name: string; title: React.ReactNode; className?: string }>;
  children: (tab: { name: string; title: string }) => React.ReactNode;
  className?: string;
  activeClass?: string;
  onSelect?: (tabName: string) => void;
}

vi.mock('@wordpress/components', () => ({
  TabPanel: ({ tabs, children, className, activeClass, onSelect }: MockTabPanelProps) => {
    return (
      <div className={className} data-testid="tab-panel">
        <div className="tab-list">
          {tabs.map((tab, index: number) => (
            <button
              key={tab.name}
              className={`tab ${tab.className || ''} ${index === 0 ? activeClass : ''}`}
              onClick={() => onSelect?.(tab.name)}
              data-testid={`tab-${tab.name}`}
            >
              {tab.title}
            </button>
          ))}
        </div>
        <div className="tab-content">
          {children({ name: tabs[0]?.name, title: 'First Tab' })}
        </div>
      </div>
    );
  },
}));

interface MockIconProps {
  icon: unknown;
  size?: number;
  style?: React.CSSProperties;
}

vi.mock('@wordpress/icons', () => ({
  Icon: ({ size, style }: MockIconProps) => (
    <span
      data-testid="pencil-icon"
      data-size={size}
      style={style}
      className="wp-icon"
    >
      pencil
    </span>
  ),
  pencil: 'pencil-icon',
}));

describe('DynamicTabPanel', () => {
  const mockTabs = [
    { name: 'tab1', title: 'First Tab' },
    { name: 'tab2', title: 'Second Tab' },
    { name: 'tab3', title: 'Third Tab' },
  ];

  const mockChildren = vi.fn(({ name, title }) => (
    <div data-testid={`content-${name}`}>
      Content for {title}
    </div>
  ));

  beforeEach(() => {
    mockChildren.mockClear();
  });

  test('renders TabPanel with correct props', () => {
    render(
      <DynamicTabPanel tabs={mockTabs}>
        {mockChildren}
      </DynamicTabPanel>
    );

    expect(screen.getByTestId('tab-panel')).toBeInTheDocument();
    expect(screen.getByTestId('tab-panel')).toHaveClass('anura-tabs');
  });

  test('renders all tabs with their titles', () => {
    render(
      <DynamicTabPanel tabs={mockTabs}>
        {mockChildren}
      </DynamicTabPanel>
    );

    expect(screen.getByTestId('tab-tab1')).toBeInTheDocument();
    expect(screen.getByTestId('tab-tab2')).toBeInTheDocument();
    expect(screen.getByTestId('tab-tab3')).toBeInTheDocument();

    expect(screen.getByText('First Tab')).toBeInTheDocument();
    expect(screen.getByText('Second Tab')).toBeInTheDocument();
    expect(screen.getByText('Third Tab')).toBeInTheDocument();
  });

  test('applies custom className when provided', () => {
    render(
      <DynamicTabPanel tabs={mockTabs} className="custom-tabs">
        {mockChildren}
      </DynamicTabPanel>
    );

    expect(screen.getByTestId('tab-panel')).toHaveClass('custom-tabs');
  });

  test('applies custom activeClass when provided', () => {
    render(
      <DynamicTabPanel tabs={mockTabs} activeClass="custom-active">
        {mockChildren}
      </DynamicTabPanel>
    );

    expect(screen.getByTestId('tab-tab1')).toHaveClass('custom-active');
  });

  test('applies tab-specific className to tabs', () => {
    const tabsWithClasses = [
      { name: 'tab1', title: 'First Tab', className: 'special-tab' },
      { name: 'tab2', title: 'Second Tab' },
    ];

    render(
      <DynamicTabPanel tabs={tabsWithClasses}>
        {mockChildren}
      </DynamicTabPanel>
    );

    expect(screen.getByTestId('tab-tab1')).toHaveClass('special-tab');
    expect(screen.getByTestId('tab-tab2')).not.toHaveClass('special-tab');
  });

  test('shows pencil icon when tab has changes', () => {
    const tabsWithChanges = [
      { name: 'tab1', title: 'First Tab', hasChanges: true },
      { name: 'tab2', title: 'Second Tab', hasChanges: false },
      { name: 'tab3', title: 'Third Tab' },
    ];

    render(
      <DynamicTabPanel tabs={tabsWithChanges}>
        {mockChildren}
      </DynamicTabPanel>
    );

    const pencilIcons = screen.getAllByTestId('pencil-icon');
    expect(pencilIcons).toHaveLength(1); // Only in tab button with hasChanges: true

    const iconElement = pencilIcons[0];
    expect(iconElement).toHaveAttribute('data-size', '20');
    expect(iconElement).toHaveStyle('color: #d97706');
  });

  test('does not show pencil icon when tab has no changes', () => {
    const tabsWithoutChanges = [
      { name: 'tab1', title: 'First Tab', hasChanges: false },
      { name: 'tab2', title: 'Second Tab' },
    ];

    render(
      <DynamicTabPanel tabs={tabsWithoutChanges}>
        {mockChildren}
      </DynamicTabPanel>
    );

    expect(screen.queryByTestId('pencil-icon')).not.toBeInTheDocument();
  });

  test('calls onSelect when tab is clicked', () => {
    const mockOnSelect = vi.fn();

    render(
      <DynamicTabPanel tabs={mockTabs} onSelect={mockOnSelect}>
        {mockChildren}
      </DynamicTabPanel>
    );

    fireEvent.click(screen.getByTestId('tab-tab2'));

    expect(mockOnSelect).toHaveBeenCalledWith('tab2');
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  test('does not break when onSelect is not provided', () => {
    render(
      <DynamicTabPanel tabs={mockTabs}>
        {mockChildren}
      </DynamicTabPanel>
    );

    expect(() => {
      fireEvent.click(screen.getByTestId('tab-tab2'));
    }).not.toThrow();
  });

  test('renders children with correct tab information', () => {
    render(
      <DynamicTabPanel tabs={mockTabs}>
        {mockChildren}
      </DynamicTabPanel>
    );

    expect(mockChildren).toHaveBeenCalledWith({
      name: 'tab1',
      title: expect.anything() // Title is transformed to include icon logic
    });
    expect(screen.getByTestId('content-tab1')).toBeInTheDocument();
  });

  test('handles empty tabs array', () => {
    render(
      <DynamicTabPanel tabs={[]}>
        {mockChildren}
      </DynamicTabPanel>
    );

    expect(screen.getByTestId('tab-panel')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('handles mixed change states across multiple tabs', () => {
    const mixedTabs = [
      { name: 'tab1', title: 'Changed Tab', hasChanges: true },
      { name: 'tab2', title: 'Unchanged Tab', hasChanges: false },
      { name: 'tab3', title: 'Another Changed Tab', hasChanges: true },
      { name: 'tab4', title: 'Default Tab' },
    ];

    render(
      <DynamicTabPanel tabs={mixedTabs}>
        {mockChildren}
      </DynamicTabPanel>
    );

    const pencilIcons = screen.getAllByTestId('pencil-icon');
    expect(pencilIcons).toHaveLength(2); // Only tabs with hasChanges: true

    expect(screen.getByText('Changed Tab')).toBeInTheDocument();
    expect(screen.getByText('Another Changed Tab')).toBeInTheDocument();
    expect(screen.getByText('Unchanged Tab')).toBeInTheDocument();
    expect(screen.getByText('Default Tab')).toBeInTheDocument();
  });

  test('renders tab titles with proper flex layout styling', () => {
    const tabsWithChanges = [
      { name: 'tab1', title: 'Tab with Changes', hasChanges: true },
    ];

    render(
      <DynamicTabPanel tabs={tabsWithChanges}>
        {mockChildren}
      </DynamicTabPanel>
    );

    const tabButton = screen.getByTestId('tab-tab1');
    const titleContainer = tabButton.querySelector('div');

    expect(titleContainer).toHaveStyle({
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      position: 'relative',
    });
  });
});
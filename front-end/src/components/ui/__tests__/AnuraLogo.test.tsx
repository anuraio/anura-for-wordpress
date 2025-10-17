import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AnuraLogo } from '../AnuraLogo';

describe('AnuraLogo', () => {
  it('renders with default className', () => {
    const { container } = render(<AnuraLogo />);

    const logoContainer = container.firstChild as HTMLElement;
    expect(logoContainer).toHaveClass('w-12', 'h-12');
  });

  it('renders with custom className', () => {
    const { container } = render(<AnuraLogo className="w-24 h-24 custom-class" />);

    const logoContainer = container.firstChild as HTMLElement;
    expect(logoContainer).toHaveClass('w-24', 'h-24', 'custom-class');
    expect(logoContainer).not.toHaveClass('w-12', 'h-12');
  });

  it('renders SVG with correct attributes', () => {
    const { container } = render(<AnuraLogo />);

    const svg = container.querySelector('svg') as SVGElement;
    expect(svg).toHaveAttribute('width', '48');
    expect(svg).toHaveAttribute('height', '48');
    expect(svg).toHaveAttribute('viewBox', '0 0 480 480');
    expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
  });

  it('applies drop shadow filter to SVG', () => {
    const { container } = render(<AnuraLogo />);

    const svg = container.querySelector('svg') as SVGElement;
    expect(svg).toHaveStyle({ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' });
  });
});
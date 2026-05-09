import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Card from './Card';

// Mock dnd-kit hooks
vi.mock('@dnd-kit/core', () => ({
  useDraggable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    isDragging: false,
  }),
}));

describe('Card Component', () => {
  it('renders card value correctly', () => {
    render(<Card id="c1" value="7" />);
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('renders operator symbols correctly', () => {
    render(<Card id="c2" value="*" type="operator" />);
    // Our Card component converts '*' to '×'
    expect(screen.getByText('×')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Card id="c3" value="5" onClick={handleClick} />);
    fireEvent.click(screen.getByText('5'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('applies rarity classes', () => {
    const { container } = render(<Card id="c4" value="9" rarity="super" />);
    expect(container.firstChild).toHaveClass('math-card--super');
  });
});

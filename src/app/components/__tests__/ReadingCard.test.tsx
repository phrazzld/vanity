import { render, screen, fireEvent } from '@testing-library/react';
import ReadingCard from '../ReadingCard';

// Mock the getSeededPlaceholderStyles function
jest.mock('../../readings/placeholderUtils', () => ({
  getSeededPlaceholderStyles: jest.fn().mockReturnValue({
    backgroundColor: '#f5f5f5',
  }),
}));

describe('ReadingCard', () => {
  const mockProps = {
    slug: 'test-book',
    title: 'Test Book',
    coverImageSrc: '/covers/test-book.jpg',
    dropped: false,
    finishedDate: new Date('2023-01-01'),
  };

  it('renders with cover image', () => {
    render(<ReadingCard {...mockProps} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/readings/test-book');
    
    const image = screen.getByAltText('Test Book cover');
    expect(image).toBeInTheDocument();
  });

  it('renders without cover image using placeholder', () => {
    render(
      <ReadingCard 
        {...mockProps}
        coverImageSrc={null}
      />
    );
    
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    
    // No image should be rendered
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('applies grayscale filter when dropped is true', () => {
    render(
      <ReadingCard 
        {...mockProps}
        dropped={true}
      />
    );
    
    const image = screen.getByAltText('Test Book cover');
    expect(image).toHaveStyle('filter: grayscale(100%)');
  });

  it('applies opacity when finishedDate is null', () => {
    render(
      <ReadingCard 
        {...mockProps}
        finishedDate={null}
      />
    );
    
    const image = screen.getByAltText('Test Book cover');
    expect(image).toHaveStyle('opacity: 0.5');
  });

  it('applies hover styles when mouse enters', () => {
    render(<ReadingCard {...mockProps} />);
    
    const link = screen.getByRole('link');
    
    // Simulate mouse enter
    fireEvent.mouseEnter(link);
    
    expect(link).toHaveStyle('transform: translateY(-2px) scale(1.02)');
    expect(link).toHaveStyle('box-shadow: 0 4px 8px rgba(0,0,0,0.1)');
  });

  it('removes hover styles when mouse leaves', () => {
    render(<ReadingCard {...mockProps} />);
    
    const link = screen.getByRole('link');
    
    // Simulate mouse enter then leave
    fireEvent.mouseEnter(link);
    fireEvent.mouseLeave(link);
    
    expect(link).toHaveStyle('transform: translateY(0) scale(1)');
    expect(link).toHaveStyle('box-shadow: 0 1px 2px rgba(0,0,0,0.05)');
  });
});
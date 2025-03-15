import { render, screen, fireEvent } from '@testing-library/react';
import ReadingCard from '../ReadingCard';

// Mock the getSeededPlaceholderStyles function
jest.mock('../placeholderUtils', () => ({
  getSeededPlaceholderStyles: jest.fn().mockReturnValue({
    backgroundColor: '#f5f5f5',
  }),
}));

// Mock Next.js image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => <img {...props} />,
}));

// Mock environment variables
process.env.NEXT_PUBLIC_SPACES_BASE_URL = 'https://test-space.com';

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
    
    const card = screen.getByTitle('Test Book');
    expect(card).toBeInTheDocument();
    
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
    
    const card = screen.getByTitle('Test Book');
    expect(card).toBeInTheDocument();
    
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
    const { container } = render(<ReadingCard {...mockProps} />);
    
    const card = screen.getByTitle('Test Book');
    
    // Simulate mouse enter
    fireEvent.mouseEnter(card);
    
    // Check that the state has been updated (card now has hover styles)
    expect(card).toHaveStyle('transform: translateY(-2px) scale(1.02)');
    expect(card).toHaveStyle('box-shadow: 0 4px 8px rgba(0,0,0,0.1)');
  });

  it('removes hover styles when mouse leaves', () => {
    render(<ReadingCard {...mockProps} />);
    
    const card = screen.getByTitle('Test Book');
    
    // Simulate mouse enter then leave
    fireEvent.mouseEnter(card);
    fireEvent.mouseLeave(card);
    
    // Check that the state has been reset
    expect(card).toHaveStyle('transform: translateY(0) scale(1)');
    expect(card).toHaveStyle('box-shadow: 0 1px 2px rgba(0,0,0,0.05)');
  });
});
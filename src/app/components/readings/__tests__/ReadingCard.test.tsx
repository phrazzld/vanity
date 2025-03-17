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
  default: (props) => {
    // Convert boolean to string for attributes like "fill"
    const imgProps = Object.keys(props).reduce((acc, key) => {
      if (typeof props[key] === 'boolean') {
        acc[key] = props[key].toString();
      } else {
        acc[key] = props[key];
      }
      return acc;
    }, {});
    return <div data-testid="mock-image" style={{ width: imgProps.width, height: imgProps.height }}>Mock Image: {imgProps.alt || ""}</div>;
  },
}));

// Mock environment variables
process.env.NEXT_PUBLIC_SPACES_BASE_URL = 'https://test-space.com';

// Mock setInterval and clearInterval
jest.useFakeTimers();

describe('ReadingCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
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
    
    // Should show date in the status badge - use regex for flexibility
    const dateLabel = screen.getByText(/Dec 2022|Jan 2023/);
    expect(dateLabel).toBeInTheDocument();
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

  it('shows paused indicator when dropped is true', () => {
    render(
      <ReadingCard 
        {...mockProps}
        dropped={true}
      />
    );
    
    // Book cover should have grayscale filter
    const image = screen.getByAltText('Test Book cover');
    expect(image).toHaveStyle('filter: grayscale(50%) brightness(0.95)');
    
    // Should show paused label
    const pausedLabel = screen.getByText('Paused');
    expect(pausedLabel).toBeInTheDocument();
    
    // Should not show finished date label
    expect(screen.queryByText(/Completed/i)).not.toBeInTheDocument();
  });

  it('shows reading indicator when book is in progress (null finishedDate)', () => {
    render(
      <ReadingCard 
        {...mockProps}
        finishedDate={null}
      />
    );
    
    // Should show reading label
    const readingLabel = screen.getByText('Reading');
    expect(readingLabel).toBeInTheDocument();
    
    // No completed or paused labels
    expect(screen.queryByText(/Completed/i)).not.toBeInTheDocument();
    expect(screen.queryByText('Paused')).not.toBeInTheDocument();
  });

  it('applies hover styles when mouse enters', () => {
    render(<ReadingCard {...mockProps} />);
    
    const card = screen.getByTitle('Test Book');
    
    // Simulate mouse enter
    fireEvent.mouseEnter(card);
    
    // Check that the state has been updated (card now has hover styles)
    expect(card).toHaveStyle('transform: translateY(-2px)');
    expect(card).toHaveStyle('boxShadow: 0 4px 12px rgba(0,0,0,0.12)');
  });

  it('removes hover styles when mouse leaves', () => {
    render(<ReadingCard {...mockProps} />);
    
    const card = screen.getByTitle('Test Book');
    
    // Simulate mouse enter then leave
    fireEvent.mouseEnter(card);
    fireEvent.mouseLeave(card);
    
    // Check that the state has been reset
    expect(card).toHaveStyle('transform: translateY(0)');
    expect(card).toHaveStyle('boxShadow: 0 1px 3px rgba(0,0,0,0.08)');
  });
});
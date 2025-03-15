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
    return <img {...imgProps} />;
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
    
    // Should show finished date label
    const finishedLabel = screen.getByText(/Finished/i);
    expect(finishedLabel).toBeInTheDocument();
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

  it('shows dropped indicator when dropped is true', () => {
    render(
      <ReadingCard 
        {...mockProps}
        dropped={true}
      />
    );
    
    // Book cover should have grayscale filter
    const image = screen.getByAltText('Test Book cover');
    expect(image).toHaveStyle('filter: grayscale(100%)');
    
    // Should show dropped label
    const droppedLabel = screen.getByText('DROPPED');
    expect(droppedLabel).toBeInTheDocument();
    
    // Should not show finished date label
    expect(screen.queryByText(/Finished/i)).not.toBeInTheDocument();
  });

  it('shows reading indicator when book is in progress (null finishedDate)', () => {
    render(
      <ReadingCard 
        {...mockProps}
        finishedDate={null}
      />
    );
    
    // No dropped or finished labels
    expect(screen.queryByText(/Finished/i)).not.toBeInTheDocument();
    expect(screen.queryByText('DROPPED')).not.toBeInTheDocument();
  });

  it('applies hover styles when mouse enters', () => {
    render(<ReadingCard {...mockProps} />);
    
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
  });
});
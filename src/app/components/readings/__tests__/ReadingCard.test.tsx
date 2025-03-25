import { render, screen, fireEvent } from '@testing-library/react';
import ReadingCard from '../ReadingCard';
import { ThemeProvider } from '@/app/context/ThemeContext';

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

// Mock the ThemeContext
jest.mock('@/app/context/ThemeContext', () => ({
  useTheme: jest.fn().mockReturnValue({ isDarkMode: false, toggleDarkMode: jest.fn() }),
  ThemeProvider: ({ children }) => <>{children}</>,
}));

// Mock environment variables
process.env.NEXT_PUBLIC_SPACES_BASE_URL = 'https://test-space.com';

// Mock setInterval and clearInterval
jest.useFakeTimers();

describe('ReadingCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  // Use a fixed date string to ensure consistent formatting in tests
  const testDate = '2022-12-15';
  
  const mockProps = {
    slug: 'test-book',
    title: 'Test Book',
    author: 'Test Author',
    coverImageSrc: '/covers/test-book.jpg',
    dropped: false,
    finishedDate: testDate,
  };

  it('renders with cover image', () => {
    render(<ReadingCard {...mockProps} />);
    
    const card = screen.getByTitle('Test Book');
    expect(card).toBeInTheDocument();
    
    const image = screen.getByTestId('mock-image');
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
    expect(screen.queryByTestId('mock-image')).not.toBeInTheDocument();
  });

  it('shows book title and author', () => {
    render(<ReadingCard {...mockProps} />);
    
    // Hover the card to reveal the ribbon with text
    const card = screen.getByTitle('Test Book');
    fireEvent.mouseEnter(card);
    
    const bookTitle = screen.getByTestId('book-title');
    expect(bookTitle).toHaveTextContent('Test Book');
    
    const bookAuthor = screen.getByTestId('book-author');
    expect(bookAuthor).toHaveTextContent('Test Author');
  });

  it('shows paused indicator when dropped is true', () => {
    render(
      <ReadingCard 
        {...mockProps}
        dropped={true}
      />
    );
    
    // Hover the card to reveal the ribbon
    const card = screen.getByTitle('Test Book');
    fireEvent.mouseEnter(card);
    
    // Look for the paused text
    expect(screen.getByText('Reading paused')).toBeInTheDocument();
  });

  it('shows currently reading indicator when finishedDate is null', () => {
    render(
      <ReadingCard 
        {...mockProps}
        finishedDate={null}
      />
    );
    
    // Hover the card to reveal the ribbon
    const card = screen.getByTitle('Test Book');
    fireEvent.mouseEnter(card);
    
    // Look for the currently reading text
    expect(screen.getByText('Currently reading')).toBeInTheDocument();
  });

  it('shows finished date when book is completed', () => {
    render(<ReadingCard {...mockProps} />);
    
    // Hover the card to reveal the ribbon
    const card = screen.getByTitle('Test Book');
    fireEvent.mouseEnter(card);
    
    // Look for the finished date text (Dec 2022 based on our testDate)
    expect(screen.getByText('Finished Dec 2022')).toBeInTheDocument();
  });

  it('applies ribbon unfurl animation when mouse enters', () => {
    render(<ReadingCard {...mockProps} />);
    
    const card = screen.getByTitle('Test Book');
    
    // Get the ribbon container before hover
    const ribbonContainer = screen.getByTestId('ribbon-container');
    expect(ribbonContainer).toHaveStyle('opacity: 0');
    expect(ribbonContainer).toHaveStyle('visibility: hidden');
    // The transform now combines translateY and scale for a more refined animation
    expect(ribbonContainer).toHaveStyle('transform: translateY(15px) scale(0.98)');
    expect(ribbonContainer).toHaveStyle('minHeight: 0');
    
    // Simulate mouse enter
    fireEvent.mouseEnter(card);
    
    // Check that the ribbon expands
    expect(ribbonContainer).toHaveStyle('opacity: 1');
    expect(ribbonContainer).toHaveStyle('visibility: visible');
    // The transform now combines translateY and scale for a more refined animation
    expect(ribbonContainer).toHaveStyle('transform: translateY(0) scale(1)');
    expect(ribbonContainer).toHaveStyle('minHeight: 100px'); // Check expanded state
    
    // Check that the main card has hover styles
    expect(card).toHaveStyle('transform: translateY(-4px) scale(1.01)');
    
    // Check that content elements become visible
    const ribbon = screen.getByTestId('ribbon-container');
    expect(ribbon).toBeInTheDocument();
    
    // Status icon should be visible
    const statusIcon = screen.getByTestId('status-icon');
    expect(statusIcon).toBeInTheDocument();
  });

  it('collapses ribbon when mouse leaves', () => {
    render(<ReadingCard {...mockProps} />);
    
    const card = screen.getByTitle('Test Book');
    
    // Simulate mouse enter then leave
    fireEvent.mouseEnter(card);
    fireEvent.mouseLeave(card);
    
    // Get the ribbon container after hover
    const ribbonContainer = screen.getByTestId('ribbon-container');
    expect(ribbonContainer).toHaveStyle('opacity: 0');
    // The transform now combines translateY and scale for a more refined animation
    expect(ribbonContainer).toHaveStyle('transform: translateY(15px) scale(0.98)');
    
    // Check that the main card hover state has been reset
    expect(card).toHaveStyle('transform: translateY(0) scale(1)');
  });
  
  it('sets accessible ARIA label with book details', () => {
    render(<ReadingCard {...mockProps} />);
    
    const card = screen.getByTitle('Test Book');
    expect(card).toHaveAttribute('aria-label', 'Book: Test Book by Test Author, Status: Finished on Dec 2022');
    
    // Render a currently reading book
    render(
      <ReadingCard 
        {...mockProps}
        finishedDate={null}
      />
    );
    
    const readingCard = screen.getAllByTitle('Test Book')[1];
    expect(readingCard).toHaveAttribute('aria-label', 'Book: Test Book by Test Author, Status: Currently Reading');
  });
});
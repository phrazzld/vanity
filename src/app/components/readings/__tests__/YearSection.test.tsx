/**
 * Test suite for YearSection component
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import YearSection from '../YearSection';
import type { Reading } from '@/types';

// Mock the theme context
jest.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({ isDarkMode: false, toggleDarkMode: jest.fn() }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

describe('YearSection Component', () => {
  // Sample reading data for tests
  const sampleReadings: Reading[] = [
    {
      id: 1,
      slug: 'book-one',
      title: 'Book One',
      author: 'Author A',
      finishedDate: '2023-01-15',
      coverImageSrc: '/covers/book-one.jpg',
      thoughts: 'Great book',
      dropped: false
    },
    {
      id: 2,
      slug: 'book-two',
      title: 'Book Two',
      author: 'Author B',
      finishedDate: '2023-03-20',
      coverImageSrc: null,
      thoughts: '',
      dropped: false
    }
  ];

  // Currently reading book
  const currentlyReadingBook: Reading = {
    id: 3,
    slug: 'book-three',
    title: 'Book Three',
    author: 'Author C',
    finishedDate: null,
    coverImageSrc: '/covers/book-three.jpg',
    thoughts: 'Reading this now',
    dropped: false
  };

  // Dropped book
  const droppedBook: Reading = {
    id: 4,
    slug: 'book-four',
    title: 'Book Four',
    author: 'Author D',
    finishedDate: null,
    coverImageSrc: null,
    thoughts: 'Not for me',
    dropped: true
  };

  it('renders year heading correctly', () => {
    render(<YearSection year="2023" readings={sampleReadings} />);
    
    expect(screen.getByText('2023')).toBeInTheDocument();
    expect(screen.getByText('(2 books)')).toBeInTheDocument();
  });

  it('renders correct count with singular form', () => {
    render(<YearSection year="2022" readings={[sampleReadings[0]]} />);
    
    expect(screen.getByText('(1 book)')).toBeInTheDocument();
  });

  it('displays "Currently Reading" section with appropriate styling', () => {
    render(<YearSection year="Currently Reading" readings={[currentlyReadingBook]} />);
    
    const heading = screen.getByText('Currently Reading');
    expect(heading).toBeInTheDocument();
    
    // Find the parent section and check for data attribute
    const section = heading.closest('section');
    expect(section).toHaveAttribute('data-year', 'Currently Reading');
  });

  it('displays "Dropped" section with appropriate styling', () => {
    render(<YearSection year="Dropped" readings={[droppedBook]} />);
    
    const heading = screen.getByText('Dropped');
    expect(heading).toBeInTheDocument();
    
    // Find the parent section and check for data attribute
    const section = heading.closest('section');
    expect(section).toHaveAttribute('data-year', 'Dropped');
  });

  it('handles empty reading array gracefully', () => {
    render(<YearSection year="2024" readings={[]} />);
    
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('No readings found for this year.')).toBeInTheDocument();
  });

  it('renders additional children when provided', () => {
    render(
      <YearSection year="2023" readings={sampleReadings}>
        <div data-testid="custom-content">Custom content</div>
      </YearSection>
    );
    
    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    expect(screen.getByText('Custom content')).toBeInTheDocument();
  });
});
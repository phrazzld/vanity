import { checkA11y, checkA11yInBothThemes } from '@/test-utils/a11y-helpers';
import QuotesList from '../quotes/QuotesList';
import ReadingsList from '../readings/ReadingsList';
import ReadingCard from '../readings/ReadingCard';
import ProjectCard from '../ProjectCard';
import TypewriterQuotes from '../TypewriterQuotes';

// Mock data for components
const mockQuotes = [
  { id: 1, text: 'Test quote 1', author: 'Author 1' },
  { id: 2, text: 'Test quote 2', author: 'Author 2' },
];

const mockReading = {
  id: 1,
  title: 'Test Book',
  author: 'Test Author',
  finished: true,
  year: 2024,
  thoughts: 'Great book',
  slug: 'test-book',
  coverImage: '/test-image.jpg',
  finishedDate: '2024-01-01',
  coverImageSrc: '/test-image.jpg',
  dropped: false,
};

const mockProject = {
  title: 'Test Project',
  description: 'A test project description',
  siteUrl: 'https://example.com',
  codeUrl: 'https://github.com/test/repo',
  techStack: ['React', 'TypeScript'],
  imageSrc: '/test-project.jpg',
  altText: 'Screenshot of Test Project showing the main interface',
};

describe('Accessibility Tests for All Components', () => {
  beforeEach(() => {
    // Mock global fetch for TypewriterQuotes
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockQuotes),
      })
    ) as jest.Mock;
  });

  describe('QuotesList', () => {
    const mockProps = {
      quotes: mockQuotes,
      sort: { field: 'id', order: 'asc' as const },
      onSortChange: jest.fn(),
      onSelectQuote: jest.fn(),
      searchQuery: '',
    };

    it('should have no accessibility violations', async () => {
      await checkA11y(<QuotesList {...mockProps} />);
    });

    it('should have no accessibility violations in both themes', async () => {
      await checkA11yInBothThemes(<QuotesList {...mockProps} />);
    });
  });

  describe('ReadingsList', () => {
    const mockProps = {
      readings: [mockReading],
      sort: { field: 'year', order: 'desc' as const },
      onSortChange: jest.fn(),
      onSelectReading: jest.fn(),
      searchQuery: '',
    };

    it('should have no accessibility violations', async () => {
      await checkA11y(<ReadingsList {...mockProps} />);
    });

    it('should have no accessibility violations in both themes', async () => {
      await checkA11yInBothThemes(<ReadingsList {...mockProps} />);
    });
  });

  describe('ReadingCard', () => {
    it('should have no accessibility violations', async () => {
      await checkA11y(<ReadingCard {...mockReading} />);
    });

    it('should have no accessibility violations in both themes', async () => {
      await checkA11yInBothThemes(<ReadingCard {...mockReading} />);
    });
  });

  describe('ProjectCard', () => {
    it('should have no accessibility violations', async () => {
      await checkA11y(<ProjectCard {...mockProject} />);
    });

    it('should have no accessibility violations in both themes', async () => {
      await checkA11yInBothThemes(<ProjectCard {...mockProject} />);
    });
  });

  describe('TypewriterQuotes', () => {
    it('should have no accessibility violations', async () => {
      await checkA11y(<TypewriterQuotes />);
    });

    it('should have no accessibility violations in both themes', async () => {
      await checkA11yInBothThemes(<TypewriterQuotes />);
    });
  });
});

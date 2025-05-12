/**
 * SearchBar Component Accessibility Tests
 *
 * This file tests the SearchBar component for accessibility compliance using axe-core.
 * It demonstrates testing a more complex form component with various configurations.
 */

import type { FilterConfig } from '../SearchBar';
import SearchBar from '../SearchBar';
import { checkA11y, a11yRules } from '@/test-utils/a11y-helpers';

describe('SearchBar Accessibility', () => {
  // Mock search handler
  const mockSearch = jest.fn();

  // Reset mocks between tests
  beforeEach(() => {
    mockSearch.mockReset();
  });

  it('has no accessibility violations in default configuration', async () => {
    await checkA11y(<SearchBar onSearch={mockSearch} />);
  });

  it('has no accessibility violations with search button visible', async () => {
    await checkA11y(
      <SearchBar onSearch={mockSearch} searchAsYouType={false} searchButtonText="Search" />
    );
  });

  it('has no accessibility violations with filters', async () => {
    // Define test filters
    const testFilters: FilterConfig[] = [
      {
        name: 'category',
        label: 'Category',
        options: [
          { value: '', label: 'All Categories' },
          { value: 'books', label: 'Books' },
          { value: 'articles', label: 'Articles' },
        ],
      },
      {
        name: 'year',
        label: 'Year',
        options: [
          { value: '', label: 'All Years' },
          { value: '2023', label: '2023' },
          { value: '2022', label: '2022' },
        ],
      },
    ];

    await checkA11y(<SearchBar onSearch={mockSearch} filters={testFilters} />);
  });

  it('has no accessibility violations with different button variants', async () => {
    // Test primary button variant
    await checkA11y(
      <SearchBar onSearch={mockSearch} searchAsYouType={false} buttonVariant="primary" />
    );

    // Test secondary button variant
    await checkA11y(
      <SearchBar onSearch={mockSearch} searchAsYouType={false} buttonVariant="secondary" />
    );

    // Test minimal button variant
    await checkA11y(
      <SearchBar onSearch={mockSearch} searchAsYouType={false} buttonVariant="minimal" />
    );
  });

  it('passes form-specific accessibility checks', async () => {
    // Use form-specific accessibility rules
    await checkA11y(
      <SearchBar onSearch={mockSearch} placeholder="Search for books..." searchAsYouType={false} />,
      {
        axeOptions: a11yRules.forms,
        verbose: true,
      }
    );
  });

  it('has no accessibility violations with initial query', async () => {
    await checkA11y(<SearchBar onSearch={mockSearch} initialQuery="test query" />);
  });
});

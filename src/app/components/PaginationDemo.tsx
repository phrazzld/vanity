'use client';

/**
 * PaginationDemo Component
 *
 * A simple demo of the Pagination component showing different configurations.
 */

import { useState } from 'react';
import Pagination from './Pagination';

export default function PaginationDemo() {
  // Demo state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalItems = 247; // Simulated total number of items

  // Calculate total pages
  const totalPages = Math.ceil(totalItems / pageSize);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    // Reset to first page when changing page size
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-8">
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Pagination Demo</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            This component demonstrates the Pagination component with different configurations.
          </p>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            Demo Controls
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="demo-current-page"
                className="block text-xs text-gray-500 dark:text-gray-400 mb-1"
              >
                Current Page
              </label>
              <input
                id="demo-current-page"
                type="number"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={e =>
                  setCurrentPage(Math.min(Math.max(1, parseInt(e.target.value) || 1), totalPages))
                }
                className="text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-1 w-24"
              />
            </div>
            <div>
              <label
                htmlFor="demo-total-pages"
                className="block text-xs text-gray-500 dark:text-gray-400 mb-1"
              >
                Total Pages
              </label>
              <input
                id="demo-total-pages"
                type="text"
                value={totalPages}
                disabled
                className="text-sm rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-1 w-24"
              />
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Basic Pagination
            </h3>
            <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={handlePageChange}
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              With Page Size Selector
            </h3>
            <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                showPageSizeSelector={true}
                pageSizeOptions={[5, 10, 25, 50]}
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Current State
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md text-sm">
              <p className="text-gray-700 dark:text-gray-300">
                Current Page:{' '}
                <span className="font-mono text-blue-600 dark:text-blue-400">{currentPage}</span>
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Page Size:{' '}
                <span className="font-mono text-blue-600 dark:text-blue-400">{pageSize}</span>
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Total Items:{' '}
                <span className="font-mono text-blue-600 dark:text-blue-400">{totalItems}</span>
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Total Pages:{' '}
                <span className="font-mono text-blue-600 dark:text-blue-400">{totalPages}</span>
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Showing Items:{' '}
                <span className="font-mono text-blue-600 dark:text-blue-400">
                  {(currentPage - 1) * pageSize + 1}
                </span>{' '}
                to{' '}
                <span className="font-mono text-blue-600 dark:text-blue-400">
                  {Math.min(currentPage * pageSize, totalItems)}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

/**
 * Admin Quotes Management Page
 * 
 * This page allows administrators to create, view, edit, and delete quotes.
 */

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Quote, QuoteInput } from '@/types';

export default function QuotesManagementPage() {
  const router = useRouter();
  
  // State for quotes list and loading status
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for selected quote and form
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<QuoteInput>>({
    text: '',
    author: ''
  });
  
  // State for form feedback
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<Quote | null>(null);
  
  // Fetch quotes when component mounts
  useEffect(() => {
    fetchQuotes();
  }, []);
  
  const fetchQuotes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/quotes');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch quotes: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setQuotes(data);
    } catch (err) {
      console.error('Error fetching quotes:', err);
      setError('Failed to load quotes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setIsCreating(false);
    setFormData({
      text: quote.text,
      author: quote.author || ''
    });
    setFormError(null);
    setSuccessMessage(null);
  };
  
  const handleNewQuote = () => {
    setSelectedQuote(null);
    setIsCreating(true);
    setFormData({
      text: '',
      author: ''
    });
    setFormError(null);
    setSuccessMessage(null);
  };
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const validateForm = (): boolean => {
    if (!formData.text || formData.text.trim() === '') {
      setFormError('Quote text is required');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSaving(true);
      setFormError(null);
      setSuccessMessage(null);
      
      const endpoint = isCreating ? '/api/quotes' : `/api/quotes?id=${selectedQuote?.id}`;
      const method = isCreating ? 'POST' : 'PUT';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token' // In a real app, use a real token
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed with status: ${response.status}`);
      }
      
      const savedQuote = await response.json();
      
      setSuccessMessage(isCreating ? 'Quote created successfully!' : 'Quote updated successfully!');
      
      // Refresh quotes list
      fetchQuotes();
      
      if (isCreating) {
        // Switch to edit mode for the new quote
        handleSelectQuote(savedQuote);
      } else {
        // Update the selected quote
        setSelectedQuote(savedQuote);
      }
      
    } catch (err) {
      console.error('Error saving quote:', err);
      setFormError(`Failed to save: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  const confirmDelete = (quote: Quote) => {
    setQuoteToDelete(quote);
    setShowDeleteModal(true);
  };
  
  const handleDelete = async () => {
    if (!quoteToDelete) return;
    
    try {
      setIsSaving(true);
      setFormError(null);
      
      const response = await fetch(`/api/quotes?id=${quoteToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer token' // In a real app, use a real token
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed with status: ${response.status}`);
      }
      
      // Refresh quotes list
      fetchQuotes();
      
      // Reset form if we were editing the deleted quote
      if (selectedQuote?.id === quoteToDelete.id) {
        handleNewQuote();
      }
      
      setSuccessMessage(`Quote deleted successfully!`);
    } catch (err) {
      console.error('Error deleting quote:', err);
      setFormError(`Failed to delete: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSaving(false);
      setShowDeleteModal(false);
      setQuoteToDelete(null);
    }
  };
  
  const getPreviewText = (text: string, maxLength = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Quotes</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Collect and manage meaningful quotes
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="flex items-center space-x-3">
            <Link
              href="/admin"
              className="form-button-secondary"
            >
              <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Dashboard
            </Link>
            <button
              onClick={handleNewQuote}
              className="form-button-primary"
            >
              <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Quote
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Quotes List */}
        <div className="w-full lg:w-2/5">
          <div className="item-list">
            <div className="item-list-header">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">All Quotes</h2>
                {!isLoading && quotes.length > 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                    {quotes.length} {quotes.length === 1 ? 'quote' : 'quotes'}
                  </span>
                )}
              </div>
            </div>
            
            {isLoading ? (
              <div className="py-12 flex justify-center">
                <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-t border-b border-red-100 dark:border-red-800">
                <p className="text-sm">{error}</p>
              </div>
            ) : quotes.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <div className="w-16 h-16 mx-auto bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" 
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">No quotes found</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Start building your collection of inspirational quotes</p>
                <button
                  onClick={handleNewQuote}
                  className="mt-4 inline-flex items-center px-3 py-1.5 text-sm text-blue-600 font-medium"
                >
                  <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add your first quote
                </button>
              </div>
            ) : (
              <ul className="item-list-body">
                {quotes.map(quote => (
                  <li 
                    key={quote.id}
                    className={`item-list-item ${selectedQuote?.id === quote.id ? 'item-list-item-selected' : ''}`}
                    onClick={() => handleSelectQuote(quote)}
                  >
                    <div className="flex flex-col">
                      <div className="flex items-start">
                        <svg className="h-4 w-4 text-gray-400 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        <p className="text-sm font-medium text-gray-900 dark:text-white leading-5">
                          &ldquo;{getPreviewText(quote.text)}&rdquo;
                        </p>
                      </div>
                      <div className="mt-1 ml-5.5 text-xs text-gray-500 dark:text-gray-400">
                        {quote.author ? `— ${quote.author}` : '— Anonymous'}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Edit Form */}
        <div className="w-full lg:w-3/5">
          {(selectedQuote || isCreating) ? (
            <div className="form-container">
              <div className="form-header">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  {isCreating ? 'Add New Quote' : 'Edit Quote'}
                </h2>
                {!isCreating && selectedQuote && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                    ID: {selectedQuote.id}
                  </span>
                )}
              </div>
              
              <div className="form-body">
                {formError && (
                  <div className="error-message">
                    <svg className="h-5 w-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{formError}</span>
                  </div>
                )}
                
                {successMessage && (
                  <div className="success-message">
                    <svg className="h-5 w-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{successMessage}</span>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="form-section">
                    <label htmlFor="text" className="form-label">
                      Quote Text <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-start pointer-events-none p-3">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                      </div>
                      <textarea
                        id="text"
                        name="text"
                        rows={5}
                        value={formData.text || ''}
                        onChange={handleInputChange}
                        className="form-textarea pl-10"
                        placeholder="Enter the quote text..."
                        required
                      />
                    </div>
                    <p className="form-help-text">
                      The full text of the quote. This field is required.
                    </p>
                  </div>
                  
                  <div className="form-section">
                    <label htmlFor="author" className="form-label">
                      Author
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        id="author"
                        name="author"
                        value={formData.author || ''}
                        onChange={handleInputChange}
                        placeholder="Anonymous"
                        className="form-input pl-10"
                      />
                    </div>
                    <p className="form-help-text">
                      The person who said or wrote the quote. Leave blank for anonymous quotes.
                    </p>
                  </div>
                
                  <div className="form-footer">
                    <div>
                      {!isCreating && (
                        <button
                          type="button"
                          onClick={() => confirmDelete(selectedQuote!)}
                          className="form-button-danger"
                          disabled={isSaving}
                        >
                          <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      )}
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={isCreating ? () => setIsCreating(false) : () => setSelectedQuote(null)}
                        className="form-button-secondary"
                        disabled={isSaving}
                      >
                        Cancel
                      </button>
                      
                      <button
                        type="submit"
                        className="form-button-primary"
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <svg className="animate-spin mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving
                          </>
                        ) : 'Save'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="form-container h-full">
              <div className="flex flex-col items-center justify-center p-8 h-full min-h-[400px] text-center">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" 
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No quote selected</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-md">
                  Select a quote from the list to edit it, or create a new one to add to your collection.
                </p>
                <div className="mt-6">
                  <button
                    onClick={handleNewQuote}
                    className="form-button-primary"
                  >
                    <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create New Quote
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="modal-backdrop" aria-hidden="true"></div>
            
            {/* Modal panel */}
            <div className="modal-container">
              <div className="modal-body">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                      Delete Quote
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Are you sure you want to delete this quote? This action cannot be undone.
                      </p>
                      <div className="mt-3 p-4 bg-gray-50 rounded-md border border-gray-200">
                        <p className="text-sm italic text-gray-700">&ldquo;{quoteToDelete?.text}&rdquo;</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {quoteToDelete?.author ? `— ${quoteToDelete.author}` : '— Anonymous'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="form-button-danger sm:ml-3 sm:w-auto"
                  onClick={handleDelete}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : 'Delete'}
                </button>
                <button 
                  type="button" 
                  className="form-button-secondary sm:mt-0 sm:ml-3 sm:w-auto"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isSaving}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
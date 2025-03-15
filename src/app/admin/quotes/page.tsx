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
    <div>
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between pb-6 border-b border-gray-200 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Quotes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your quotes collection
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="flex items-center space-x-3">
            <Link
              href="/admin"
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-0.5 mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Dashboard
            </Link>
            <button
              onClick={handleNewQuote}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-0.5 mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-4 border-b border-gray-200 sm:px-6">
              <h2 className="text-base font-medium text-gray-900">All Quotes</h2>
            </div>
            
            {isLoading ? (
              <div className="py-12 flex justify-center">
                <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 text-red-600 border-t border-b border-red-100">
                <p className="text-sm">{error}</p>
              </div>
            ) : quotes.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" 
                  />
                </svg>
                <p className="mt-2">No quotes found</p>
                <button
                  onClick={handleNewQuote}
                  className="mt-3 inline-flex items-center px-3 py-1 text-sm text-blue-600 font-medium"
                >
                  Add your first quote
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 max-h-[650px] overflow-auto">
                {quotes.map(quote => (
                  <li 
                    key={quote.id}
                    className={`px-4 py-4 hover:bg-gray-50 cursor-pointer transition-colors sm:px-6 ${
                      selectedQuote?.id === quote.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                    onClick={() => handleSelectQuote(quote)}
                  >
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-gray-900">
                        &ldquo;{getPreviewText(quote.text)}&rdquo;
                      </p>
                      <div className="mt-1 text-xs text-gray-500">
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
            <div className="bg-white shadow sm:rounded-md">
              <div className="px-4 py-4 border-b border-gray-200 sm:px-6">
                <h2 className="text-lg font-medium text-gray-900">
                  {isCreating ? 'Add New Quote' : 'Edit Quote'}
                </h2>
              </div>
              
              <div className="px-4 py-5 sm:p-6">
                {formError && (
                  <div className="mb-4 rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">{formError}</h3>
                      </div>
                    </div>
                  </div>
                )}
                
                {successMessage && (
                  <div className="mb-4 rounded-md bg-green-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">{successMessage}</h3>
                      </div>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="text" className="block text-sm font-medium text-gray-700">
                      Quote Text <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="text"
                        name="text"
                        rows={5}
                        value={formData.text || ''}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      The full text of the quote. This field is required.
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="author" className="block text-sm font-medium text-gray-700">
                      Author
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="author"
                        name="author"
                        value={formData.author || ''}
                        onChange={handleInputChange}
                        placeholder="Anonymous"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      The person who said or wrote the quote. Leave blank for anonymous quotes.
                    </p>
                  </div>
                
                  <div className="pt-4 border-t border-gray-200 flex justify-between">
                    <div>
                      {!isCreating && (
                        <button
                          type="button"
                          onClick={() => confirmDelete(selectedQuote!)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm"
                          disabled={isSaving}
                        >
                          <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        disabled={isSaving}
                      >
                        Cancel
                      </button>
                      
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 min-w-[80px]"
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
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
            <div className="bg-white shadow sm:rounded-md">
              <div className="px-4 py-5 sm:p-6 flex flex-col items-center justify-center min-h-[400px] text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" 
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No quote selected</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Select a quote from the list or create a new one
                </p>
                <div className="mt-6">
                  <button
                    onClick={handleNewQuote}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    New Quote
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
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            
            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Delete Quote
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this quote? This action cannot be undone.
                      </p>
                      <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                        <p className="text-sm italic text-gray-700">&ldquo;{quoteToDelete?.text}&rdquo;</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {quoteToDelete?.author ? `— ${quoteToDelete.author}` : '— Anonymous'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDelete}
                  disabled={isSaving}
                >
                  {isSaving ? 'Deleting...' : 'Delete'}
                </button>
                <button 
                  type="button" 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quotes Management</h1>
          <p className="text-gray-600">Add, edit and remove quotes</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleNewQuote}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Add New Quote
          </button>
          <Link
            href="/admin"
            className="px-4 py-2 bg-gray-200 rounded-md text-sm hover:bg-gray-300"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Quotes List */}
        <div className="w-full lg:w-2/5">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">All Quotes</h2>
            
            {isLoading ? (
              <div className="py-8 text-center text-gray-500">Loading quotes...</div>
            ) : error ? (
              <div className="py-8 text-center text-red-500">{error}</div>
            ) : quotes.length === 0 ? (
              <div className="py-8 text-center text-gray-500">No quotes found</div>
            ) : (
              <ul className="divide-y divide-gray-200 max-h-[600px] overflow-auto">
                {quotes.map(quote => (
                  <li 
                    key={quote.id}
                    className={`py-3 px-2 cursor-pointer hover:bg-gray-50 ${selectedQuote?.id === quote.id ? 'bg-indigo-50' : ''}`}
                    onClick={() => handleSelectQuote(quote)}
                  >
                    <div className="font-medium text-sm">"{getPreviewText(quote.text)}"</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {quote.author ? `— ${quote.author}` : '— Anonymous'}
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
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">
                {isCreating ? 'Create New Quote' : 'Edit Quote'}
              </h2>
              
              {formError && (
                <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md text-sm">
                  {formError}
                </div>
              )}
              
              {successMessage && (
                <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-md text-sm">
                  {successMessage}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quote Text <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="text"
                      value={formData.text || ''}
                      onChange={handleInputChange}
                      rows={5}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Enter the quote text. This field is required.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Author
                    </label>
                    <input
                      name="author"
                      value={formData.author || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Anonymous"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Leave blank for anonymous quotes.
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-between mt-6">
                  <div>
                    {!isCreating && (
                      <button
                        type="button"
                        onClick={() => confirmDelete(selectedQuote!)}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        disabled={isSaving}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={isCreating ? () => setIsCreating(false) : () => setSelectedQuote(null)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                      disabled={isSaving}
                    >
                      Cancel
                    </button>
                    
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 min-w-[100px]"
                      disabled={isSaving}
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center min-h-[400px] text-center">
              <h2 className="text-xl font-semibold mb-2">No Quote Selected</h2>
              <p className="text-gray-600 mb-6">
                Select a quote from the list to edit or create a new one
              </p>
              <button
                onClick={handleNewQuote}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Create New Quote
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete this quote? This action cannot be undone.
            </p>
            <div className="p-3 bg-gray-100 rounded-md mb-4">
              <p className="text-sm italic">"{quoteToDelete?.text}"</p>
              <p className="text-xs text-gray-600 mt-1">
                {quoteToDelete?.author ? `— ${quoteToDelete.author}` : '— Anonymous'}
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                disabled={isSaving}
              >
                {isSaving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
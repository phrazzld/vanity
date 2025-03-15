'use client';

/**
 * Admin Readings Management Page
 * 
 * This page allows administrators to create, view, edit, and delete readings.
 */

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Reading, ReadingInput } from '@/types';

export default function ReadingsManagementPage() {
  const router = useRouter();
  
  // State for readings list and loading status
  const [readings, setReadings] = useState<Reading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for selected reading and form
  const [selectedReading, setSelectedReading] = useState<Reading | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<ReadingInput>>({
    slug: '',
    title: '',
    author: '',
    finishedDate: null,
    coverImageSrc: '',
    thoughts: '',
    dropped: false
  });
  
  // State for form feedback
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [readingToDelete, setReadingToDelete] = useState<Reading | null>(null);
  
  // Fetch readings when component mounts
  useEffect(() => {
    fetchReadings();
  }, []);
  
  const fetchReadings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/readings');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch readings: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setReadings(data);
    } catch (err) {
      console.error('Error fetching readings:', err);
      setError('Failed to load readings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectReading = (reading: Reading) => {
    setSelectedReading(reading);
    setIsCreating(false);
    setFormData({
      slug: reading.slug,
      title: reading.title,
      author: reading.author,
      finishedDate: reading.finishedDate,
      coverImageSrc: reading.coverImageSrc || '',
      thoughts: reading.thoughts || '',
      dropped: reading.dropped || false
    });
    setFormError(null);
    setSuccessMessage(null);
  };
  
  const handleNewReading = () => {
    setSelectedReading(null);
    setIsCreating(true);
    setFormData({
      slug: '',
      title: '',
      author: '',
      finishedDate: null,
      coverImageSrc: '',
      thoughts: '',
      dropped: false
    });
    setFormError(null);
    setSuccessMessage(null);
  };
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox inputs differently
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } 
    // Handle date inputs
    else if (name === 'finishedDate') {
      const dateValue = value ? new Date(value) : null;
      setFormData(prev => ({ ...prev, [name]: dateValue }));
    } 
    // Handle all other inputs
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const validateForm = (): boolean => {
    if (!formData.slug) {
      setFormError('Slug is required');
      return false;
    }
    
    if (!formData.title) {
      setFormError('Title is required');
      return false;
    }
    
    if (!formData.author) {
      setFormError('Author is required');
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
      
      const endpoint = isCreating ? '/api/readings' : `/api/readings?slug=${selectedReading?.slug}`;
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
      
      const savedReading = await response.json();
      
      setSuccessMessage(isCreating ? 'Reading created successfully!' : 'Reading updated successfully!');
      
      // Refresh readings list
      fetchReadings();
      
      if (isCreating) {
        // Switch to edit mode for the new reading
        handleSelectReading(savedReading);
      } else {
        // Update the selected reading
        setSelectedReading(savedReading);
      }
      
    } catch (err) {
      console.error('Error saving reading:', err);
      setFormError(`Failed to save: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  const confirmDelete = (reading: Reading) => {
    setReadingToDelete(reading);
    setShowDeleteModal(true);
  };
  
  const handleDelete = async () => {
    if (!readingToDelete) return;
    
    try {
      setIsSaving(true);
      setFormError(null);
      
      const response = await fetch(`/api/readings?slug=${readingToDelete.slug}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer token' // In a real app, use a real token
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed with status: ${response.status}`);
      }
      
      // Refresh readings list
      fetchReadings();
      
      // Reset form if we were editing the deleted reading
      if (selectedReading?.slug === readingToDelete.slug) {
        handleNewReading();
      }
      
      setSuccessMessage(`"${readingToDelete.title}" deleted successfully!`);
    } catch (err) {
      console.error('Error deleting reading:', err);
      setFormError(`Failed to delete: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSaving(false);
      setShowDeleteModal(false);
      setReadingToDelete(null);
    }
  };
  
  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')        // Replace spaces with -
      .replace(/&/g, '-and-')      // Replace & with 'and'
      .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
      .replace(/\-\-+/g, '-');     // Replace multiple - with single -
  };
  
  const generateSlug = () => {
    if (formData.title) {
      const slug = slugify(formData.title);
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between pb-6 border-b border-gray-200 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Readings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your readings collection
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
              onClick={handleNewReading}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-0.5 mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Reading
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Readings List */}
        <div className="w-full lg:w-2/5">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-4 border-b border-gray-200 sm:px-6">
              <h2 className="text-base font-medium text-gray-900">All Readings</h2>
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
            ) : readings.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="mt-2">No readings found</p>
                <button
                  onClick={handleNewReading}
                  className="mt-3 inline-flex items-center px-3 py-1 text-sm text-blue-600 font-medium"
                >
                  Add your first reading
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 max-h-[650px] overflow-auto">
                {readings.map(reading => (
                  <li 
                    key={reading.slug}
                    className={`px-4 py-4 hover:bg-gray-50 cursor-pointer transition-colors sm:px-6 ${
                      selectedReading?.slug === reading.slug ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                    onClick={() => handleSelectReading(reading)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{reading.title}</h3>
                        <div className="mt-1 flex items-center">
                          <p className="text-sm text-gray-600 truncate">{reading.author}</p>
                        </div>
                        <div className="mt-1 flex items-center text-xs text-gray-500">
                          <span className="pr-2">
                            {reading.finishedDate ? new Date(reading.finishedDate).toLocaleDateString() : 'Unfinished'}
                          </span>
                          {reading.dropped && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Dropped
                            </span>
                          )}
                        </div>
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
          {(selectedReading || isCreating) ? (
            <div className="bg-white shadow sm:rounded-md">
              <div className="px-4 py-4 border-b border-gray-200 sm:px-6">
                <h2 className="text-lg font-medium text-gray-900">
                  {isCreating ? 'Add New Reading' : 'Edit Reading'}
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
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title || ''}
                        onChange={handleInputChange}
                        onBlur={() => !formData.slug && generateSlug()}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                        Slug <span className="text-red-500">*</span>
                      </label>
                      <button 
                        type="button"
                        onClick={generateSlug}
                        className="text-xs text-blue-600 hover:text-blue-900"
                      >
                        Generate from title
                      </button>
                    </div>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="slug"
                        name="slug"
                        value={formData.slug || ''}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      URL-friendly identifier. Example: "the-great-gatsby"
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="author" className="block text-sm font-medium text-gray-700">
                      Author <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="author"
                        name="author"
                        value={formData.author || ''}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="finishedDate" className="block text-sm font-medium text-gray-700">
                        Finished Date
                      </label>
                      <div className="mt-1">
                        <input
                          type="date"
                          id="finishedDate"
                          name="finishedDate"
                          value={formData.finishedDate ? new Date(formData.finishedDate).toISOString().split('T')[0] : ''}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Leave blank if not finished
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="coverImageSrc" className="block text-sm font-medium text-gray-700">
                        Cover Image URL
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="coverImageSrc"
                          name="coverImageSrc"
                          value={formData.coverImageSrc || ''}
                          onChange={handleInputChange}
                          placeholder="https://example.com/cover.jpg"
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="thoughts" className="block text-sm font-medium text-gray-700">
                      Thoughts
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="thoughts"
                        name="thoughts"
                        rows={5}
                        value={formData.thoughts || ''}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Your thoughts, opinions, or a brief review of the reading
                    </p>
                  </div>
                  
                  <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="dropped"
                        name="dropped"
                        type="checkbox"
                        checked={formData.dropped || false}
                        onChange={handleInputChange}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="dropped" className="font-medium text-gray-700">
                        Dropped
                      </label>
                      <p className="text-gray-500">Mark this if you didn&apos;t finish the reading</p>
                    </div>
                  </div>
                
                  <div className="pt-4 border-t border-gray-200 flex justify-between">
                    <div>
                      {!isCreating && (
                        <button
                          type="button"
                          onClick={() => confirmDelete(selectedReading!)}
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
                        onClick={isCreating ? () => setIsCreating(false) : () => setSelectedReading(null)}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No reading selected</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Select a reading from the list or create a new one
                </p>
                <div className="mt-6">
                  <button
                    onClick={handleNewReading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    New Reading
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
                      Delete Reading
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete &ldquo;{readingToDelete?.title}&rdquo;? This action cannot be undone.
                      </p>
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
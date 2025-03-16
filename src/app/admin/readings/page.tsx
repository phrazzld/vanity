'use client';

/**
 * Admin Readings Management Page
 * 
 * This page allows administrators to create, view, edit, and delete readings.
 */

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { Reading, ReadingInput } from '@/types';

export default function ReadingsManagementPage() {
  const router = useRouter();
  
  // State for readings list and loading status
  const [readings, setReadings] = useState<Reading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<Record<string, string>>({});
  
  // Debug helper function 
  const debug = (key: string, value: string) => {
    setDebugInfo(prev => ({ ...prev, [key]: value }));
  };
  
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
    
    // Add debug info about environment
    if (process.env.NEXT_PUBLIC_SPACES_BASE_URL) {
      debug('NEXT_PUBLIC_SPACES_BASE_URL', process.env.NEXT_PUBLIC_SPACES_BASE_URL);
    } else {
      debug('ENV_ERROR', 'NEXT_PUBLIC_SPACES_BASE_URL is not defined');
    }
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
    
    // Log reading details for debugging
    debug(`reading-${reading.slug}`, JSON.stringify({
      title: reading.title,
      coverImageSrc: reading.coverImageSrc,
      fullImageUrl: reading.coverImageSrc ? `${process.env.NEXT_PUBLIC_SPACES_BASE_URL}${reading.coverImageSrc}` : 'none'
    }));
    
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
    <div className="space-y-6">
      {/* Debug panel */}
      {Object.keys(debugInfo).length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400 mb-2">Image Loading Debug Info</h3>
          <div className="max-h-40 overflow-auto text-xs">
            {Object.entries(debugInfo).map(([key, value]) => (
              <div key={key} className="mb-1">
                <span className="font-medium">{key}:</span> {value}
              </div>
            ))}
          </div>
          <div className="mt-2">
            <button 
              onClick={() => setDebugInfo({})} 
              className="text-xs text-yellow-800 dark:text-yellow-400 underline"
            >
              Clear Debug Info
            </button>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Readings</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track and manage your reading collection
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
              onClick={handleNewReading}
              className="form-button-primary"
            >
              <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          <div className="item-list">
            <div className="item-list-header">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">All Readings</h2>
                {!isLoading && readings.length > 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                    {readings.length} {readings.length === 1 ? 'book' : 'books'}
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
            ) : readings.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <div className="w-16 h-16 mx-auto bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">No readings found</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Start building your literary collection</p>
                <button
                  onClick={handleNewReading}
                  className="mt-4 inline-flex items-center px-3 py-1.5 text-sm text-blue-600 font-medium"
                >
                  <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add your first reading
                </button>
              </div>
            ) : (
              <ul className="item-list-body">
                {readings.map(reading => (
                  <li 
                    key={reading.slug}
                    className={`item-list-item ${selectedReading?.slug === reading.slug ? 'item-list-item-selected' : ''}`}
                    onClick={() => handleSelectReading(reading)}
                  >
                    <div className="flex items-start gap-3">
                      {reading.coverImageSrc ? (
                        <div className="h-14 w-10 flex-shrink-0 rounded overflow-hidden border border-gray-200">
                          {process.env.NEXT_PUBLIC_SPACES_BASE_URL ? (
                            <Image 
                              src={`${process.env.NEXT_PUBLIC_SPACES_BASE_URL}${reading.coverImageSrc}`}
                              alt={`Cover for ${reading.title}`}
                              width={40}
                              height={56}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                debug(`imageError-${reading.slug}`, `Failed to load: ${process.env.NEXT_PUBLIC_SPACES_BASE_URL}${reading.coverImageSrc}`);
                                e.currentTarget.src = '/images/projects/book-02.webp';
                              }}
                            />
                          ) : (
                            <img 
                              src="/images/projects/book-02.webp"
                              alt={`Cover for ${reading.title}`}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                      ) : (
                        <div className="h-14 w-10 flex-shrink-0 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600">
                          <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">{reading.title}</h3>
                        <div className="mt-1 text-xs text-gray-600 dark:text-gray-300 truncate">{reading.author}</div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center">
                            <svg className="h-3 w-3 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {reading.finishedDate ? new Date(reading.finishedDate).toLocaleDateString() : 'Unfinished'}
                          </span>
                          {reading.dropped && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300">
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
            <div className="form-container">
              <div className="form-header">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  {isCreating ? 'Add New Reading' : 'Edit Reading'}
                </h2>
                {!isCreating && selectedReading && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                    ID: {selectedReading.id}
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
                    <h3 className="form-section-title">
                      <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Basic Information
                    </h3>
                    
                    <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-6">
                      <div className="sm:col-span-4">
                        <label htmlFor="title" className="form-label">
                          Title <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title || ''}
                            onChange={handleInputChange}
                            onBlur={() => !formData.slug && generateSlug()}
                            className="form-input pl-10"
                            placeholder="Enter book title"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="sm:col-span-2">
                        <div className="flex items-center justify-between">
                          <label htmlFor="slug" className="form-label">
                            Slug <span className="text-red-500">*</span>
                          </label>
                        </div>
                        <div className="relative mt-1 flex rounded-md shadow-sm">
                          <input
                            type="text"
                            id="slug"
                            name="slug"
                            value={formData.slug || ''}
                            onChange={handleInputChange}
                            className="form-input rounded-r-none"
                            placeholder="url-slug"
                            required
                          />
                          <button 
                            type="button"
                            onClick={generateSlug}
                            className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-xs hover:bg-gray-100"
                            title="Generate from title"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                        </div>
                        <p className="form-help-text">
                          URL-friendly identifier
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label htmlFor="author" className="form-label">
                          Author <span className="text-red-500">*</span>
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
                            className="form-input pl-10"
                            placeholder="Author name"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="sm:col-span-3">
                        <label htmlFor="finishedDate" className="form-label">
                          Finished Date
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <input
                            type="date"
                            id="finishedDate"
                            name="finishedDate"
                            value={formData.finishedDate ? new Date(formData.finishedDate).toISOString().split('T')[0] : ''}
                            onChange={handleInputChange}
                            className="form-input pl-10"
                          />
                        </div>
                        <p className="form-help-text">
                          Date when you finished reading
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-section">
                    <h3 className="form-section-title">
                      <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Cover & Content
                    </h3>
                    
                    <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label htmlFor="coverImageSrc" className="form-label">
                          Cover Image URL
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            id="coverImageSrc"
                            name="coverImageSrc"
                            value={formData.coverImageSrc || ''}
                            onChange={handleInputChange}
                            placeholder="https://example.com/cover.jpg"
                            className="form-input pl-10"
                          />
                        </div>
                      </div>
                      
                      <div className="sm:col-span-3 flex items-start pl-5 pt-6">
                        <div className="flex h-5 items-center">
                          <input
                            id="dropped"
                            name="dropped"
                            type="checkbox"
                            checked={formData.dropped || false}
                            onChange={handleInputChange}
                            className="form-checkbox"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="dropped" className="font-medium text-gray-700">
                            Dropped
                          </label>
                          <p className="text-gray-500 text-xs">Mark if you didn&apos;t finish this book</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label htmlFor="thoughts" className="form-label">
                        Your Thoughts
                      </label>
                      <div className="relative">
                        <div className="absolute top-3 left-3 pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                        </div>
                        <textarea
                          id="thoughts"
                          name="thoughts"
                          rows={5}
                          value={formData.thoughts || ''}
                          onChange={handleInputChange}
                          className="form-textarea pl-10"
                          placeholder="Share your thoughts about this reading..."
                        />
                      </div>
                      <p className="form-help-text">
                        Your thoughts, opinions, or a brief review of the reading
                      </p>
                    </div>
                  </div>
                
                  <div className="form-footer">
                    <div>
                      {!isCreating && (
                        <button
                          type="button"
                          onClick={() => confirmDelete(selectedReading!)}
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
                        onClick={isCreating ? () => setIsCreating(false) : () => setSelectedReading(null)}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No reading selected</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-md">
                  Select a reading from the list to edit it, or create a new one to add to your collection.
                </p>
                <div className="mt-6">
                  <button
                    onClick={handleNewReading}
                    className="form-button-primary"
                  >
                    <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create New Reading
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
                      Delete Reading
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Are you sure you want to delete &ldquo;{readingToDelete?.title}&rdquo;? This action cannot be undone.
                      </p>
                      <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 flex items-start gap-3">
                        {readingToDelete?.coverImageSrc ? (
                          <div className="h-14 w-10 flex-shrink-0 rounded overflow-hidden border border-gray-200 dark:border-gray-700">
                            {process.env.NEXT_PUBLIC_SPACES_BASE_URL ? (
                              <Image 
                                src={`${process.env.NEXT_PUBLIC_SPACES_BASE_URL}${readingToDelete.coverImageSrc}`}
                                alt={`Cover for ${readingToDelete.title}`}
                                width={40}
                                height={56}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  debug(`modalImageError-${readingToDelete.slug}`, `Failed to load: ${process.env.NEXT_PUBLIC_SPACES_BASE_URL}${readingToDelete.coverImageSrc}`);
                                  e.currentTarget.src = '/images/projects/book-02.webp';
                                }}
                              />
                            ) : (
                              <img 
                                src="/images/projects/book-02.webp"
                                alt={`Cover for ${readingToDelete.title}`}
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>
                        ) : (
                          <div className="h-14 w-10 flex-shrink-0 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600">
                            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{readingToDelete?.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{readingToDelete?.author}</p>
                        </div>
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
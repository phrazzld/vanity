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
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Readings Management</h1>
          <p className="text-gray-600">Add, edit and remove readings</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleNewReading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Add New Reading
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
        {/* Readings List */}
        <div className="w-full lg:w-2/5">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">All Readings</h2>
            
            {isLoading ? (
              <div className="py-8 text-center text-gray-500">Loading readings...</div>
            ) : error ? (
              <div className="py-8 text-center text-red-500">{error}</div>
            ) : readings.length === 0 ? (
              <div className="py-8 text-center text-gray-500">No readings found</div>
            ) : (
              <ul className="divide-y divide-gray-200 max-h-[600px] overflow-auto">
                {readings.map(reading => (
                  <li 
                    key={reading.slug}
                    className={`py-3 px-2 cursor-pointer hover:bg-gray-50 ${selectedReading?.slug === reading.slug ? 'bg-indigo-50' : ''}`}
                    onClick={() => handleSelectReading(reading)}
                  >
                    <div className="font-medium">{reading.title}</div>
                    <div className="text-sm text-gray-600">{reading.author}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {reading.finishedDate ? new Date(reading.finishedDate).toLocaleDateString() : 'Unfinished'}
                      {reading.dropped && <span className="ml-2 text-red-500">(Dropped)</span>}
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
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">
                {isCreating ? 'Create New Reading' : `Edit: ${selectedReading?.title}`}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="title"
                      value={formData.title || ''}
                      onChange={handleInputChange}
                      onBlur={() => !formData.slug && generateSlug()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Slug <span className="text-red-500">*</span>
                      </label>
                      <button 
                        type="button"
                        onClick={generateSlug}
                        className="text-xs text-indigo-600 hover:text-indigo-800"
                      >
                        Generate from title
                      </button>
                    </div>
                    <input
                      name="slug"
                      value={formData.slug || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Author <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="author"
                      value={formData.author || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Finished Date
                    </label>
                    <input
                      type="date"
                      name="finishedDate"
                      value={formData.finishedDate ? new Date(formData.finishedDate).toISOString().split('T')[0] : ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cover Image URL
                    </label>
                    <input
                      name="coverImageSrc"
                      value={formData.coverImageSrc || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="https://example.com/cover.jpg"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thoughts
                    </label>
                    <textarea
                      name="thoughts"
                      value={formData.thoughts || ''}
                      onChange={handleInputChange}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="dropped"
                        checked={formData.dropped || false}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Dropped (didn&apos;t finish)
                      </span>
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-between mt-6">
                  <div>
                    {!isCreating && (
                      <button
                        type="button"
                        onClick={() => confirmDelete(selectedReading!)}
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
                      onClick={isCreating ? () => setIsCreating(false) : () => setSelectedReading(null)}
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
              <h2 className="text-xl font-semibold mb-2">No Reading Selected</h2>
              <p className="text-gray-600 mb-6">
                Select a reading from the list to edit or create a new one
              </p>
              <button
                onClick={handleNewReading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Create New Reading
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
              Are you sure you want to delete &ldquo;{readingToDelete?.title}&rdquo;? This action cannot be undone.
            </p>
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
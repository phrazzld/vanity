'use client';

/**
 * Form Utilities Test Component
 * 
 * This component demonstrates the basic usage of react-hook-form.
 * It can be used as a reference for implementing forms in the admin interface.
 */

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';

// Define form input types
type Inputs = {
  name: string;
  email: string;
  message: string;
  agreeToTerms: boolean;
};

export function FormUtilsTest() {
  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<Inputs>({
    defaultValues: {
      name: '',
      email: '',
      message: '',
      agreeToTerms: false
    }
  });

  // State for form submission feedback
  const [formStatus, setFormStatus] = useState<{ 
    success?: string; 
    error?: string;
  }>({});

  // Watch form values for demonstration
  const watchedValues = watch();
  
  // Form submission handler
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Form submitted successfully:', data);
      setFormStatus({
        success: 'Form submitted successfully!'
      });
      
      // Reset form after successful submission
      reset();
    } catch (error) {
      console.error('Error submitting form:', error);
      setFormStatus({
        error: 'An error occurred while submitting the form.'
      });
    }
  };

  return (
    <div className="form-container max-w-lg mx-auto">
      <div className="form-header">
        <h2 className="text-lg font-medium text-gray-900">
          React Hook Form Test
        </h2>
      </div>
      
      <div className="form-body">
        {formStatus.error && (
          <div className="error-message">
            <svg className="h-5 w-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{formStatus.error}</span>
          </div>
        )}
        
        {formStatus.success && (
          <div className="success-message">
            <svg className="h-5 w-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{formStatus.success}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="form-section">
            <label htmlFor="name" className="form-label">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              className={`form-input ${errors.name ? 'ring-red-500' : ''}`}
              {...register('name', { 
                required: 'Name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' }
              })}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>
          
          <div className="form-section">
            <label htmlFor="email" className="form-label">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              className={`form-input ${errors.email ? 'ring-red-500' : ''}`}
              {...register('email', { 
                required: 'Email is required',
                pattern: { 
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, 
                  message: 'Invalid email address' 
                } 
              })}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>
          
          <div className="form-section">
            <label htmlFor="message" className="form-label">
              Message
            </label>
            <textarea
              id="message"
              rows={4}
              className="form-textarea"
              {...register('message')}
            />
          </div>
          
          <div className="form-section">
            <div className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="agreeToTerms"
                  type="checkbox"
                  className={`form-checkbox ${errors.agreeToTerms ? 'border-red-500' : ''}`}
                  {...register('agreeToTerms', { 
                    required: 'You must agree to the terms' 
                  })}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="agreeToTerms" className="font-medium text-gray-700">
                  I agree to the terms and conditions <span className="text-red-500">*</span>
                </label>
                {errors.agreeToTerms && (
                  <p className="mt-1 text-xs text-red-600">{errors.agreeToTerms.message}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="form-footer">
            <button
              type="button"
              onClick={() => reset()}
              className="form-button-secondary"
            >
              Reset
            </button>
            
            <button
              type="submit"
              className="form-button-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting
                </>
              ) : 'Submit'}
            </button>
          </div>
        </form>
        
        {/* Form values preview (for demonstration) */}
        <div className="mt-8 p-4 bg-gray-50 rounded-md border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Live Form Values:</h3>
          <pre className="text-xs text-gray-600 overflow-auto">
            {JSON.stringify(watchedValues, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
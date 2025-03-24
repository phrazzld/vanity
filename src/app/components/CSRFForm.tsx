/**
 * CSRFForm Component
 * 
 * A reusable component that adds CSRF protection to forms.
 * This should be used with a server action or API route.
 */

'use client';

import { CSRF_TOKEN_FIELD } from '../utils/csrf';

interface CSRFFormProps {
  children: React.ReactNode;
  action?: string | ((formData: FormData) => void);
  method?: 'get' | 'post';
  className?: string;
  csrfToken: string; // Token must be provided by a server component
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
}

export default function CSRFForm({ 
  children, 
  action,
  method = 'post',
  className = '',
  csrfToken,
  onSubmit
}: CSRFFormProps) {
  return (
    <form 
      action={action} 
      method={typeof action === 'string' ? method : undefined} 
      className={className}
      onSubmit={onSubmit}
    >
      <input 
        type="hidden" 
        name={CSRF_TOKEN_FIELD} 
        value={csrfToken} 
      />
      {children}
    </form>
  );
}
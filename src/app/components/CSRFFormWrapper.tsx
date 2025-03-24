/**
 * CSRFFormWrapper Component
 * 
 * A server component that generates a CSRF token and passes it to CSRFForm
 */

import { getFormToken } from '../utils/csrf';
import CSRFForm from './CSRFForm';

interface CSRFFormWrapperProps {
  children: React.ReactNode;
  action?: string | ((formData: FormData) => void);
  method?: 'get' | 'post';
  className?: string;
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
}

export default function CSRFFormWrapper({
  children,
  action,
  method,
  className,
  onSubmit
}: CSRFFormWrapperProps) {
  // Generate a CSRF token on the server
  const csrfToken = getFormToken();
  
  return (
    <CSRFForm
      action={action}
      method={method}
      className={className}
      csrfToken={csrfToken}
      onSubmit={onSubmit}
    >
      {children}
    </CSRFForm>
  );
}
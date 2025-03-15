# Form Utilities Documentation

This document provides a guide for implementing forms using `react-hook-form` in the Vanity project.

## Installation

The `react-hook-form` library has been installed as a project dependency:

```bash
npm install react-hook-form
```

## Basic Usage

Import the necessary hooks and types from react-hook-form:

```tsx
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
```

### Setting up a form

1. Define your form input types:

```tsx
type FormInputs = {
  title: string;
  author: string;
  // other fields...
};
```

2. Initialize the form with useForm hook:

```tsx
const {
  register,
  handleSubmit,
  control,
  formState: { errors, isSubmitting },
  reset,
  watch,
  setValue
} = useForm<FormInputs>({
  defaultValues: {
    title: '',
    author: '',
    // other default values...
  }
});
```

3. Create a submit handler:

```tsx
const onSubmit: SubmitHandler<FormInputs> = async (data) => {
  try {
    // Handle form submission
    // Example: API call to save data
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    // Handle response
    if (!response.ok) throw new Error('Submission failed');
    
    // Reset form on success
    reset();
    
    // Show success message
    setSuccessMessage('Form submitted successfully!');
  } catch (error) {
    // Handle error
    setErrorMessage('Failed to submit form');
  }
};
```

4. Create form elements with validation:

```tsx
<form onSubmit={handleSubmit(onSubmit)}>
  <div>
    <label htmlFor="title">Title</label>
    <input
      id="title"
      {...register('title', { 
        required: 'Title is required',
        minLength: { value: 2, message: 'Title must be at least 2 characters' }
      })}
    />
    {errors.title && <p>{errors.title.message}</p>}
  </div>
  
  {/* Other form fields */}
  
  <button type="submit" disabled={isSubmitting}>
    {isSubmitting ? 'Submitting...' : 'Submit'}
  </button>
</form>
```

## Advanced Features

### Form Validation

react-hook-form supports various validation methods:

```tsx
// Required field
{...register('field', { required: 'This field is required' })}

// Min/max length
{...register('field', { 
  minLength: { value: 2, message: 'Too short' },
  maxLength: { value: 100, message: 'Too long' }
})}

// Pattern (regex)
{...register('email', { 
  pattern: { 
    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    message: 'Invalid email address' 
  } 
})}

// Custom validation
{...register('field', { 
  validate: value => value !== 'invalid' || 'This value is not allowed'
})}
```

### Controlled Components

For components that need more control, use the Controller component:

```tsx
<Controller
  name="fieldName"
  control={control}
  rules={{ required: 'This field is required' }}
  render={({ field, fieldState: { error } }) => (
    <div>
      <CustomInput {...field} />
      {error && <p>{error.message}</p>}
    </div>
  )}
/>
```

### Field Arrays

For handling dynamic form arrays:

```tsx
import { useFieldArray } from 'react-hook-form';

// Inside your component
const { fields, append, remove } = useFieldArray({
  control,
  name: "items",
});

// Render fields
{fields.map((field, index) => (
  <div key={field.id}>
    <input {...register(`items.${index}.value`)} />
    <button type="button" onClick={() => remove(index)}>Remove</button>
  </div>
))}

// Add new item
<button type="button" onClick={() => append({ value: '' })}>
  Add Item
</button>
```

## Example Implementation

A full example implementation can be found in:
- `/src/app/admin/FormUtilsTest.tsx` - Demo component showing basic usage

## Best Practices

1. **Type Safety**: Always define TypeScript interfaces for your form inputs
2. **Error Handling**: Display validation errors close to the relevant fields
3. **Loading States**: Disable the submit button during form submission
4. **Reset**: Provide a way to reset the form to initial values
5. **Feedback**: Show success/error messages after form submission
6. **Validation**: Use appropriate validation rules for each field type

## Additional Resources

- [React Hook Form Documentation](https://react-hook-form.com/get-started)
- [API Reference](https://react-hook-form.com/api)
- [Examples](https://github.com/react-hook-form/react-hook-form/tree/master/examples)
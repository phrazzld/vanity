# Input Validation in Vanity API

This document outlines the input validation rules implemented in the Vanity API, particularly for the Readings API.

## Readings API Validation

The Readings API implements comprehensive validation for all input fields to ensure data integrity and security.

### Required Fields

When creating a new reading (POST requests), the following fields are required:
- `slug` - Unique identifier for the reading
- `title` - Title of the book or reading
- `author` - Author of the book or reading

### Field-Specific Validation Rules

#### Slug
- Must be a string
- Cannot be empty
- Maximum length: 100 characters
- Must contain only lowercase letters, numbers, and hyphens
- Must start and end with a letter or number
- Cannot have consecutive hyphens

#### Title
- Must be a string
- Cannot be empty
- Maximum length: 200 characters

#### Author
- Must be a string
- Cannot be empty
- Maximum length: 100 characters

#### Finished Date
- Must be a valid date if provided
- Cannot be in the future
- Can be set to null (for in-progress readings)

#### Cover Image Source
- Must be a string if provided
- Can be null
- If not empty, must be a valid path format (e.g., /covers/image.jpg)

#### Thoughts
- Must be a string if provided
- Maximum length: 10,000 characters

#### Dropped
- Must be a boolean value if provided

### Validation Response Format

When validation fails, the API returns a 400 Bad Request status with detailed error information:

```json
{
  "error": "Validation failed",
  "validationErrors": {
    "slug": "Slug must contain only lowercase letters, numbers, and hyphens...",
    "title": "Title must be less than 200 characters",
    "author": "Author cannot be empty"
  }
}
```

This format allows clients to easily identify and display field-specific validation errors.

## Implementation Notes

- Validation is performed using the `validateReadingInput` function in the API route handler
- Different validation rules apply for POST (create) and PUT (update) operations:
  - For POST, all required fields must be present
  - For PUT, only the fields being updated are validated
- All validation occurs server-side before any database operations
- Input validation is the first line of defense in the API security strategy
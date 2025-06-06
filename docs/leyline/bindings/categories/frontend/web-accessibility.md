---
derived_from: explicit-over-implicit
enforced_by: Code review, Automated a11y testing
id: web-accessibility
last_modified: '2025-05-14'
---
# Binding: Web Accessibility

Make all web interfaces accessible to people with disabilities by following WCAG 2.1 AA
standards—implementing keyboard navigation, proper semantic structure, sufficient color
contrast, clear focus management, and appropriate ARIA attributes.

## Rationale

This binding directly implements our explicit-over-implicit tenet by requiring
developers to make accessibility considerations explicit rather than assuming interfaces
will naturally be accessible. Accessible design forces us to think clearly about how our
interfaces are structured, navigated, and interacted with—making our intentions explicit
in the code rather than relying on browser defaults or visual-only design patterns.

Accessibility isn't just a checkbox for compliance or a nice-to-have feature—it's a
fundamental requirement for building high-quality software. When 15-20% of the world's
population has some form of disability, making your applications inaccessible
effectively means blocking a significant portion of potential users from using your
product. Think of accessibility as the digital equivalent of building ramps alongside
stairs—it ensures everyone can enter your building, regardless of their abilities.

Beyond the ethical imperative, accessible applications deliver tangible business
benefits. They reach larger audiences, comply with increasingly common legal
requirements, rank better in search engines, and often provide better experiences for
*all* users. Consider how voice interfaces like Siri and Alexa rely on the same semantic
structures that screen readers use, or how keyboard shortcuts benefit both power users
and those with motor impairments. Properly implemented accessibility creates more
robust, flexible interfaces that work better across different contexts and devices.

## Rule Definition

This binding establishes these core requirements for web accessibility:

- **Meet WCAG 2.1 AA Standards**: All frontend applications **MUST** meet
  [Web Content Accessibility Guidelines (WCAG) 2.1 Level AA](https://www.w3.org/WAI/WCAG21/quickref/)
  at minimum. This is a comprehensive standard that covers most accessibility needs.

- **Ensure Keyboard Accessibility**: All interactive elements **MUST** be fully
  accessible with a keyboard alone. Users should be able to:

  - Tab through all interactive elements in a logical order
  - Activate buttons, links, and form controls using only the keyboard
  - Navigate complex interfaces (menus, modals, etc.) with appropriate keyboard
    shortcuts

- **Provide Proper Semantic Structure**: Content **MUST** be structured using
  appropriate semantic HTML elements and ARIA attributes to ensure screen readers can
  interpret the page correctly:

  - Use proper heading hierarchy (`<h1>` through `<h6>`)
  - Use semantic elements (`<nav>`, `<main>`, `<article>`, etc.) for major page sections
  - Add ARIA roles, properties, and states when HTML semantics are insufficient
  - Ensure form fields have associated labels

- **Maintain Sufficient Color Contrast**: All text and essential UI elements **MUST**
  meet minimum contrast ratios:

  - 4.5:1 for normal text
  - 3:1 for large text (18pt or 14pt bold)
  - 3:1 for UI components and graphical objects

- **Implement Focus Management**: Focus indicators **MUST** be visible and focus order
  **MUST** be logical:

  - Never remove focus outlines without providing an alternative
  - Trap focus within modal dialogs when they're open
  - Return focus to a logical location when interactions complete
  - Maintain a tab order that matches the visual flow of the page

- **Provide Text Alternatives**: All non-text content (images, icons, etc.) **MUST**
  have text alternatives:

  - Add alt text to images that convey meaning
  - Provide transcripts for audio content
  - Include captions for video content
  - Ensure icon buttons have accessible labels

In rare cases, exceptions to these rules may be necessary, but they must be explicitly
documented, justified, and approved. Even in these cases, alternative accessible paths
must be provided whenever possible.

## Practical Implementation

1. **Start with Semantic HTML**: The foundation of accessibility is proper HTML
   structure:

   ```jsx
   // ❌ BAD: Div soup with no semantic meaning
   <div className="nav">
     <div className="logo">Logo</div>
     <div className="links">
       <div className="link" onClick={handleClick}>Home</div>
       <div className="link" onClick={handleClick}>About</div>
     </div>
   </div>

   // ✅ GOOD: Semantic HTML that conveys meaning
   <nav aria-label="Main navigation">
     <div className="logo" aria-hidden="true">Logo</div>
     <ul className="links">
       <li><a href="/">Home</a></li>
       <li><a href="/about">About</a></li>
     </ul>
   </nav>
   ```

1. **Implement Keyboard Navigation**: Ensure all interactive elements are
   keyboard-accessible:

   - Test tab order and navigation flow
   - Add keyboard event handlers for custom components
   - Use `tabIndex` strategically (avoid positive values)
   - Implement standard keyboard patterns (arrow keys for navigation, Enter/Space for
     activation)

   ```jsx
   // Accessible menu button implementation
   function MenuButton({ children, onClick }) {
     return (
       <button
         onClick={onClick}
         aria-haspopup="true"
         aria-expanded={isOpen}
         onKeyDown={(e) => {
           // Handle arrow key navigation
           if (e.key === 'ArrowDown') {
             e.preventDefault();
             focusFirstMenuItem();
           }
         }}
       >
         {children}
       </button>
     );
   }
   ```

1. **Manage Focus Properly**: Implement proper focus management for dynamic content:

   - Use `useRef` and `focus()` to manage focus in React components
   - Create focus traps for modal dialogs
   - Return focus after temporary UI elements close
   - Ensure focus indicators are visible

   ```jsx
   function Modal({ isOpen, onClose, children }) {
     const modalRef = useRef(null);

     // Move focus to modal when it opens
     useEffect(() => {
       if (isOpen && modalRef.current) {
         modalRef.current.focus();
       }
     }, [isOpen]);

     if (!isOpen) return null;

     return (
       <div className="modal-overlay">
         <div
           ref={modalRef}
           className="modal"
           role="dialog"
           aria-modal="true"
           tabIndex={-1}
         >
           {children}
           <button onClick={onClose}>Close</button>
         </div>
       </div>
     );
   }
   ```

1. **Add ARIA Attributes Judiciously**: Use ARIA to enhance HTML semantics when needed:

   - Follow the "first rule of ARIA": don't use ARIA if native HTML can do the job
   - Add `aria-label`, `aria-labelledby`, or `aria-describedby` for context
   - Use `aria-expanded`, `aria-controls`, and other state attributes
   - Implement proper ARIA roles for custom components

   ```jsx
   // Form with proper ARIA attributes
   <form>
     <div className="form-group">
       <label id="nameLabel" htmlFor="name">Full Name</label>
       <input
         id="name"
         aria-labelledby="nameLabel nameHint"
         aria-required="true"
       />
       <p id="nameHint" className="hint">Enter your legal name as it appears on your ID</p>
     </div>

     <div className="form-group">
       <fieldset>
         <legend>Notification Preferences</legend>
         <div>
           <input type="checkbox" id="email" />
           <label htmlFor="email">Email</label>
         </div>
         <div>
           <input type="checkbox" id="sms" />
           <label htmlFor="sms">SMS</label>
         </div>
       </fieldset>
     </div>
   </form>
   ```

1. **Implement Automated Testing**: Set up accessibility testing in your workflow:

   - Add axe-core or similar tools to your test suite
   - Enable accessibility linting in your IDE
   - Set up Storybook a11y addon for component testing
   - Integrate accessibility checks into CI/CD pipeline

   ```jsx
   // Example Jest test with jest-axe
   import { axe } from 'jest-axe';

   test('Button component has no accessibility violations', async () => {
     const { container } = render(<Button>Click Me</Button>);
     const results = await axe(container);
     expect(results).toHaveNoViolations();
   });
   ```

## Examples

```jsx
// ❌ BAD: Inaccessible button implementation
function IconButton({ icon, onClick }) {
  return (
    <div
      className="icon-button"
      onClick={onClick}
    >
      <i className={`icon-${icon}`} />
    </div>
  );
}

// ✅ GOOD: Accessible button implementation
function IconButton({ icon, label, onClick }) {
  return (
    <button
      className="icon-button"
      onClick={onClick}
      aria-label={label}
    >
      <i className={`icon-${icon}`} aria-hidden="true" />
    </button>
  );
}

// Usage
<IconButton
  icon="trash"
  label="Delete item"
  onClick={handleDelete}
/>
```

```jsx
// ❌ BAD: Inaccessible form with missing labels and error handling
function ContactForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError('Invalid email');
      return;
    }
    // Submit form...
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className={`input-group ${error ? 'error' : ''}`}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />
      </div>
      {error && <div className="error-text">{error}</div>}
      <div className="submit-btn" onClick={handleSubmit}>
        Submit
      </div>
    </form>
  );
}

// ✅ GOOD: Accessible form with proper labels and error handling
function ContactForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const errorId = 'email-error';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError('Invalid email format. Please enter a valid email address.');
      return;
    }
    // Submit form...
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={!!error}
          required
        />
        {error && (
          <div id={errorId} className="error-text" role="alert">
            {error}
          </div>
        )}
      </div>
      <button type="submit">Submit</button>
    </form>
  );
}
```

```jsx
// ❌ BAD: Inaccessible modal dialog
function Modal({ isOpen, children }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        {children}
        <div className="close-btn" onClick={onClose}>×</div>
      </div>
    </div>
  );
}

// ✅ GOOD: Accessible modal with proper focus management
function Modal({ isOpen, onClose, title, children }) {
  const modalRef = useRef(null);
  const [previouslyFocused, setPreviouslyFocused] = useState(null);

  useEffect(() => {
    if (isOpen) {
      // Store the element that had focus before opening the modal
      setPreviouslyFocused(document.activeElement);

      // Move focus to the modal
      if (modalRef.current) {
        modalRef.current.focus();
      }

      // Add event listener for ESC key
      const handleEsc = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      document.addEventListener('keydown', handleEsc);

      // Prevent scrolling the background
      document.body.style.overflow = 'hidden';

      return () => {
        // Cleanup
        document.removeEventListener('keydown', handleEsc);
        document.body.style.overflow = '';

        // Return focus to the previously focused element
        if (previouslyFocused) {
          previouslyFocused.focus();
        }
      };
    }
  }, [isOpen, onClose, previouslyFocused]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        ref={modalRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="modal-title">{title}</h2>
        <div className="modal-content">
          {children}
        </div>
        <button
          className="close-btn"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>
      </div>
    </div>
  );
}
```

## Related Bindings

- [component-architecture.md](../../docs/bindings/core/component-architecture.md): Properly structured components
  following Atomic Design principles provide a solid foundation for accessibility. This
  binding extends component architecture by adding accessibility requirements to the
  component design process.

- [frontend-state-management.md](../../docs/bindings/categories/frontend/state-management.md): Effective state
  management is crucial for tracking UI states that affect accessibility, such as
  whether a component is expanded, focused, or in an error state. The state management
  binding complements accessibility by providing patterns for managing these states.

- [../tenets/explicit-over-implicit.md](../../docs/tenets/explicit-over-implicit.md): This
  binding directly implements the explicit-over-implicit tenet by requiring developers
  to explicitly consider and implement accessibility features rather than making
  implicit assumptions about how users interact with interfaces.

- [api-design.md](../../docs/bindings/core/api-design.md): For frontend components, the API is the props
  interface. Accessible components need well-designed, explicit APIs that provide all
  necessary properties for accessibility (labels, descriptions, ARIA attributes),
  connecting these two bindings.

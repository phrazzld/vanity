# Keyboard Navigation Utilities

This document describes the keyboard navigation utilities implemented in the project to ensure WCAG 2.1 AA compliance for keyboard accessibility.

## Core Principles

- **Focus Management**: Ensure all interactive elements can receive keyboard focus
- **Navigation**: Support arrow key navigation within components
- **Focus Trapping**: Contain focus within modals and dialogs
- **Keyboard Shortcuts**: Provide consistent keyboard shortcuts
- **Skip Links**: Allow users to bypass navigation elements

## Directory Structure

```
src/
├── utils/
│   └── keyboard/           # Core utility functions
│       ├── constants.ts    # Keyboard key constants and selectors
│       ├── focus.ts        # Focus management utilities
│       ├── index.ts        # Main exports
│       ├── navigation.ts   # Arrow key navigation utilities
│       ├── shortcuts.ts    # Keyboard shortcut utilities
│       ├── trap.ts         # Focus trapping utilities
│       └── types.ts        # TypeScript types and interfaces
├── hooks/
│   └── keyboard/           # React hooks
│       ├── useArrowNavigation.ts  # Hook for arrow key navigation
│       ├── useFocusTrap.ts        # Hook for focus trapping
│       ├── useGridNavigation.ts   # Hook for 2D grid navigation
│       ├── useShortcuts.ts        # Hook for keyboard shortcuts
│       └── index.ts               # Main exports
└── app/
    └── components/
        └── keyboard/       # React components
            ├── ArrowNavigation.tsx  # Component for arrow key navigation
            ├── FocusTrap.tsx        # Component for focus trapping
            ├── SkipLink.tsx         # Skip navigation link component
            └── index.ts             # Main exports
```

## Usage Examples

### Focus Trapping (for Modals)

```tsx
import { FocusTrap } from '@/app/components/keyboard';

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <FocusTrap onEscape={onClose}>
      <div className="modal">
        <button onClick={onClose}>Close</button>
        {children}
      </div>
    </FocusTrap>
  );
}
```

### Arrow Key Navigation (for Menus)

```tsx
import { ArrowNavigation } from '@/app/components/keyboard';

function Menu({ items }) {
  return (
    <ArrowNavigation direction="vertical">
      <ul role="menu">
        {items.map(item => (
          <li key={item.id} role="menuitem" tabIndex={0}>
            {item.label}
          </li>
        ))}
      </ul>
    </ArrowNavigation>
  );
}
```

### Skip Link (for Main Content)

```tsx
import { SkipLink } from '@/app/components/keyboard';

function Layout({ children }) {
  return (
    <>
      <SkipLink targetId="main-content" />
      <header>...</header>
      <nav>...</nav>
      <main id="main-content">{children}</main>
      <footer>...</footer>
    </>
  );
}
```

### Keyboard Shortcuts

```tsx
import { useShortcuts } from '@/hooks/keyboard';

function SearchComponent() {
  const inputRef = useRef(null);

  // Register a keyboard shortcut
  useShortcuts([
    {
      id: 'focus-search',
      keyCombination: 'ctrl+k',
      handler: () => {
        inputRef.current?.focus();
      },
      description: 'Focus the search input',
    },
  ]);

  return <input ref={inputRef} type="search" placeholder="Search (Ctrl+K)" />;
}
```

### Using Direct Utilities

```tsx
import { createFocusTrap, handleArrowNavigation } from '@/utils/keyboard';

// In a component
useEffect(() => {
  const container = containerRef.current;
  if (!container) return;

  // Create a focus trap
  const cleanup = createFocusTrap(container);

  // Set up keyboard navigation
  const handleKeyDown = event => {
    handleArrowNavigation(event, container, {
      direction: 'horizontal',
      loop: true,
    });
  };

  container.addEventListener('keydown', handleKeyDown);

  return () => {
    cleanup();
    container.removeEventListener('keydown', handleKeyDown);
  };
}, []);
```

## WCAG 2.1 AA Requirements Addressed

These utilities help meet the following WCAG 2.1 AA requirements:

- **2.1.1 Keyboard**: All functionality is operable through a keyboard interface
- **2.1.2 No Keyboard Trap**: Keyboard focus can be moved away from components
- **2.4.3 Focus Order**: Focus moves in a sequence that preserves meaning
- **2.4.7 Focus Visible**: Keyboard focus indicator is visible
- **2.4.1 Bypass Blocks**: Skip navigation links are provided

## Testing Keyboard Accessibility

1. **Keyboard Navigation Testing**: Ensure all interactive elements can be accessed using Tab key
2. **Focus Visibility**: Verify that focused elements have visible focus indicators
3. **Keyboard Traps**: Test that modals trap focus, and focus can be moved away when closed
4. **Keyboard Shortcuts**: Test that shortcuts work consistently

/**
 * FocusTrap component for trapping focus within a container
 * Used for modals, dialogs, and other components that need to trap focus
 */
import React, { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { useFocusTrap } from '../../../hooks/keyboard';
import type { FocusTrapOptions } from '../../../utils/keyboard';

export interface FocusTrapProps extends HTMLAttributes<HTMLDivElement>, FocusTrapOptions {
  /**
   * The element to render as the container
   * @default 'div'
   */
  as?: React.ElementType;
}

/**
 * Component that traps focus within its container
 * Useful for modals, dialogs, and other components that need keyboard focus containment
 */
export const FocusTrap = forwardRef<HTMLDivElement, FocusTrapProps>((props, externalRef) => {
  const {
    children,
    as: Component = 'div',
    enabled = true,
    initialFocus = true,
    returnFocusOnUnmount = true,
    onEscape,
    ...divProps
  } = props;

  const trapOptions: FocusTrapOptions = {
    enabled,
    initialFocus,
    returnFocusOnUnmount,
    onEscape,
  };

  const focusTrapRef = useFocusTrap(trapOptions);

  // Combine refs
  const setRefs = (element: HTMLDivElement) => {
    // Set the internal ref
    if (focusTrapRef) {
      (focusTrapRef as React.MutableRefObject<HTMLDivElement | null>).current = element;
    }

    // Forward the ref
    if (externalRef) {
      if (typeof externalRef === 'function') {
        externalRef(element);
      } else {
        (externalRef as React.MutableRefObject<HTMLDivElement | null>).current = element;
      }
    }
  };

  return (
    <Component ref={setRefs} {...divProps}>
      {children}
    </Component>
  );
});

FocusTrap.displayName = 'FocusTrap';

export default FocusTrap;

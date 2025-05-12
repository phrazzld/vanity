/**
 * ArrowNavigation component for keyboard arrow key navigation
 */
import React, { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { useArrowNavigation } from '../../../hooks/keyboard';
import type { ArrowNavigationOptions } from '../../../utils/keyboard';

export interface ArrowNavigationProps
  extends HTMLAttributes<HTMLDivElement>,
    ArrowNavigationOptions {
  /**
   * The element to render as the container
   * @default 'div'
   */
  as?: React.ElementType;
}

/**
 * Component that provides arrow key navigation for its children
 * Wraps focusable elements and enables arrow key navigation between them
 */
export const ArrowNavigation = forwardRef<HTMLDivElement, ArrowNavigationProps>(
  (props, externalRef) => {
    const {
      children,
      as: Component = 'div',
      direction = 'both',
      loop = true,
      preventScroll = true,
      onNavigate,
      ...divProps
    } = props;

    const navigationOptions: ArrowNavigationOptions = {
      direction,
      loop,
      preventScroll,
      onNavigate,
    };

    const arrowNavRef = useArrowNavigation(navigationOptions);

    // Combine refs
    const setRefs = (element: HTMLDivElement) => {
      // Set the internal ref
      if (arrowNavRef) {
        (arrowNavRef as React.MutableRefObject<HTMLDivElement | null>).current = element;
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

    // Add ARIA role for accessibility
    const ariaProps = {
      role: 'group',
      ...divProps,
    };

    return (
      <Component ref={setRefs} {...ariaProps}>
        {children}
      </Component>
    );
  }
);

ArrowNavigation.displayName = 'ArrowNavigation';

export default ArrowNavigation;

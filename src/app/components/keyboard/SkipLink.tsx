/**
 * SkipLink component for keyboard accessibility
 * Allows keyboard users to skip navigation and go directly to main content
 */
import React, { useState } from 'react';

export interface SkipLinkProps {
  /**
   * The ID of the element to skip to (without '#')
   */
  targetId: string;

  /**
   * Text to display in the skip link
   * @default 'Skip to main content'
   */
  text?: string;

  /**
   * Additional class names to apply to the skip link
   */
  className?: string;
}

/**
 * Component that provides a skip link for keyboard users to bypass navigation
 * It's visually hidden until it receives focus, following accessibility best practices
 */
export const SkipLink: React.FC<SkipLinkProps> = ({
  targetId,
  text = 'Skip to main content',
  className = '',
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Base styles to visually hide the link until it's focused
  const baseStyles: React.CSSProperties = {
    position: 'absolute',
    width: isFocused ? 'auto' : '1px',
    height: isFocused ? 'auto' : '1px',
    padding: isFocused ? '0.5rem 1rem' : 0,
    margin: isFocused ? '1rem' : '-1px',
    overflow: 'hidden',
    clip: isFocused ? 'auto' : 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    backgroundColor: '#fff',
    color: '#000',
    zIndex: 9999,
    textDecoration: 'none',
    fontWeight: 'bold',
    border: '2px solid #000',
    borderRadius: '4px',
    top: 0,
    left: 0,
  };

  return (
    <a
      href={`#${targetId}`}
      className={className}
      style={baseStyles}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      {text}
    </a>
  );
};

export default SkipLink;

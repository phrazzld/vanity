# Vanity Design Token System

This document describes the design token system implemented for the Vanity project. Design tokens are the visual design atoms of the design system — specifically, they are named entities that store visual design attributes such as colors, typography, spacing, and more.

## Overview

The design token system is implemented through a combination of:

1. Tailwind CSS configuration (`tailwind.config.ts`)
2. CSS variables (in `globals.css`)
3. Component-specific styles

The system enables consistent design across the application, supports dark mode, and ensures responsive layouts.

## Token Categories

### Colors

#### Base Palette

The base color palette consists of:

- **Gray**: Neutral colors from `gray-50` (lightest) to `gray-950` (darkest)
- **Blue**: Primary brand colors from `blue-50` to `blue-900`
- **Green**: Success colors from `green-50` to `green-900`

#### Semantic Tokens

- **Theme Tokens**: Dynamic tokens that adapt between light and dark modes

  - `background`: Page background
  - `foreground`: Primary text color
  - `card`: Card background
  - `card-foreground`: Card text color
  - `popover`: Popover background
  - `popover-foreground`: Popover text color
  - `border`: Border color
  - `input`: Input field backgrounds
  - `muted`: Muted background areas
  - `muted-foreground`: Text in muted areas
  - `accent`: Accent background
  - `accent-foreground`: Text on accent backgrounds

- **Primary Colors**: Primary UI colors from `primary-50` to `primary-900`

  - In light mode: Based on blue palette
  - In dark mode: Inverted for better contrast

- **Status Colors**: Colors representing different states
  - `status.reading`: Currently reading state
  - `status.finished`: Completed reading state
  - `status.paused`: Paused reading state

### Typography

#### Font Families

- `font-inter`: Primary font for body text (Inter)
- `font-space-grotesk`: Secondary font for headings (Space Grotesk)

#### Font Sizes

Standard Tailwind font sizes from `xs` to `6xl`, with appropriate line heights

#### Font Weights

Standard font weights: `400` (normal), `500` (medium), `600` (semibold), `700` (bold)

### Spacing

Standard Tailwind spacing scale extended with additional values:

- `4.5`: 1.125rem (18px)
- `7.5`: 1.875rem (30px)
- `13`: 3.25rem (52px)

### Borders

#### Border Radius

- `rounded-sm`: 0.125rem (2px)
- `rounded-md`: 0.375rem (6px)
- `rounded-lg`: 0.5rem (8px)
- `rounded-xl`: 0.75rem (12px)
- `rounded-2xl`: 1rem (16px)
- `rounded-3xl`: 1.5rem (24px)
- `rounded-pill`: 9999px (pill shape)

### Shadows

- Standard Tailwind shadows (`shadow-sm` to `shadow-2xl`)
- Custom shadows:
  - `shadow-card`: Subtle shadow for cards
  - `shadow-card-dark`: Subtle shadow for cards in dark mode
  - `shadow-card-hover`: Enhanced shadow for card hover state
  - `shadow-card-hover-dark`: Enhanced shadow for card hover state in dark mode

### Animations

- `animate-fade-in`: Fade in from below animation
- `animate-spin-slow`: Slow spinning animation
- `animate-bounce-slow`: Slow bouncing animation
- `animate-pulse-reading`: Pulsing animation for reading indicator

### Transitions

- `ease-elegant-entrance`: Cubic bezier for elegant entrance animations
- `ease-standard-exit`: Standard easing for exit animations
- `ease-content-entrance`: Specialized easing for content reveals

## Usage Guidelines

### Color Usage

- Use semantic color tokens (`background`, `foreground`, etc.) instead of direct color values
- Use status colors for their specific meaning only
- Maintain adequate contrast for accessibility

### Typography

- Use appropriate heading levels (`h1`-`h6`) for document structure
- Maintain consistent font usage:
  - Space Grotesk for headings and prominent text
  - Inter for body text and UI elements

### Component Patterns

- Button variations:
  - `.btn` + `.btn-primary`
  - `.btn` + `.btn-secondary`
  - `.btn` + `.btn-outline`
  - `.btn` + `.btn-ghost`
- Button sizes:
  - `.btn-sm`: Small
  - `.btn-md`: Medium (default)
  - `.btn-lg`: Large

### Dark Mode

Dark mode is implemented using the `class` strategy:

- The `dark` class is added to the `html` element
- CSS variables and Tailwind's dark mode variants handle theme switching
- Always test both light and dark modes when making changes

## Extensions

When extending the design system:

1. Add new tokens to `tailwind.config.ts` under the appropriate category
2. If needed, add CSS variables in `globals.css` for tokens that need to change with theme
3. Document new tokens in this file
4. Create examples in Storybook to showcase usage

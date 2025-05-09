# State Management Developer Tools

This document explains how to use the state management developer tools configured for the Vanity project.

## Overview

The Vanity project uses two primary state management solutions, each with their own developer tools:

1. **TanStack Query** - For server state management
2. **Zustand** - For UI state management

The developer tools provide visibility into state changes, data fetching, caching, and make debugging easier.

## TanStack Query DevTools

TanStack Query DevTools provide a visual interface to inspect queries, mutations, and the cache.

### How to Access

The DevTools are only available in development mode and can be accessed in two ways:

1. **Floating Panel**: By default, there's a small floating panel at the bottom of the application. Click on it to open the full DevTools panel.

2. **Keyboard Shortcut**: Press `Shift + L` to toggle the DevTools panel.

### Features

- **Queries**: View all active and inactive queries, their status, data, and last updated time.
- **Cache Inspector**: Explore the structure of the query cache.
- **Query Explorer**: Filter queries by status (active, inactive, stale).
- **Refetch Button**: Manually trigger refetching of queries.
- **Clear Cache**: Reset the entire query cache.

## Zustand with Redux DevTools

Zustand stores are connected to Redux DevTools for state inspection and time-travel debugging.

### Setup

1. Install the [Redux DevTools browser extension](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd) for Chrome or the equivalent for your browser.

2. Open the Redux DevTools in your browser's developer tools panel when running the application in development mode.

### Features

- **State Inspection**: View the current state of each store in real-time.
- **Action History**: See all actions that have modified the state.
- **Time Travel**: Jump back and forth between different states.
- **State Diff**: Visualize what changed between states.
- **Multiple Stores**: Switch between `ThemeStore` and `UIStore` in the dropdown selector.

### Available Stores

1. **ThemeStore**: Contains dark mode state and related actions.

   - Key state: `isDarkMode`
   - Actions: `toggleDarkMode`, `setDarkMode`

2. **UIStore**: Contains UI-related state like sidebar, modals, and search.
   - Key states: `isSidebarOpen`, `activeModal`, `globalSearchQuery`, `isSearchActive`
   - Actions: Various open/close/toggle functions for each feature

## Best Practices

1. **Development Only**: These tools are only available in development mode and disabled in production.

2. **Performance Impact**: The DevTools can impact performance, so they are disabled by default and must be explicitly opened.

3. **Debugging**: When encountering state-related issues:

   - Check the Redux DevTools for unexpected state changes in Zustand stores
   - Use TanStack Query DevTools to verify that queries are running and returning expected data

4. **Logging**: Extra logging is enabled in development mode for TanStack Query to provide additional context in the console.

## Troubleshooting

If you don't see the DevTools:

1. Verify you're running in development mode (`npm run dev`)
2. Check the browser console for any errors
3. For Redux DevTools, ensure the browser extension is installed and active
4. For TanStack Query DevTools, try the keyboard shortcut `Shift + L`

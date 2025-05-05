## Technical Overview of `/Users/phaedrus/Development/vanity/src/app/map` Directory

This directory implements a map page within a Next.js application. Its primary purpose is to display an interactive map, leveraging client-side rendering for the map component to handle potential browser-specific dependencies or performance considerations.

**Architecture:**

The directory follows a simple, modular architecture utilizing Next.js's app router. It consists of three key files: `page.tsx`, `ClientMapWrapper.tsx`, and `data.ts`. The `page.tsx` file serves as the entry point for the `/map` route. It imports and renders `ClientMapWrapper.tsx`. `ClientMapWrapper.tsx` is a client component responsible for dynamically importing the actual map component (located at `@/app/components/Map`) using `next/dynamic`.  `data.ts` exports static map data in the form of a `PLACES` array of `Place` objects, where each object contains the id, name, latitude, longitude, and note of a particular location.

**Key File Roles:**

*   **`page.tsx`**: The main page component for the `/map` route. It acts as a container for the client-side map wrapper.
*   **`ClientMapWrapper.tsx`**: A client-side component that dynamically imports the actual map component to enable client-side rendering. This is crucial for components that rely on browser APIs or require significant client-side processing.
*   **`data.ts`**: Defines the `Place` type and exports the `PLACES` array containing static data for map markers. This data includes geographical coordinates and descriptive notes for each location.

**Dependencies and Gotchas:**

*   **`next/dynamic`**: This is a critical dependency, provided by Next.js, used for dynamically importing the `@/app/components/Map` component. This allows the map component to be rendered only on the client-side, bypassing server-side rendering (SSR). This is often necessary when the map component relies on browser-specific APIs or libraries.
*   **`@/app/components/Map`**: This represents the actual map implementation. The functionality of this directory depends entirely on the implementation and dependencies of the map component itself (e.g., Leaflet, Google Maps API, etc.).
*   **Client-Side Rendering:** The entire map rendering process is forced to the client-side. This might impact initial page load time if the map component is large and complex. It also means that the map content won't be indexed by search engines unless specific SEO strategies are implemented.
*   **Static Data:** The map data is currently defined statically in `data.ts`. This limits the map's ability to display dynamic or real-time data without modification to the underlying code.

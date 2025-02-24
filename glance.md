## Technical Overview: `/Users/phaedrus/Development/vanity`

This directory contains the source code and assets for a Next.js-based personal portfolio website.  The application comprises client-side rendered (CSR) components, statically-generated assets, and a Git repository.

**1. Purpose:** The application serves as a personal portfolio website, showcasing projects, a reading list, a travel map, and introductory content.

**2. Architecture:** The application follows a Next.js app directory structure, using a component-based architecture. Publicly accessible assets are located in the `/public` directory. Source code resides in the `/src` directory, organized into modular subdirectories.  The application uses client-side rendering, resulting in slower initial load times for pages with large datasets. Data is predominantly hardcoded, limiting scalability.

**3. Key File Roles:**

* `/public`: Contains static assets, including SVG icons and image assets.
    * `/images`:  A subdirectory containing project images.  Organization within this subdirectory is flat, potentially hindering scalability.
* `/src`: Contains the application's source code.
    * `/app`:  Contains Next.js app directory pages and subdirectories for reusable components (`components`), map data (`map`), project data (`projects`), and reading list data (`readings`).
    * `/app/layout.tsx`: Defines the application's global layout, including navigation and a dark mode toggle.
    * `/app/page.tsx`: Implements the homepage component.
    * `/app/components/*`: Contains reusable React components.
    * `/app/map/*`: Manages the map visualization component and associated data.
    * `/app/projects/page.tsx`: Renders the projects page.
    * `/app/readings/*`: Manages the reading list page and individual reading detail pages.
    * `/app/quotes.ts`: Contains an array of quotes for the homepage typewriter effect.
    * `/globals.css`: Defines global CSS styles, including dark mode styles.
* `tsconfig.json`: Defines TypeScript compiler options.
* `postcss.config.mjs`: PostCSS configuration file.
* `next.config.ts`: Next.js configuration file, specifying remote image patterns.
* `package.json` and `package-lock.json`: Manage project dependencies and versions.


**4. Dependencies:**

* Next.js (15.1.4)
* React (19.0.0)
* React-DOM (19.0.0)
* Leaflet (1.9.4)
* React-Leaflet (5.0.0)
* Tailwind CSS (3.4.1)
* TypeScript (5.7.3)
* Various other packages listed in `package.json` and `package-lock.json`.  Correct web server configuration is required for serving static assets.


**5. Gotchas:**

* The application heavily relies on hardcoded data, limiting scalability and maintainability.
* Client-side rendering negatively affects the initial load time, especially on pages with large datasets.
* The codebase lacks comprehensive testing and robust error handling.
* The dark mode toggle directly manipulates the DOM, which is an anti-pattern.
* Asset management in the `/public/images` subdirectory presents scalability and maintainability challenges.  The purpose of several SVG files in `/public` is unclear.

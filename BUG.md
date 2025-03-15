tried deploying with vercel. hit the following error.

[11:26:07.652] Cloning github.com/phrazzld/vanity (Branch: feature/postgres-integration, Commit: 45f433e)
[11:26:09.164] Cloning completed: 1.511s
[11:26:12.105] Restored build cache from previous deployment (6vqLgYNwBtAxiTAeTntmaFLThEEq)
[11:26:13.124] Running build in Washington, D.C., USA (East) – iad1
[11:26:13.335] Running "vercel build"
[11:26:13.711] Vercel CLI 41.3.2
[11:26:14.076] Installing dependencies...
[11:26:18.444] npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
[11:26:18.782] npm warn deprecated domexception@4.0.0: Use your platform's native DOMException instead
[11:26:18.937] npm warn deprecated abab@2.0.6: Use your platform's native atob() and btoa() methods instead
[11:26:19.479] npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
[11:26:19.533] npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
[11:26:19.533] npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
[11:26:19.574] npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
[11:26:24.284]
[11:26:24.285] added 391 packages in 10s
[11:26:24.285]
[11:26:24.286] 67 packages are looking for funding
[11:26:24.286]   run `npm fund` for details
[11:26:24.325] Detected Next.js version: 15.1.4
[11:26:24.331] Running "npm run build"
[11:26:24.447]
[11:26:24.449] > vanity@0.1.0 build
[11:26:24.449] > next build
[11:26:24.450]
[11:26:25.153]    ▲ Next.js 15.1.4
[11:26:25.154]
[11:26:25.180]    Creating an optimized production build ...
[11:26:37.402]  ✓ Compiled successfully
[11:26:37.407]    Linting and checking validity of types ...
[11:26:41.906] Failed to compile.
[11:26:41.907]
[11:26:41.908] src/app/readings/[slug]/page.tsx
[11:26:41.908] Type error: Page "src/app/readings/[slug]/page.tsx" does not match the required types of a Next.js Page.
[11:26:41.908]   "getReading" is not a valid Page export field.
[11:26:41.908]
[11:26:41.926] Static worker exited with code: 1 and signal: null
[11:26:41.950] Error: Command "npm run build" exited with 1
[11:26:42.190]

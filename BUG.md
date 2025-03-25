vercel deploy failed

[19:21:45.576] Cloning github.com/phrazzld/vanity (Branch: feat/secure-auth, Commit: 39bf892)
[19:21:46.369] Cloning completed: 793.000ms
[19:21:54.568] Restored build cache from previous deployment (BUCC6JnDrVwMhoYWQj1stQgLXoXC)
[19:21:54.674] Running build in Washington, D.C., USA (East) – iad1
[19:21:55.568] Running "vercel build"
[19:21:55.946] Vercel CLI 41.4.1
[19:21:56.265] Installing dependencies...
[19:21:59.069] npm error code ERESOLVE
[19:21:59.070] npm error ERESOLVE could not resolve
[19:21:59.070] npm error
[19:21:59.070] npm error While resolving: next-auth@4.24.5
[19:21:59.070] npm error Found: next@15.2.3
[19:21:59.070] npm error node_modules/next
[19:21:59.070] npm error   next@"15.2.3" from the root project
[19:21:59.071] npm error
[19:21:59.071] npm error Could not resolve dependency:
[19:21:59.071] npm error peer next@"^12.2.5 || ^13 || ^14" from next-auth@4.24.5
[19:21:59.071] npm error node_modules/next-auth
[19:21:59.071] npm error   next-auth@"^4.24.5" from the root project
[19:21:59.071] npm error
[19:21:59.072] npm error Conflicting peer dependency: next@14.2.26
[19:21:59.072] npm error node_modules/next
[19:21:59.072] npm error   peer next@"^12.2.5 || ^13 || ^14" from next-auth@4.24.5
[19:21:59.072] npm error   node_modules/next-auth
[19:21:59.072] npm error     next-auth@"^4.24.5" from the root project
[19:21:59.072] npm error
[19:21:59.072] npm error Fix the upstream dependency conflict, or retry
[19:21:59.073] npm error this command with --force or --legacy-peer-deps
[19:21:59.073] npm error to accept an incorrect (and potentially broken) dependency resolution.
[19:21:59.073] npm error
[19:21:59.073] npm error
[19:21:59.073] npm error For a full report see:
[19:21:59.073] npm error /vercel/.npm/_logs/2025-03-25T00_21_56_492Z-eresolve-report.txt
[19:21:59.074] npm error A complete log of this run can be found in: /vercel/.npm/_logs/2025-03-25T00_21_56_492Z-debug-0.log
[19:21:59.116] Error: Command "npm install" exited with 1
[19:21:59.965]

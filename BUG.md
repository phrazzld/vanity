vercel deployment failed the build

[19:11:25.826] Cloning github.com/phrazzld/vanity (Branch: feat/secure-auth, Commit: 06b4e4b)
[19:11:26.346] Cloning completed: 520.000ms
[19:11:34.712] Restored build cache from previous deployment (BUCC6JnDrVwMhoYWQj1stQgLXoXC)
[19:11:34.819] Running build in Washington, D.C., USA (East) – iad1
[19:11:35.297] Running "vercel build"
[19:11:35.682] Vercel CLI 41.4.1
[19:11:36.021] Installing dependencies...
[19:11:37.879] npm error code ERESOLVE
[19:11:37.880] npm error ERESOLVE could not resolve
[19:11:37.880] npm error
[19:11:37.881] npm error While resolving: @testing-library/react-hooks@8.0.1
[19:11:37.881] npm error Found: @types/react@19.0.4
[19:11:37.881] npm error node_modules/@types/react
[19:11:37.881] npm error   dev @types/react@"^19" from the root project
[19:11:37.882] npm error   peerOptional @types/react@"^18.0.0 || ^19.0.0" from @testing-library/react@16.2.0
[19:11:37.882] npm error   node_modules/@testing-library/react
[19:11:37.882] npm error     dev @testing-library/react@"^16.2.0" from the root project
[19:11:37.882] npm error   1 more (@types/react-dom)
[19:11:37.882] npm error
[19:11:37.882] npm error Could not resolve dependency:
[19:11:37.883] npm error peerOptional @types/react@"^16.9.0 || ^17.0.0" from @testing-library/react-hooks@8.0.1
[19:11:37.883] npm error node_modules/@testing-library/react-hooks
[19:11:37.883] npm error   dev @testing-library/react-hooks@"^8.0.1" from the root project
[19:11:37.883] npm error
[19:11:37.884] npm error Conflicting peer dependency: @types/react@17.0.84
[19:11:37.884] npm error node_modules/@types/react
[19:11:37.884] npm error   peerOptional @types/react@"^16.9.0 || ^17.0.0" from @testing-library/react-hooks@8.0.1
[19:11:37.884] npm error   node_modules/@testing-library/react-hooks
[19:11:37.884] npm error     dev @testing-library/react-hooks@"^8.0.1" from the root project
[19:11:37.885] npm error
[19:11:37.885] npm error Fix the upstream dependency conflict, or retry
[19:11:37.885] npm error this command with --force or --legacy-peer-deps
[19:11:37.885] npm error to accept an incorrect (and potentially broken) dependency resolution.
[19:11:37.885] npm error
[19:11:37.886] npm error
[19:11:37.886] npm error For a full report see:
[19:11:37.886] npm error /vercel/.npm/_logs/2025-03-25T00_11_36_242Z-eresolve-report.txt
[19:11:37.887] npm error A complete log of this run can be found in: /vercel/.npm/_logs/2025-03-25T00_11_36_242Z-debug-0.log
[19:11:37.916] Error: Command "npm install" exited with 1
[19:11:39.010]

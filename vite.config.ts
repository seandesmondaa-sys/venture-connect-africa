// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    // These packages read process.env.TSS_SERVER_FN_BASE, which Vite's `define` replaces
    // only for source files — pre-bundled deps would keep the literal `process` reference
    // and crash the browser with "process is not defined".
    optimizeDeps: {
      exclude: [
        "@tanstack/start-client-core",
        "@tanstack/react-start",
        "@tanstack/react-start-client",
      ],
    },
  },
});


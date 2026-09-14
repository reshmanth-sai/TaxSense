import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          // Split the three vendor libraries that dominate the eager entry
          // chunk into their own files. This does not reduce first-load bytes;
          // it makes them cacheable across deploys. react+react-dom (61 kB gz),
          // motion (49 kB gz) and react-router (13 kB gz) are 123 kB gz of the
          // ~163 kB gz entry, and they only change when the dependency is
          // upgraded -- keeping them out of the app chunk means an ordinary
          // code change re-downloads ~40 kB instead of ~163 kB.
          //
          // Only these three are listed. A catch-all `if (id.includes(
          // 'node_modules')) return 'vendor'` would drag every lazily-imported
          // dependency (jsPDF, html2canvas, dompurify -- 230 kB gz of the
          // export path alone) into a chunk the entry point references, which
          // would undo the route-level splitting already in place.
          manualChunks(id: string) {
            if (!id.includes('node_modules')) return undefined;
            if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'vendor-react';
            if (/node_modules\/(motion|motion-dom|motion-utils|framer-motion)\//.test(id)) return 'vendor-motion';
            if (/node_modules\/react-router/.test(id)) return 'vendor-router';
            return undefined;
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

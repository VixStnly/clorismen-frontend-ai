import { cpSync, existsSync } from 'node:fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Foto & logo tetap di folder images/ dan logo.png (tidak dipindah). Saat build disalin ke dist/.
const copyAssets = () => ({
  name: 'copy-assets',
  apply: 'build',
  closeBundle() {
    for (const p of ['images', 'logo.png']) {
      if (existsSync(p)) cpSync(p, `dist/${p}`, { recursive: true });
    }
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.BFF_PROXY_TARGET || 'http://clorismen-landing.local';

  return {
    plugins: [react(), copyAssets()],
    // static/ berisi bff.php + .htaccess, ikut tersalin ke dist/ saat build
    publicDir: 'static',
    build: { outDir: 'dist', emptyOutDir: true, sourcemap: false },
    server: {
      port: 5175,
      proxy: {
        // Saat `npm run dev`, /bff diteruskan ke vhost Apache (yang menjalankan bff.php)
        '/bff': { target, changeOrigin: true, headers: { Origin: target } },
      },
    },
  };
});

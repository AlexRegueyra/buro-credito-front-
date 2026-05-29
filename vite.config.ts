import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: env.VITE_NAME_PROJECT ? `/${env.VITE_NAME_PROJECT}/` : '/',
    plugins: [
      react(),
      svgr({
        svgrOptions: {
          exportType: 'default',
          ref: true,
          svgo: false,
          titleProp: true,
        },
        include: '**/*.svg',
      }),
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@app': path.resolve(__dirname, './src/app'),
        '@features': path.resolve(__dirname, './src/features'),
        '@shared': path.resolve(__dirname, './src/shared'),
        '@lib': path.resolve(__dirname, './src/lib'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@tests': path.resolve(__dirname, './src/tests'),
      },
    },

    server: {
      port: 3001,
      open: true,
      proxy: {
        ...(env.VITE_API_TARGET
          ? {
            '/api': {
              target: env.VITE_API_TARGET,
              changeOrigin: true,
              rewrite: (p) => p.replace(/^\/api/, ''),
              secure: false,
            },
          }
          : {}),
        ...(env.VITE_GRAPHQL_PROXY_TARGET
          ? {
            '/x-graphql': {
              target: env.VITE_GRAPHQL_PROXY_TARGET,
              changeOrigin: true,
              rewrite: (p) => p.replace(/^\/x-graphql/, '/graphql'),
              secure: false,
            },
          }
          : {}),
        ...(env.VITE_KEYCLOAK_PROXY_TARGET
          ? {
            '/auth': {
              target: env.VITE_KEYCLOAK_PROXY_TARGET,
              changeOrigin: true,
              secure: false,
              selfHandleResponse: true,
              configure: (proxy) => {
                const kcTarget = env.VITE_KEYCLOAK_PROXY_TARGET;

                // Pedir respuestas sin compresión para poder reescribir el body
                proxy.on('proxyReq', (proxyReq) => {
                  proxyReq.setHeader('Accept-Encoding', 'identity');
                });

                proxy.on('proxyRes', (proxyRes, _req, res) => {
                  // --- Reescribir Set-Cookie ---
                  const setCookie = proxyRes.headers['set-cookie'];
                  if (setCookie) {
                    proxyRes.headers['set-cookie'] = setCookie.map((cookie: string) =>
                      cookie
                        .replace(/;\s*Domain=[^;]*/gi, '')
                        .replace(/;\s*Secure/gi, '')
                        .replace(/;\s*SameSite=None/gi, '; SameSite=Lax'),
                    );
                  }

                  // --- Reescribir Location header (redirects 3xx) ---
                  const location = proxyRes.headers['location'];
                  if (typeof location === 'string') {
                    proxyRes.headers['location'] = location.replaceAll(kcTarget, '');
                  }

                  // --- Reescribir body para contenido de texto (HTML, JS, JSON) ---
                  const contentType = String(proxyRes.headers['content-type'] ?? '');
                  const isText =
                    contentType.includes('text/') ||
                    contentType.includes('application/json') ||
                    contentType.includes('application/javascript');

                  if (!isText) {
                    res.writeHead(proxyRes.statusCode ?? 200, proxyRes.headers);
                    proxyRes.pipe(res);
                    return;
                  }

                  // Buffear respuesta, reemplazar URLs externas, enviar
                  const chunks: Buffer[] = [];
                  proxyRes.on('data', (chunk: Buffer) => chunks.push(chunk));
                  proxyRes.on('end', () => {
                    let body = Buffer.concat(chunks).toString('utf-8');
                    body = body.replaceAll(kcTarget, '');

                    const headers = { ...proxyRes.headers };
                    delete headers['content-length']; // El tamaño cambió
                    delete headers['content-encoding'];

                    res.writeHead(proxyRes.statusCode ?? 200, headers);
                    res.end(body);
                  });
                });
              },
            },
          }
          : {}),
      },
    },

    build: {
      outDir: 'dist',
      sourcemap: true,
      minify: 'terser',
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        output: {
          manualChunks: {
            // React core - debe cargarse primero
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            // MUI con todas sus dependencias juntas para evitar ciclos
            'vendor-mui': [
              '@mui/material',
              '@mui/system',
              '@mui/utils',
              '@emotion/react',
              '@emotion/styled',
            ],
          },
        },
      },
    },

    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
    },
  };
});

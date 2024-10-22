import { defineConfig } from 'vitest/config'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import path from 'path'
import { loadEnv } from 'vite'
import { fileURLToPath } from 'url'

const currentPath = fileURLToPath(import.meta.url)
const appPath = path.resolve(currentPath, '..')

export default defineConfig(({ command, mode }) => {
  const isProductionBuild = () => command === 'build' && mode === 'production'

  return {
    build: {
      ssr: true,
      target: 'node20',
      outDir: 'dist',
      rollupOptions: {
        input: 'src/index.ts',
      },
    },
    ssr: {
      target: 'node',
      noExternal: isProductionBuild() ? true : undefined,
    },
    plugins: [
      viteStaticCopy({
        targets: [
          {
            src: './node_modules/swagger-ui-dist/swagger-ui.css',
            dest: '.',
          },
          {
            src: './node_modules/swagger-ui-dist/favicon-16x16.png',
            dest: '.',
          },
          {
            src: './node_modules/swagger-ui-dist/favicon-32x32.png',
            dest: '.',
          },
          {
            src: './node_modules/swagger-ui-dist/swagger-ui-bundle.js',
            dest: '.',
          },
          {
            src: './node_modules/swagger-ui-dist/swagger-ui-standalone-preset.js',
            dest: '.',
          },
        ],
      }),
    ],
    resolve: {
      alias: {
        '@db/schemas': path.join(appPath, 'db', 'schemas'),
      },
    },
    test: {
      env: loadEnv('test', process.cwd(), ''),
      include: ['src/**/*.test.ts'],
      poolOptions: {
        forks: {
          singleFork: true,
        },
      },
      coverage: {
        reporter: ['lcov', 'text'],
      },
    },
  }
})

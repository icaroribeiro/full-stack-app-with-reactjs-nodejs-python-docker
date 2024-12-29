import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'
import { loadEnv } from 'vite'
import { fileURLToPath } from 'url'

const currentPath = fileURLToPath(import.meta.url)
const appPath = path.resolve(currentPath, '..')

// dotenv.config()

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // process.env = { ...process.env, ...loadEnv(mode, process.cwd(), '') }
  // const isProductionBuild = () => command === 'build' && mode === 'production'

  // let port = ''
  // if (isProductionBuild()) {
  //   dotenv.config()
  //   port = process.env.PORT as string
  // } else {
  //   port = env.PORT
  // }

  return {
    server: {
      open: true,
      port: parseInt(env.PORT),
    },
    build: {
      outDir: 'dist',
    },
    plugins: [react()],
    test: {
      include: ['src/**/*.test.{ts,tsx}'],
      coverage: {
        reporter: [['lcov', { projectRoot: appPath }], 'text'],
      },
    },
  }
})

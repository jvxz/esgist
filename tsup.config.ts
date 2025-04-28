import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    'index': 'src/index.ts',
    'cli': 'src/index.ts'
  },
  shims: true,
  format: ['cjs'],
  platform: 'node',
  noExternal: ['*'],
})

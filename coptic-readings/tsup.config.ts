import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  // Bundle JSON so consumers do not need resolveJsonModule / asset loaders.
  loader: {
    '.json': 'json',
  },
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : '.mjs',
    }
  },
})

import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],        // cjs → .cjs, esm → .js
  dts: true,                     // generates .d.ts
  sourcemap: true,
  clean: true,
  // CRITICAL: Do NOT override extension
  // Remove outExtension completely!
})
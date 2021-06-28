import { terser } from 'rollup-plugin-terser'
import typescript from 'rollup-plugin-typescript2'

export default [
  {
    input: 'src/index-umd.ts',
    output: {
      file: 'dist/index.umd.min.js',
      format: 'umd',
      name: '@yuanfudao/resource-retry'
    },
    plugins: [typescript({ useTsconfigDeclarationDir: true }), terser()]
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.esm.js',
      format: 'es',
    },
    plugins: [typescript({ useTsconfigDeclarationDir: true })]
  }
]

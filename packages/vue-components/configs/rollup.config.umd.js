import base from './rollup.config.base'
import { terser } from 'rollup-plugin-terser'

const config = Object.assign({}, base, {
  output: {
    exports: 'named',
    name: 'AuthingVueUIComponents',
    file: 'lib/index.min.js',
    format: 'umd',
  },
})

config.plugins.push(terser())

export default config

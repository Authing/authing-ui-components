import base from './rollup.config.base'
import { terser } from 'rollup-plugin-terser'

const config = Object.assign({}, base, {
  output: {
    exports: 'named',
    name: 'AuthingVueUiComponents',
    file: 'lib/index.js',
    format: 'umd',
  },
})

config.plugins.push(terser())

export default config

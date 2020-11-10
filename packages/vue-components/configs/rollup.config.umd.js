import base from './rollup.config.base'

const config = Object.assign({}, base, {
  output: {
    exports: 'named',
    name: 'AuthingVueUiComponents',
    file: 'lib/index.js',
    format: 'umd',
  },
})

export default config

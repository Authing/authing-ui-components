import path from 'path'
// import postcss from 'postcss'
// import scss from 'rollup-plugin-scss'
// import copy from 'rollup-plugin-copy'
// import { name } from '../package.json'
// import autoprefixer from 'autoprefixer'
// import postcssPresetEnv from 'postcss-preset-env'
// import postcssMinify from 'postcss-minify'
// import postcssImport from 'postcss-import'
import css from 'rollup-plugin-css-only'
import CleanCSS from 'clean-css'
import fs from 'fs'

// const file = (type = 'min') => path.resolve(__dirname, `../lib/${name}.${type}.js`)

export default function (commonRollupPlugins) {
	return {
		input: path.resolve(__dirname, '../components/index.js'),
		output: [
			// {
			// 	name,
			// 	file: file('esm'),
			// 	format: 'es',
			// 	exports: 'auto',
			// 	sourcemap: !isProduct
			// },
			{
				exports: 'named',
				name: 'AuthingVueUIComponents',
				// file: '../lib/index.min.js',
				file: path.resolve(__dirname, '../lib/index.min.js'),
				format: 'umd',
				globals: {
					'vue': 'Vue'
				}
			}
		],
		plugins: [
			// scss({
			// 	output: `lib/css/${name}.min.css`,
			// 	prefix: '@import "./variable";',
			// 	processor: () => postcss([
			// 		autoprefixer(),
			// 		postcssPresetEnv(),
			// 		postcssMinify(),
			// 		postcssImport()
			// 	]),
			// 	sass: require('node-sass')
			// }),

			...commonRollupPlugins,
			css({
				output: (styles) => {
					// const filePath = '../lib/index.min.css'

					// fs.access(`${filePath}`, fs.constants.F_OK, (err) => {
					// 	if (err !== null) {
					// 		fs.writeFileSync('../lib/index.min.css', new CleanCSS().minify(styles).styles)
					// 	}
					// })
					fs.mkdir(path.resolve(__dirname, '../lib'), () => {
						fs.writeFileSync(path.resolve(__dirname, '../lib/index.min.css'), new CleanCSS().minify(styles).styles)
					})

				}
			})
		],
		external: ['vue']
	}
}

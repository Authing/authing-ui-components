import { nodeResolve } from '@rollup/plugin-node-resolve'
import babel from "rollup-plugin-babel";
import commonjs from 'rollup-plugin-commonjs'
import vuePlugin from 'rollup-plugin-vue'
import polyfill from 'rollup-plugin-polyfill-node'
import json from '@rollup/plugin-json'
import progress from 'rollup-plugin-progress'
import filesize from 'rollup-plugin-filesize'

import bundleConfig from './rollup.bundle'

const isProduct = process.env.NODE_ENV === 'production'

const commonRollupPlugins = [
	commonjs({
		include: [
			'node_modules/**',
			'node_modules/**/*',
			'lib/**/*',
			'../native-js/**/*',
		],
		// requireReturnsDefault: 'auto'
		namedExports: {
			"@authing/native-js-ui-components": [
			  "AuthingGuard",
			  "Guard",
			  "GuardEventsCamelToKebabMap",
			  "GuardMode",
			  "GuardScenes",
			  "LoginMethods",
			  "RegisterMethods",
			],
			"../native-js/lib/index.min.js": [
			  "AuthingGuard",
			  "Guard",
			  "GuardEventsCamelToKebabMap",
			  "GuardMode",
			  "GuardScenes",
			  "LoginMethods",
			  "RegisterMethods",
			  "getAuthClient",
			  "initAuthClient",
			],
		  },
	}),
	json(),
	polyfill(),
	nodeResolve({
		jsnext: true,
		main: true,
		extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.vue']
	}),
	// image(),
	vuePlugin({
		include: /\.vue$/,
		target: 'browser'
	}),
	babel({
		exclude: "node_modules/**",
		runtimeHelpers: true,
	}),
	progress(),
	filesize()
]
export default function () {

	return [ // 全量打包
		bundleConfig(commonRollupPlugins, isProduct)
		// ...componentsConfig(commonRollupPlugins, isProduct)
	]
}

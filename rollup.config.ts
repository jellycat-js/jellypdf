import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import commonjs from '@rollup/plugin-commonjs'
import alias from '@rollup/plugin-alias'
import { dts } from "rollup-plugin-dts"
import json from '@rollup/plugin-json'
import { defineConfig } from 'rollup'
import path from 'path'

const rewriteDynImport = (outDir) => ({
	name: 'rewrite-dynamic-imports',
	renderDynamicImport: ({ targetModuleId }) => {
		if (!targetModuleId || !targetModuleId.startsWith('./handlers/')) return null
		const ext = outDir.includes('cjs') ? '.cjs' : '.mjs'
		return { left: 'import(', right: ` + "${ext}")` }
	}
})

const makePlugins = (outDir) => [
	json(),
	typescript({
		tsconfig: './tsconfig.json',
		outDir: outDir,
		declaration: false
	}),
	nodeResolve({ 
		preferBuiltins: true 
	}),
	commonjs({ 
		ignore: ['chromium-bidi'] 
	}),
	rewriteDynImport(outDir),
	terser()
]

const external = [
	'yargs',
	'path',
	'fs',
	'puppeteer',
	'playwright-core',
	'playwright-chromium',
	'chromium-bidi',
	/node_modules\/playwright-core\/.*/,
	/node_modules\/playwright-chromium\/.*/,
	/node_modules\/chromium-bidi\/.*/
]

const builds = {

	esm: {
		input: {
			index: './src/jellypdf.ts',
			'handlers/PuppeteerHandler': './src/handlers/PuppeteerHandler.ts',
			'handlers/PlaywrightHandler': './src/handlers/PlaywrightHandler.ts'
		},
		output: {
			dir: 'dist/esm',
			format: 'esm',
			sourcemap: true,
			entryFileNames: '[name].mjs',
			chunkFileNames: '[name]-[hash].mjs'
		},
		external,
		plugins: makePlugins('dist/esm')
	},

	cjs: {
		input: {
			index: './src/jellypdf.ts',
			'handlers/PuppeteerHandler': './src/handlers/PuppeteerHandler.ts',
			'handlers/PlaywrightHandler': './src/handlers/PlaywrightHandler.ts'
		},
		output: {
			dir: 'dist/cjs',
			format: 'cjs',
			sourcemap: true,
			entryFileNames: '[name].cjs',
			chunkFileNames: '[name]-[hash].cjs'
		},
		external,
		plugins: makePlugins('dist/cjs')
	},

	cli: {
		input: {
			index: './src/bin/cli.ts',
			'handlers/PuppeteerHandler': './src/handlers/PuppeteerHandler.ts',
			'handlers/PlaywrightHandler': './src/handlers/PlaywrightHandler.ts'
		},
		output: {
			dir: 'dist/cli',
			format: 'esm',
			sourcemap: true,
			entryFileNames: 'jellypdf-cli.js'
		},
		external: external,
		plugins: makePlugins('dist/cli')
	},

	types: {
		input: './src/types/index.types.ts',
		output: { file: 'dist/types/index.d.ts', format: 'esm' },
		plugins: [
			alias({
				entries: [
					{ find: '@types', replacement: path.resolve(__dirname, 'src/types/index.types.ts') },
					{ find: '@constants', replacement: path.resolve(__dirname, 'src/constants.ts') }
				]
			}),
			dts()
		]
	}
}

export default defineConfig(Object.values(builds))
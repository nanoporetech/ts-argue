import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';
import { dirname } from 'path';
import { asStruct, isString } from 'ts-runtime-typecheck';

const { main: MAIN, module: MODULE } = asStruct({
  main: isString,
  module: isString
})(pkg);

export default {
	input: 'src/index.ts',
	preserveModules: true,
	plugins: [
		typescript({ tsconfig: './tsconfig.main.json' })
	],
	output: [
		{
			dir: `dist/${dirname(MAIN)}`,
			entryFileNames: '[name].js',
			format: 'cjs'
		},
		{
			dir: `dist/${dirname(MODULE)}`,
			entryFileNames: '[name].mjs',
			format: 'esm'
		}
	]
};
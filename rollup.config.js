import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import dts from "rollup-plugin-dts";
import nodeResolve from "@rollup/plugin-node-resolve";
// import terser from "@rollup/plugin-terser";
import { optimizeLodashImports } from "@optimize-lodash/rollup-plugin";

export default [{
  // name: 'curl-to-har',
  input: 'src/index.ts',
  output: {
    name: '@a76yyyy/curl-to-har',
    file: 'dist/index.js',
    format: 'cjs'
  },
  external: [
    'url',
    'shellwords-ts'
  ],
  plugins: [
    typescript(),
    commonjs(),
    nodeResolve({
      preferBuiltins: false,
    }),
    // terser(),
    optimizeLodashImports(),
  ]
},
{
  input: "src/index.ts",
  output: [{ file: "dist/index.d.ts", format: "es" }],
  plugins: [
    dts.default(),
    nodeResolve({
      preferBuiltins: false,
    }),
  ],
}]


import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import dts from "rollup-plugin-dts";
import nodeResolve from "@rollup/plugin-node-resolve";

export default [{
  // name: 'curl-to-har',
  input: 'src/index.ts',
  output: {
    name: '@a76yyyy/curl-to-har',
    file: 'dist/index.js',
    format: 'cjs'
  },
  plugins: [
    typescript(),
    commonjs(),
    nodeResolve()
  ]
},
{
  input: "src/index.ts",
  output: [{ file: "dist/index.d.ts", format: "es" }],
  plugins: [dts.default()],
}]


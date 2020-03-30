import vue from 'rollup-plugin-vue'
import wasm from 'rollup-plugin-wasm'

export default {
  input: './lib/index.js',
  plugins: [
    wasm({
      sync: [
        // './lib/json-rs/json_rs_bg.wasm',
      ]
    }),
    vue(),
  ],
  output: {
    format: 'esm',
    file: 'dist/op-vue.js'
  },
}

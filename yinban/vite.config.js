import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import javascriptObfuscator from 'rollup-plugin-javascript-obfuscator';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni()
  ],
  build: {
    rollupOptions: {
      plugins: [
        javascriptObfuscator({
          compact: true,                     // 压缩代码
          controlFlowFlattening: true,       // 控制流扁平化
          controlFlowFlatteningThreshold: 0.75,
          deadCodeInjection: true,           // 注入死代码
          debugProtection: true,             // 防调试
          stringArray: true,                 // 字符串数组加密
          stringArrayEncoding: ['rc4'],
          rotateStringArray: true,
          selfDefending: true,
        })
      ]
    }
  }
})

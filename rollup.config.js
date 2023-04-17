// rollup.config.js
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import babel from "@rollup/plugin-babel";
const extensions = [".js", ".ts"];

const isProduction = process.env.NODE_ENV === 'production';
export default [
    {
  
        input: './src/index.js',
    
        output: {
            file: './dist/direcbase.cjs',
            format: 'cjs',
        },  
        plugins: [
            resolve(),
            commonjs(),
            babel({ babelHelpers: "bundled", extensions }),
            isProduction && (await import('@rollup/plugin-terser')).default()
            ]
    },
    {
        input: './src/index.js',
    
        output: {
            file: './dist/direcbase.mjs',
            format: 'es',  
            plugins: [
                resolve(),
                commonjs(),
                babel({ babelHelpers: "bundled", extensions }),
                isProduction && (await import('@rollup/plugin-terser')).default()
            ]
        }
    },
  ];
// rollup.config.js
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';

const isProduction = process.env.NODE_ENV === 'production';
export default [
    {
  
        input: './src/index.js',
    
        output: {
            file: './dist/direcbase.cjs',
            format: 'cjs'
        },  
        plugins: [
            resolve(),
            commonjs(),
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
                isProduction && (await import('@rollup/plugin-terser')).default()
            ]
        }
    },
  ];
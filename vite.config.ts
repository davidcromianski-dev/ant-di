import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
    build: {
        lib: {
            entry: 'src/index.ts',
            name: 'ant-di',
            formats: ['es', 'cjs'],
            fileName: (format) => `index.${format === 'es' ? 'es' : 'cjs'}.js`
        },
    },
    plugins: [
        dts({
            entryRoot: 'src',
            outDir: 'dist/types',
            insertTypesEntry: true,
        }),
    ],
});
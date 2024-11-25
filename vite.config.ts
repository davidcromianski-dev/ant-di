import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
    build: {
        lib: {
            entry: 'src/index.ts',
            name: 'ixc-js-di',
            fileName: (format) => `index.${format}.js`
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

import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
    server: {
        proxy: {
            '/api': 'http://localhost:5252',
        },
    },

    plugins: [
        react(),
        babel({ presets: [reactCompilerPreset()] })
    ],

    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './src/test/setup.ts',
        include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
        css: true,
    },
})

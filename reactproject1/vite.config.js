import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import WindiCSS from "vite-plugin-windicss";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [plugin(), WindiCSS()],
    server: {
        port: 62684,
    }
})
/// <reference types="vitest" />

import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
// import { libInjectCss } from "vite-plugin-lib-inject-css";

export default defineConfig({
	plugins: [
		react(),
		// libInjectCss(),
		dts({
			include: ["src/CustomSelect"],
			insertTypesEntry: true,
		}),
	],
	build: {
		copyPublicDir: false,
		lib: {
			entry: resolve(__dirname, "src/CustomSelect/index.ts"),
			name: "custom-select",
			fileName: "custom-select",
			formats: ["es", "umd"],
		},
		rollupOptions: {
			external: ["react", "react-dom", "react/jsx-runtime"],
			output: {
				globals: {
					react: "React",
					"react-dom": "ReactDOM",
					"react/jsx-runtime": "jsxRuntime",
				},
			},
		},
	},
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["./vitest.setup.ts"],
	},
});

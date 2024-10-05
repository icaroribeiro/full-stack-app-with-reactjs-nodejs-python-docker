import { defineConfig } from "vitest/config";

export default defineConfig(({}) => {
	return {
		build: {
			ssr: true,
			target: "node20",
			outDir: "dist",
			emptyOutDir: true,
			rollupOptions: {
				input: {
					eslint: "src/eslint/index.ts",
				},
			},
		},
		ssr: {
			target: "node",
		},
	};
});

/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { resolve } from 'path';
import { transform } from 'esbuild';

function minifyEs() {
	return {
		name: 'minify-es',
		renderChunk: {
			order: 'post',
			async handler(code, chunk, outputOptions) {
				if (outputOptions.format === 'es' && chunk.fileName.endsWith('.min.js')) {
					return await transform(code, { minify: true });
				}
				return code;
			},
		},
	};
}

export default defineConfig({
	test: {
		browser: {
			enabled: true,
			name: 'chrome', // browser name is required
		},
	},
	plugins: [minifyEs()],
	build: {
		lib: {
			entry: resolve(__dirname, 'src/signal-flow.js'),
			name: 'SignalFlow',
			formats: ['es', 'esm'],
			fileName: (format) =>
				({
					es: 'signal-flow.js',
					esm: 'signal-flow.min.js',
				}[format]),
		},
	},
});

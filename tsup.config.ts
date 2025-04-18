import { defineConfig } from "tsup";

const config = defineConfig({
  entryPoints: ["src/index.ts"],
  splitting: false,
  sourcemap: false,
  clean: true,
  minify: true,
  noExternal: [/(.*)/],
});

export default config;

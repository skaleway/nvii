import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs"],
  splitting: false,
  sourcemap: false,
  clean: true,
  bundle: true,
  dts: true,
  noExternal: ["commander", "inquirer", "picocolors", "@nvii/env-helpers"],
});

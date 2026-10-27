import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  // TypeScript 7 has no JS API for rolldown-plugin-dts; emit declarations with oxc
  // (isolatedDeclarations), which tsconfig enforces.
  dts: { generator: "oxc", resolver: "oxc" },
  platform: "neutral",
  target: "es2020"
});

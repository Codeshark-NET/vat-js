// Rough throughput check: `pnpm bench` (Node runs the .ts directly).
import { checkVAT, countries } from "../src/index.ts";

const inputs = [
  "DE136695976",
  "NL008601562B01",
  "FR40303265045",
  "IT07458361008",
  "BE0411905847",
  "XX123"
];
const n = 1_000_000;

for (let i = 0; i < 100_000; i++) checkVAT(inputs[i % inputs.length], countries);
const start = process.hrtime.bigint();
for (let i = 0; i < n; i++) checkVAT(inputs[i % inputs.length], countries);
const nsPerCall = Number(process.hrtime.bigint() - start) / n;

console.log(`${nsPerCall.toFixed(0)} ns/call, ${(1e3 / nsPerCall).toFixed(2)}M calls/s`);

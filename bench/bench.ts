// Throughput check: `pnpm bench` (Node runs the .ts directly). Inputs are every vector in
// test-vectors/, plus each valid one with separators inserted. Reports the median of 7 rounds.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { belgium, type Country, checkVAT, countries } from "../src/index.ts";

const dir = join(import.meta.dirname, "..", "test-vectors");
const valid: string[] = [];
const invalid: string[] = [];
for (const file of readdirSync(dir)) {
  const vectors = JSON.parse(readFileSync(join(dir, file), "utf8"));
  valid.push(...vectors.valid);
  invalid.push(...vectors.validOnlyByFormat, ...vectors.invalid);
}
const formatted = valid.map((v) => `${v.slice(0, 4)} ${v.slice(4, 8)}-${v.slice(8)}`);

function run(label: string, inputs: string[], list: readonly Country[]): void {
  const rounds: number[] = [];
  const calls = 500_000;
  for (let i = 0; i < calls; i++) checkVAT(inputs[i % inputs.length], list);
  for (let r = 0; r < 7; r++) {
    const start = process.hrtime.bigint();
    for (let i = 0; i < calls; i++) checkVAT(inputs[i % inputs.length], list);
    rounds.push(Number(process.hrtime.bigint() - start) / calls);
  }
  const median = rounds.sort((a, b) => a - b)[3];
  console.log(`${label.padEnd(34)} ${median.toFixed(0).padStart(6)} ns/call`);
}

run(`valid, all countries (${valid.length})`, valid, countries);
run(`invalid, all countries (${invalid.length})`, invalid, countries);
run("valid with separators, all", formatted, countries);
run("garbage 'XX123', all countries", ["XX123"], countries);
run("Belgium only, [belgium]", ["BE0411905847"], [belgium]);

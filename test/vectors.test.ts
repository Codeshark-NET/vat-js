// Runs every country's language-neutral vectors in test-vectors/*.json, the same assertions
// jsvat's per-country specs made: valid (as-is, and with dashes or spaces inserted),
// format-only valid, and invalid.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { type Country, checkVAT, countries } from "../src/index.ts";

interface Vectors {
  name: string;
  codes: [string, string, string];
  valid: string[];
  validOnlyByFormat: string[];
  invalid: string[];
}

const dir = join(import.meta.dirname, "..", "test-vectors");
const files = readdirSync(dir).filter((f) => f.endsWith(".json"));

function countryNamed(name: string): Country {
  const country = countries.find((c) => c.name === name);
  if (!country) throw new Error(`No country named ${name}`);
  return country;
}

/** jsvat's addCharsToString: insert `char` at positions 3 and 7. */
function withSeparators(vat: string, char: string): string {
  const chars = vat.split("");
  chars.splice(3, 0, char);
  chars.splice(7, 0, char);
  return chars.join("");
}

describe.each(files)("%s", (file) => {
  const vectors: Vectors = JSON.parse(readFileSync(join(dir, file), "utf8"));
  const country = countryNamed(vectors.name);

  const expectValid = (vat: string) => {
    const result = checkVAT(vat, [country]);
    expect(result, vat).toMatchObject({
      isValid: true,
      isValidFormat: true,
      isSupportedCountry: true,
      country: {
        name: vectors.name,
        isoCode: { short: vectors.codes[0], long: vectors.codes[1], numeric: vectors.codes[2] }
      }
    });
  };

  it("accepts valid VATs", () => vectors.valid.forEach(expectValid));

  it("accepts valid VATs with dashes", () =>
    vectors.valid.map((v) => withSeparators(v, "-")).forEach(expectValid));

  it("accepts valid VATs with spaces", () =>
    vectors.valid.map((v) => withSeparators(v, " ")).forEach(expectValid));

  // Europe's calcFn is a stub that always returns true, so its format-only vectors pass as
  // valid. jsvat skipped this check for Europe too.
  it.skipIf(vectors.name === "Europe")("flags format-only VATs as valid format but invalid", () => {
    for (const vat of vectors.validOnlyByFormat) {
      expect(checkVAT(vat, [country]), vat).toMatchObject({
        isValid: false,
        isValidFormat: true,
        isSupportedCountry: true
      });
    }
  });

  it("rejects invalid VATs", () => {
    for (const vat of vectors.invalid) {
      expect(checkVAT(vat, [country]).isValid, vat).toBe(false);
    }
  });
});

describe("all countries at once", () => {
  // Known jsvat bug: getCountry matches numeric ISO codes as prefixes, so a Brazilian CNPJ
  // starting "020" resolves to Andorra (numeric code 020). Flip to `it` once fixed.
  it.fails("resolves each valid VAT to its own country", () => {
    for (const file of files) {
      const vectors: Vectors = JSON.parse(readFileSync(join(dir, file), "utf8"));
      for (const vat of vectors.valid) {
        const result = checkVAT(vat, countries);
        expect(result.isValid, vat).toBe(true);
        expect(result.country?.name, vat).toBe(vectors.name);
      }
    }
  });
});

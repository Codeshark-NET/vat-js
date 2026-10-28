import type { Country } from "../core.ts";
import { digit } from "../digits.ts";

export const croatia: Country = {
  name: "Croatia",
  codes: ["HR", "HRV", "191"],
  calcFn: (vat: string): boolean => {
    // Checks the check digits of a Croatian VAT number using ISO 7064, MOD 11-10 for check digit.
    let product = 10;
    let sum = 0;

    for (let i = 0; i < 10; i++) {
      // Extract the next digit and implement the algorithm
      sum = (digit(vat, i) + product) % 10;
      if (sum === 0) {
        sum = 10;
      }

      product = (2 * sum) % 11;
    }

    // Now check that we have the right check digit
    const expect = digit(vat, 10);
    return (product + expect) % 10 === 1;
  },
  rules: {
    multipliers: {},
    regex: [/^(HR)(\d{11})$/]
  }
};

import type { Country } from "../core.ts";
import { digit } from "../digits.ts";

export const slovenia: Country = {
  name: "Slovenia",
  codes: ["SI", "SVN", "705"],
  calcFn: (vat: string): boolean => {
    let total = 0;

    // Extract the next digit and multiply by the counter.
    for (let i = 0; i < 7; i++) {
      total += digit(vat, i) * slovenia.rules.multipliers.common[i];
    }

    // Establish check digits using modulus 11
    total = 11 - (total % 11);
    if (total === 10) {
      total = 0;
    }

    // Compare the number with the last character of the VAT number. If it is the
    // same, then it's a valid check digit.
    const expect = digit(vat, 7);
    return !!(total !== 11 && total === expect);
  },
  rules: {
    multipliers: {
      common: [8, 7, 6, 5, 4, 3, 2]
    },
    regex: [/^(SI)([1-9]\d{7})$/]
  }
};

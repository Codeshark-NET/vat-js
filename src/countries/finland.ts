import type { Country } from "../core.ts";
import { digit } from "../digits.ts";

export const finland: Country = {
  name: "Finland",
  codes: ["FI", "FIN", "246"],
  calcFn: (vat: string): boolean => {
    let total = 0;

    // Extract the next digit and multiply by the counter.
    for (let i = 0; i < 7; i++) total += digit(vat, i) * finland.rules.multipliers.common[i];

    // Establish check digit.
    total = 11 - (total % 11);
    if (total > 9) {
      total = 0;
    }

    // Compare it with the last character of the VAT number. If it's the same, then it's valid.
    const expect = digit(vat, 7);
    return total === expect;
  },
  rules: {
    multipliers: {
      common: [7, 9, 10, 5, 8, 4, 2]
    },
    regex: [/^(FI)(\d{8})$/]
  }
};

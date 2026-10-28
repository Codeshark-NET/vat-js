import type { Country } from "../core.ts";
import { digit } from "../digits.ts";

export const hungary: Country = {
  name: "Hungary",
  codes: ["HU", "HUN", "348"],
  calcFn: (vat: string): boolean => {
    let total = 0;

    // Extract the next digit and multiply by the counter.
    for (let i = 0; i < 7; i++) {
      total += digit(vat, i) * hungary.rules.multipliers.common[i];
    }

    // Establish check digit.
    total = 10 - (total % 10);
    if (total === 10) total = 0;

    // Compare it with the last character of the VAT number. If it's the same, then it's valid.
    const expect = digit(vat, 7);
    return total === expect;
  },
  rules: {
    multipliers: {
      common: [9, 7, 3, 1, 9, 7, 3]
    },
    regex: [/^(HU)(\d{8})$/]
  }
};

import type { Country } from "../core.ts";
import { digit, digits } from "../digits.ts";

export const poland: Country = {
  name: "Poland",
  codes: ["PL", "POL", "616"],
  calcFn: (vat: string): boolean => {
    let total = 0;

    // All zeros would pass the checksum below.
    if (digits(vat, 0) === 0) return false;

    // Extract the next digit and multiply by the counter.
    for (let i = 0; i < 9; i++) {
      total += digit(vat, i) * poland.rules.multipliers.common[i];
    }

    // Establish check digit. A remainder of 10 can't be written as one digit, so it's invalid.
    total = total % 11;
    if (total > 9) return false;

    // Compare it with the last character of the VAT number. If it's the same, then it's valid.
    const expect = digit(vat, 9);
    return total === expect;
  },
  rules: {
    multipliers: {
      common: [6, 5, 7, 2, 3, 4, 5, 6, 7]
    },
    regex: [/^(PL)(\d{10})$/]
  }
};

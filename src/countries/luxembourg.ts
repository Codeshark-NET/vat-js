import type { Country } from "../core.ts";
import { digits } from "../digits.ts";

export const luxembourg: Country = {
  name: "Luxembourg",
  codes: ["LU", "LUX", "442"],
  calcFn: (vat: string): boolean => {
    const expect = digits(vat, 6, 8);
    const checkDigit = digits(vat, 0, 6) % 89;
    // Checks the check digits of a Luxembourg VAT number.

    return checkDigit === expect;
  },
  rules: {
    multipliers: {},
    regex: [/^(LU)(\d{8})$/]
  }
};

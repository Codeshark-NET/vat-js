import type { Country } from "../core.ts";
import { digit } from "../digits.ts";

export const switzerland: Country = {
  name: "Switzerland",
  codes: ["CH", "CHE", "756"],
  calcFn: (vat: string): boolean => {
    let total = 0;
    for (let i = 0; i < 8; i++) {
      total += digit(vat, i) * switzerland.rules.multipliers.common[i];
    }

    // Establish check digit.s
    total = 11 - (total % 11);
    if (total === 10) return false;
    if (total === 11) total = 0;

    // Check to see if the check digit given is correct, If not, we have an error with the VAT number
    const expect = digit(vat, 8);
    return total === expect;
  },
  rules: {
    multipliers: {
      common: [5, 4, 3, 2, 7, 6, 5, 4]
    },
    regex: [/^(CHE)(\d{9})(MWST|TVA|IVA)?$/]
  }
};

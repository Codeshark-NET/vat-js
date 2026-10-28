import type { Country } from "../core.ts";
import { digit } from "../digits.ts";

export const romania: Country = {
  name: "Romania",
  codes: ["RO", "ROU", "642"],
  calcFn: (vat: string): boolean => {
    let total = 0;

    // Extract the next digit and multiply by the counter.
    const vatLength = vat.length;
    const multipliers = romania.rules.multipliers.common.slice(10 - vatLength);

    for (let i = 0; i < vat.length - 1; i++) {
      total += digit(vat, i) * multipliers[i];
    }

    // Establish check digits by getting modulus 11.
    total = (10 * total) % 11;
    if (total === 10) total = 0;

    // Compare it with the last character of the VAT number. If it's the same, then it's valid.
    const expect = digit(vat, vat.length - 1);
    return total === expect;
  },
  rules: {
    multipliers: {
      common: [7, 5, 3, 2, 1, 7, 5, 3, 2]
    },
    regex: [/^(RO)([1-9]\d{1,9})$/]
  }
};

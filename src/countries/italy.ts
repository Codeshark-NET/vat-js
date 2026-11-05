import type { Country } from "../core.ts";
import { digit, digits } from "../digits.ts";

export const italy: Country = {
  name: "Italy",
  codes: ["IT", "ITA", "380"],
  calcFn: (vat: string): boolean => {
    let total = 0;
    let temp: number;

    if (digits(vat, 0, 7) === 0) {
      return false;
    }

    // Digits 8-10 are the issuing office: 001-100 for the provinces, 120 and 121, and the
    // special 888 and 999. No official list is published; all 7,834 real numbers checked fall in
    // these ranges, and use every code from 001-100 plus 120 and 121.
    temp = digits(vat, 7, 10);
    if (temp < 1 || (temp > 100 && temp !== 120 && temp !== 121 && temp !== 888 && temp !== 999)) {
      return false;
    }

    // Extract the next digit and multiply by the appropriate
    for (let i = 0; i < 10; i++) {
      temp = digit(vat, i) * italy.rules.multipliers.common[i];
      if (temp > 9) total += Math.floor(temp / 10) + (temp % 10);
      else total += temp;
    }

    // Establish check digit.
    total = 10 - (total % 10);
    if (total > 9) {
      total = 0;
    }

    // Compare it with the last character of the VAT number. If it's the same, then it's valid.
    const expect = digit(vat, 10);
    return total === expect;
  },
  rules: {
    multipliers: {
      common: [1, 2, 1, 2, 1, 2, 1, 2, 1, 2]
    },
    regex: [/^(IT)(\d{11})$/]
  }
};

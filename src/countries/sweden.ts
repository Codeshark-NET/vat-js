import type { Country } from "../core.ts";
import { digit } from "../digits.ts";

export const sweden: Country = {
  name: "Sweden",
  codes: ["SE", "SWE", "752"],
  calcFn: (vat: string): boolean => {
    // Calculate R where R = R1 + R3 + R5 + R7 + R9, and Ri = INT(Ci/5) + (Ci*2) modulo 10
    let R = 0;
    for (let i = 0; i < 9; i = i + 2) {
      const d = digit(vat, i);
      R += Math.floor(d / 5) + ((d * 2) % 10);
    }

    // Calculate S where S = C2 + C4 + C6 + C8
    let S = 0;
    for (let j = 1; j < 9; j = j + 2) {
      S += digit(vat, j);
    }

    const checkDigit = (10 - ((R + S) % 10)) % 10;

    // Compare it with the last character of the VAT number. If it's the same, then it's valid.
    const expect = digit(vat, 9);

    return checkDigit === expect;
  },
  rules: {
    multipliers: {},
    regex: [/^(SE)(\d{10}01)$/]
  }
};

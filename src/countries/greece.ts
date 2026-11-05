import type { Country } from "../core.ts";
import { digit } from "../digits.ts";

export const greece: Country = {
  name: "Greece",
  codes: ["GR", "GRC", "300"],
  prefixes: ["EL"],
  calcFn: (vat: string): boolean => {
    let total = 0;

    // eight character numbers should be prefixed with an 0.
    const newVat = vat.length === 8 ? `0${vat}` : vat;

    // Extract the next digit and multiply by the counter.
    for (let i = 0; i < 8; i++) {
      total += digit(newVat, i) * greece.rules.multipliers.common[i];
    }

    // Establish check digit.
    total = total % 11;
    total = total > 9 ? 0 : total;

    // Compare it with the last character of the VAT number. If it's the same, then it's valid.
    const expect = digit(newVat, 8);
    return total === expect;
  },
  canonicalize: (match) => (match[2].length === 9 ? match.input : `EL0${match[2]}`),
  rules: {
    multipliers: {
      common: [256, 128, 64, 32, 16, 8, 4, 2]
    },
    // 8 digits is the 9 digit form without its leading zero: VIES has EL094051189 as valid.
    regex: [/^(EL)(\d{8,9})$/]
  }
};

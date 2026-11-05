import type { Country } from "../core.ts";
import { digit, digits } from "../digits.ts";

export const belgium: Country = {
  name: "Belgium",
  codes: ["BE", "BEL", "056"],
  calcFn: (vat: string): boolean => {
    const newVat = vat.length === 9 ? `0${vat}` : vat;
    if (digit(newVat, 0) === 0 && digit(newVat, 1) === 0) return false;

    const check = 97 - (digits(newVat, 0, 8) % 97);
    return check === digits(newVat, 8, 10);
  },
  canonicalize: (match) => (match[2].length === 10 ? match.input : `BE0${match[2]}`),
  rules: {
    multipliers: {},
    // First digit 0 or 1; the 1 series has been issued since 2023. The old 9 digit form means 0.
    regex: [/^(BE)([01]?\d{9})$/]
  }
};

import type { Country } from "../core.ts";
import { digit, digits } from "../digits.ts";

export const belgium: Country = {
  name: "Belgium",
  codes: ["BE", "BEL", "056"],
  calcFn: (vat: string): boolean => {
    const newVat = vat.length === 9 ? `0${vat}` : vat;
    if (digit(newVat, 1) === 0) return false;

    const check = 97 - (digits(newVat, 0, 8) % 97);
    return check === digits(newVat, 8, 10);
  },
  rules: {
    multipliers: {},
    regex: [/^(BE)(0?\d{9})$/]
  }
};

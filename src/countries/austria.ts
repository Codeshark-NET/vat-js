import type { Country } from "../core.ts";
import { digit } from "../digits.ts";

export const austria: Country = {
  name: "Austria",
  codes: ["AT", "AUT", "040"],
  calcFn: (vat: string): boolean => {
    let total = 0;

    for (let i = 0; i < 7; i++) {
      const temp = digit(vat, i) * austria.rules.multipliers.common[i];

      if (temp > 9) {
        total += Math.floor(temp / 10) + (temp % 10);
      } else {
        total += temp;
      }
    }

    total = 10 - ((total + 4) % 10);
    if (total === 10) total = 0;

    return total === digit(vat, 7);
  },
  rules: {
    multipliers: {
      common: [1, 2, 1, 2, 1, 2, 1]
    },
    regex: [/^(AT)U(\d{8})$/]
  }
};

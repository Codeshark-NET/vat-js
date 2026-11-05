import type { Country } from "../core.ts";
import { digits } from "../digits.ts";

// Letters and ranges from Andorra's TIN sheet, published by the OECD. The algorithm for the final
// control letter isn't published, so any letter passes.
export const andorra: Country = {
  name: "Andorra",
  codes: ["AD", "AND", "020"],
  calcFn: (vat: string): boolean => {
    const number = digits(vat, 1, 7);
    if (vat[0] === "F") return number <= 699999;
    if (vat[0] === "A" || vat[0] === "L") return number >= 700000 && number <= 799999;
    return true;
  },
  rules: {
    multipliers: {},
    regex: [/^(AD)([ACDEFGLOPU]\d{6}[A-Z])$/]
  }
};

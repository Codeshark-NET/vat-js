import type { Country } from "../core.ts";
import { digit } from "../digits.ts";

export const germany: Country = {
  name: "Germany",
  codes: ["DE", "DEU", "276"],
  calcFn: (vat: string): boolean => {
    // Checks the check digits of a German VAT number.
    let product = 10;
    let sum = 0;
    let checkDigit = 0;

    for (let i = 0; i < 8; i++) {
      // Extract the next digit and implement peculiar algorithm!.
      sum = (digit(vat, i) + product) % 10;
      if (sum === 0) {
        sum = 10;
      }
      product = (2 * sum) % 11;
    }

    // Establish check digit.
    if (11 - product === 10) {
      checkDigit = 0;
    } else {
      checkDigit = 11 - product;
    }

    // Compare it with the last two characters of the VAT number. If the same, then it is a valid
    // check digit.
    const expect = digit(vat, 8);
    return checkDigit === expect;
  },
  rules: {
    multipliers: {},
    regex: [/^(DE)([1-9]\d{8})$/]
  }
};

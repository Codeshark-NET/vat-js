import type { Country } from "../core.ts";
import { digit, digits } from "../digits.ts";

// Letters in a key come from this alphabet, which skips I and O.
const ALPHABET = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export const france: Country = {
  name: "France",
  codes: ["FR", "FRA", "250"],
  calcFn: (vat: string): boolean => {
    const siren = digits(vat, 2);
    const k0 = vat.charCodeAt(0);

    // Numeric key: the key is (SIREN * 100 + 12) mod 97.
    if (k0 <= 57 && vat.charCodeAt(1) <= 57) {
      return (siren * 100 + 12) % 97 === digits(vat, 0, 2);
    }

    // Letter key. There is no official source for this formula; it's python-stdnum's, and it
    // holds for 35 of 38 letter-key numbers in real data, the 3 exceptions being invalid in VIES.
    // SIRENs starting 000 (Monaco) aren't SIRENs, so they skip the Luhn check.
    if (vat[2] !== "0" || vat[3] !== "0" || vat[4] !== "0") {
      if (!isLuhn(vat, 2)) return false;
    }
    const a = ALPHABET.indexOf(vat[0]);
    const b = ALPHABET.indexOf(vat[1]);
    const check = k0 <= 57 ? a * 24 + b - 10 : a * 34 + b - 100;
    return (siren + 1 + Math.floor(check / 11)) % 11 === check % 11;
  },
  rules: {
    multipliers: {},
    regex: [
      /^(FR)(\d{11})$/,
      /^(FR)([A-HJ-NP-Z]\d{10})$/,
      /^(FR)(\d[A-HJ-NP-Z]\d{9})$/,
      /^(FR)([A-HJ-NP-Z]{2}\d{9})$/
    ]
  }
};

/** Luhn check over the digits of `s` from index `start` to the end. */
function isLuhn(s: string, start: number): boolean {
  let sum = 0;
  for (let i = s.length - 1, double = false; i >= start; i--, double = !double) {
    let d = digit(s, i);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

import type { Country } from "../core.ts";
import { digit, digits } from "../digits.ts";

export const bulgaria: Country = {
  name: "Bulgaria",
  codes: ["BG", "BGR", "100"],
  calcFn: (vat: string): boolean => {
    if (vat.length === 9) return _checkNineLengthVat(vat);

    const { multipliers } = bulgaria.rules;
    return (
      _isPhysicalPerson(vat, multipliers.physical) ||
      _isForeigner(vat, multipliers) ||
      _miscellaneousVAT(vat, multipliers)
    );
  },
  rules: {
    multipliers: {
      physical: [2, 4, 8, 5, 10, 9, 7, 3, 6],
      foreigner: [21, 19, 17, 13, 11, 9, 7, 3, 1],
      miscellaneous: [4, 3, 2, 7, 6, 5, 4, 3, 2]
    },
    regex: [/^(BG)(\d{9,10})$/]
  }
};

function _increase(value: number, vat: string, from: number, to: number, incr: number): number {
  let result = value;
  for (let i = from; i < to; i++) {
    result += digit(vat, i) * (i + incr);
  }
  return result;
}

function _increase2(
  value: number,
  vat: string,
  from: number,
  to: number,
  multipliers: readonly number[]
): number {
  let result = value;
  for (let i = from; i < to; i++) {
    result += digit(vat, i) * multipliers[i];
  }
  return result;
}

function _checkNineLengthVat(vat: string): boolean {
  let total: number;
  let temp = _increase(0, vat, 0, 8, 1);
  const expect = digits(vat, 8);

  total = temp % 11;
  if (total !== 10) return total === expect;

  temp = _increase(0, vat, 0, 8, 3);

  total = temp % 11;
  if (total === 10) total = 0;

  return total === expect;
}

function _isPhysicalPerson(vat: string, physicalMultipliers: readonly number[]): boolean {
  // 10 digit VAT code - see if it relates to a standard physical person
  if (/^\d\d[0-5]\d[0-3]\d\d{4}$/.test(vat)) {
    // Check month
    const month = digits(vat, 2, 4);
    if ((month > 0 && month < 13) || (month > 20 && month < 33) || (month > 40 && month < 53)) {
      let total = _increase2(0, vat, 0, 9, physicalMultipliers);
      // Establish check digit.
      total = total % 11;
      if (total === 10) total = 0;
      // Check to see if the check digit given is correct, If not, try next type of person
      if (total === digit(vat, 9)) return true;
    }
  }

  return false;
}

function _isForeigner(
  vat: string,
  multipliers: { readonly [key: string]: readonly number[] }
): boolean {
  // Extract the next digit and multiply by the counter.
  const total = _increase2(0, vat, 0, 9, multipliers.foreigner);

  // Check to see if the check digit given is correct, If not, try next type of person
  return total % 10 === digit(vat, 9);
}

function _miscellaneousVAT(
  vat: string,
  multipliers: { readonly [key: string]: readonly number[] }
): boolean {
  // Finally, if not yet identified, see if it conforms to a miscellaneous VAT number
  let total = _increase2(0, vat, 0, 9, multipliers.miscellaneous);

  // Establish check digit.
  total = 11 - (total % 11);
  if (total === 10) return false;
  if (total === 11) total = 0;

  // Check to see if the check digit given is correct, If not, we have an error with the VAT number
  const expect = digit(vat, 9);
  return total === expect;
}

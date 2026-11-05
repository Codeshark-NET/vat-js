import { countries } from "./countries/all.ts";
import { brazil } from "./countries/index.ts";

export interface Multipliers {
  readonly [key: string]: readonly number[];
}

export interface Rules {
  multipliers: Multipliers;
  check?: RegExp;
  regex: readonly RegExp[];
  lookup?: readonly number[];
  typeFormats?: { readonly [key: string]: RegExp };
  additional?: readonly RegExp[];
}

export interface Country {
  name: string;
  codes: readonly string[];
  /** Prefixes its VATs can start with besides the alpha-2 code in `codes[0]`. */
  prefixes?: readonly string[];
  calcFn: (vat: string, options?: { readonly [key: string]: unknown }) => boolean;
  /** The official form of a number whose format matched. Without it, `value` is the input, cleaned. */
  canonicalize?: (match: RegExpExecArray) => string;
  rules: Rules;
}

export interface CheckOptions {
  /**
   * Country to try when the number has no prefix of its own, as in `B12345674` for Spain. Must be
   * in `countriesList`, or `checkVAT` throws a `TypeError`.
   */
  assumeCountry?: Country;
}

export interface VatCheckResult {
  value?: string;
  isValid: boolean;
  isValidFormat: boolean;
  isSupportedCountry: boolean;
  country?: {
    name: string;
    isoCode: { short: string; long: string; numeric: string };
  };
}

function makeResult(
  vat: string,
  isValid: boolean,
  isValidFormat: boolean,
  country?: Country
): VatCheckResult {
  return {
    value: vat || undefined,
    isValid,
    isValidFormat,
    isSupportedCountry: Boolean(country),
    country: !country
      ? undefined
      : {
          name: country.name,
          isoCode: {
            short: country.codes[0],
            long: country.codes[1],
            numeric: country.codes[2]
          }
        }
  };
}

const SEPARATOR = /[\s.,/-]/;
const SEPARATORS = /[\s.,/-]+/g;

function removeExtraChars(vat = ""): string {
  const upper = String(vat).toUpperCase();
  // Most input is already compact; skip the replace when there is nothing to strip.
  return SEPARATOR.test(upper) ? upper.replace(SEPARATORS, "") : upper;
}

const countriesVATDoesNotStartWithCountryCode: readonly string[] = [brazil.name];

function isVATStartWithCountryCode(countryName: string): boolean {
  return !countriesVATDoesNotStartWithCountryCode.includes(countryName);
}

function isVATStartWithNumber(vat: string): boolean {
  return /^\d{2}/.test(vat);
}

/** The prefixes a country's VATs start with: its alpha-2 code, plus any others it declares. */
function prefixesOf(country: Country): readonly string[] {
  return country.prefixes ? [country.codes[0], ...country.prefixes] : [country.codes[0]];
}

// Prefix -> country, built once per countries list. Callers usually pass the same array on
// every call, so this is a lookup after the first. A list mutated after its first use keeps
// its old map.
const prefixMaps = new WeakMap<readonly Country[], ReadonlyMap<string, Country>>();

function prefixMapFor(countriesList: readonly Country[]): ReadonlyMap<string, Country> {
  let map = prefixMaps.get(countriesList);
  if (!map) {
    const built = new Map<string, Country>();
    for (const country of countriesList) {
      for (const prefix of prefixesOf(country)) {
        const key = prefix.slice(0, 2);
        if (!built.has(key)) built.set(key, country);
      }
    }
    prefixMaps.set(countriesList, built);
    map = built;
  }
  return map;
}

function getCountry(vat: string, countriesList: readonly Country[]): Country | undefined {
  const byPrefix = prefixMapFor(countriesList).get(vat.slice(0, 2));
  if (byPrefix) return byPrefix;
  if (isVATStartWithNumber(vat)) {
    return countriesList.find((country) => !isVATStartWithCountryCode(country.name));
  }
  return undefined;
}

/** The first of the country's format regexes that matches, or null. */
function matchFormat(vat: string, regexes: readonly RegExp[]): RegExpExecArray | null {
  for (const regex of regexes) {
    const match = regex.exec(vat);
    if (match) return match;
  }
  return null;
}

function checkAgainst(cleanVAT: string, country: Country): VatCheckResult {
  // Group 2 of every format regex is the number without its country prefix.
  const match = matchFormat(cleanVAT, country.rules.regex);
  if (!match) return makeResult(cleanVAT, false, false, country);
  const value = country.canonicalize ? country.canonicalize(match) : cleanVAT;
  return makeResult(value, country.calcFn(match[2]), true, country);
}

/**
 * Check a VAT number. `countriesList` limits which countries it may match; by default, all of
 * them. `options.assumeCountry` applies only when the number doesn't match a format as typed.
 */
export function checkVAT(
  vat: string,
  countriesList: readonly Country[] = countries,
  options?: CheckOptions
): VatCheckResult {
  const assumed = options?.assumeCountry;
  if (assumed && !countriesList.includes(assumed)) {
    throw new TypeError(`assumeCountry ${assumed.name} is not in countriesList`);
  }
  if (!vat) return makeResult(vat, false, false);
  const cleanVAT = removeExtraChars(vat);
  const country = getCountry(cleanVAT, countriesList);
  const result = country ? checkAgainst(cleanVAT, country) : makeResult(cleanVAT, false, false);
  if (result.isValidFormat || !assumed) return result;
  for (const prefix of prefixesOf(assumed)) {
    const candidate = checkAgainst(prefix + cleanVAT, assumed);
    if (candidate.isValidFormat) return candidate;
  }
  return result;
}

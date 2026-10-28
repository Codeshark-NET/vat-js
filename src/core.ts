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
  calcFn: (vat: string, options?: { readonly [key: string]: unknown }) => boolean;
  rules: Rules;
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

const SEPARATOR = /[\s./-]/;
const SEPARATORS = /[\s./-]+/g;

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

/** The 2-letter prefixes a country's VATs start with: its alpha-2 code, plus EL for Greece. */
function prefixesOf(country: Country): readonly string[] {
  return country.name === "Greece" ? [country.codes[0], "EL"] : [country.codes[0]];
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
        if (!built.has(prefix)) built.set(prefix, country);
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

/**
 * Check a VAT number. `countriesList` limits which countries it may match; by default, all of
 * them.
 */
export function checkVAT(
  vat: string,
  countriesList: readonly Country[] = countries
): VatCheckResult {
  if (!vat) return makeResult(vat, false, false);
  const cleanVAT = removeExtraChars(vat);
  const country = getCountry(cleanVAT, countriesList);
  if (!country) return makeResult(cleanVAT, false, false);
  // Group 2 of every format regex is the number without its country prefix.
  const match = matchFormat(cleanVAT, country.rules.regex);
  const isValid = match ? country.calcFn(match[2]) : false;
  return makeResult(cleanVAT, isValid, match !== null, country);
}

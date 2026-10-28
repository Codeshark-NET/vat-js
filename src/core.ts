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

function makeResult(vat: string, isValid?: boolean, country?: Country): VatCheckResult {
  return {
    value: vat || undefined,
    isValid: Boolean(isValid),
    isValidFormat: country ? isVatValidToRegexp(vat, country.rules.regex).isValid : false,
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

function removeExtraChars(vat = ""): string {
  return vat
    .toString()
    .toUpperCase()
    .replace(/(\s|-|\.|\/)+/g, "");
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

function isVatValidToRegexp(
  vat: string,
  regexArr: readonly RegExp[]
): { isValid: boolean; regex?: RegExp } {
  for (const regex of regexArr) {
    const isValid = regex.test(vat);
    if (isValid) return { isValid: true, regex: regex };
  }

  return { isValid: false, regex: undefined };
}

function isVatValid(vat: string, country: Country): boolean {
  const regexpValidRes = isVatValidToRegexp(vat, country.rules.regex);
  if (!regexpValidRes.isValid || !regexpValidRes.regex) return false;
  const regexResult = regexpValidRes.regex.exec(vat);
  if (!regexResult) return false;
  return country.calcFn(regexResult[2]);
}

export function checkVAT(vat: string, countriesList: readonly Country[] = []): VatCheckResult {
  if (!vat) return makeResult(vat, false);
  const cleanVAT = removeExtraChars(vat);
  const country = getCountry(cleanVAT, countriesList);
  const isValid = country ? isVatValid(cleanVAT, country) : false;
  return makeResult(cleanVAT, isValid, country);
}

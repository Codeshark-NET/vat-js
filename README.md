# @codeshark/vat

Offline VAT number validation (format + checksum) for the EU and a few other countries. No
dependencies, no HTTP calls. Derived from [jsvat](https://github.com/se-panfilov/jsvat) (MIT,
archived 2026-03), starting from its 2.5.4 source and test lists.

This checks that a number is well formed. It does not check that the number is registered to a
business; use [VIES](https://ec.europa.eu/taxation_customs/vies/) for that.

```sh
npm install @codeshark/vat
```

```ts
import { checkVAT, belgium } from "@codeshark/vat";

checkVAT("BE0411905847"); // { isValid: true, value: "BE0411905847", country: {...}, ... }
checkVAT("BE0411905847", [belgium]); // limit to specific countries
```

The result has this shape:

```ts
interface VatCheckResult {
  value?: string; // uppercased, with whitespace and . / - removed
  isValid: boolean; // format and checksum both pass
  isValidFormat: boolean;
  isSupportedCountry: boolean;
  country?: {
    name: string;
    isoCode: { short: string; long: string; numeric: string };
  };
}
```

ESM only. CommonJS consumers on Node 20.19+ can `require("@codeshark/vat")` directly.

## Supported countries

Andorra, Austria, Belgium, Brazil, Bulgaria, Croatia, Cyprus, Czech Republic, Denmark, Estonia,
Europe (`EU`), Finland, France, Germany, Greece, Hungary, Ireland, Italy, Latvia, Lithuania,
Luxembourg, Malta, Netherlands, Norway, Poland, Portugal, Romania, Russia, Serbia, Slovakia,
Slovenia, Spain, Sweden, Switzerland, United Kingdom.

## Migrating from jsvat

Change the import. The exports and result shape are the same as jsvat 2.5.4.

```diff
- import { checkVAT, countries } from "jsvat";
+ import { checkVAT, countries } from "@codeshark/vat";
```

There are two differences:

- The countries list is optional and defaults to all countries. jsvat reports every number as
  invalid without it.
- Digit-only Brazilian numbers are no longer sent to another country. jsvat treats
  `02.061.065/0001-72` as Andorran and rejects it.

All the test vectors in this repo give the same results in both packages, apart from that number.

## Known issues inherited from jsvat

- `europe` has no checksum; anything matching `EU\d{9}` is valid.
- Belgian numbers starting with 1, issued since 2023, are rejected (`BE1006023325`).
- Polish numbers whose checksum remainder is 10 are accepted (`PL1234567890`).
- French numbers with letter keys skip the checksum (`FRXX433138302`).
- The `XI` prefix for Northern Ireland is unsupported.
- Equivalent forms are returned as typed, not canonicalised: Belgian 9 and 10 digit numbers,
  Norwegian numbers with and without `MVA`.

## Test vectors

`test-vectors/<country>.json` holds `valid`, `validOnlyByFormat` and `invalid` lists per
country, converted from jsvat's `test/countries_vat_lists`. They are plain JSON so ports in
other languages can run the same vectors.

## Development

- `pnpm test`: Vitest over `test-vectors/*.json`
- `pnpm typecheck`: `tsc`, no emit
- `pnpm build`: `tsc -p tsconfig.build.json` → `dist/` (per-file ESM + `.d.ts`)
- `pnpm lint` / `pnpm lint:fix`: Biome (also runs on staged files via husky + lint-staged)
- `pnpm bench`: rough calls/second

## License

MIT. See [LICENSE](LICENSE) and [LICENSE.jsvat](LICENSE.jsvat).

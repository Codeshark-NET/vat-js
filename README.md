# @codeshark/vat

Offline VAT number validation (format + checksum) for the EU and a few other countries. No
dependencies, no HTTP calls. Derived from [jsvat](https://github.com/se-panfilov/jsvat) (MIT,
archived 2026-03), starting from its 2.5.4 source and test lists.

It checks that a number is well formed, not that it's registered; use
[VIES](https://ec.europa.eu/taxation_customs/vies/) for that.

```sh
npm install @codeshark/vat
```

```ts
import { checkVAT, belgium } from "@codeshark/vat";

checkVAT("BE0411905847"); // { isValid: true, value: "BE0411905847", country: {...}, ... }
checkVAT("BE0411905847", [belgium]); // limit to specific countries
checkVAT("0411905847", undefined, { assumeCountry: belgium }); // for numbers with no prefix
```

`assumeCountry` applies only when the number doesn't match a format as typed. It must be in the
countries list, or `checkVAT` throws a `TypeError`.

```ts
interface VatCheckResult {
  value?: string; // uppercased, with whitespace and . , / - removed; see below
  isValid: boolean; // format and checksum both pass
  isValidFormat: boolean;
  isSupportedCountry: boolean;
  country?: {
    name: string;
    isoCode: { short: string; long: string; numeric: string };
  };
}
```

When the format matches, `value` is the official form:

| Country     | Input                                  | `value`            |
| ----------- | -------------------------------------- | ------------------ |
| Belgium     | `BE411905847`                          | `BE0411905847`     |
| Norway      | `NO974760673`                          | `NO974760673MVA`   |
| Switzerland | `CHE272990183`, `CHE272990183TVA`, ... | `CHE272990183MWST` |

ESM only. CommonJS consumers on Node 20.19+ can `require("@codeshark/vat")` directly.

## Supported countries

Andorra, Austria, Belgium, Brazil, Bulgaria, Croatia, Cyprus, Czech Republic, Denmark, Estonia,
Europe (`EU`), Finland, France, Germany, Greece, Hungary, Ireland, Italy, Latvia, Lithuania,
Luxembourg, Malta, Netherlands, Norway, Poland, Portugal, Romania, Russia, Serbia, Slovakia,
Slovenia, Spain, Sweden, Switzerland, United Kingdom (`GB`, and `XI` for Northern Ireland).

## Migrating from jsvat

Change the import; exports and result shape match jsvat 2.5.4.

```diff
- import { checkVAT, countries } from "jsvat";
+ import { checkVAT, countries } from "@codeshark/vat";
```

It's about 5× faster: around 240 ns per call against 1,300 ns for jsvat 2.5.4 (valid numbers,
all countries), and about 20× faster on input that matches no country.

Differences:

- The countries list is optional and defaults to all countries. jsvat reports every number as
  invalid without it.
- Digit-only Brazilian numbers are no longer sent to another country. jsvat treats
  `02.061.065/0001-72` as Andorran and rejects it.
- Belgian numbers starting with 1, issued since 2023, are accepted (`BE1006023325`).
- Polish numbers that can't have a valid check digit are rejected (`PL1234567890`,
  `PL0000000000`).
- `XI` is accepted, as the United Kingdom.
- Andorran numbers accept any final control letter (`ADL708585T`); `F`, `A` and `L` numbers must
  be in their official ranges (`ADA000000A` is invalid).
- `value` is the official form for Belgium, Norway and Switzerland.
- Commas count as separators.

## Known issues inherited from jsvat

- `europe` has no checksum; anything matching `EU\d{9}` is valid.
- French numbers with letter keys skip the checksum (`FRXX433138302`).

## Test vectors

`test-vectors/<country>.json` holds `valid`, `validOnlyByFormat` and `invalid` lists per
country, converted from jsvat's `test/countries_vat_lists`. Plain JSON, so ports in other
languages can reuse them.

## Development

- `pnpm test`: Vitest over `test-vectors/*.json`
- `pnpm typecheck`: `tsc`, no emit
- `pnpm build`: `tsc -p tsconfig.build.json` → `dist/` (per-file ESM + `.d.ts`)
- `pnpm lint` / `pnpm lint:fix`: Biome (also runs on staged files via husky + lint-staged)
- `pnpm bench`: rough calls/second

## License

MIT. See [LICENSE](LICENSE) and [LICENSE.jsvat](LICENSE.jsvat).

# @codeshark/vat

Offline VAT number validation for the EU and a few other countries. It checks format and
checksum, has no dependencies, and makes no network calls.

It's a drop-in replacement for [jsvat](https://github.com/se-panfilov/jsvat), which was archived
in 2026-03.

```ts
import { checkVAT } from "@codeshark/vat";

checkVAT("BE0411905847").isValid; // true
checkVAT("BE0411905848").isValid; // false, bad checksum
```

A valid result means the number is well formed, not that it's registered. Use
[VIES](https://ec.europa.eu/taxation_customs/vies/) for that.

## Why use it

- **Fast.** About 190 ns per call, 7× faster than jsvat 2.5.4 on valid numbers and 40× faster on
  input that matches no country. Run `pnpm bench` to measure it yourself.
- **Current rules.** It follows recent national formats, such as Belgian numbers starting with 1
  (issued since 2023), and checks Italian office codes and French letter keys. Coming from jsvat?
  See [what changed](#differences-from-jsvat).
- **Tested against shared vectors.** The test cases are plain JSON in `test-vectors/`, so ports
  in other languages can reuse them.

## Install

```sh
npm install @codeshark/vat
```

ESM only, with TypeScript types included. CommonJS consumers on Node 20.19+ can
`require("@codeshark/vat")` directly.

Coming from jsvat? Change the import. Exports and the result shape match jsvat 2.5.4.

```diff
- import { checkVAT, countries } from "jsvat";
+ import { checkVAT, countries } from "@codeshark/vat";
```

## Usage

```ts
checkVAT(vat: string, countries?: Country[], options?: { assumeCountry?: Country }): VatCheckResult
```

```ts
import { checkVAT, belgium } from "@codeshark/vat";

checkVAT("BE0411905847"); // checks against all countries
checkVAT("BE0411905847", [belgium]); // only Belgium
checkVAT("0411905847", undefined, { assumeCountry: belgium }); // number has no prefix
```

`countries` defaults to all supported countries. `assumeCountry` applies only when the number
doesn't match a format as typed. It must be in `countries`, or `checkVAT` throws a `TypeError`.

```ts
interface VatCheckResult {
  value?: string; // uppercased, with whitespace and . , / - removed
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
| Greece      | `EL94051189`                           | `EL094051189`      |
| Netherlands | `NL4495445B01`                         | `NL004495445B01`   |
| Norway      | `NO974760673`                          | `NO974760673MVA`   |
| Switzerland | `CHE272990183`, `CHE272990183TVA`, ... | `CHE272990183MWST` |

## Supported countries

Andorra, Austria, Belgium, Brazil, Bulgaria, Croatia, Cyprus, Czech Republic, Denmark, Estonia,
Europe (`EU`), Finland, France, Germany, Greece, Hungary, Ireland, Italy, Latvia, Lithuania,
Luxembourg, Malta, Netherlands, Norway, Poland, Portugal, Romania, Russia, Serbia, Slovakia,
Slovenia, Spain, Sweden, Switzerland, United Kingdom (`GB`, and `XI` for Northern Ireland).

Each country is exported by its camelCase name, such as `belgium` or `unitedKingdom`. Note
`czechRepublic` and `slovakiaRepublic`. `countries` holds them all.

`EU` numbers are issued to non-EU businesses under the non-Union OSS scheme. They have no public
checksum, so only the format (`EU` plus 9 digits) is checked.

## Differences from jsvat

Accepts numbers jsvat rejects:

- Belgian numbers starting with 1, issued since 2023 (`BE1006023325`).
- Greek and Dutch numbers missing leading zeros (`EL94051189`, `NL4495445B01`).
- Andorran numbers with any final control letter (`ADL708585T`).
- Digit-only Brazilian numbers. jsvat treats `02.061.065/0001-72` as Andorran and rejects it.
- `XI`, as the United Kingdom.

Rejects numbers jsvat accepts:

- Polish numbers that can't have a valid check digit (`PL1234567890`, `PL0000000000`).
- Andorran `F`, `A` and `L` numbers outside their official ranges (`ADA000000A`).
- French numbers with letter keys and a bad checksum (`FRXX433138302`).
- Italian numbers without a known office code: 001–100, 120, 121, 888 or 999 (jsvat allowed up
  to 201).

Other changes:

- The countries list is optional and defaults to all countries. jsvat reports every number as
  invalid without it.
- `value` is the official form for Belgium, Greece, the Netherlands, Norway and Switzerland.
- Commas count as separators.

## Development

- `pnpm test`: Vitest over `test-vectors/*.json`
- `pnpm typecheck`: `tsc`, no emit
- `pnpm build`: `tsc -p tsconfig.build.json` → `dist/` (per-file ESM + `.d.ts`)
- `pnpm lint` / `pnpm lint:fix`: Biome (also runs on staged files via husky + lint-staged)
- `pnpm bench`: ns per call for a few input types

Each `test-vectors/<country>.json` holds `valid`, `validOnlyByFormat` and `invalid` lists,
converted from jsvat's `test/countries_vat_lists`.

## License

MIT. Derived from jsvat 2.5.4 by Sergei Panfilov. See [LICENSE](LICENSE) and
[LICENSE.jsvat](LICENSE.jsvat).

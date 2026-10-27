# tsvat

Offline VAT number validation (format + checksum) for the EU and a few other countries. No
dependencies, no HTTP calls. Derived from [jsvat](https://github.com/se-panfilov/jsvat) (MIT,
archived 2026-03), starting from its 2.5.4 source and test lists.

```ts
import { checkVAT, countries, belgium } from "tsvat";

checkVAT("BE0411905847", countries); // { isValid: true, value: "BE0411905847", country: {...}, ... }
checkVAT("BE0411905847", [belgium]); // limit to specific countries
```

## Commands

- `pnpm test`: Vitest over `test-vectors/*.json`
- `pnpm typecheck`: `tsc`, no emit
- `pnpm build`: `tsdown` → `dist/` (ESM + CJS + `.d.ts`)
- `pnpm bench`: rough calls/second

## Test vectors

`test-vectors/<country>.json` holds `valid`, `validOnlyByFormat` and `invalid` lists per
country, converted from jsvat's `test/countries_vat_lists`. They are plain JSON so ports in
other languages can run the same vectors.

## Known issues inherited from jsvat

- Numeric ISO codes are matched as VAT prefixes, so a Brazilian CNPJ starting `020` resolves
  to Andorra.
- `europe` has no checksum; anything matching `EU\d{9}` is valid.
- Open jsvat issues (BE numbers starting with 1, French keys with letters, Poland mod-11 = 10,
  `XI` prefix for Northern Ireland, Norway) are not addressed yet.

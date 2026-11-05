import { describe, expect, it } from "vitest";
import {
  austria,
  belgium,
  checkVAT,
  france,
  germany,
  greece,
  norway,
  spain,
  switzerland,
  unitedKingdom
} from "../src/index.ts";

describe("canonical value", () => {
  it.each([
    ["BE411905847", "BE0411905847"],
    ["BE0411905847", "BE0411905847"],
    ["BE1006023325", "BE1006023325"],
    ["NO974760673", "NO974760673MVA"],
    ["NO974760673MVA", "NO974760673MVA"],
    ["CHE272990183", "CHE272990183MWST"],
    ["CHE-272.990.183 TVA", "CHE272990183MWST"],
    ["CHE272990183IVA", "CHE272990183MWST"],
    ["CHE272990183MWST", "CHE272990183MWST"],
    ["EL94051189", "EL094051189"],
    ["EL094051189", "EL094051189"],
    ["NL4495445B01", "NL004495445B01"],
    ["NL004495445B01", "NL004495445B01"]
  ])("%s -> %s", (vat, value) => {
    expect(checkVAT(vat)).toMatchObject({ isValid: true, value });
  });

  it("canonicalizes a well-formed number with a bad checksum", () => {
    expect(checkVAT("NO974760674")).toMatchObject({ isValid: false, value: "NO974760674MVA" });
  });

  it("returns a malformed number cleaned, not canonicalized", () => {
    expect(checkVAT("BE-41190")).toMatchObject({ isValidFormat: false, value: "BE41190" });
  });
});

describe("XI prefix", () => {
  it("is the United Kingdom, and keeps its prefix", () => {
    expect(checkVAT("XI432525179", [unitedKingdom])).toMatchObject({
      isValid: true,
      value: "XI432525179",
      country: { name: "United Kingdom", isoCode: { short: "GB" } }
    });
  });

  it("runs the same checksum as GB", () => {
    expect(checkVAT("XI432525170").isValid).toBe(false);
    expect(checkVAT("GB432525179").isValid).toBe(checkVAT("XI432525179").isValid);
  });
});

describe("separators", () => {
  it("strips commas", () => {
    expect(checkVAT("BE 0411,905,847")).toMatchObject({ isValid: true, value: "BE0411905847" });
  });
});

describe("Poland", () => {
  it.each(["PL1234567890", "PL0000000000"])("rejects %s", (vat) => {
    expect(checkVAT(vat)).toMatchObject({ isValid: false, isValidFormat: true });
  });
});

describe("assumeCountry", () => {
  it.each([
    ["B12345674", spain, "ESB12345674"],
    ["0411905847", belgium, "BE0411905847"],
    ["136695976", germany, "DE136695976"],
    ["974760673", norway, "NO974760673MVA"],
    ["272990183", switzerland, "CHE272990183MWST"],
    ["094259216", greece, "EL094259216"]
  ])("reads %s as a number of that country", (vat, country, value) => {
    expect(checkVAT(vat, undefined, { assumeCountry: country })).toMatchObject({
      value,
      isValidFormat: true,
      country: { name: country.name }
    });
  });

  it("does not change a number that matches a format as typed", () => {
    const options = { assumeCountry: france };
    expect(checkVAT("DE136695976", undefined, options).country?.name).toBe("Germany");
    expect(checkVAT("DE136695970", undefined, options)).toMatchObject({
      isValid: false,
      country: { name: "Germany" }
    });
  });

  it("reports a bad checksum against the assumed country", () => {
    expect(checkVAT("0411905848", undefined, { assumeCountry: belgium })).toMatchObject({
      isValid: false,
      isValidFormat: true,
      country: { name: "Belgium" }
    });
  });

  it("throws when the assumed country isn't in the list", () => {
    expect(() => checkVAT("B12345674", [belgium], { assumeCountry: spain })).toThrow(TypeError);
    expect(() => checkVAT("BE0411905847", [belgium], { assumeCountry: spain })).toThrow(TypeError);
  });

  it("accepts an assumed country that is in the list", () => {
    expect(checkVAT("B12345674", [belgium, spain], { assumeCountry: spain }).value).toBe(
      "ESB12345674"
    );
  });

  it("keeps the plain result when the assumed country doesn't fit either", () => {
    expect(checkVAT("ZZ12345", undefined, { assumeCountry: austria })).toMatchObject({
      isValidFormat: false,
      isSupportedCountry: false,
      value: "ZZ12345"
    });
  });
});

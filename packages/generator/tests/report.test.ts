import { describe, expect, it } from "vitest";
import { mergeMissingInputs } from "../src/report/writeReports.js";

describe("mergeMissingInputs", () => {
  it("merges plan gaps and content TODOs without duplicates", () => {
    const merged = mergeMissingInputs(
      ["business.contact.phone — phone CTAs omitted."],
      [
        "TODO: add a phone number for the contact card.",
        "TODO: add a phone number for the contact card.",
      ],
    );
    expect(merged).toHaveLength(2);
    expect(merged[0]).toMatch(/business\.contact\.phone/);
    expect(merged[1]).toMatch(/TODO: add a phone/);
  });

  it("normalizes todos that omit the TODO prefix", () => {
    const merged = mergeMissingInputs([], ["add opening hours"]);
    expect(merged).toEqual(["TODO: add opening hours"]);
  });
});

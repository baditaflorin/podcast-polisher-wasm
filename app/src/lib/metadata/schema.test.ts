import { describe, expect, it } from "vitest";
import { VersionMetadataSchema } from "./schema";

describe("VersionMetadataSchema", () => {
  it("accepts the static metadata contract", () => {
    expect(
      VersionMetadataSchema.parse({
        version: "0.1.0",
        commit: "abc1234",
        builtAt: "2026-05-08T08:00:00.000Z",
        repositoryUrl: "https://github.com/baditaflorin/podcast-polisher-wasm",
        pagesUrl: "https://baditaflorin.github.io/podcast-polisher-wasm/",
        supportUrl: "https://www.paypal.com/paypalme/florinbadita"
      })
    ).toMatchObject({ version: "0.1.0" });
  });
});

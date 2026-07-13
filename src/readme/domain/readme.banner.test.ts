import { describe, expect, it } from "vitest";
import { buildBannerSvg, defaultDesign, hashHue } from "./readme.banner.js";

describe("readme banner", () => {
  it("uses a stable default design", () => {
    expect(defaultDesign()).toEqual({ motif: "aurora", density: "calm" });
  });

  it("produces a deterministic and escaped SVG for a fixed seed", () => {
    const data = {
      title: "<unsafe & title>",
      description: "A safe description",
      seed: 42,
    };

    const svg = buildBannerSvg(data);

    expect(buildBannerSvg(data)).toBe(svg);
    expect(svg).toContain("<svg");
    expect(svg).toContain("&lt;UNSAFE &amp;");
    expect(svg).toContain("TITLE&gt;");
  });

  it("maps every name to a valid hue", () => {
    expect(hashHue("@acme/demo")).toBeGreaterThanOrEqual(0);
    expect(hashHue("@acme/demo")).toBeLessThan(360);
  });
});

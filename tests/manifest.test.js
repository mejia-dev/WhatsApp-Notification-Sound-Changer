import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { SRC } from "./helpers/env.js";

const manifest = JSON.parse(readFileSync(SRC + "manifest.json", "utf8"));

describe("manifest.json", () => {
  it("is a Manifest V3 extension with a version", () => {
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.version).toMatch(/^\d+(\.\d+){0,3}$/);
  });

  it("only references files that exist", () => {
    const files = [
      manifest.action.default_popup,
      manifest.action.default_icon,
      ...Object.values(manifest.icons),
      ...manifest.content_scripts.flatMap((cs) => cs.js),
    ];
    const missing = files.filter((f) => !existsSync(SRC + f));
    expect(missing).toEqual([]);
  });

  it("injects the page script into the MAIN world and the bridge into the isolated world", () => {
    const byScript = Object.fromEntries(manifest.content_scripts.map((cs) => [cs.js[0], cs]));
    expect(byScript["scripts/inject.js"].world).toBe("MAIN");
    expect(byScript["scripts/injector.js"].world).toBeUndefined();
    for (const cs of manifest.content_scripts) expect(cs.run_at).toBe("document_start");
  });
});
import { describe, it, expect, vi } from "vitest";
import { loadScript, flush } from "./helpers/env.js";

const SOUND = "data:audio/mpeg;base64,aGVsbG8=";

function setup(storage) {
  const env = loadScript("scripts/injector.js", { storage });
  const initialize = vi.fn((e) => e.detail);
  const stopSound = vi.fn();
  env.document.addEventListener("WANSC-Initialize", initialize);
  env.document.addEventListener("WANSC-Stop-Sound", stopSound);
  return { ...env, initialize, stopSound };
}

describe("injector.js", () => {
  it("sends the stored custom sound to the page", async () => {
    const { initialize, chrome } = setup({ uploadedAudio: SOUND });
    await flush();
    expect(chrome.storage.local.get).toHaveBeenCalledWith(["uploadedAudio"], expect.any(Function));
    expect(initialize).toHaveBeenCalledTimes(1);
    expect(initialize.mock.results[0].value).toBe(SOUND);
  });

  it("does nothing when no custom sound is stored", async () => {
    const { initialize } = setup({});
    await flush();
    expect(initialize).not.toHaveBeenCalled();
  });

  it.each([
    ["other storage keys", { uploadedAudio: { newValue: SOUND } }, "local"],
    ["other storage areas", { stopSoundAt: { newValue: 1 } }, "sync"],
  ])("ignores changes to %s", (_label, changes, area) => {
    const { stopSound, chrome } = setup({});
    chrome._fireChanged(changes, area);
    expect(stopSound).not.toHaveBeenCalled();
  });
});
import { describe, it, expect } from "vitest";
import { loadScript, flush } from "./helpers/env.js";

const SOUND = "data:audio/mpeg;base64,aGVsbG8=";

async function setup(storage = {}) {
  const env = loadScript("scripts/popup.js", { page: "popup.html", storage });
  await flush();
  const $ = (id) => env.document.getElementById(id);
  return { ...env, $ };
}

describe("popup.js", () => {
  it("shows only the upload button when no custom sound is stored", async () => {
    const { $ } = await setup();
    expect($("deleteSoundButton")).toBeNull();
    expect($("stopSoundButton").style.display).toBe("none");
    expect($("audioElement").querySelector("source")).toBeNull();
  });

  it("loads the stored sound into the preview player", async () => {
    const { $, mocks } = await setup({ uploadedAudio: SOUND });
    const audio = $("audioElement");
    expect(audio.querySelector("source").getAttribute("src")).toBe(SOUND);
    expect(mocks.load.mock.contexts).toContain(audio);
    expect($("deleteSoundButton")).not.toBeNull();
    expect($("stopSoundButton").style.display).toBe("");
  });

  it("removes the custom sound", async () => {
    const { $, chrome } = await setup({ uploadedAudio: SOUND });
    $("deleteSoundButton").click();

    expect(chrome.storage.local.clear).toHaveBeenCalled();
    expect(chrome._data()).toEqual({});
    expect($("deleteSoundButton")).toBeNull();
    expect($("audioElement").querySelector("source")).toBeNull();
    expect($("stopSoundButton").style.display).toBe("none");
    expect($("message").innerText).toMatch(/Custom sound removed/);
  });

  it("stops the preview and sends stop signal", async () => {
    const { $, chrome, mocks } = await setup({ uploadedAudio: SOUND });
    const audio = $("audioElement");
    $("stopSoundButton").click();

    expect(mocks.pause.mock.contexts).toContain(audio);
    expect(chrome.storage.local.set).toHaveBeenCalledWith({ stopSoundAt: expect.any(Number) });
  });

  it("opens the upload window and closes the popup", async () => {
    const { $, chrome, mocks } = await setup();
    $("uploadButton").click();
    await flush();

    expect(chrome.windows.create).toHaveBeenCalledWith(
      expect.objectContaining({ url: "upload.html", type: "popup" }),
    );
    expect(mocks.close).toHaveBeenCalled();
  });
});
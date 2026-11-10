import { describe, it, expect, vi } from "vitest";
import { loadScript } from "./helpers/env.js";

const MAX_BYTES = 7 * 1024 * 1024;

function setup() {
  const env = loadScript("scripts/upload.js", { page: "upload.html" });
  const $ = (id) => env.document.getElementById(id);
  const file = (contents, type, name = "sound.mp3") => new env.window.File([contents], name, { type });

  const choose = (f) => {
    const input = $("audioFileUpload");
    Object.defineProperty(input, "files", { value: [f], configurable: true });
    input.dispatchEvent(new env.window.Event("change"));
  };

  const message = () => $("message").innerText;

  return { ...env, $, file, choose, message };
}

describe("upload.js", () => {
  it("saves a chosen audio file as a data URL", async () => {
    const { file, choose, chrome, message, mocks } = setup();
    choose(file("hello", "audio/mpeg"));

    await vi.waitFor(() => expect(message()).toMatch(/^Saved/));
    expect(chrome._data().uploadedAudio).toBe("data:audio/mpeg;base64,aGVsbG8=");
    await vi.waitFor(() => expect(mocks.close).toHaveBeenCalled(), { timeout: 3000 });
  });

  it("rejects non-audio files", () => {
    const { file, choose, chrome, message } = setup();
    choose(file("hello", "image/png", "pic.png"));
    expect(message()).toMatch(/Not a recognized audio file/);
    expect(chrome.storage.local.set).not.toHaveBeenCalled();
  });

  it("rejects files over 7 MB", () => {
    const { file, choose, chrome, message } = setup();
    choose(file(new Uint8Array(MAX_BYTES + 1), "audio/mpeg"));
    expect(message()).toMatch(/File is too large \(7\.0 MB\)/);
    expect(chrome.storage.local.set).not.toHaveBeenCalled();
  });

  it("reports storage errors", async () => {
    const { file, choose, chrome, message, mocks } = setup();
    chrome.runtime.lastError = { message: "QUOTA_BYTES quota exceeded" };
    choose(file("hello", "audio/mpeg"));

    await vi.waitFor(() => expect(message()).toBe("Upload failed: QUOTA_BYTES quota exceeded"));
    expect(mocks.close).not.toHaveBeenCalled();
  });
});
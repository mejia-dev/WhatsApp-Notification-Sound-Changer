import { describe, it, expect, vi } from "vitest";
import { loadScript } from "./helpers/env.js";

const DEFAULT_SOUND = "https://static.whatsapp.net/rsrc.php/yv/r/BS_BUUXbKq5.mp3";
const FAKE_SOUND = "https://static.whatsapp.net/rsrc.php/yv/r/ringtone_abc123.mp3";
const CUSTOM_SOUND = "data:audio/mpeg;base64," + Buffer.from("hello").toString("base64");

function setup() {
  const env = loadScript("scripts/inject.js");
  const { document } = env;
  return {
    ...env,
    initialize(detail = CUSTOM_SOUND) {
      document.dispatchEvent(new env.window.CustomEvent("WANSC-Initialize", { detail }));
    },
    stop() {
      document.dispatchEvent(new env.window.CustomEvent("WANSC-Stop-Sound"));
    },
    audio(src, { loop = false } = {}) {
      const el = document.createElement("audio");
      el.src = src;
      el.loop = loop;
      return el;
    },
  };
}

describe("inject.js", () => {
  it("passes play() through untouched when no custom sound is set", async () => {
    const { audio, mocks } = setup();
    const chime = audio(DEFAULT_SOUND);
    await chime.play();
    expect(mocks.play.mock.contexts).toEqual([chime]);
  });

  it("plays the custom sound instead of WhatsApp's notification chime", async () => {
    const { audio, initialize, mocks } = setup();
    initialize();
    const chime = audio(DEFAULT_SOUND);
    await chime.play();

    expect(mocks.play).toHaveBeenCalledTimes(1);
    const played = mocks.play.mock.contexts[0];
    expect(played).not.toBe(chime);
    expect(played.src).toBe("blob:https://web.whatsapp.com/fake");
    expect(played.currentTime).toBe(0);
  });

  it("decodes the stored data URL into a Blob with the right type and bytes", async () => {
    const { initialize, mocks } = setup();
    initialize();
    expect(mocks.createObjectURL).toHaveBeenCalledTimes(1);
    const blob = mocks.createObjectURL.mock.calls[0][0];
    expect(blob.type).toBe("audio/mpeg");
    expect(await blob.text()).toBe("hello");
  });

  it.each([
    ["a looping chime (e.g. a call ringtone)", DEFAULT_SOUND, true],
    ["a different WhatsApp sound", FAKE_SOUND, false],
    ["a non-WhatsApp host", "https://example.com/BS_BUUXbKq5.mp3", false],
    ["a lookalike host", "https://notwhatsapp.com/BS_BUUXbKq5.mp3", false],
  ])("does not swap %s", async (_label, src, loop) => {
    const { audio, initialize, mocks, window } = setup();
    vi.spyOn(window.console, "debug").mockImplementation(() => {});
    initialize();
    const el = audio(src, { loop });
    await el.play();
    expect(mocks.play.mock.contexts).toEqual([el]);
  });

  it("falls back to WhatsApp's sound if the custom sound fails to play", async () => {
    const { audio, initialize, mocks } = setup();
    initialize();
    mocks.play.mockImplementationOnce(() => Promise.reject(new Error("NotAllowedError")));
    const chime = audio(DEFAULT_SOUND);
    await chime.play();

    expect(mocks.play).toHaveBeenCalledTimes(2);
    expect(mocks.play.mock.contexts[1]).toBe(chime);
  });

  it("ignores a malformed data URL and keeps WhatsApp's sound", async () => {
    const { audio, initialize, mocks, window } = setup();
    const error = vi.spyOn(window.console, "error").mockImplementation(() => {});
    initialize("not a data url");

    expect(error).toHaveBeenCalled();
    const chime = audio(DEFAULT_SOUND);
    await chime.play();
    expect(mocks.play.mock.contexts).toEqual([chime]);
  });

  it("only initializes once", () => {
    const { initialize, mocks } = setup();
    initialize();
    initialize("data:audio/ogg;base64," + Buffer.from("other").toString("base64"));
    expect(mocks.createObjectURL).toHaveBeenCalledTimes(1);
  });

  it("stops and rewinds the custom sound on WANSC-Stop-Sound", async () => {
    const { audio, initialize, stop, mocks } = setup();
    initialize();
    await audio(DEFAULT_SOUND).play();
    const custom = mocks.play.mock.contexts[0];

    stop();
    expect(mocks.pause.mock.contexts).toEqual([custom]);
    expect(custom.currentTime).toBe(0);
  });

  it("does nothing on WANSC-Stop-Sound when no custom sound is loaded", () => {
    const { stop, mocks } = setup();
    stop();
    expect(mocks.pause).not.toHaveBeenCalled();
  });
});
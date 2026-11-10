import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import { vi } from "vitest";

export const SRC = fileURLToPath(new URL("../../src/", import.meta.url));

function pageBody(page) {
  const html = readFileSync(SRC + page, "utf8");
  const body = /<body[^>]*>([\s\S]*)<\/body>/i.exec(html)[1];
  return body.replace(/<script[\s\S]*?<\/script>/gi, "");
}

// Mocks the chrome.* APIs.
export function createChromeMock(initialStorage = {}) {
  let data = { ...initialStorage };
  const changeListeners = [];
  const chrome = {
    runtime: { lastError: undefined },
    storage: {
      local: {
        get: vi.fn((keys, cb) => {
          const list = Array.isArray(keys) ? keys : [keys];
          const result = {};
          for (const key of list) if (key in data) result[key] = data[key];
          setTimeout(() => cb(result), 0);
        }),
        set: vi.fn((items, cb) => {
          if (!chrome.runtime.lastError) data = { ...data, ...items };
          if (cb) setTimeout(cb, 0);
        }),
        clear: vi.fn(() => {
          data = {};
        }),
      },
      onChanged: {
        addListener: vi.fn((fn) => changeListeners.push(fn)),
      },
    },
    windows: { create: vi.fn(() => Promise.resolve({})) },
    _data: () => data,
    _fireChanged: (changes, areaName) => changeListeners.forEach((fn) => fn(changes, areaName)),
  };
  return chrome;
}

export function loadScript(script, { page, storage } = {}) {
  const html = `<!DOCTYPE html><html><head></head><body>${page ? pageBody(page) : ""}</body></html>`;
  const dom = new JSDOM(html, { runScripts: "outside-only", url: "https://web.whatsapp.com/" });
  const { window } = dom;

  // stub since jsdom doesn't support media playback
  const media = window.HTMLMediaElement.prototype;
  const play = vi.fn(() => Promise.resolve());
  const pause = vi.fn();
  const load = vi.fn();
  media.play = play;
  media.pause = pause;
  media.load = load;

  const createObjectURL = vi.fn(() => "blob:https://web.whatsapp.com/fake");
  window.URL.createObjectURL = createObjectURL;
  const close = vi.fn();
  window.close = close;

  const chrome = createChromeMock(storage);
  window.chrome = chrome;

  window.eval(readFileSync(SRC + script, "utf8"));

  return { window, document: window.document, chrome, mocks: { play, pause, load, createObjectURL, close } };
}

export const flush = () => new Promise((resolve) => setTimeout(resolve, 5));
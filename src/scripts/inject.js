(() => {
  const SOUND_FILES = ["BS_BUUXbKq5.mp3"];
  const HOSTNAME = /(^|\.)whatsapp\.(net|com)$/;

  const originalPlay = HTMLMediaElement.prototype.play;
  let customAudio = null;

  function dataUrlToBlobUrl(dataUrl) {
    const match = /^data:([^;,]*)(?:;[^,]*)?;base64,(.*)$/s.exec(dataUrl);
    if (!match) throw new Error("Not a base64 data URL");
    const binary = atob(match[2]);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return URL.createObjectURL(new Blob([bytes], { type: match[1] }));
  }

  function classify(element) {
    const url = element.currentSrc || element.src;
    if (!url) return null;
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      return null;
    }
    if (!HOSTNAME.test(parsed.hostname)) return null;
    const file = parsed.pathname.split("/").pop();
    if (SOUND_FILES.includes(file) && !element.loop) return { ding: true, url };
    return { ding: false, url };
  }

  HTMLMediaElement.prototype.play = function play(...args) {
    if (customAudio) {
      try {
        const sound = classify(this);
        if (sound && sound.ding) {
          customAudio.currentTime = 0;
          return originalPlay.call(customAudio).catch(() => originalPlay.apply(this, args));
        }
        if (sound) console.debug("[WANSC] unmatched WhatsApp sound:", sound.url);
      } catch {
        // Fallback to whatever WhatsApp provided.
      }
    }
    return originalPlay.apply(this, args);
  };

  document.addEventListener("WANSC-Initialize", (event) => {
    if (customAudio) return;
    try {
      customAudio = new Audio(dataUrlToBlobUrl(event.detail));
    } catch (error) {
      console.error("[WANSC] Could not load custom sound:", error);
    }
  });

  document.addEventListener("WANSC-Stop-Sound", () => {
    if (!customAudio) return;
    customAudio.pause();
    customAudio.currentTime = 0;
  });
})();
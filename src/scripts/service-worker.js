chrome.runtime.onMessage.addListener(async (message) => {
  if (message.title === "WANSC-Load-Player") {
    if (await chrome.offscreen.hasDocument()) {
      chrome.offscreen.closeDocument();
    }

    chrome.tabs.query({url: "https://web.whatsapp.com/*"}, function (tabs) {
      if (tabs.length > 0) {
        const whatsApp = tabs[0];
        chrome.tabs.update(whatsApp.id, { muted: true });
      }
    });

    await chrome.offscreen.createDocument({
      url: "audio_player/audio_player.html",
      reasons: ["AUDIO_PLAYBACK"],
      justification: "Required for playing back audio while tab is muted"
    });

    await chrome.runtime.sendMessage({
      title: "WANSC-Play-Sound",
      audio: message.audio
    });
  }
  if (message.title === "WANSC-Audio-Ended") {
    chrome.tabs.query({url: "https://web.whatsapp.com/*"}, function (tabs) {
      if (tabs.length > 0) {
        const whatsApp = tabs[0];
        chrome.tabs.update(whatsApp.id, { muted: false });
      }
    });
  }
});
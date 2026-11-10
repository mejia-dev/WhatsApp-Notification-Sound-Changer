let loadPlayerQueue = Promise.resolve();

async function loadPlayer(audio) {
  try {
    if (await chrome.offscreen.hasDocument()) {
      await chrome.offscreen.closeDocument();
    }

    const tabs = await chrome.tabs.query({url: "https://web.whatsapp.com/*"});
    if (tabs.length > 0) {
      const whatsApp = tabs[0];
      await chrome.tabs.update(whatsApp.id, { muted: true });
    }

    await chrome.offscreen.createDocument({
      url: "audio_player/audio_player.html",
      reasons: ["AUDIO_PLAYBACK"],
      justification: "Required for playing back audio while tab is muted"
    });

    await chrome.runtime.sendMessage({
      title: "WANSC-Play-Sound",
      audio: audio
    });
  } catch (error) {
    console.error("Failed to play custom sound:", error);
    const tabs = await chrome.tabs.query({url: "https://web.whatsapp.com/*"});
    if (tabs.length > 0) {
      await chrome.tabs.update(tabs[0].id, { muted: false });
    }
  }
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.title === "WANSC-Load-Player") {
    loadPlayerQueue = loadPlayerQueue
      .then(() => loadPlayer(message.audio))
      .catch((error) => console.error(error));
  }
  if (message.title === "WANSC-Stop-Sound") {
    chrome.runtime.sendMessage({ title: "WANSC-Stop-Sound" });
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
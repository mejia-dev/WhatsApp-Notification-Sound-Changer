chrome.runtime.onMessage.addListener(async (message) => {
  if (message.title === "WANSC-Load-Player") {
    if (await chrome.offscreen.hasDocument()) {
      chrome.offscreen.closeDocument();
    }

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs.length > 0) {
        let currentTab = tabs[0];
        chrome.tabs.update(currentTab.id, { muted: true });
      }
    });

    await chrome.offscreen.createDocument({
      url: "audio_player/audio_player.html",
      reasons: ["AUDIO_PLAYBACK"],
      justification: "Required for playing back audio while tab is muted"
    });

    chrome.runtime.sendMessage({
      title: "WANSC-Play-Sound",
      audio: message.audio
    });
  }

});
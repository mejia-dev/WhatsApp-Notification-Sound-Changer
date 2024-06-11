chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.title === "WAW-Alert-Triggered") {
    console.log("Bees");
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs.length > 0) {
        let currentTab = tabs[0];
        // Mute the current tab
        chrome.tabs.update(currentTab.id, { muted: true }, function () {
          console.log('Tab muted due to notification');
        });
      }
    });

    chrome.offscreen.createDocument({
      url: "audio_player/audio_player.html",
      reasons: ["AUDIO_PLAYBACK","LOCAL_STORAGE"],
      justification: "Required for playing back audio while tab is muted"
    });

    // chrome.runtime.sendMessage({
    //   title: "WAW-Play-Audio",
    //   audio: message.audio
    // });
  }

});
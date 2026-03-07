document.addEventListener("DOMContentLoaded", () => {
  let currentAudio = null;

  chrome.runtime.onMessage.addListener((message) => {
    if (message.title === "WANSC-Play-Sound") {
      currentAudio = new Audio;
      currentAudio.src = message.audio;
      currentAudio.addEventListener("ended", () => {
        currentAudio = null;
        chrome.runtime.sendMessage({ title: "WANSC-Audio-Ended" });
      });
      currentAudio.play();
    }
    if (message.title === "WANSC-Stop-Sound") {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
        chrome.runtime.sendMessage({ title: "WANSC-Audio-Ended" });
      }
    }
  });
});
document.addEventListener("DOMContentLoaded", () => {
  chrome.runtime.onMessage.addListener((message) => {
    if (message.title === "WANSC-Play-Sound") {
      const audio = new Audio;
      audio.src = message.audio;
      audio.addEventListener("ended", () => {
        chrome.runtime.sendMessage({ title: "WANSC-Audio-Ended" });
      })
      audio.play();
    }
  });
});
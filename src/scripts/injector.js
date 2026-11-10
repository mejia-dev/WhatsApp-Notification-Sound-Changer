chrome.storage.local.get(["uploadedAudio"], (result) => {
  if (result.uploadedAudio) {
    document.dispatchEvent(new CustomEvent("WANSC-Initialize", { detail: result.uploadedAudio }));
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes.stopSoundAt) {
    document.dispatchEvent(new CustomEvent("WANSC-Stop-Sound"));
  }
});
(async () => {
  const injectScript = await chrome.runtime.getURL("scripts/inject.js");
  const script = document.createElement("script");
  script.setAttribute("src", injectScript);
  script.setAttribute("type", "text/javascript");
  script.onload = function () {
    this.remove();
    chrome.storage.local.get(["uploadedAudio"], function (result) {
      if (result.uploadedAudio) {
        document.dispatchEvent(new CustomEvent("WANSC-Initialize", { detail: result.uploadedAudio }));
        document.addEventListener("WANSC-Notification-Triggered", () => {
          chrome.runtime.sendMessage({ title: "WANSC-Load-Player", audio: result.uploadedAudio });
        });
      }
    });
  }
  document.head.appendChild(script);
})();
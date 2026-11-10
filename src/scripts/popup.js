const storage = chrome.storage.local;

const audioElement = document.getElementById("audioElement");
const uploadButton = document.getElementById("uploadButton");
const message = document.getElementById("message");
const stopSoundButton = document.getElementById("stopSoundButton");

stopSoundButton.addEventListener("click", () => {
  // Stop sample audio player
  audioElement.pause();
  audioElement.currentTime = 0;
  // Signal WhatsApp tabs to stop the custom sound
  chrome.storage.local.set({ stopSoundAt: Date.now() });
});

uploadButton.addEventListener("click", async () => {
  await chrome.windows.create({ url: "upload.html", type: "popup", width: 340, height: 260 });
  window.close();
});

async function loadCurrentAudio() {
  chrome.storage.local.get(["uploadedAudio"], function (result) {
    if (result.uploadedAudio) {
      const audioSource = document.createElement("source");
      audioSource.setAttribute("src", result.uploadedAudio);
      audioElement.innerHTML = "";
      audioElement.appendChild(audioSource);
      audioElement.load();
      generateDeleteButton();
      stopSoundButton.style.display = "";
    }
  });
}

function generateDeleteButton() {
  if (document.getElementById("deleteSoundButton")) document.getElementById("deleteSoundButton").remove();
  const delButton = document.createElement("button");
  delButton.innerHTML = `<i class="bi bi-trash"></i> Remove custom sound`;
  delButton.id = "deleteSoundButton";
  delButton.classList.add("deleteSoundButton");
  delButton.addEventListener("click", doDelete);
  const buttonsContainer = document.getElementById("buttonsContainer");
  buttonsContainer.prepend(delButton);
}

function doDelete() {
  chrome.storage.local.clear();
  audioElement.innerHTML = "";
  audioElement.load();
  document.getElementById("deleteSoundButton").remove();
  stopSoundButton.style.display = "none";
  message.innerText = "Custom sound removed. Please refresh the page to complete the removal.";
}

loadCurrentAudio();
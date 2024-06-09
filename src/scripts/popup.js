const storage = chrome.storage.local;

const audioElement = document.getElementById("audioElement");
const audioFileUpload = document.getElementById("audioFileUpload");
const message = document.getElementById("message");

audioFileUpload.addEventListener("change", handleAudioUpload);

async function handleAudioUpload() {
  try {
    const file = audioFileUpload.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
      const audioDataURL = e.target.result;
      chrome.storage.local.set({ uploadedAudio: audioDataURL },
        function () {
          message.innerText = "Successfully uploaded file. Please refresh the page to activate the custom sound.";
          loadCurrentAudio();
        }
      );
    };
    reader.readAsDataURL(file);
  }
  catch (e) {
    message.innerText = e.message;
  }
}

async function loadCurrentAudio() {
  chrome.storage.local.get(["uploadedAudio"], function (result) {
    if (result.uploadedAudio) {
      const audioSource = document.createElement("source");
      audioSource.setAttribute("src", result.uploadedAudio);
      audioElement.innerHTML = "";
      audioElement.appendChild(audioSource);
      audioElement.load();
      generateDeleteButton();
    }
  });
}

function generateDeleteButton() {
  if (document.getElementById("deleteSoundButton")) document.getElementById("deleteSoundButton").remove();
  const delButton = document.createElement("button");
  delButton.innerText = "Remove custom sound";
  delButton.id = "deleteSoundButton";
  delButton.classList.add("deleteSoundButton");
  delButton.addEventListener("click", doDelete);
  audioElement.after(delButton);
}

function doDelete() {
  chrome.storage.local.clear();
  audioElement.innerHTML = "";
  audioElement.load();
  document.getElementById("deleteSoundButton").remove();
  message.innerText = "Custom sound removed. Please refresh the page to complete the removal.";
}

loadCurrentAudio();
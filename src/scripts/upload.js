// chrome.storage.local allows 10 MB. Audio is stored as a base64 data URL.
const MAX_FILE_BYTES = 7 * 1024 * 1024;

const audioFileUpload = document.getElementById("audioFileUpload");
const dropzone = document.getElementById("dropzone");
const message = document.getElementById("message");

audioFileUpload.addEventListener("change", () => handleFile(audioFileUpload.files[0]));

dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropzone.classList.add("dragover");
});
dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropzone.classList.remove("dragover");
  handleFile(e.dataTransfer.files[0]);
});

function handleFile(file) {
  if (!file) return;
  if (!file.type.startsWith("audio/")) {
    message.innerText = "Not a recognized audio file. Please try again.";
    return;
  }
  if (file.size > MAX_FILE_BYTES) {
    message.innerText = `File is too large (${(file.size / 1048576).toFixed(1)} MB). Maximum is 7 MB.`;
    return;
  }

  const reader = new FileReader();
  reader.onerror = () => { message.innerText = "Couldn't read that file."; };
  reader.onload = (e) => {
    chrome.storage.local.set({ uploadedAudio: e.target.result }, () => {
      if (chrome.runtime.lastError) {
        message.innerText = `Upload failed: ${chrome.runtime.lastError.message}`;
        return;
      }
      message.innerText = "Saved. Refresh WhatsApp Web to use it.";
      setTimeout(() => window.close(), 1500);
    });
  };
  reader.readAsDataURL(file);
}
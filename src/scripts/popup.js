const storage = chrome.storage.local;

const audioElement = document.getElementById("audioElement");
const audioFileUpload = document.getElementById("audioFileUpload");
const message = document.getElementById("message");

audioFileUpload.addEventListener("change", handleAudioUpload);

async function handleAudioUpload() {
  try {
    chrome.storage.local.set({ uploadedAudio: audioFileUpload.files[0] });
    message.innerText = "Successfully uploaded file";
    loadCurrentAudio();
  }
  catch (e) {
    message.innerText = e.message;
  }
}

async function loadCurrentAudio() {
  console.log(await chrome.storage.local.get(["uploadedAudio"]));
  const audioFile = await chrome.runtime.getURL(chrome.storage.local.get(["uploadedAudio"]));
  
    const audioSource = document.createElement("source");
    audioSource.setAttribute("src", audioURL);
    audioElement.appendChild(audioSource);
  

}
loadCurrentAudio();
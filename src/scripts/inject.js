(function () {
  const storage = chrome.storage.local;
  const OriginalNotification = Notification;
  const OriginalAudio = Audio;

  function CustomNotification(title, options) {
    options.silent = true;
    const notification = new OriginalNotification(title, options);
    changeAudioConstructor();
    const audio = new Audio;
    audio.play();
    setTimeout(() => {
      window.Audio = OriginalAudio;
    }, 2000);
    return notification;
  }

  function changeAudioConstructor() {
    function CustomAudio(src) {
      const audio = new OriginalAudio(src);
      // set to a temporary sound for now, can be updated later to use user-specified sound
      chrome.storage.local.get(["uploadedAudio"], function (result) {
        if (result.uploadedAudio) {
          audio.src = result.uploadedAudio;
        }
      });
      // audio.src = "https://cdn.freesound.org/previews/352/352653_4019029-lq.mp3";
      return audio;
    }
    CustomAudio.prototype = OriginalAudio.prototype;
    window.Audio = CustomAudio;
  }

  CustomNotification.prototype = OriginalNotification.prototype;
  CustomNotification.requestPermission = OriginalNotification.requestPermission.bind(OriginalNotification);
  CustomNotification.permission = OriginalNotification.permission;

  window.Notification = CustomNotification;

  console.log("WhatsApp Notification Sound Changer loaded!");
})();
(function () {
  const OriginalNotification = Notification;
  const OriginalAudio = Audio;

  function CustomNotification(title, options) {
    const notification = new OriginalNotification(title, options);
    changeAudioConstructor();
    setTimeout(() => {
      window.Audio = OriginalAudio;
    }, 2000);
    return notification;
  }

  function changeAudioConstructor() {
    function CustomAudio(src) {
      const audio = new OriginalAudio(src);
      // set to a temporary sound for now, can be updated later to use user-specified sound
      audio.src = "https://cdn.freesound.org/previews/352/352653_4019029-lq.mp3";
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
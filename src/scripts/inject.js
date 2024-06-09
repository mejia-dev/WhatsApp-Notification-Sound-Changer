document.addEventListener('WACustomNotificationSound', (e) => {
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
      audio.src = e.detail;
      return audio;
    }
    CustomAudio.prototype = OriginalAudio.prototype;
    window.Audio = CustomAudio;
  }

  CustomNotification.prototype = OriginalNotification.prototype;
  CustomNotification.requestPermission = OriginalNotification.requestPermission.bind(OriginalNotification);
  CustomNotification.permission = OriginalNotification.permission;
  window.Notification = CustomNotification;
});
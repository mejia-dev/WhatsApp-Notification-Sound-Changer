document.addEventListener("WANSC-Initialize", () => {
  const OriginalNotification = Notification;

  function CustomNotification(title, options) {
    options.silent = true;
    const notification = new OriginalNotification(title, options);
    document.dispatchEvent(new CustomEvent("WANSC-Notification-Triggered"));
    return notification;
  }

  CustomNotification.prototype = OriginalNotification.prototype;
  CustomNotification.requestPermission = OriginalNotification.requestPermission.bind(OriginalNotification);
  CustomNotification.permission = OriginalNotification.permission;
  window.Notification = CustomNotification;
});
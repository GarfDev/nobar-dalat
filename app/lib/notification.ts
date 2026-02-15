export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.log("This browser does not support desktop notification");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

export function sendNotification(title: string, options?: NotificationOptions) {
  if (Notification.permission === "granted") {
    const notification = new Notification(title, {
      icon: "/apple-touch-icon.png", // Use app icon
      badge: "/favicon-32x32.png",
      ...options,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Play a subtle sound
    try {
      // Simple beep using AudioContext if no file is available,
      // but simpler to just try to play a file or rely on system sound.
      // Since we don't have a specific sound file, we'll skip the audio part
      // or use a very generic base64 if requested, but Visual is MVP.
    } catch (e) {
      // ignore
    }
  }
}

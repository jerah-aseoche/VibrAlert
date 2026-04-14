// Convert VAPID public key to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// VAPID Public Key (from step 2)
const VAPID_PUBLIC_KEY = 'BDKDZu9HQ_1uyQ6VxwqekpHudhAef_ZpIXFaZMBxGYsz6vyUXkHwhBZvScxwE6dkWUn29kmHuDi2NigiwSTKeVQ';

export async function subscribeToPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push notifications not supported');
    return false;
  }

  try {
    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return false;
    }

    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;
    
    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    // Send subscription to backend
    const response = await fetch('/api/device/subscribe-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription })
    });

    if (response.ok) {
      console.log('✅ Subscribed to push notifications');
      return true;
    }
  } catch (error) {
    console.error('Push subscription error:', error);
  }
  return false;
}

// Check if notifications are supported
export function areNotificationsSupported() {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
}

// Get notification permission status
export function getNotificationPermission() {
  return Notification.permission;
}
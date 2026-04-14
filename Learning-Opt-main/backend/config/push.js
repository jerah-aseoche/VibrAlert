import webpush from 'web-push';

// VAPID Keys (replace with your generated keys)
const vapidKeys = {
  publicKey: 'BDKDZu9HQ_1uyQ6VxwqekpHudhAef_ZpIXFaZMBxGYsz6vyUXkHwhBZvScxwE6dkWUn29kmHuDi2NigiwSTKeVQ',
  privateKey: 'KnWmP-WPk69rf7DErwmUaADWYCxYnbPtYZpmMOjX_js'
};

webpush.setVapidDetails(
  'mailto:vibralert@example.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Store subscriptions (in production, save to MongoDB)
let subscriptions = [];

export function addSubscription(subscription) {
  subscriptions.push(subscription);
  console.log(`📱 Subscription added. Total: ${subscriptions.length}`);
}

export async function sendPushNotification(title, body, url = '/') {
  const payload = JSON.stringify({ title, body, url });
  
  for (const subscription of subscriptions) {
    try {
      await webpush.sendNotification(subscription, payload);
      console.log('✅ Push notification sent');
    } catch (error) {
      console.error('❌ Push failed:', error);
      // Remove invalid subscription
      subscriptions = subscriptions.filter(s => s !== subscription);
    }
  }
}

// Send notification on alarm trigger
export function notifyAlarmTriggered() {
  sendPushNotification(
    '🔔 VibrAlert Alarm!',
    'Vibration detected! Alarm has been triggered.',
    '/'
  );
}
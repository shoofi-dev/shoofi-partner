import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      vibrate:true
    }),
  });
export async function schedulePushNotification(data: any) {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "אטליז עבד אלחי",
            body: 'طلبية جديدة',
            data: data,
            sound: 'buffalosound.wav',
            vibrate: [10]
        },
        trigger: { seconds: 2 },
    });
}

export async function schedulePushNotificationDeliveryDelay(data: any) {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "אטליז עבד אלחי",
            body: 'تاخير بالارسالية',
            data: data,
            sound: 'deliverysound.wav',
            vibrate: [10]
        },
        trigger: { seconds: 2 },
    });
}

export async function registerForPushNotificationsAsync() {
    let token;
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        // if (finalStatus !== 'granted') {
        //     // alert('Failed to get push token for push notification!');
        //     return;
        // }
        token = (await Notifications.getExpoPushTokenAsync({projectId:'5ba01fc0-6005-4e0a-b5b1-4e16e5aecc76'})).data;
    } else {
       // alert('Must use physical device for Push Notifications');
    }
    return token;
}
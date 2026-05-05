import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { insertWish } from './supabase';

const CURSE_KEY = 'GIRIGO_CURSE_END_TIME';

// Ensure notifications show in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const setupNotifications = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('curse-channel', {
      name: 'Curse Status',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
};

export const startCurse = async (name?: string, wish?: string) => {
  // 24 hours from now
  const now = new Date();
  const endTime = now.getTime() + 24 * 60 * 60 * 1000;
  await AsyncStorage.setItem(CURSE_KEY, endTime.toString());

  await setupNotifications();
  const { status } = await Notifications.requestPermissionsAsync();

  // Get Expo push token for server-side notifications
  let pushToken: string | undefined;
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: 'bc79a1c2-278d-4f38-8cf5-fa99f8ab96b6',
    });
    pushToken = tokenData.data;
  } catch (e) {
    console.warn('Could not get push token:', e);
  }

  // Store the ritual in Supabase (fire-and-forget, don't block the user)
  if (name && wish) {
    insertWish({
      name,
      wish,
      push_token: pushToken ?? null,
      curse_start: now.toISOString(),
      curse_end: new Date(endTime).toISOString(),
    });
  }

  if (status === 'granted') {
    // Immediate sticky notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '👁️ 의식이 시작되었습니다.',
        body: '24시간 후 제물이 바쳐집니다. The ritual has begun.',
        sticky: true,
        autoDismiss: false,
      },
      trigger: null,
    });
  }

  return endTime;
};

export const getCurseEndTime = async () => {
  const timeStr = await AsyncStorage.getItem(CURSE_KEY);
  if (!timeStr) return null;
  const time = parseInt(timeStr, 10);
  if (new Date().getTime() > time) {
    // Curse has expired
    await Notifications.dismissAllNotificationsAsync();
    return null;
  }
  return time;
};

export const clearCurse = async () => {
  await AsyncStorage.removeItem(CURSE_KEY);
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.dismissAllNotificationsAsync();
};

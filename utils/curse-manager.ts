import AsyncStorage from '@react-native-async-storage/async-storage';

const CURSE_KEY = 'GIRIGO_CURSE_END_TIME';

export const startCurse = async () => {
  // 24 hours from now
  const endTime = new Date().getTime() + 24 * 60 * 60 * 1000;
  await AsyncStorage.setItem(CURSE_KEY, endTime.toString());
  return endTime;
};

export const getCurseEndTime = async () => {
  const timeStr = await AsyncStorage.getItem(CURSE_KEY);
  if (!timeStr) return null;
  const time = parseInt(timeStr, 10);
  if (new Date().getTime() > time) {
    // Curse has expired
    return null;
  }
  return time;
};

export const clearCurse = async () => {
  await AsyncStorage.removeItem(CURSE_KEY);
};

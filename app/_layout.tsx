import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';

export default function Layout() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#171417" />
      <Stack screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: '#171417' },
        animation: 'fade'
      }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="wish-form" />
        <Stack.Screen name="camera" />
        <Stack.Screen name="timer" options={{ gestureEnabled: false }} />
      </Stack>
    </>
  );
}

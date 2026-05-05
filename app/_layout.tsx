import { Stack } from 'expo-router';
import { StatusBar, StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

export default function Layout() {
  return (
    <View style={styles.container}>
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

      {/* Global Vignette Overlay */}
      <View style={styles.vignette} pointerEvents="none">
        <Svg height="100%" width="100%">
          <Defs>
            <RadialGradient id="vignetteGrad" cx="50%" cy="50%" rx="70%" ry="70%" fx="50%" fy="50%">
              <Stop offset="50%" stopColor="#000" stopOpacity="0" />
              <Stop offset="100%" stopColor="#000" stopOpacity="0.85" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#vignetteGrad)" />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#171417',
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  }
});

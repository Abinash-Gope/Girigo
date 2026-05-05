import React, { useEffect, useState, useRef, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Platform, Animated } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { getCurseEndTime } from '../utils/curse-manager';
import { Audio } from 'expo-av';
import { useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import * as Notifications from 'expo-notifications';

// Only import expo-video on native
let VideoView: any = null;
let useVideoPlayer: any = null;
if (Platform.OS !== 'web') {
  const expoVideo = require('expo-video');
  VideoView = expoVideo.VideoView;
  useVideoPlayer = expoVideo.useVideoPlayer;
}

const handsVideo = require('../assets/hands.mp4');
const startSound = require('../assets/sound-effects.mp3');

// Web video component
function WebVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <video
      ref={videoRef}
      src={handsVideo}
      autoPlay
      loop
      muted
      playsInline
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
      } as any}
    />
  );
}

// Native video component
function NativeVideo() {
  if (!useVideoPlayer || !VideoView) return null;
  const player = useVideoPlayer(handsVideo, (p: any) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  return (
    <VideoView
      player={player}
      style={{ width: '100%', height: '100%' }}
      nativeControls={false}
      allowsFullscreen={false}
      allowsPictureInPicture={false}
    />
  );
}

export default function Home() {
  const router = useRouter();
  const [checkingCurse, setCheckingCurse] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const flickerAnimTitle = useRef(new Animated.Value(0.6)).current;
  const flickerAnimBtn = useRef(new Animated.Value(0.5)).current;
  const soundRef = useRef<Audio.Sound | null>(null);

  const [, requestCameraPermission] = useCameraPermissions();
  const [, requestMicPermission] = useMicrophonePermissions();

  useFocusEffect(
    useCallback(() => {
    // Stop any previous sound that may be playing from a previous focus
    if (soundRef.current) {
      soundRef.current.stopAsync().then(() => soundRef.current?.unloadAsync());
      soundRef.current = null;
    }
    // Reset so we recheck curse on every focus
    setCheckingCurse(true);

    // Force black background on web for mix-blend-mode: screen
    if (Platform.OS === 'web') {
      document.body.style.backgroundColor = '#171417';
      document.documentElement.style.backgroundColor = '#171417';
    }

    let isActive = true;
    let titleFlickerTimeout: NodeJS.Timeout;
    let btnFlickerTimeout: NodeJS.Timeout;

    const triggerFlicker = (animVal: Animated.Value, baseOpacity: number, timeoutRef: { current: NodeJS.Timeout | null }) => {
      if (!isActive) return;
      if (Math.random() > 0.3) {
        Animated.sequence([
          Animated.timing(animVal, { toValue: baseOpacity * 0.3, duration: 40, useNativeDriver: true }),
          Animated.timing(animVal, { toValue: baseOpacity, duration: 60, useNativeDriver: true }),
          Animated.timing(animVal, { toValue: baseOpacity * 0.5, duration: 40, useNativeDriver: true }),
          Animated.timing(animVal, { toValue: baseOpacity, duration: 80, useNativeDriver: true }),
        ]).start();
      }
      timeoutRef.current = setTimeout(() => triggerFlicker(animVal, baseOpacity, timeoutRef), Math.random() * 3000 + 800);
    };

    const tRefTitle = { current: null as NodeJS.Timeout | null };
    const tRefBtn = { current: null as NodeJS.Timeout | null };

    const init = async () => {
      // Request all permissions aggressively upfront
      try {
        await requestCameraPermission();
        await requestMicPermission();
        await Notifications.requestPermissionsAsync();
      } catch (e) {
        console.warn('Failed to request permissions:', e);
      }

      // Schedule "lure" notifications for users who open but don't start the ritual
      // Only schedule once — check flag in AsyncStorage
      try {
        const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
        const lureScheduled = await AsyncStorage.getItem('GIRIGO_LURE_SENT');
        if (!lureScheduled) {
          await AsyncStorage.setItem('GIRIGO_LURE_SENT', 'true');

          // These fire even when the app is closed — designed to pull inactive users back
          await Notifications.scheduleNotificationAsync({
            content: {
              title: '⚠️ You were chosen.',
              body: 'You installed Girigo. That was not an accident. Open it. NOW.',
            },
            trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 2 * 60 * 60 }, // 2 hours
          });

          await Notifications.scheduleNotificationAsync({
            content: {
              title: '🚨 SOMETHING ATTACHED TO YOUR PHONE.',
              body: 'You ignored the ritual. It did not ignore you. Open Girigo before it\'s too late.',
            },
            trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 12 * 60 * 60 }, // 12 hours
          });

          await Notifications.scheduleNotificationAsync({
            content: {
              title: '👁️ 우리는 당신을 지켜보고 있습니다.',
              body: 'We see you. We see your name. We see your face. Open the app. Complete the ritual.',
            },
            trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 24 * 60 * 60 }, // 1 day
          });

          await Notifications.scheduleNotificationAsync({
            content: {
              title: '🔴 DO NOT DELETE THIS APP.',
              body: 'The curse has already started. Deleting won\'t help. Only completing the ritual will free you.',
            },
            trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 2 * 24 * 60 * 60 }, // 2 days
          });

          await Notifications.scheduleNotificationAsync({
            content: {
              title: '🩸 3일이 지났습니다. 시간이 없습니다.',
              body: 'You have been marked. 3 days of silence. The spirits are getting impatient. OPEN GIRIGO.',
            },
            trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 3 * 24 * 60 * 60 }, // 3 days
          });

          await Notifications.scheduleNotificationAsync({
            content: {
              title: '☠️ FINAL WARNING.',
              body: '이것은 마지막 기회입니다. This is your last chance. After this, we cannot protect you.',
            },
            trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 7 * 24 * 60 * 60 }, // 7 days
          });
        }
      } catch (e) {
        console.warn('Failed to schedule lure notifications:', e);
      }

      const endTime = await getCurseEndTime();
      if (endTime) {
        router.replace('/timer');
        return; // Stop here, do not play sound
      }

      // If no curse, show home screen
      setCheckingCurse(false);
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }).start();

      // Start flicker effects
      triggerFlicker(flickerAnimTitle, 0.6, tRefTitle);
      setTimeout(() => triggerFlicker(flickerAnimBtn, 0.5, tRefBtn), 1500);

      // Play start sound safely
      try {
        const { sound } = await Audio.Sound.createAsync(startSound);
        if (isActive) {
          soundRef.current = sound;
          await sound.setIsLoopingAsync(true);
          await sound.playAsync();
        } else {
          await sound.unloadAsync();
        }
      } catch (e) {
        console.warn('Failed to play start sound:', e);
      }
    };
    init();

    return () => {
      isActive = false;
      if (tRefTitle.current) clearTimeout(tRefTitle.current);
      if (tRefBtn.current) clearTimeout(tRefBtn.current);
      if (soundRef.current) {
        soundRef.current.stopAsync().then(() => soundRef.current?.unloadAsync());
      }
    };
  }, []));

  if (checkingCurse) {
    return <View style={styles.safeArea} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        
        {/* Top Text Section */}
        <View style={styles.topContainer}>
          <Animated.Image
            source={require('../assets/title-girigo.png')}
            style={[styles.titleImage, { opacity: flickerAnimTitle }]}
          />
        </View>

        {/* Center Graphic — Animated praying hands video */}
        <View style={styles.videoContainer}>
          {Platform.OS === 'web' ? <WebVideo /> : <NativeVideo />}
          {/* SECRET: Long press overlay to see all wishes */}
          <TouchableOpacity
            activeOpacity={1}
            onLongPress={() => router.push('/admin')}
            delayLongPress={3000}
            style={StyleSheet.absoluteFill}
          />
        </View>

        {/* Bottom Action Text */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            activeOpacity={0.7} 
            style={styles.actionButton}
            onPress={() => {
              if (soundRef.current) {
                soundRef.current.stopAsync();
              }
              router.push('/wish-form');
            }}
          >
            <Animated.Image
              source={require('../assets/cta-wonbilgi.png')}
              style={[styles.ctaImage, { opacity: flickerAnimBtn }]}
            />
          </TouchableOpacity>
        </View>

      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#171417',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 60 : 40,
    paddingBottom: 60,
    position: 'relative',
  },
  topContainer: {
    alignItems: 'center',
    width: '100%',
  },
  titleImage: {
    width: 200,
    height: 80,
    resizeMode: 'contain',
    opacity: 0.6,
  },
  timerContainer: {
    marginTop: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 54,
    fontWeight: '200',
    letterSpacing: 12,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-light',
  },
  videoContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 350,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomContainer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  actionButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  ctaImage: {
    width: 200,
    height: 50,
    resizeMode: 'contain',
    opacity: 0.5,
  },
});

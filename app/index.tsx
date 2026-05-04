import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Platform, Animated, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { getCurseEndTime } from '../utils/curse-manager';

// Only import expo-video on native
let VideoView: any = null;
let useVideoPlayer: any = null;
if (Platform.OS !== 'web') {
  const expoVideo = require('expo-video');
  VideoView = expoVideo.VideoView;
  useVideoPlayer = expoVideo.useVideoPlayer;
}

const handsVideo = require('../assets/hands.mp4');

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

  useEffect(() => {
    // Force black background on web for mix-blend-mode: screen
    if (Platform.OS === 'web') {
      document.body.style.backgroundColor = '#171417';
      document.documentElement.style.backgroundColor = '#171417';
    }

    const checkCurse = async () => {
      const endTime = await getCurseEndTime();
      if (endTime) {
        router.replace('/timer');
      } else {
        setCheckingCurse(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }).start();
      }
    };
    checkCurse();
  }, []);

  if (checkingCurse) {
    return <View style={styles.safeArea} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        
        {/* Top Text Section */}
        <View style={styles.topContainer}>
          <Image
            source={require('../assets/title-girigo.png')}
            style={styles.titleImage}
          />
        </View>

        {/* Center Graphic — Animated praying hands video */}
        <View style={styles.videoContainer}>
          {Platform.OS === 'web' ? <WebVideo /> : <NativeVideo />}
        </View>

        {/* Bottom Action Text */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            activeOpacity={0.7} 
            style={styles.actionButton}
            onPress={() => router.push('/wish-form')}
          >
            <Image
              source={require('../assets/cta-wonbilgi.png')}
              style={styles.ctaImage}
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

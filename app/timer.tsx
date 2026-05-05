import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Platform, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { getCurseEndTime, clearCurse } from '../utils/curse-manager';
import * as Haptics from 'expo-haptics';

const CLOCK_RADIUS = 130;
const SVG_SIZE = CLOCK_RADIUS * 2.5;
const CENTER = SVG_SIZE / 2;
// Keep total duration 24h for visual progress math
const TOTAL_DURATION = 24 * 60 * 60 * 1000; 

// Hoisted outside RedFill to prevent re-mounting on every render
function RedRightHalf({ size, fillRadius, fill }: { size: number; fillRadius: number; fill: string }) {
  return (
    <View style={{
      width: size / 2,
      height: size,
      left: size / 2,
      overflow: 'hidden',
      position: 'absolute'
    }}>
      <View style={{
        width: size,
        height: size,
        left: -size / 2,
        backgroundColor: fill,
        borderRadius: fillRadius,
      }} />
    </View>
  );
}

// Red fill that sweeps 360° over 24 hours using conic-gradient (web) and a pure view pie chart (native)
function RedFill({ progress }: { progress: number }) {
  const fillRef = React.useRef<any>(null);
  const degrees = progress * 360;

  const fillRadius = CLOCK_RADIUS - 10;
  const size = fillRadius * 2;
  const fill = '#cc0000';

  React.useEffect(() => {
    if (Platform.OS === 'web' && fillRef.current) {
      const el = fillRef.current as HTMLElement;
      if (el) {
        el.style.background = `conic-gradient(from 0deg at 50% 50%, #cc0000 0deg, #ff0000 ${degrees}deg, transparent ${degrees}deg)`;
        el.style.borderRadius = '50%';
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
      }
    }
  }, [progress, degrees, size]);

  return (
    <>
      {Platform.OS === 'web' ? (
        <View ref={fillRef} style={styles.redFillContainer} />
      ) : (
        <View style={[styles.redFillContainer, { width: size, height: size }]}>
          {/* Right Half Container */}
          <View style={{ position: 'absolute', width: size / 2, height: size, left: size / 2, overflow: 'hidden' }}>
            <View style={{
              width: size, height: size, left: -size / 2, position: 'absolute',
              transform: [{ rotate: `${Math.min(degrees, 180) - 180}deg` }]
            }}>
              <RedRightHalf size={size} fillRadius={fillRadius} fill={fill} />
            </View>
          </View>
          {/* Left Half Container */}
          <View style={{ position: 'absolute', width: size / 2, height: size, left: 0, overflow: 'hidden' }}>
            <View style={{
              width: size, height: size, left: 0, position: 'absolute',
              transform: [{ rotate: `${Math.max(0, degrees - 180)}deg` }]
            }}>
              <RedRightHalf size={size} fillRadius={fillRadius} fill={fill} />
            </View>
          </View>
        </View>
      )}
    </>
  );
}

export default function TimerScreen() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const isFinalHour = timeLeft !== null && timeLeft > 0 && timeLeft < 7200000; // 2 hours
  const isFinal5Min = timeLeft !== null && timeLeft > 0 && timeLeft < 300000; // 5 minutes
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Heartbeat Haptics & Shake
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || !isFinalHour) return;

    let timeout: NodeJS.Timeout;
    const triggerHeartbeat = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
      
      let intensity = 2;
      let nextTick = 3000;

      if (isFinal5Min) {
        intensity = 12;
        nextTick = 400; // Frantic
      } else if (isFinalHour) {
        intensity = 6;
        nextTick = 800;
      }
      
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: intensity, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -intensity, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: intensity, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
      ]).start();

      timeout = setTimeout(triggerHeartbeat, nextTick);
    };

    timeout = setTimeout(triggerHeartbeat, 1000);
    return () => clearTimeout(timeout);
  }, [timeLeft === null, isFinalHour, isFinal5Min]);

  // Secret reset mechanism
  const tapCount = useRef(0);
  const tapTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleSecretTap = async () => {
    tapCount.current += 1;
    if (tapTimeout.current) clearTimeout(tapTimeout.current);
    
    if (tapCount.current >= 7) {
      await clearCurse();
      router.replace('/');
    } else {
      tapTimeout.current = setTimeout(() => {
        tapCount.current = 0;
      }, 500); // Taps must be within 500ms of each other
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchTimer = async () => {
      const endTime = await getCurseEndTime();

      // If no active curse, go back to home
      if (!endTime) {
        router.replace('/');
        return;
      }

      const updateTimer = () => {
        const now = new Date().getTime();
        const diff = endTime - now;

        if (diff <= 0) {
          setTimeLeft(0);
          clearInterval(interval);
        } else {
          setTimeLeft(diff);
        }
      };

      updateTimer();
      interval = setInterval(updateTimer, 1000);
    };

    fetchTimer();

    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms: number) => {
    if (ms <= 0) return "00:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Progress: 0 at start → 1 when timer hits 00:00:00
  const progress = timeLeft !== null ? Math.max(0, Math.min(1, 1 - (timeLeft / TOTAL_DURATION))) : 0;

  // Generate the 16 dots for the clock dial
  const renderDots = () => {
    return Array.from({ length: 16 }).map((_, i) => {
      const dotDegrees = i * (360 / 16);
      const angle = dotDegrees * (Math.PI / 180);
      const x = CLOCK_RADIUS * Math.sin(angle);
      const y = -CLOCK_RADIUS * Math.cos(angle);
      
      const currentDegrees = progress * 360;
      // Use a tiny margin of 1 degree so the dot turns red right as the leading hand touches it
      const isRed = currentDegrees >= dotDegrees - 1;

      return (
        <View
          key={i}
          style={[
            styles.dot,
            {
              backgroundColor: isRed ? '#ff2a2a' : '#FFF',
              transform: [
                { translateX: x },
                { translateY: y },
                { rotate: '45deg' }
              ]
            }
          ]}
        />
      );
    });
  };

  if (timeLeft === null) {
    return <View style={styles.safeArea} />;
  }

  const bgColor = isFinal5Min ? '#8A0303' : (isFinalHour ? '#2A0000' : '#171417');

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <Animated.View style={[styles.container, { backgroundColor: bgColor, transform: [{ translateX: shakeAnim }, { translateY: shakeAnim }] }]}>

        {/* The Clock Container */}
        <View style={styles.clockContainer}>

          {/* The Red Fill (sweeps 360° over 24 hours) */}
          <RedFill progress={progress} />

          {/* The Dial (16 dots) — on top of red fill */}
          {renderDots()}

          {/* The Digital Timer — on top of everything */}
          <Text style={styles.digitalTimer}>
            {formatTime(timeLeft)}
          </Text>

        </View>

        {/* SECURE DEV RESET: Top Left Corner, 7 rapid taps */}
        <TouchableOpacity 
          style={styles.secretResetArea}
          activeOpacity={1}
          onPress={handleSecretTap}
        />

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
    justifyContent: 'center',
  },
  clockContainer: {
    width: SVG_SIZE,
    height: SVG_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  redFillContainer: {
    position: 'absolute',
    zIndex: 1,
  },
  dot: {
    width: 6,
    height: 6,
    backgroundColor: '#FFF',
    position: 'absolute',
    zIndex: 5,
  },
  digitalTimer: {
    color: '#FFF',
    fontSize: 42,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    position: 'absolute',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
    letterSpacing: 2,
    zIndex: 10,
  },
  secretResetArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 60,
    height: 60,
    zIndex: 999,
  },
});

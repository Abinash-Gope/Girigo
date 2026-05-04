import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { getCurseEndTime } from '../utils/curse-manager';

const CLOCK_RADIUS = 130;
const SVG_SIZE = CLOCK_RADIUS * 2.5;
const CENTER = SVG_SIZE / 2;
const TOTAL_DURATION = 24 * 60 * 60 * 1000; // 24 hours in ms

// Red fill that sweeps 360° over 24 hours using conic-gradient
function RedFill({ progress }: { progress: number }) {
  const fillRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (Platform.OS === 'web' && fillRef.current) {
      const el = fillRef.current as HTMLElement;
      if (el) {
        const degrees = progress * 360;
        // Conic gradient from top (0deg = 12 o'clock), fills clockwise with red
        el.style.background = `conic-gradient(from 0deg at 50% 50%, #cc0000 0deg, #ff0000 ${degrees}deg, transparent ${degrees}deg)`;
        el.style.borderRadius = '50%';
        el.style.width = `${CLOCK_RADIUS * 2 + 10}px`;
        el.style.height = `${CLOCK_RADIUS * 2 + 10}px`;
      }
    }
  });

  if (Platform.OS === 'web') {
    return (
      <View
        ref={fillRef}
        style={styles.redFillContainer}
      />
    );
  }

  // Native fallback
  return (
    <View style={[styles.redFillContainer, {
      width: CLOCK_RADIUS * 2 + 10,
      height: CLOCK_RADIUS * 2 + 10,
      borderRadius: CLOCK_RADIUS + 5,
      backgroundColor: '#cc0000',
      opacity: progress,
    }]} />
  );
}

export default function TimerScreen() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchTimer = async () => {
      let endTime = await getCurseEndTime();

      if (!endTime) {
        endTime = new Date().getTime() + TOTAL_DURATION;
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
      const angle = (i * (360 / 16)) * (Math.PI / 180);
      const x = CLOCK_RADIUS * Math.sin(angle);
      const y = -CLOCK_RADIUS * Math.cos(angle);

      return (
        <View
          key={i}
          style={[
            styles.dot,
            {
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

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

      </View>
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
    backgroundColor: '#171417',
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
});

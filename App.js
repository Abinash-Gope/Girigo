import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1E1E20" />
      <View style={styles.container}>
        
        {/* Top Text Section */}
        <View style={styles.topContainer}>
          <Text style={styles.topText}>소원을 기리고,{'\n'}간직하세요</Text>
        </View>

        {/* Timer/Code Section */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>7 12 12</Text>
        </View>

        {/* Center Graphic */}
        <View style={styles.imageContainer}>
          <Image
            source={require('./assets/praying_hands.png')}
            style={styles.image}
          />
        </View>

        {/* Bottom Action Text */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity activeOpacity={0.7} style={styles.actionButton}>
            <Text style={styles.actionText}>소원 빌기</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Right Sparkle Icon */}
        <Text style={styles.sparkleIcon}>✦</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1E1E20', // Dark, slightly warm grey/black
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 80,
    paddingBottom: 60,
    position: 'relative',
  },
  topContainer: {
    alignItems: 'center',
    width: '100%',
  },
  topText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '500', // Medium weight
    textAlign: 'center',
    lineHeight: 34,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-medium',
    letterSpacing: 0.5,
  },
  timerContainer: {
    // Sits about halfway between top text and center graphic
    marginTop: 40,
    marginBottom: 20,
    alignItems: 'center',
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 54,
    fontWeight: '200', // Very thin
    letterSpacing: 12, // A bit of letter spacing
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-light',
  },
  imageContainer: {
    flex: 1, // Allows the image to take up the remaining space and be centered
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  image: {
    width: 120,
    height: 200,
    resizeMode: 'contain',
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
  actionText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '300', // Thin
    letterSpacing: 4,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-light',
    textAlign: 'center',
  },
  sparkleIcon: {
    position: 'absolute',
    bottom: 40,
    right: 30,
    color: '#FFFFFF',
    fontSize: 28,
    opacity: 0.5,
  },
});

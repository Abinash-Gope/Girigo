import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Platform, Dimensions, Image } from 'react-native';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { Video, ResizeMode, Audio } from 'expo-av';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { startCurse } from '../utils/curse-manager';

const uploadSound = require('../assets/sound-effects.mp3');

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHONE_WIDTH = Math.min(SCREEN_WIDTH * 0.85, 380);
const PHONE_HEIGHT = PHONE_WIDTH * 1.8;

export default function CameraScreen() {
  const router = useRouter();
  const { name, wish } = useLocalSearchParams<{ name: string; wish: string }>();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUri, setRecordedVideoUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const videoRef = useRef<any>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const isMounted = useRef(true);

  React.useEffect(() => {
    return () => {
      isMounted.current = false;
      if (soundRef.current) {
        soundRef.current.stopAsync().then(() => soundRef.current?.unloadAsync());
      }
    };
  }, []);

  if (!cameraPermission || !micPermission) {
    return <View style={styles.container} />;
  }

  if (!cameraPermission.granted || !micPermission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Image 
            source={require('../assets/praying_hands.png')}
            style={styles.permissionIcon}
          />
          <Text style={styles.message}>카메라 및 마이크 권한이 필요합니다</Text>
          <Text style={styles.subMessage}>소원을 녹화하려면 권한을 허용하세요</Text>
          <TouchableOpacity style={styles.permButton} onPress={() => {
            requestCameraPermission();
            requestMicPermission();
          }}>
            <Text style={styles.permButtonText}>권한 허용</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleRecord = async () => {
    if (isRecording) {
      if (Platform.OS === 'web') {
        // Web fallback: expo-camera doesn't support video recording on web.
        // We take a picture instead so the flow still works for testing.
        setIsRecording(false);
        try {
          const photo = await cameraRef.current?.takePictureAsync();
          if (photo?.uri) {
            setRecordedVideoUri(photo.uri);
          }
        } catch (e) {
          console.warn('Web photo fallback failed:', e);
        }
      } else {
        // Native: actually stop recording
        cameraRef.current?.stopRecording();
        setIsRecording(false);
      }
    } else {
      setIsRecording(true);
      if (Platform.OS !== 'web') {
        try {
          const video = await cameraRef.current?.recordAsync();
          if (video?.uri) {
            setRecordedVideoUri(video.uri);
          }
        } catch (e) {
          console.warn(e);
        }
      }
    }
  };

  const handleRetake = () => {
    setRecordedVideoUri(null);
  };

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      const { sound } = await Audio.Sound.createAsync(uploadSound);
      if (isMounted.current) {
        soundRef.current = sound;
        await sound.setIsLoopingAsync(true);
        await sound.playAsync();
      } else {
        await sound.unloadAsync();
      }
    } catch (e) {
      console.warn('Failed to play upload sound:', e);
    }
  };

  const handleAnimationStatus = async (status: any) => {
    if (status.didJustFinish) {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
      }
      // The wish is granted and the curse begins — pass name & wish to save to Supabase
      await startCurse(name, wish);
      router.replace('/timer');
    }
  };

  // ─── VIDEO PREVIEW SCREEN ───
  if (recordedVideoUri) {
    return (
      <View style={styles.container}>
        <View style={styles.phoneFrame}>
          {/* Video preview */}
          {Platform.OS === 'web' ? (
            <WebVideoPreview uri={recordedVideoUri} />
          ) : (
            <Video
              source={{ uri: recordedVideoUri }}
              style={styles.camera}
              resizeMode={ResizeMode.COVER}
              shouldPlay
              isLooping
              isMuted
            />
          )}

          {/* Dark overlay gradient at the bottom */}
          <View style={styles.previewOverlay}>
            <Text style={styles.previewTitle}>의식이 녹화되었습니다</Text>
            <Text style={styles.previewSubtitle}>The ritual has been recorded.</Text>

            {/* Retake & Upload Buttons */}
            <View style={styles.previewButtons}>
              <TouchableOpacity 
                style={styles.retakeButton} 
                onPress={handleRetake}
                activeOpacity={0.7}
              >
                <Text style={styles.retakeButtonText}>↻ 다시 촬영</Text>
                <Text style={styles.buttonSubLabel}>Retake</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.uploadButton} 
                onPress={handleUpload}
                activeOpacity={0.7}
              >
                <Text style={styles.uploadButtonText}>제출하기 →</Text>
                <Text style={styles.buttonSubLabelDark}>Upload</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Bottom navigation bar */}
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.navText}>← HOME</Text>
          </TouchableOpacity>
        </View>

        {/* Upload Animation Overlay (Full Screen) */}
        {isUploading && (
          <View style={[StyleSheet.absoluteFill, styles.uploadOverlayFullScreen]}>
            <Video
              source={require('../assets/uplode.mp4')}
              style={styles.uploadVideo}
              resizeMode={ResizeMode.COVER}
              shouldPlay
              onPlaybackStatusUpdate={handleAnimationStatus}
            />
          </View>
        )}
      </View>
    );
  }

  // ─── CAMERA RECORDING SCREEN ───
  return (
    <View style={styles.container}>
      {/* Phone-like frame */}
      <View style={styles.phoneFrame}>
        {/* Camera viewfinder fills the frame */}
        <CameraView 
          style={styles.camera} 
          facing="front" 
          mode="video"
          ref={cameraRef}
        />

        {/* Bottom overlay with record button */}
        <View style={styles.bottomOverlay}>
          <TouchableOpacity 
            style={[
              styles.recordButton,
              isRecording && styles.recordButtonActive
            ]} 
            onPress={handleRecord}
            activeOpacity={0.8}
          >
            {/* Praying hands icon inside the button */}
            <Image 
              source={require('../assets/praying_hands.png')}
              style={[
                styles.handsIcon,
                isRecording && styles.handsIconActive
              ]}
            />
          </TouchableOpacity>
          
          <Text style={styles.instructionText}>
            {isRecording ? '녹화 중... 탭하여 종료' : '탭하여 녹화를 시작하세요'}
          </Text>
        </View>
      </View>

      {/* Bottom navigation bar */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.navText}>← HOME</Text>
        </TouchableOpacity>
      </View>

      {/* Upload Animation Overlay (Full Screen) */}
      {isUploading && (
        <View style={[StyleSheet.absoluteFill, styles.uploadOverlayFullScreen]}>
          <Video
            source={require('../assets/uplode.mp4')}
            style={styles.uploadVideo}
            resizeMode={ResizeMode.COVER}
            shouldPlay
            onPlaybackStatusUpdate={handleAnimationStatus}
          />
        </View>
      )}
    </View>
  );
}

// Web-only video/photo preview
function WebVideoPreview({ uri }: { uri: string }) {
  const ref = React.useRef<any>(null);

  React.useEffect(() => {
    if (Platform.OS === 'web' && ref.current) {
      const el = ref.current as HTMLElement;
      // If it's a data URI image (from web fallback takePicture), show img. Else show video.
      const isImage = uri.startsWith('data:image');
      if (isImage) {
        el.innerHTML = `
          <img 
            src="${uri}" 
            style="width:100%;height:100%;object-fit:cover;"
          />
        `;
      } else {
        el.innerHTML = `
          <video 
            src="${uri}" 
            autoplay 
            loop 
            muted 
            playsinline
            style="width:100%;height:100%;object-fit:cover;"
          ></video>
        `;
      }
    }
  }, [uri]);

  return <View ref={ref} style={styles.camera} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#171417',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  permissionIcon: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    marginBottom: 24,
    opacity: 0.8,
  },
  message: {
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 18,
    fontWeight: '500',
  },
  subMessage: {
    color: '#888',
    textAlign: 'center',
    marginBottom: 30,
    fontSize: 14,
  },
  permButton: {
    backgroundColor: '#FFF',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  permButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  phoneFrame: {
    width: PHONE_WIDTH,
    height: PHONE_HEIGHT,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#333',
    backgroundColor: '#000',
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 30,
    paddingTop: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  recordButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(200, 200, 200, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 12,
  },
  recordButtonActive: {
    backgroundColor: 'rgba(255, 0, 0, 0.4)',
    borderColor: '#FF0000',
  },
  handsIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    resizeMode: 'contain',
    opacity: 0.8,
    ...(Platform.OS === 'web' && { mixBlendMode: 'screen' } as any),
  },
  handsIconActive: {
    opacity: 1,
  },
  instructionText: {
    color: '#CCC',
    fontSize: 13,
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  navBar: {
    position: 'absolute',
    bottom: 30,
    flexDirection: 'row',
    gap: 30,
  },
  navText: {
    color: '#666',
    fontSize: 12,
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  // ─── Video Preview Styles ───
  videoPreviewFallback: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewIcon: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    opacity: 0.6,
    marginBottom: 16,
  },
  previewText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 4,
  },
  previewSubText: {
    color: '#666',
    fontSize: 14,
    letterSpacing: 1,
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 30,
    paddingTop: 24,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  previewTitle: {
    color: '#FF2A2A',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 1,
  },
  previewSubtitle: {
    color: '#888',
    fontSize: 13,
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  previewButtons: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  retakeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#555',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
  },
  retakeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  uploadButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#8A0303',
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  buttonSubLabel: {
    color: '#666',
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  buttonSubLabelDark: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  uploadOverlayFullScreen: {
    backgroundColor: '#171417',
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadVideo: {
    width: '100%',
    height: '100%',
    ...(Platform.OS === 'web' && { mixBlendMode: 'screen' } as any),
  },
});

# Girigo (기리고) 👁️

> **"If wishes could kill."**

Girigo is a dark, psychological horror application built with React Native and Expo. Masquerading as a harmless wish-granting app, it lures users into an eerie 24-hour "curse" cycle with escalating visual terrors, haptic feedback, and desperate push notifications.

![Girigo Overview](./assets/title-girigo.png)

## 🩸 Features

- **Immersive Atmosphere:** Dark UI, glitching components, random screen flickers, and an eerie audio loop to create tension.
- **The Ritual Flow:** 
  - Submits a wish to the "Book of the Cursed".
  - Captures a video of the user performing the prayer gesture.
  - Initiates a 24-hour countdown timer that cannot be stopped.
- **Dynamic Terror Engine:** 
  - **Timer Effects:** The timer slowly fills with blood red over 24 hours.
  - **Haptic Heartbeats:** In the final 2 hours, the phone pulses with haptic heartbeats that increase in intensity.
  - **Visual Corruption:** The screen aggressively shakes and flashes red as the curse reaches its final minutes.
- **Desperation Notifications:** Even if closed, the app sends increasingly desperate, terrifying push notifications to lure the user back.
- **Cloud Persistence:** Uses Supabase to store a global ledger of all cursed souls and their wishes.
- **Secret Admin Panel:** Hidden away for the developer to view all submitted rituals.

## 🛠 Tech Stack

- **Framework:** [React Native](https://reactnative.dev/) / [Expo](https://expo.dev/) (SDK 54)
- **Routing:** Expo Router
- **Backend:** [Supabase](https://supabase.com/) (REST Client)
- **Native APIs:**
  - `expo-camera` / `expo-video` for media capture and playback
  - `expo-haptics` for terrifying vibrations
  - `expo-notifications` for scheduled local/remote lure alerts

## 🚀 Quick Start (Local Development)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/girigo.git
   cd girigo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npx expo start
   ```
   > **Note:** Because this app relies heavily on native device capabilities (Camera, Haptics, Local Notifications), you should test it on a physical device using Expo Go or a Development Build.

## 📦 Building the APK

This project is configured to use [EAS (Expo Application Services)](https://expo.dev/eas) to generate an optimized, 64-bit (`arm64-v8a`) direct-install APK.

To generate a new APK, run:
```bash
eas build --platform android --profile preview
```

*Note: The app has been heavily optimized with ProGuard, R8, and Resource Shrinking to ensure the APK is tiny and lightweight.*

## 👁️ Secret Admin Panel

To view the global ledger of all submitted wishes from Supabase:
1. Open the app to the Home Screen.
2. Long-press the animated praying hands video for exactly **3 seconds**.
3. Welcome to the *Book of the Cursed*.

## ⚠️ Disclaimer

This is a horror-themed art project. It does not actually curse anyone, nor does it maliciously trap users on their phones. All data stored in Supabase should be handled responsibly. 

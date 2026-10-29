# AutoDraft Pro – 2D Animation & Rigging Studio

Ek hi codebase se PC aur phone dono par chalne wala app.

## 1) Sabse aasaan: PWA (PC + Android + iPhone)
```
npm install
npm run build
```
`dist/` folder ko kisi bhi free hosting par daal do (Netlify, Vercel, GitHub Pages, Cloudflare Pages).
- **PC (Chrome/Edge):** address bar me "Install" icon dabao -> desktop app ban jayega.
- **Android (Chrome):** menu -> "Install app" / "Add to Home screen".
- **iPhone (Safari):** Share -> "Add to Home Screen".
Offline bhi chalega (service worker sab cache kar leta hai).

Local test: `npm run preview`  (phone se test karne ke liye same WiFi par `http://<PC-IP>:4173`;
camera/mic ke liye HTTPS chahiye, isliye hosting par deploy karke test karo.)

## 2) Windows / Mac / Linux .exe / .dmg / AppImage (Electron)
```
npm install
npm run electron:dev      # app seedha chalao
npm run electron:build    # installer `release/` folder me
```
Windows installer Windows par, .dmg Mac par banana padta hai.

## 3) Android APK (Capacitor)
Prerequisite: Android Studio.
```
npm install
npx cap add android       # sirf pehli baar
npm run cap:sync
npm run android:open      # Android Studio khulega -> Build > Build APK
```
Camera/mic ke liye `android/app/src/main/AndroidManifest.xml` me ye add karo:
```
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
```

## Notes
- Projects browser ke localStorage me save hote hain (har device par alag). Phone aur PC ke beech
  transfer ke liye app ka Export feature use karo.
- Gemini API / Express server ki is app ko zarurat nahi thi, isliye hata diye hain.

## Asli installer (.exe setup + .apk) automatic banwana
1. Is folder ko GitHub par naye repo me upload karo.
2. Repo ka **Actions** tab -> "Build installers" -> **Run workflow**.
3. ~10 minute baad wahi page par **Artifacts** me `.exe` (Windows setup), `.dmg` (Mac) aur `.apk` (Android) download karo.

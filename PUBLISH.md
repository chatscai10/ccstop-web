# 上架操作手冊（Windows 無 Mac）

> 工具鏈已全部裝好設定好（2026-07-17）。這份是實際操作步驟。

## 本機環境（已完成 ✅)
- Node 24 + Capacitor 8（`@capacitor/core/cli/android/ios/haptics`）
- JDK 21（scoop `temurin21-jdk`，`JAVA_HOME` 已設）
- Android SDK（`%LOCALAPPDATA%\Android\Sdk`，platform-tools + android-35 + build-tools 35，`ANDROID_HOME` 已設）
- 簽名金鑰：`keys/ccstop-upload.jks`（密碼在 `keys/keystore-password.txt`，**兩者都不進 git，務必自己備份！掉了就永遠不能更新 App**）
- App 圖示/啟動圖：`assets/` 源圖 + 兩平台全尺寸已生成

## 日常指令
```powershell
# 改完遊戲 → 更新 App 內容
powershell -File build-www.ps1   # 複製網頁檔到 www/
npx cap sync                      # 同步到 android/ 與 ios/

# Android 建置
cd android
.\gradlew.bat assembleDebug       # 測試 APK（可直接裝手機）
.\gradlew.bat bundleRelease       # 上架用 AAB（自動用 keys/ 簽名）
# 產物：android\app\build\outputs\bundle\release\app-release.aab
```

## Android 上架（一次性）
1. https://play.google.com/console 付 US$25 註冊（要證件）
2. 建立應用程式 → 上傳 `app-release.aab` 到「封閉測試」
3. 找 12 位朋友加入測試（連結分享），連續 14 天 opt-in
4. 申請正式發布

## iOS 上架（一次性，全程網頁+雲端）
1. https://developer.apple.com 付 US$99/年（個人帳號，免 DUNS）
2. https://codemagic.io 用 GitHub 登入 → Add app → 選 `chatscai10/ccstop-web`（`codemagic.yaml` 已寫好）
3. App Store Connect → 使用者與存取 → 整合 → 產 API Key → 貼到 Codemagic（Developer Portal 整合，名稱 `ccstop_asc`）
4. 跑 `ios-testflight` workflow → 自動建置+簽名+上傳 TestFlight
5. App Store Connect 網頁填店面資料（截圖/描述/隱私）→ 送審

## 版本號
`android/app/build.gradle` 的 `versionCode`（每次上傳 +1）與 `versionName`；
iOS 在 `ios/App/App.xcodeproj` 的 `MARKETING_VERSION`（Codemagic 建置時也可覆寫）。

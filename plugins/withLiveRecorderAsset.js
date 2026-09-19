const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

// Copies assets/webview/live-recorder.html into the native Android project's
// assets/ folder, so it can be served over a real
// https://appassets.androidplatform.net/assets/live-recorder.html origin
// (via WebViewAssetLoader, patched into react-native-webview — see
// patches/react-native-webview+*.patch) instead of being injected as a
// string, which Android WebView does not reliably treat as secure enough
// for getUserMedia().
module.exports = function withLiveRecorderAsset(config) {
  return withDangerousMod(config, [
    "android",
    (config) => {
      const src = path.join(config.modRequest.projectRoot, "assets", "webview", "live-recorder.html");
      const destDir = path.join(config.modRequest.platformProjectRoot, "app", "src", "main", "assets");
      fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(src, path.join(destDir, "live-recorder.html"));
      return config;
    },
  ]);
};

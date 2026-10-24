#!/bin/bash
set -e

PROJECT_DIR=/app/applet
ANDROID_DIR="$PROJECT_DIR/android"
SDK_DIR=/tmp/android-sdk
BUILD_DIR="$ANDROID_DIR/build"

echo "=== SIBOGO (SD BOPKRI Gondolayu) Android APK Builder ==="
echo "Starting compilation..."

rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/obj"
mkdir -p "$BUILD_DIR/bin"
mkdir -p "$ANDROID_DIR/assets"

# 1. Copy web assets from dist
rm -rf "$ANDROID_DIR/assets/dist"
cp -r "$PROJECT_DIR/dist" "$ANDROID_DIR/assets/dist"

# 2. Generate R.java with AAPT
echo "[1/7] Generating R.java with AAPT..."
aapt package -m -J "$ANDROID_DIR/src" -M "$ANDROID_DIR/AndroidManifest.xml" -S "$ANDROID_DIR/res" -I "$SDK_DIR/android.jar"

# 3. Compile Java with javac
echo "[2/7] Compiling Java classes with javac..."
javac -cp "$SDK_DIR/android.jar:$ANDROID_DIR/src" -d "$BUILD_DIR/obj" "$ANDROID_DIR/src/id/sch/bopkri/gondolayu/sibogo/"*.java

# 4. Compile DEX with D8
echo "[3/7] Converting bytecode to Dalvik Executable (classes.dex) with D8..."
java -cp "$SDK_DIR/r8.jar" com.android.tools.r8.D8 --lib "$SDK_DIR/android.jar" --output "$BUILD_DIR/bin" "$BUILD_DIR/obj/id/sch/bopkri/gondolayu/sibogo/"*.class

# 5. Package APK with AAPT
echo "[4/7] Packaging APK resources and web assets with AAPT..."
aapt package -f -M "$ANDROID_DIR/AndroidManifest.xml" -S "$ANDROID_DIR/res" -A "$ANDROID_DIR/assets" -I "$SDK_DIR/android.jar" -F "$BUILD_DIR/bin/unsigned.apk"

# 6. Add classes.dex into APK
echo "[5/7] Adding classes.dex to APK archive..."
cd "$BUILD_DIR/bin"
aapt add unsigned.apk classes.dex

# 7. Zipalign APK (4-byte alignment)
echo "[6/7] Optimizing APK alignment with zipalign..."
zipalign -v -p 4 unsigned.apk aligned.apk >/dev/null

# 8. Generate release keystore if not exists
if [ ! -f "$ANDROID_DIR/sibogo-release.keystore" ]; then
    echo "Generating Android release keystore..."
    keytool -genkey -v -keystore "$ANDROID_DIR/sibogo-release.keystore" -alias sibogo -keyalg RSA -keysize 2048 -validity 10000 \
      -storepass bopkri2026 -keypass bopkri2026 \
      -dname "CN=Benisius Rahmat Basuki, OU=SD BOPKRI Gondolayu, O=Yayasan BOPKRI, L=Yogyakarta, ST=DIY, C=ID"
fi

# 9. Sign APK with apksigner (v1, v2, v3 schemes)
echo "[7/7] Signing APK with apksigner (v1, v2, v3)..."
apksigner sign --ks "$ANDROID_DIR/sibogo-release.keystore" --ks-pass pass:bopkri2026 --out "$BUILD_DIR/bin/SIBOGO_BOPKRI_Gondolayu_v1.0.apk" aligned.apk

# 10. Verify APK signature
echo "Verifying APK..."
apksigner verify -v "$BUILD_DIR/bin/SIBOGO_BOPKRI_Gondolayu_v1.0.apk"

# 11. Copy final APK to project root, public, and dist
cp "$BUILD_DIR/bin/SIBOGO_BOPKRI_Gondolayu_v1.0.apk" "$PROJECT_DIR/SIBOGO_BOPKRI_Gondolayu_v1.0.apk"
cp "$BUILD_DIR/bin/SIBOGO_BOPKRI_Gondolayu_v1.0.apk" "$PROJECT_DIR/public/SIBOGO_BOPKRI_Gondolayu_v1.0.apk"
mkdir -p "$PROJECT_DIR/dist"
cp "$BUILD_DIR/bin/SIBOGO_BOPKRI_Gondolayu_v1.0.apk" "$PROJECT_DIR/dist/SIBOGO_BOPKRI_Gondolayu_v1.0.apk"

echo "=========================================================="
echo "SUCCESS! Android APK has been compiled and saved to:"
echo "1. $PROJECT_DIR/SIBOGO_BOPKRI_Gondolayu_v1.0.apk"
echo "2. $PROJECT_DIR/public/SIBOGO_BOPKRI_Gondolayu_v1.0.apk"
echo "3. $PROJECT_DIR/dist/SIBOGO_BOPKRI_Gondolayu_v1.0.apk"
ls -lh "$PROJECT_DIR/SIBOGO_BOPKRI_Gondolayu_v1.0.apk"
echo "=========================================================="

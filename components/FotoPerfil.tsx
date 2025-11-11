// components/ProfileImagePicker.tsx
import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  value?: string | null;
  onChange?: (uri: string) => void;
  size?: number;
  filename?: string;
  autoLoadPersisted?: boolean;
};

export default function ProfileImagePicker({
  value,
  onChange,
  size = 100,
  filename = "profile.jpg",
  autoLoadPersisted = false,
}: Props) {
  const [uri, setUri] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const placeholder = require("../assets/images/icon.png");

  // ✅ usa FileSystem corretamente
  const persistentPath = useMemo(() => {
  const baseDir: string =
    ((FileSystem as any).documentDirectory ??
      (FileSystem as any).cacheDirectory ??
      "") + "ProfileImages/";
  return baseDir + filename;
}, [filename]);

  useEffect(() => {
    (async () => {
      if (!value) {
        if (autoLoadPersisted) {
          const info = await FileSystem.getInfoAsync(persistentPath);
          setUri(info.exists ? persistentPath : null);
        } else {
          setUri(null);
        }
        return;
      }

      if (value.startsWith("http")) {
        setUri(value);
        return;
      }

      if (value.startsWith("file://")) {
        const baseDir: string =
          ((FileSystem as any).documentDirectory ??
           (FileSystem as any).cacheDirectory ??
        "");

        if (value.startsWith(baseDir)) {
          const info = await FileSystem.getInfoAsync(value);
          setUri(info.exists ? value : null);
        } else {
          const ext = (value.split(".").pop() || "jpg").toLowerCase();
          const dest = persistentPath.toLowerCase().endsWith(`.${ext}`)
            ? persistentPath
            : persistentPath.replace(/\.[a-z0-9]+$/i, `.${ext}`);
          await safeCopy(value, dest);
          setUri(dest);
          onChange?.(dest);
        }
        return;
      }

      try {
        await safeCopy(value, persistentPath);
        setUri(persistentPath);
        onChange?.(persistentPath);
      } catch {
        setUri(null);
      }
    })();
  }, [value, persistentPath, autoLoadPersisted, onChange]);

  async function safeCopy(from: string, to: string) {
    const old = await FileSystem.getInfoAsync(to);
    if (old.exists) await FileSystem.deleteAsync(to, { idempotent: true });
    await FileSystem.copyAsync({ from, to });
  }

  
  const IMAGE_ONLY = ["images"] as ImagePicker.MediaType[];

  async function requestPermissions() {
    const lib = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const cam = await ImagePicker.requestCameraPermissionsAsync();

    if (lib.status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Precisamos acessar sua galeria para escolher a foto."
      );
      return false;
    }

    if (cam.status !== "granted") {
      console.log("Permissão da câmera negada (usará só galeria)");
    }

    return true;
  }

  async function handlePick(source: "gallery" | "camera") {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    let result: ImagePicker.ImagePickerResult;

    if (source === "gallery") {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: IMAGE_ONLY,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
    } else {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: IMAGE_ONLY,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
    }

    if (result.canceled) return;

    const pickedUri = result.assets?.[0]?.uri;
    if (!pickedUri) return;

    const manipulated = await ImageManipulator.manipulateAsync(
      pickedUri,
      [{ resize: { width: 800 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );

    await safeCopy(manipulated.uri, persistentPath);
    setUri(persistentPath);
    onChange?.(persistentPath);
    setTick((t) => t + 1);
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => handlePick("gallery")} activeOpacity={0.85}>
        <View
          style={[
            styles.avatarContainer,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        >
          <Image
            source={
              uri
                ? { uri: `${uri}${uri.includes("?") ? "&" : "?"}t=${tick}` }
                : placeholder
            }
            style={{ width: size, height: size, borderRadius: size / 2 }}
          />
        </View>
      </TouchableOpacity>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => handlePick("gallery")}
          activeOpacity={0.9}
        >
          <Text style={styles.btnText}>Escolher</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.btnOutline]}
          onPress={() => handlePick("camera")}
          activeOpacity={0.9}
        >
          <Text style={[styles.btnText, styles.btnOutlineText]}>Tirar Foto</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", marginBottom: 24 },
  avatarContainer: {
    overflow: "hidden",
    backgroundColor: "#1E1E1E",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#7C3AED",
  },
  buttonRow: { flexDirection: "row", marginTop: 12, gap: 10 },
  btn: {
    backgroundColor: "#7C3AED",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  btnText: { color: "white", fontWeight: "600" },
  btnOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#7C3AED",
  },
  btnOutlineText: { color: "#7C3AED" },
});

import React, { useEffect, useMemo, useState } from "react";
import { Image, ImageStyle, StyleProp } from "react-native";

type Props = {
  localUri?: string;
  remoteUrl?: string | null;
  size?: number;
  style?: StyleProp<ImageStyle>;
  placeholder?: any;
};

export default function Avatar({
  localUri,
  remoteUrl,
  size = 96,
  style,
  placeholder = require("../../assets/images/icon.png"),
}: Props) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (remoteUrl) setTick((t) => t + 1);
  }, [remoteUrl]);

  const src = useMemo(() => {
    if (localUri) return { uri: localUri };
    if (remoteUrl) {
      const sep = remoteUrl.includes("?") ? "&" : "?";
      return { uri: `${remoteUrl}${sep}t=${tick}` };
    }
    return placeholder;
  }, [localUri, remoteUrl, tick, placeholder]);

  return (
    <Image
      source={src}
      style={[{ width: size, height: size, borderRadius: size / 2 }, style]}
    />
  );
}

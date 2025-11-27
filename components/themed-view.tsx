// components/themed-view.tsx
import React from "react";
import { View, type ViewProps } from "react-native";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedViewProps) {
  // Cor padrão de fallback
  const backgroundColor = lightColor || darkColor || "#121018";

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}

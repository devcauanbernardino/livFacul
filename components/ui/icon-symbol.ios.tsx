import { StyleProp, Text, ViewStyle } from "react-native";

export function IconSymbol({
  size = 24,
  color = "#fff",
  style,
}: {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Text
      style={[
        {
          fontSize: size,
          color: color,
        },
        style,
      ]}
    >
      ●
    </Text>
  );
}

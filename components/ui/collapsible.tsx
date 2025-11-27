import React, { PropsWithChildren, useState } from "react";
import { StyleSheet, TouchableOpacity, useColorScheme } from "react-native";

import { ThemedText } from "components/themed-text";
import { ThemedView } from "components/themed-view";

// cores locais (substitui Colors do projeto)
const Colors = {
  light: {
    icon: "#1C1C1E",
    text: "#11181C",
    background: "#FFFFFF",
  },
  dark: {
    icon: "#E6E6EA",
    text: "#E6E6EA",
    background: "#121018",
  },
};

export function Collapsible({
  children,
  title,
}: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorScheme() ?? "light";

  return (
    <ThemedView>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}
      >
        <ThemedText
          style={{
            fontSize: 18,
            color: Colors[theme].icon,
            transform: [{ rotate: isOpen ? "90deg" : "0deg" }],
          }}
        >
          ▶
        </ThemedText>

        <ThemedText type="defaultSemiBold">{title}</ThemedText>
      </TouchableOpacity>

      {isOpen && <ThemedView style={styles.content}>{children}</ThemedView>}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  content: {
    marginTop: 6,
    marginLeft: 24,
  },
});

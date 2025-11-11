// app/(tabs)/splash.tsx
import COLORS from "@/constants/theme/colors";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    });
    anim.start();

    const timer = setTimeout(() => {
      router.replace("/"); // vai para a home (index.tsx)
    }, 1600);

    return () => {
      anim.stop();
      clearTimeout(timer);
    };
  }, [fadeAnim, router]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Image
          source={require("../../assets/images/lua.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      <Text style={styles.appName}>Seu Marketplace de Livros</Text>
      <Text style={styles.tagline}>Compre, venda e troque 📚</Text>
      <Text style={styles.loadingText}>carregando...</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 20,
    borderRadius: 28,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  appName: {
    color: COLORS.title,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  tagline: {
    color: COLORS.sub,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 4,
  },
  loadingText: {
    color: COLORS.sub,
    fontSize: 12,
    fontWeight: "400",
    marginTop: 24,
  },
});

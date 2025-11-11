import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

// Captura as variáveis do app.json automaticamente
const supabaseUrl =
  Constants.expoConfig?.extra?.SUPABASE_URL ||
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  "";

const supabaseAnonKey =
  Constants.expoConfig?.extra?.SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Erro: Variáveis do Supabase ausentes.");
  console.error("SUPABASE_URL:", supabaseUrl);
  console.error("SUPABASE_ANON_KEY presente?", Boolean(supabaseAnonKey));
  throw new Error(
    "As variáveis SUPABASE_URL e SUPABASE_ANON_KEY não foram encontradas. " +
      "Verifique seu app.json (em expo.extra) ou use EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY."
  );
}

// Cria o client do Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

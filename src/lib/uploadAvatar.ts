import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system";
import mime from "mime";
import { supabase } from "./supabase";

export async function uploadAvatarToSupabase(localUri: string, userId: string) {
  try {
    if (!localUri || !userId) throw new Error("URI local ou ID do usuário ausente.");

    const contentType = mime.getType(localUri) || "image/jpeg";
    const ext = mime.getExtension(contentType) || "jpg";
    const filePath = `${userId}/avatar.${ext}`;

    // ✅ Lê a imagem como base64 (forçando tipo literal)
   
const base64 = await FileSystem.readAsStringAsync(localUri, {
  encoding: "base64", // ✅ literal string já é válida
});


    // Converte base64 -> ArrayBuffer
    const arrayBuffer = decode(base64);

    // Upload para o bucket 'avatars'
    const { error } = await supabase.storage
      .from("avatars")
      .upload(filePath, arrayBuffer, {
        contentType,
        upsert: true,
      });

    if (error) throw error;

    // Retorna URL pública
    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    return data.publicUrl;
  } catch (err: any) {
    console.warn("❌ Falha ao subir avatar:", err.message || err);
    throw err;
  }
}

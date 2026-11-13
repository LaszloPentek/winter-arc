import { supabase } from "./client";
const base = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object`;
export function validateCover(file: File) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("JPG, PNG vagy WebP képet válassz.");
  if (!file.size || file.size > 5 * 1024 * 1024) throw new Error("Legfeljebb 5 MB méretű képet válassz.");
}
async function request(user: string, method: string, file?: File) {
  const { data, error } = await supabase!.auth.getSession();
  if (error || data.session?.user.id !== user) throw new Error("Jelentkezz be újra a saját fiókodba.");
  const response = await fetch(`${base}${method === "GET" ? "/authenticated" : ""}/winter-covers/${user}/cover`, {
    method, cache: "no-store", signal: AbortSignal.timeout(30000),
    headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${data.session.access_token}`,
      ...(file ? { "Content-Type": file.type, "x-upsert": "true", "Cache-Control": "0" } : {}) },
    body: file,
  });
  if (!response.ok) {
    const details = await response.json().catch(() => ({})) as { message?: string; error?: string };
    if (method === "GET" && (response.status === 404 || details.message === "Object not found" || details.error === "not_found")) return null;
    throw new Error("A borító művelete nem sikerült. Ellenőrizd a kapcsolatot; ha a hiba megmarad, a privát képtár beállítása is ellenőrzendő.");
  }
  return response;
}
export async function loadCover(user: string) {
  const result = await request(user, "GET");
  return result ? result.blob() : null;
}
export async function uploadCover(user: string, file: File) {
  validateCover(file);
  const bitmap = await createImageBitmap(file).catch(() => { throw new Error("A képfájl nem olvasható. Válassz másik képet."); });
  bitmap.close();
  await request(user, "POST", file);
}

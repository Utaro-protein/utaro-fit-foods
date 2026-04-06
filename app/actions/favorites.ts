"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleFavorite(
  targetType: "product" | "selection" | "recipe",
  targetId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "ログインしてください。" };

  const { data: existingRows, error: existingError } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .limit(1);
  if (existingError) return { error: existingError.message };

  if ((existingRows ?? []).length > 0) {
    // 重複レコードがあっても一括で外せるようにキー条件で削除する
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("target_type", targetType)
      .eq("target_id", targetId);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("favorites").insert({
      user_id: user.id,
      target_type: targetType,
      target_id: targetId,
    });
    // 一意制約が入った後の同時押しでは 23505 が返ることがあるが、
    // 目的状態（お気に入り済み）には到達しているため成功扱いにする。
    if (error && error.code !== "23505") return { error: error.message };
  }
  revalidatePath("/");
  revalidatePath("/mypage");
  revalidatePath("/selections/search");
  return {};
}

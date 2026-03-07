"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type SubmitProductState = {
  error?: string;
};

export async function submitProduct(
  _prev: SubmitProductState,
  formData: FormData
): Promise<SubmitProductState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "ログインしてください。" };
  }

  const name = (formData.get("name") as string)?.trim();
  if (!name) {
    return { error: "食品名を入力してください。" };
  }

  const unit = formData.get("unit") as string;
  if (!unit || !["100g", "1食あたり", "1袋", "1本"].includes(unit)) {
    return { error: "基準を選択してください。" };
  }

  const brand = (formData.get("brand") as string)?.trim() || null;
  const purpose = (formData.get("purpose") as string)?.trim() || null;
  const comment = (formData.get("comment") as string)?.trim() || null;

  const parseNum = (v: FormDataEntryValue | null): number | null => {
    if (v == null || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  const calories = parseNum(formData.get("calories"));
  const carbs = parseNum(formData.get("carbs"));
  const protein = parseNum(formData.get("protein"));
  const fat = parseNum(formData.get("fat"));

  const imageUrls = [
    formData.get("image_url_1"),
    formData.get("image_url_2"),
    formData.get("image_url_3"),
    formData.get("image_url_4"),
    formData.get("image_url_5"),
  ]
    .filter((v): v is string => typeof v === "string" && v.length > 0)
    .slice(0, 5);

  const { error } = await supabase.from("products").insert({
    created_by: user.id,
    name,
    brand,
    unit,
    calories,
    carbs,
    protein,
    fat,
    purpose,
    comment,
    image_url_1: imageUrls[0] ?? null,
    image_url_2: imageUrls[1] ?? null,
    image_url_3: imageUrls[2] ?? null,
    image_url_4: imageUrls[3] ?? null,
    image_url_5: imageUrls[4] ?? null,
    hearts: 0,
    utaro_select: false,
    utaro_comment: null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/mypage");
  revalidatePath("/");
  redirect("/mypage");
}

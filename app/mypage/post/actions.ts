"use server";

import { createClient } from "@/utils/supabase/server";
import { toProductImagePath } from "@/utils/productImage";
import { revalidatePath } from "next/cache";

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
  const priceNum = parseNum(formData.get("price"));
  const price = priceNum != null && priceNum >= 0 ? Math.floor(priceNum) : null;

  const imagePaths = [
    formData.get("image_url_1"),
    formData.get("image_url_2"),
    formData.get("image_url_3"),
    formData.get("image_url_4"),
    formData.get("image_url_5"),
  ]
    .filter((v): v is string => typeof v === "string" && v.length > 0)
    .map((v) => toProductImagePath(v))
    .filter((v) => v.length > 0)
    .slice(0, 5);

  const { error } = await supabase.from("products").insert({
    created_by: user.id,
    name,
    brand,
    unit,
    price: price ?? null,
    calories,
    carbs,
    protein,
    fat,
    purpose,
    comment,
    image_url_1: imagePaths[0] ?? null,
    image_url_2: imagePaths[1] ?? null,
    image_url_3: imagePaths[2] ?? null,
    image_url_4: imagePaths[3] ?? null,
    image_url_5: imagePaths[4] ?? null,
    hearts: 0,
    utaro_select: false,
    utaro_comment: null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/mypage");
  revalidatePath("/");
  return {};
}

export async function updateProduct(
  productId: string,
  formData: FormData
): Promise<SubmitProductState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "ログインしてください。" };
  }

  const { data: product } = await supabase
    .from("products")
    .select("id, created_by")
    .eq("id", productId)
    .single();
  if (!product || product.created_by !== user.id) {
    return { error: "この投稿を編集する権限がありません。" };
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
  const priceNum = parseNum(formData.get("price"));
  const price = priceNum != null && priceNum >= 0 ? Math.floor(priceNum) : null;

  const imagePaths = [
    formData.get("image_url_1"),
    formData.get("image_url_2"),
    formData.get("image_url_3"),
    formData.get("image_url_4"),
    formData.get("image_url_5"),
  ]
    .filter((v): v is string => typeof v === "string" && v.length > 0)
    .map((v) => toProductImagePath(v))
    .filter((v) => v.length > 0)
    .slice(0, 5);

  const { error } = await supabase
    .from("products")
    .update({
      name,
      brand,
      unit,
      price: price ?? null,
      calories,
      carbs,
      protein,
      fat,
      purpose,
      comment,
      image_url_1: imagePaths[0] ?? null,
      image_url_2: imagePaths[1] ?? null,
      image_url_3: imagePaths[2] ?? null,
      image_url_4: imagePaths[3] ?? null,
      image_url_5: imagePaths[4] ?? null,
    })
    .eq("id", productId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/mypage");
  revalidatePath("/");
  revalidatePath(`/products/${productId}`);
  return {};
}

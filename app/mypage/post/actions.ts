"use server";

import { createClient } from "@/utils/supabase/server";
import { toProductImagePath } from "@/utils/productImage";
import { revalidatePath } from "next/cache";

export type SubmitProductState = {
  error?: string;
};

type RecipeIngredientPayload = {
  name: string;
  amount: number;
  unit: "g" | "ml";
};

type RecipeStepPayload = {
  content: string;
  image_url?: string | null;
};

function parseNum(v: FormDataEntryValue | null): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function parseJsonArray<T>(value: FormDataEntryValue | null): T[] | null {
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return null;
    return parsed as T[];
  } catch {
    return null;
  }
}

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

  const calories = parseNum(formData.get("calories"));
  const carbs = parseNum(formData.get("carbs"));
  const protein = parseNum(formData.get("protein"));
  const fat = parseNum(formData.get("fat"));
  const priceNum = parseNum(formData.get("price"));
  const price = priceNum != null && priceNum >= 0 ? Math.floor(priceNum) : null;

  const rawMain = formData.get("image_url_1");
  const mainPath =
    typeof rawMain === "string" && rawMain.length > 0
      ? toProductImagePath(rawMain)
      : "";
  const coverImage = mainPath.length > 0 ? mainPath : null;

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
    image_url_1: coverImage,
    image_url_2: null,
    image_url_3: null,
    image_url_4: null,
    image_url_5: null,
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

export async function submitRecipe(
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

  const title = (formData.get("title") as string)?.trim();
  if (!title) {
    return { error: "レシピ名を入力してください。" };
  }

  const description = (formData.get("description") as string)?.trim() || null;
  const calories = parseNum(formData.get("calories"));
  const carbs = parseNum(formData.get("carbs"));
  const protein = parseNum(formData.get("protein"));
  const fat = parseNum(formData.get("fat"));

  const rawRecipeCover = formData.get("image_url_1");
  const recipeCoverPath =
    typeof rawRecipeCover === "string" && rawRecipeCover.length > 0
      ? toProductImagePath(rawRecipeCover)
      : "";
  const recipeCoverImage = recipeCoverPath.length > 0 ? recipeCoverPath : null;

  const ingredientsPayload = parseJsonArray<RecipeIngredientPayload>(
    formData.get("ingredients_json")
  );
  if (!ingredientsPayload || ingredientsPayload.length === 0) {
    return { error: "材料を1つ以上入力してください。" };
  }
  const ingredients = ingredientsPayload
    .map((item) => ({
      name: String(item.name ?? "").trim(),
      amount: Number(item.amount),
      unit: item.unit,
    }))
    .filter((item) => item.name.length > 0 || Number.isFinite(item.amount));
  if (
    ingredients.length === 0 ||
    ingredients.some(
      (item) =>
        !item.name ||
        !Number.isFinite(item.amount) ||
        item.amount < 0 ||
        !["g", "ml"].includes(item.unit)
    )
  ) {
    return { error: "材料の入力内容を確認してください。" };
  }

  const stepsPayload = parseJsonArray<RecipeStepPayload>(formData.get("steps_json"));
  if (!stepsPayload || stepsPayload.length === 0) {
    return { error: "作り方を1つ以上入力してください。" };
  }
  const steps = stepsPayload
    .map((item) => {
      const content = String(item.content ?? "").trim();
      const rawPath = item.image_url;
      let imageUrl: string | null = null;
      if (rawPath != null && String(rawPath).trim() !== "") {
        const p = toProductImagePath(String(rawPath));
        imageUrl = p.length > 0 ? p : null;
      }
      return { content, image_url: imageUrl };
    })
    .filter((item) => item.content.length > 0);
  if (steps.length === 0) {
    return { error: "作り方を1つ以上入力してください。" };
  }

  const { data: recipeRow, error: recipeError } = await supabase
    .from("recipes")
    .insert({
      created_by: user.id,
      title,
      description,
      calories,
      carbs,
      protein,
      fat,
      image_url_1: recipeCoverImage,
      image_url_2: null,
      image_url_3: null,
      image_url_4: null,
    })
    .select("id")
    .single();

  if (recipeError || !recipeRow) {
    return { error: recipeError?.message ?? "レシピ投稿に失敗しました。" };
  }

  const recipeId = recipeRow.id;
  const ingredientRows = ingredients.map((item, index) => ({
    recipe_id: recipeId,
    sort_order: index,
    name: item.name,
    amount: item.amount,
    unit: item.unit,
  }));
  const stepRows = steps.map((item, index) => ({
    recipe_id: recipeId,
    sort_order: index,
    content: item.content,
    image_url: item.image_url,
  }));

  const { error: ingredientError } = await supabase
    .from("recipe_ingredients")
    .insert(ingredientRows);
  if (ingredientError) {
    return { error: ingredientError.message };
  }

  const { error: stepError } = await supabase.from("recipe_steps").insert(stepRows);
  if (stepError) {
    return { error: stepError.message };
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

  const calories = parseNum(formData.get("calories"));
  const carbs = parseNum(formData.get("carbs"));
  const protein = parseNum(formData.get("protein"));
  const fat = parseNum(formData.get("fat"));
  const priceNum = parseNum(formData.get("price"));
  const price = priceNum != null && priceNum >= 0 ? Math.floor(priceNum) : null;

  const rawUpdateMain = formData.get("image_url_1");
  const updateMainPath =
    typeof rawUpdateMain === "string" && rawUpdateMain.length > 0
      ? toProductImagePath(rawUpdateMain)
      : "";
  const updateCoverImage = updateMainPath.length > 0 ? updateMainPath : null;

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
      image_url_1: updateCoverImage,
      image_url_2: null,
      image_url_3: null,
      image_url_4: null,
      image_url_5: null,
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

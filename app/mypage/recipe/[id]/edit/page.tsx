import { createClient } from "@/utils/supabase/server";
import type { RecipeListItem } from "@/types/recipe";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  EditRecipeForm,
  type RecipeIngredientRow,
  type RecipeStepRow,
} from "@/app/mypage/post/EditRecipeForm";

type RecipeForEdit = RecipeListItem & { description: string | null };

async function getRecipeForEdit(
  id: string,
  userId: string
): Promise<{
  recipe: RecipeForEdit;
  ingredients: RecipeIngredientRow[];
  steps: RecipeStepRow[];
} | null> {
  const supabase = await createClient();
  const { data: recipe, error: rErr } = await supabase
    .from("recipes")
    .select(
      "id, created_by, created_at, title, description, image_url_1, calories, carbs, protein, fat"
    )
    .eq("id", id)
    .single();
  if (rErr || !recipe) return null;
  if (recipe.created_by !== userId) return null;

  const { data: ing } = await supabase
    .from("recipe_ingredients")
    .select("id, name, amount, unit, sort_order")
    .eq("recipe_id", id)
    .order("sort_order", { ascending: true });
  const { data: st } = await supabase
    .from("recipe_steps")
    .select("id, content, image_url, sort_order")
    .eq("recipe_id", id)
    .order("sort_order", { ascending: true });

  return {
    recipe: recipe as RecipeForEdit,
    ingredients: (ing ?? []) as RecipeIngredientRow[],
    steps: (st ?? []) as RecipeStepRow[],
  };
}

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const data = await getRecipeForEdit(id, user.id);
  if (!data) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/mypage"
        className="mb-6 inline-block text-sm text-zinc-600 hover:underline"
      >
        ← マイページへ
      </Link>
      <h1 className="mb-6 text-xl font-semibold text-zinc-900">レシピを編集</h1>
      <EditRecipeForm
        recipe={data.recipe}
        initialIngredients={data.ingredients}
        initialSteps={data.steps}
      />
    </div>
  );
}

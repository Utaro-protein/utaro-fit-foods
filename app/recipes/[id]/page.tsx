import { createClient } from "@/utils/supabase/server";
import { resolveProductImageSrc } from "@/utils/productImage";
import { notFound } from "next/navigation";
import type { RecipeListItem } from "@/types/recipe";

type RecipeDetailRow = RecipeListItem & { description: string | null };

type IngredientRow = {
  id: string;
  name: string;
  amount: number;
  unit: string;
  sort_order: number;
};

type StepRow = {
  id: string;
  content: string;
  sort_order: number;
  image_url: string | null;
};

async function getRecipeDetail(id: string): Promise<{
  recipe: RecipeDetailRow;
  ingredients: IngredientRow[];
  steps: StepRow[];
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

  const { data: ing } = await supabase
    .from("recipe_ingredients")
    .select("id, name, amount, unit, sort_order")
    .eq("recipe_id", id)
    .order("sort_order", { ascending: true });
  const { data: st } = await supabase
    .from("recipe_steps")
    .select("id, content, sort_order, image_url")
    .eq("recipe_id", id)
    .order("sort_order", { ascending: true });

  return {
    recipe: recipe as RecipeDetailRow,
    ingredients: (ing ?? []) as IngredientRow[],
    steps: (st ?? []) as StepRow[],
  };
}

export default async function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getRecipeDetail(id);
  if (!data) notFound();

  const { recipe, ingredients, steps } = data;
  const cover = resolveProductImageSrc(recipe.image_url_1, "");
  const cal = recipe.calories != null ? Math.round(Number(recipe.calories)) : null;
  const protein = recipe.protein != null ? Math.round(Number(recipe.protein)) : null;
  const fat = recipe.fat != null ? Math.round(Number(recipe.fat)) : null;
  const carbs = recipe.carbs != null ? Math.round(Number(recipe.carbs)) : null;
  const nutritionItems = [
    { label: "カロリー", value: cal != null ? `${cal} kcal` : null },
    { label: "たんぱく質", value: protein != null ? `${protein} g` : null },
    { label: "脂質", value: fat != null ? `${fat} g` : null },
    { label: "炭水化物", value: carbs != null ? `${carbs} g` : null },
  ].filter((item) => item.value != null);

  return (
    <main className="min-h-screen bg-zinc-50 pb-12">
      <div className="mx-auto w-full max-w-4xl px-4 py-5 sm:px-6 sm:py-8">
        <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="grid gap-5 md:grid-cols-[minmax(0,280px)_1fr] md:items-start">
            <div className="aspect-square max-h-[280px] overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cover}
                  alt={recipe.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-zinc-400">
                  No image
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-700">レシピ</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                {recipe.title}
              </h1>
              {recipe.description ? (
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
                  {recipe.description}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        {nutritionItems.length > 0 ? (
          <section className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:mt-6 sm:p-6">
            <h2 className="text-base font-semibold text-zinc-800 sm:text-lg">栄養情報（目安）</h2>
            <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {nutritionItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3"
                >
                  <dt className="text-xs text-zinc-500 sm:text-sm">{item.label}</dt>
                  <dd className="mt-1 text-lg font-semibold text-zinc-900 sm:text-xl">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {ingredients.length > 0 ? (
          <section className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:mt-6 sm:p-6">
            <h2 className="text-base font-semibold text-zinc-800 sm:text-lg">材料</h2>
            <ul className="mt-4 space-y-2">
              {ingredients.map((row) => (
                <li
                  key={row.id}
                  className="flex justify-between gap-4 border-b border-zinc-100 py-2 text-sm last:border-0"
                >
                  <span className="text-zinc-900">{row.name}</span>
                  <span className="shrink-0 text-zinc-600">
                    {row.amount}
                    {row.unit}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {steps.length > 0 ? (
          <section className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:mt-6 sm:p-6">
            <h2 className="text-base font-semibold text-zinc-800 sm:text-lg">作り方</h2>
            <ol className="mt-4 space-y-4">
              {steps.map((row, i) => {
                const stepImg = row.image_url
                  ? resolveProductImageSrc(row.image_url, "")
                  : "";
                return (
                  <li key={row.id} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-bold text-zinc-700">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1 space-y-2">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-800">
                        {row.content}
                      </p>
                      {stepImg ? (
                        <div className="relative h-40 max-w-xs overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={stepImg}
                            alt={`手順 ${i + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        ) : null}
      </div>
    </main>
  );
}

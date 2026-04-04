import type { RecipeListItem } from "@/types/recipe";
import { resolveProductImageSrc } from "@/utils/productImage";
import Link from "next/link";

type Props = {
  recipe: RecipeListItem;
};

export function RecipeCard({ recipe }: Props) {
  const imageUrl = resolveProductImageSrc(recipe.image_url_1, "");
  const protein = recipe.protein != null ? Math.round(Number(recipe.protein)) : null;
  const fat = recipe.fat != null ? Math.round(Number(recipe.fat)) : null;
  const carbs = recipe.carbs != null ? Math.round(Number(recipe.carbs)) : null;

  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="flex w-full flex-col overflow-hidden rounded-xl border border-zinc-200/80 bg-white/90 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800"
    >
      <div className="relative h-[95px] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-700">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={recipe.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-400 dark:text-zinc-500">
            <span className="text-xs">No image</span>
          </div>
        )}
        <span className="absolute left-1.5 top-1.5 rounded bg-emerald-600/90 px-1.5 py-0.5 text-[10px] font-medium text-white">
          レシピ
        </span>
      </div>
      <div className="space-y-1 px-2.5 py-2">
        <p className="line-clamp-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {recipe.title}
        </p>
        <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs font-semibold text-emerald-700">
          {protein != null && <span>P: {protein}g</span>}
          {fat != null && <span>F: {fat}g</span>}
          {carbs != null && <span>C: {carbs}g</span>}
        </div>
      </div>
    </Link>
  );
}

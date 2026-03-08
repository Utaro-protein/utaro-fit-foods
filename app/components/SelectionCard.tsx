"use client";

import { FavoriteButton } from "@/app/components/FavoriteButton";
import { resolveProductImageSrc } from "@/utils/productImage";
import Link from "next/link";

export type SelectionCardItem = {
  id: string;
  name: string;
  brand: string | null;
  image_url_1: string | null;
  protein?: number | null;
  fat?: number | null;
  carbs?: number | null;
};

type Props = {
  selection: SelectionCardItem;
  /** お気に入り欄で表示するとき。ハートを表示し、解除で一覧から外れる */
  favoriteKey?: { type: "selection"; id: string };
};

export function SelectionCard({ selection, favoriteKey }: Props) {
  const imageUrl = resolveProductImageSrc(selection.image_url_1, "");
  const protein = selection.protein != null ? Math.round(Number(selection.protein)) : null;
  const fat = selection.fat != null ? Math.round(Number(selection.fat)) : null;
  const carbs = selection.carbs != null ? Math.round(Number(selection.carbs)) : null;

  return (
    <Link
      href={`/selections/${selection.id}`}
      className="flex w-full flex-col overflow-hidden rounded-xl border border-zinc-200/80 bg-white/90 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800"
    >
      <div className="relative h-[95px] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-700">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={selection.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-400 dark:text-zinc-500">
            <span className="text-xs">No image</span>
          </div>
        )}
        {favoriteKey && (
          <FavoriteButton
            targetType="selection"
            targetId={favoriteKey.id}
            initialChecked
          />
        )}
      </div>
      <div className="space-y-1 px-2.5 py-2">
        <p className="line-clamp-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {selection.name}
        </p>
        {selection.brand && (
          <p className="line-clamp-1 text-xs text-zinc-500 dark:text-zinc-400">
            {selection.brand}
          </p>
        )}
        <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs font-semibold text-emerald-700">
          {protein != null && <span>P: {protein}g</span>}
          {fat != null && <span>F: {fat}g</span>}
          {carbs != null && <span>C: {carbs}g</span>}
        </div>
      </div>
    </Link>
  );
}

import type { Product } from "@/types/product";
import Link from "next/link";

type Props = { product: Product };

export function ProductCard({ product }: Props) {
  const imageUrl = product.image_url_1;
  const calories = product.calories != null ? Math.round(Number(product.calories)) : null;
  const protein = product.protein != null ? Math.round(Number(product.protein)) : null;

  return (
    <Link
      href={`/products/${product.id}`}
      className="flex w-40 shrink-0 flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800"
    >
      <div className="relative aspect-square w-full bg-zinc-100 dark:bg-zinc-700">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-400 dark:text-zinc-500">
            <span className="text-xs">No image</span>
          </div>
        )}
        {product.utaro_select && (
          <span className="absolute right-1.5 top-1.5 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
            うたろうセレクト
          </span>
        )}
      </div>
      <div className="flex flex-col gap-0.5 p-2.5">
        <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {product.name}
        </p>
        {product.brand && (
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
            {product.brand}
          </p>
        )}
        <div className="mt-1 flex gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          {calories != null && <span>{calories}kcal</span>}
          {protein != null && <span>P{protein}g</span>}
        </div>
      </div>
    </Link>
  );
}

import type { Product } from "@/types/product";
import { resolveProductImageSrc } from "@/utils/productImage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FavoriteButton } from "@/app/components/FavoriteButton";

type Props = {
  product: Product;
  editHref?: string;
  /** お気に入り欄で表示するとき。ハートを表示し、解除で一覧から外れる */
  favoriteKey?: { type: "product"; id: string };
};

export function ProductCard({ product, editHref, favoriteKey }: Props) {
  const router = useRouter();
  const imageUrl = resolveProductImageSrc(product.image_url_1, "");
  const protein = product.protein != null ? Math.round(Number(product.protein)) : null;
  const fat = product.fat != null ? Math.round(Number(product.fat)) : null;
  const carbs = product.carbs != null ? Math.round(Number(product.carbs)) : null;

  return (
    <Link
      href={`/products/${product.id}`}
      className="flex w-full flex-col overflow-hidden rounded-xl border border-zinc-200/80 bg-white/90 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800"
    >
      <div className="relative h-[95px] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-700">
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
        {editHref && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(editHref);
            }}
            className="absolute right-1.5 top-1.5 rounded bg-zinc-800/90 px-2 py-1 text-[10px] font-medium text-white hover:bg-zinc-700"
          >
            編集
          </button>
        )}
        {favoriteKey && (
          <FavoriteButton
            targetType="product"
            targetId={favoriteKey.id}
            initialChecked
          />
        )}
        {product.utaro_select && !editHref && !favoriteKey && (
          <span className="absolute right-1.5 top-1.5 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
            うたろうセレクト
          </span>
        )}
        {product.utaro_select && (editHref || favoriteKey) && (
          <span className="absolute left-1.5 top-1.5 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
            うたろうセレクト
          </span>
        )}
      </div>
      <div className="space-y-1 px-2.5 py-2">
        <p className="line-clamp-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {product.name}
        </p>
        {product.brand && (
          <p className="line-clamp-1 text-xs text-zinc-500 dark:text-zinc-400">
            {product.brand}
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

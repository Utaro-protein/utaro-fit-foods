"use client";

import { ProductCard } from "@/app/components/ProductCard";
import type { SelectionCardItem } from "@/app/components/SelectionCard";
import { SelectionCard } from "@/app/components/SelectionCard";
import type { Product } from "@/types/product";
import Link from "next/link";
import { useState } from "react";

type Props = {
  displayName: string;
  handle: string;
  joinedAt: string | null;
  products: Product[];
  favoriteProducts: Product[];
  favoriteSelections: SelectionCardItem[];
};

export function MypageView({
  displayName,
  handle,
  joinedAt,
  products,
  favoriteProducts,
  favoriteSelections,
}: Props) {
  const [tab, setTab] = useState<"posts" | "favorites">("posts");

  return (
    <main className="min-h-screen bg-zinc-50">
      {/* バナー */}
      <div className="h-32 w-full bg-zinc-200" />

      {/* プロフィールブロック: アバター + 名前・@・参加日・設定リンク */}
      <div className="mx-auto max-w-2xl px-4 pb-6">
        <div className="relative -mt-16">
          <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-white bg-zinc-300 shadow-md">
            <span className="flex h-full w-full items-center justify-center text-3xl font-bold text-zinc-600">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-zinc-900">{displayName}</h2>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href="/mypage/post"
                className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
              >
                投稿
              </Link>
              <Link
                href="/mypage/settings"
                className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                設定
              </Link>
            </div>
          </div>
          <p className="text-sm text-zinc-500">{handle}</p>
          {joinedAt && (
            <p className="text-sm text-zinc-500">
              🗓️ {joinedAt}から利用
            </p>
          )}
        </div>
      </div>

      {/* タブ: 投稿 | お気に入りの食品 */}
      <div className="mx-auto max-w-2xl border-b border-zinc-200">
        <div className="flex">
          <button
            type="button"
            onClick={() => setTab("posts")}
            className={`flex-1 px-6 py-4 text-center text-sm font-medium transition-colors ${
              tab === "posts"
                ? "border-b-2 border-zinc-900 text-zinc-900"
                : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
            }`}
          >
            投稿
          </button>
          <button
            type="button"
            onClick={() => setTab("favorites")}
            className={`flex-1 px-6 py-4 text-center text-sm font-medium transition-colors ${
              tab === "favorites"
                ? "border-b-2 border-zinc-900 text-zinc-900"
                : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
            }`}
          >
            お気に入りの食品
          </button>
        </div>
      </div>

      {/* タブコンテンツ */}
      {tab === "posts" && (
        <div className="mx-auto max-w-2xl p-4">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white py-24 text-center shadow-sm">
              <span className="mb-4 text-4xl" aria-hidden>
                🍽️
              </span>
              <p className="text-zinc-500">まだ投稿がありません</p>
              <Link
                href="/mypage/post"
                className="mt-5 rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-zinc-800"
              >
                食品を投稿する
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  editHref={`/mypage/post/${product.id}/edit`}
                />
              ))}
            </div>
          )}
        </div>
      )}
      {tab === "favorites" && (
        <div className="mx-auto max-w-2xl p-4">
          {favoriteProducts.length === 0 && favoriteSelections.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white py-24 text-center shadow-sm">
              <span className="mb-4 text-4xl" aria-hidden>
                🍴
              </span>
              <p className="text-zinc-500">お気に入りの食品はまだありません</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {favoriteProducts.map((product) => (
                <ProductCard
                  key={`product-${product.id}`}
                  product={product}
                  favoriteKey={{ type: "product", id: product.id }}
                />
              ))}
              {favoriteSelections.map((selection) => (
                <SelectionCard
                  key={`selection-${selection.id}`}
                  selection={selection}
                  favoriteKey={{ type: "selection", id: selection.id }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}

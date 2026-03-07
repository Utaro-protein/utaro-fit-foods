import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Product } from "@/types/product";

async function getProduct(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return data as Product;
}

function Stars({ count }: { count: number }) {
  const full = "★";
  const empty = "☆";
  return (
    <span className="text-amber-400">
      {full.repeat(count)}
      <span className="text-zinc-300">{empty.repeat(5 - count)}</span>
    </span>
  );
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const img1 = product.image_url_1;
  const img2 = product.image_url_2;
  const cal = product.calories != null ? Math.round(Number(product.calories)) : null;
  const protein = product.protein != null ? Math.round(Number(product.protein)) : null;
  const fat = product.fat != null ? Math.round(Number(product.fat)) : null;
  const carbs = product.carbs != null ? Math.round(Number(product.carbs)) : null;
  const purpose = product.purpose ?? "";
  const commentText =
    product.utaro_select && product.utaro_comment
      ? product.utaro_comment
      : product.comment;

  const purposeStars: Record<string, number> = {
    減量: purpose === "減量" ? 5 : purpose === "増量" ? 2 : 3,
    増量: purpose === "増量" ? 5 : purpose === "減量" ? 3 : 4,
    維持期: purpose === "維持期" ? 5 : purpose === "減量" ? 4 : 3,
  };
  if (purpose && !purposeStars[purpose]) purposeStars[purpose] = 5;

  return (
    <main className="min-h-screen bg-zinc-50 pb-12">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <Link
          href="/"
          className="mb-4 inline-block text-sm text-zinc-600 hover:underline"
        >
          ← ホームへ
        </Link>

        {/* 商品画像エリア（2枚並べ or 1枚） */}
        <div className="mb-6 flex justify-center gap-3">
          <div className="flex-1 max-w-[200px] aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
            {img1 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={img1}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-zinc-200" />
            )}
          </div>
          {img2 ? (
            <div className="flex-1 max-w-[200px] aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img2}
                alt={`${product.name}（盛り付け）`}
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}
        </div>

        <h1 className="text-center text-2xl font-bold text-zinc-900">
          {product.name}
        </h1>
        {product.brand && (
          <p className="mt-1 text-center text-sm text-zinc-500">
            ブランド: {product.brand}
          </p>
        )}

        {product.utaro_select && (
          <p className="mt-2 text-center">
            <span className="rounded bg-amber-500 px-2 py-0.5 text-xs font-medium text-white">
              うたろうセレクト
            </span>
          </p>
        )}

        {/* 栄養情報カード */}
        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-800">
            <span className="text-emerald-600">🌿</span>
            栄養情報 ({product.unit})
          </h2>
          <dl className="mt-4 space-y-3 border-t border-zinc-100 pt-4">
            {cal != null && (
              <div className="flex justify-between text-sm">
                <dt className="text-zinc-600">カロリー</dt>
                <dd className="font-medium text-zinc-900">{cal} kcal</dd>
              </div>
            )}
            {protein != null && (
              <div className="flex justify-between text-sm">
                <dt className="text-zinc-600">たんぱく質</dt>
                <dd className="font-medium text-zinc-900">{protein} g</dd>
              </div>
            )}
            {fat != null && (
              <div className="flex justify-between text-sm">
                <dt className="text-zinc-600">脂質</dt>
                <dd className="font-medium text-zinc-900">{fat} g</dd>
              </div>
            )}
            {carbs != null && (
              <div className="flex justify-between text-sm">
                <dt className="text-zinc-600">炭水化物</dt>
                <dd className="font-medium text-zinc-900">{carbs} g</dd>
              </div>
            )}
            {cal == null && protein == null && fat == null && carbs == null && (
              <p className="text-sm text-zinc-500">栄養情報は未登録です</p>
            )}
          </dl>
        </section>

        {/* 目的別おすすめカード */}
        <section className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-800">
            <span className="text-blue-600">🏃</span>
            目的別おすすめ
          </h2>
          <ul className="mt-4 space-y-3 border-t border-zinc-100 pt-4">
            {(["減量", "増量", "維持期"] as const).map((p) => (
              <li
                key={p}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-zinc-700">{p}</span>
                <Stars count={purposeStars[p] ?? 3} />
              </li>
            ))}
          </ul>
        </section>

        {/* コメントカード */}
        {(product.utaro_select && product.utaro_comment) || product.comment ? (
          <section className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-800">
              <span className="text-zinc-500">💬</span>
              {product.utaro_select && product.utaro_comment
                ? "うたろう解説"
                : "コメント"}
            </h2>
            <div className="mt-4 border-t border-zinc-100 pt-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
                {commentText}
              </p>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

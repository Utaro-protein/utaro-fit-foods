import { createClient } from "@/utils/supabase/server";
import { resolveProductImageSrc } from "@/utils/productImage";
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

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const img1 = resolveProductImageSrc(product.image_url_1, "");
  const img2 = resolveProductImageSrc(product.image_url_2, "");
  const cal = product.calories != null ? Math.round(Number(product.calories)) : null;
  const protein = product.protein != null ? Math.round(Number(product.protein)) : null;
  const fat = product.fat != null ? Math.round(Number(product.fat)) : null;
  const carbs = product.carbs != null ? Math.round(Number(product.carbs)) : null;
  const purpose = product.purpose ?? "";
  const purposeBadgeClass = purpose === "増量"
    ? "bg-red-500 text-white"
    : purpose === "減量"
      ? "bg-blue-500 text-white"
      : purpose === "維持期"
        ? "bg-orange-500 text-white"
        : "bg-zinc-200 text-zinc-700";
  const commentText =
    product.utaro_select && product.utaro_comment
      ? product.utaro_comment
      : product.comment;
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
          <div className="grid gap-5 lg:grid-cols-[minmax(0,360px)_1fr] lg:items-center">
            <div className={`grid gap-3 ${img2 ? "grid-cols-2" : "grid-cols-1"}`}>
              <div className="aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
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
                <div className="aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img2}
                    alt={`${product.name}（盛り付け）`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : null}
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                {product.name}
              </h1>
              {product.brand && (
                <p className="mt-2 text-sm text-zinc-500 sm:text-base">
                  {product.brand}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {product.price != null && (
                  <p className="inline-flex rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 sm:text-sm">
                    ¥{product.price.toLocaleString()}（税込）
                  </p>
                )}
                {product.utaro_select && (
                  <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white">
                    うたろうセレクト
                  </span>
                )}
              </div>
              <p className="mt-3 inline-flex rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 sm:text-sm">
                栄養情報は{product.unit}あたり
              </p>
            </div>
          </div>
        </section>

        {/* 栄養情報カード */}
        <section className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:mt-6 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-800 sm:text-lg">
              <span className="text-emerald-600">🌿</span>
              栄養情報
            </h2>
            {purpose && (
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${purposeBadgeClass}`}
              >
                {purpose}
              </span>
            )}
          </div>
          {nutritionItems.length > 0 ? (
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
          ) : (
            <p className="mt-4 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-5 text-sm text-zinc-500">
              栄養情報は未登録です
            </p>
          )}
        </section>

        {/* コメントカード */}
        {(product.utaro_select && product.utaro_comment) || product.comment ? (
          <section className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-800 sm:text-lg">
              <span className="text-zinc-500">💬</span>
              {product.utaro_select && product.utaro_comment
                ? "うたろう解説"
                : "コメント"}
            </h2>
            <div className="mt-4 rounded-xl border border-zinc-100 bg-zinc-50 p-4">
              <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-700 sm:text-base">
                {commentText}
              </p>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

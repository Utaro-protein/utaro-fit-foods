import { createClient } from "@/utils/supabase/server";
import { resolveProductImageSrc } from "@/utils/productImage";
import { notFound } from "next/navigation";

type UtaroSelection = {
  id: string;
  name: string;
  brand: string | null;
  unit: string;
  calories: number | null;
  carbs: number | null;
  protein: number | null;
  fat: number | null;
  price: number | null;
  purpose: string | null;
  utaro_comment: string | null;
  image_url_1: string | null;
  image_url_2: string | null;
};

async function getSelection(id: string): Promise<UtaroSelection | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("utaro_selections")
    .select("id, name, brand, unit, calories, protein, fat, carbs, price, purpose, utaro_comment, image_url_1, image_url_2")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return data as UtaroSelection;
}

export default async function SelectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const selection = await getSelection(id);
  if (!selection) notFound();

  const img1 = resolveProductImageSrc(selection.image_url_1, "");
  const img2 = resolveProductImageSrc(selection.image_url_2, "");
  const cal = selection.calories != null ? Math.round(Number(selection.calories)) : null;
  const protein = selection.protein != null ? Math.round(Number(selection.protein)) : null;
  const fat = selection.fat != null ? Math.round(Number(selection.fat)) : null;
  const carbs = selection.carbs != null ? Math.round(Number(selection.carbs)) : null;
  const price =
    selection.price != null ? Math.round(Number(selection.price)) : null;
  const purpose = selection.purpose ?? "";
  const purposeBadgeClass = purpose === "増量"
    ? "bg-red-500 text-white"
    : purpose === "減量"
      ? "bg-blue-500 text-white"
      : purpose === "維持期"
        ? "bg-orange-500 text-white"
        : "bg-zinc-200 text-zinc-700";

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
                    alt={selection.name}
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
                    alt={`${selection.name}（盛り付け）`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : null}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                  {selection.name}
                </h1>
              </div>
              {selection.brand && (
                <p className="mt-2 text-sm text-zinc-500 sm:text-base">
                  {selection.brand}
                </p>
              )}
              {price != null && (
                <p className="mt-2 text-lg font-semibold text-zinc-900 sm:text-xl">
                  ¥{price.toLocaleString()}（税込想定）
                </p>
              )}
              <p className="mt-3 inline-flex rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 sm:text-sm">
                栄養情報は{selection.unit}あたり
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

        {/* うたろうのレビュー */}
        {selection.utaro_comment ? (
          <section className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-800 sm:text-lg">
              <span className="text-zinc-500">💬</span>
              うたろうのレビュー
            </h2>
            <div className="mt-4 rounded-xl border border-zinc-100 bg-zinc-50 p-4">
              <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-700 sm:text-base">
                {selection.utaro_comment}
              </p>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

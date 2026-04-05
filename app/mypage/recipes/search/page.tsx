import Link from "next/link";
import { redirect } from "next/navigation";
import { resolveProductImageSrc } from "@/utils/productImage";
import { createClient } from "@/utils/supabase/server";
import { RecipeSearchDialog } from "./RecipeSearchDialog";
import {
  getMyRecipeBounds,
  rangesFromSearchParams,
  searchMyRecipes,
} from "./searchQueries";

export default async function MyRecipeSearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const sp = await searchParams;
  const bounds = await getMyRecipeBounds(user.id);
  const rows = await searchMyRecipes(user.id, sp, bounds);
  const ranges = rangesFromSearchParams(sp, bounds);

  return (
    <main className="min-h-screen bg-zinc-50 pb-16">
      <div className="w-full max-w-5xl px-5 py-6 sm:px-8 sm:py-8">
        <div className="mb-6 mt-6 sm:mt-8">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            レシピ投稿 検索
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            自分が投稿したレシピのみを対象に絞り込みます。
          </p>
          <Link
            href="/mypage"
            className="mt-3 inline-flex text-sm font-medium text-zinc-700 underline-offset-2 hover:underline"
          >
            マイページに戻る
          </Link>
        </div>

        <RecipeSearchDialog bounds={bounds} ranges={ranges} />

        <section className="mt-8">
          <p className="mb-4 text-sm text-zinc-600">{rows.length} 件が該当しました</p>
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {rows.map((row) => {
              const img = resolveProductImageSrc(row.image_url_1);
              const p = row.protein != null ? Math.round(Number(row.protein)) : null;
              const f = row.fat != null ? Math.round(Number(row.fat)) : null;
              const c = row.carbs != null ? Math.round(Number(row.carbs)) : null;
              const cal = row.calories != null ? Math.round(Number(row.calories)) : null;
              return (
                <li key={row.id} className="min-w-0">
                  <Link
                    href={`/recipes/${row.id}`}
                    className="flex w-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:border-emerald-200 hover:shadow-md"
                  >
                    <div className="relative w-full shrink-0 overflow-hidden bg-zinc-100 aspect-[4/3]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={row.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex flex-1 flex-col justify-between p-2.5 sm:p-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-snug text-zinc-900 break-words">
                          {row.title}
                        </p>
                        <p className="mt-1 text-[10px] font-semibold leading-tight text-emerald-700 sm:text-xs">
                          {cal != null && <span>{cal} kcal</span>}
                          {cal != null && (p != null || f != null || c != null) && (
                            <span className="text-zinc-400"> · </span>
                          )}
                          {p != null && <span>P {p}g</span>}
                          {p != null && f != null && <span className="text-zinc-400"> </span>}
                          {f != null && <span>F {f}g</span>}
                          {f != null && c != null && <span className="text-zinc-400"> </span>}
                          {c != null && <span>C {c}g</span>}
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
          {rows.length === 0 && (
            <p className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-left text-sm text-zinc-600">
              条件に合うレシピ投稿がありません。範囲を広げるか、条件をクリアしてください。
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

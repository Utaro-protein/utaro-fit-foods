import Link from "next/link";
import { resolveProductImageSrc } from "@/utils/productImage";
import {
  getUtaroSelectionBounds,
  rangesFromSearchParams,
  searchUtaroSelections,
} from "./searchQueries";
import { SelectionSearchFilters } from "./SelectionSearchFilters";

export default async function SelectionSearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const bounds = await getUtaroSelectionBounds();
  const rows = await searchUtaroSelections(sp, bounds);
  const ranges = rangesFromSearchParams(sp, bounds);

  return (
    <main className="min-h-screen bg-zinc-50 pb-16">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6">
          <Link
            href="/"
            className="text-sm font-medium text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            ← ホーム
          </Link>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            Utaro selection 検索
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            カロリー・PFC・金額の範囲で絞り込めます（データに値がない列は、範囲を狭めたときに一覧から外れることがあります）。
          </p>
        </div>

        <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-base font-semibold text-zinc-800">条件</h2>
          <div className="mt-4">
            <SelectionSearchFilters bounds={bounds} ranges={ranges} />
          </div>
        </section>

        <section className="mt-8">
          <p className="mb-4 text-sm text-zinc-600">
            {rows.length} 件が該当しました
          </p>
          <ul className="space-y-3">
            {rows.map((row) => {
              const img = resolveProductImageSrc(row.image_url_1);
              const p = row.protein != null ? Math.round(Number(row.protein)) : null;
              const f = row.fat != null ? Math.round(Number(row.fat)) : null;
              const c = row.carbs != null ? Math.round(Number(row.carbs)) : null;
              const cal = row.calories != null ? Math.round(Number(row.calories)) : null;
              const price = row.price != null ? Math.round(Number(row.price)) : null;
              return (
                <li key={row.id}>
                  <Link
                    href={`/selections/${row.id}`}
                    className="flex gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm transition hover:border-emerald-200 hover:shadow-md sm:gap-4 sm:p-4"
                  >
                    <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-lg bg-zinc-100 sm:h-[100px] sm:w-[100px]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt={row.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-zinc-900 line-clamp-2">
                        {row.name}
                      </p>
                      {row.brand ? (
                        <p className="mt-0.5 text-xs text-zinc-500 line-clamp-1">
                          {row.brand}
                        </p>
                      ) : null}
                      <p className="mt-1.5 text-xs font-semibold text-emerald-700">
                        {cal != null && <span>{cal} kcal</span>}
                        {cal != null && (p != null || f != null || c != null) && (
                          <span className="text-zinc-400"> · </span>
                        )}
                        {p != null && <span>P {p}g</span>}
                        {p != null && f != null && (
                          <span className="text-zinc-400"> </span>
                        )}
                        {f != null && <span>F {f}g</span>}
                        {f != null && c != null && (
                          <span className="text-zinc-400"> </span>
                        )}
                        {c != null && <span>C {c}g</span>}
                      </p>
                      {price != null && (
                        <p className="mt-1 text-sm font-medium text-zinc-800">
                          ¥{price.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
          {rows.length === 0 && (
            <p className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-600">
              条件に合う Utaro selection がありません。範囲を広げるか、条件をクリアしてください。
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

"use client";

import * as Slider from "@radix-ui/react-slider";
import type { SelectionSearchBounds } from "@/types/utaroSelection";
import type { RangeState } from "./searchQueries";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

function buildQueryString(r: RangeState): string {
  const p = new URLSearchParams();
  p.set("calMin", String(r.calories[0]));
  p.set("calMax", String(r.calories[1]));
  p.set("proteinMin", String(r.protein[0]));
  p.set("proteinMax", String(r.protein[1]));
  p.set("fatMin", String(r.fat[0]));
  p.set("fatMax", String(r.fat[1]));
  p.set("carbMin", String(r.carbs[0]));
  p.set("carbMax", String(r.carbs[1]));
  p.set("priceMin", String(r.price[0]));
  p.set("priceMax", String(r.price[1]));
  return p.toString();
}

function DualRangeRow({
  label,
  unit,
  bounds,
  lo,
  hi,
  onChange,
}: {
  label: string;
  unit: string;
  bounds: { min: number; max: number };
  lo: number;
  hi: number;
  onChange: (next: [number, number]) => void;
}) {
  const min = bounds.min;
  const max = bounds.max;
  const step = 1;
  const safeLo = Math.min(lo, hi);
  const safeHi = Math.max(lo, hi);

  function handleChange(next: number[]) {
    if (next.length < 2) return;
    const a = Math.round(Math.min(Math.max(next[0], min), max));
    const b = Math.round(Math.min(Math.max(next[1], min), max));
    onChange([Math.min(a, b), Math.max(a, b)]);
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 px-3 py-3 sm:px-4">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-zinc-800">{label}</span>
        <span className="text-xs tabular-nums text-zinc-600">
          {safeLo}
          {unit} 〜 {safeHi}
          {unit}
        </span>
      </div>
      <Slider.Root
        value={[safeLo, safeHi]}
        min={min}
        max={max}
        step={step}
        minStepsBetweenThumbs={0}
        onValueChange={handleChange}
        className="relative flex h-8 w-full touch-none select-none items-center"
        aria-label={`${label}の範囲`}
      >
        <Slider.Track className="relative h-1.5 w-full rounded-full bg-zinc-200">
          <Slider.Range className="absolute h-full rounded-full bg-emerald-500" />
        </Slider.Track>
        <Slider.Thumb
          className="block h-[18px] w-[18px] rounded-full border-2 border-emerald-600 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12)] transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-1"
          aria-label={`${label}の下限`}
        />
        <Slider.Thumb
          className="block h-[18px] w-[18px] rounded-full border-2 border-emerald-600 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12)] transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-1"
          aria-label={`${label}の上限`}
        />
      </Slider.Root>
    </div>
  );
}

type Props = {
  bounds: SelectionSearchBounds;
  ranges: RangeState;
};

export function SelectionSearchFilters({ bounds, ranges }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [local, setLocal] = useState<RangeState>(ranges);

  useEffect(() => {
    setLocal(ranges);
  }, [ranges]);

  function apply() {
    router.replace(`${pathname}?${buildQueryString(local)}`);
  }

  function reset() {
    const resetRanges: RangeState = {
      calories: [bounds.calories.min, bounds.calories.max],
      protein: [bounds.protein.min, bounds.protein.max],
      fat: [bounds.fat.min, bounds.fat.max],
      carbs: [bounds.carbs.min, bounds.carbs.max],
      price: [bounds.price.min, bounds.price.max],
    };
    setLocal(resetRanges);
    router.replace(pathname);
  }

  return (
    <div className="space-y-3">
      <DualRangeRow
        label="カロリー"
        unit=" kcal"
        bounds={bounds.calories}
        lo={local.calories[0]}
        hi={local.calories[1]}
        onChange={(next) => setLocal((s) => ({ ...s, calories: next }))}
      />
      <DualRangeRow
        label="たんぱく質"
        unit=" g"
        bounds={bounds.protein}
        lo={local.protein[0]}
        hi={local.protein[1]}
        onChange={(next) => setLocal((s) => ({ ...s, protein: next }))}
      />
      <DualRangeRow
        label="脂質"
        unit=" g"
        bounds={bounds.fat}
        lo={local.fat[0]}
        hi={local.fat[1]}
        onChange={(next) => setLocal((s) => ({ ...s, fat: next }))}
      />
      <DualRangeRow
        label="炭水化物"
        unit=" g"
        bounds={bounds.carbs}
        lo={local.carbs[0]}
        hi={local.carbs[1]}
        onChange={(next) => setLocal((s) => ({ ...s, carbs: next }))}
      />
      <DualRangeRow
        label="金額"
        unit=" 円"
        bounds={bounds.price}
        lo={local.price[0]}
        hi={local.price[1]}
        onChange={(next) => setLocal((s) => ({ ...s, price: next }))}
      />
      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={apply}
          className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          この条件で絞り込む
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          条件をクリア
        </button>
      </div>
    </div>
  );
}

import type { NumericBounds, SelectionSearchBounds } from "@/types/utaroSelection";

export type RangeState = {
  calories: [number, number];
  protein: [number, number];
  fat: [number, number];
  carbs: [number, number];
  price: [number, number];
};

function fullRange(lo: number, hi: number, b: NumericBounds): boolean {
  return lo <= b.min && hi >= b.max;
}

/** いずれかの軸で URL と同様に「絞り込みが有効」な状態か（全軸がデータ全体の幅と一致しない） */
export function hasActiveSearchFilters(
  ranges: RangeState,
  bounds: SelectionSearchBounds
): boolean {
  return (
    !fullRange(ranges.calories[0], ranges.calories[1], bounds.calories) ||
    !fullRange(ranges.protein[0], ranges.protein[1], bounds.protein) ||
    !fullRange(ranges.fat[0], ranges.fat[1], bounds.fat) ||
    !fullRange(ranges.carbs[0], ranges.carbs[1], bounds.carbs) ||
    !fullRange(ranges.price[0], ranges.price[1], bounds.price)
  );
}

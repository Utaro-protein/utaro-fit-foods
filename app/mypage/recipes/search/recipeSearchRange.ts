import type { NumericBounds } from "@/types/utaroSelection";

export type RecipeSearchBounds = {
  calories: NumericBounds;
  protein: NumericBounds;
  fat: NumericBounds;
  carbs: NumericBounds;
};

export type RangeState = {
  calories: [number, number];
  protein: [number, number];
  fat: [number, number];
  carbs: [number, number];
};

function fullRange(lo: number, hi: number, b: NumericBounds): boolean {
  return lo <= b.min && hi >= b.max;
}

export function hasActiveSearchFilters(
  ranges: RangeState,
  bounds: RecipeSearchBounds
): boolean {
  return (
    !fullRange(ranges.calories[0], ranges.calories[1], bounds.calories) ||
    !fullRange(ranges.protein[0], ranges.protein[1], bounds.protein) ||
    !fullRange(ranges.fat[0], ranges.fat[1], bounds.fat) ||
    !fullRange(ranges.carbs[0], ranges.carbs[1], bounds.carbs)
  );
}

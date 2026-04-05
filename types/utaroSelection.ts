/** utaro_selections 一覧・検索用 */
export type UtaroSelectionListItem = {
  id: string;
  name: string;
  brand: string | null;
  calories: number | null;
  carbs: number | null;
  protein: number | null;
  fat: number | null;
  price: number | null;
  image_url_1: string | null;
  display_order: number | null;
};

export type NumericBounds = { min: number; max: number };

export type SelectionSearchBounds = {
  calories: NumericBounds;
  protein: NumericBounds;
  fat: NumericBounds;
  carbs: NumericBounds;
  price: NumericBounds;
};

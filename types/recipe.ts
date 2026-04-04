/** マイページ一覧・カード表示用（DBの recipes に対応） */
export type RecipeListItem = {
  id: string;
  created_by: string;
  created_at: string;
  title: string;
  description?: string | null;
  image_url_1: string | null;
  calories: number | null;
  carbs: number | null;
  protein: number | null;
  fat: number | null;
};

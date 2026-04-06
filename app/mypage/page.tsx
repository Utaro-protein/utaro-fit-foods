import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import type { Product } from "@/types/product";
import type { RecipeListItem } from "@/types/recipe";
import { MypageView } from "./components/MypageView";

async function getMyProducts(userId: string): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("created_by", userId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as Product[];
}

async function getMyRecipes(userId: string): Promise<RecipeListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recipes")
    .select("id, created_by, created_at, title, image_url_1, calories, carbs, protein, fat")
    .eq("created_by", userId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as RecipeListItem[];
}

type FavoriteRow = { target_type: string; target_id: string };

type FavoriteSelection = {
  id: string;
  name: string;
  brand: string | null;
  image_url_1: string | null;
  protein: number | null;
  fat: number | null;
  carbs: number | null;
};

async function getFavoriteItems(userId: string): Promise<{
  products: Product[];
  selections: FavoriteSelection[];
  recipes: RecipeListItem[];
}> {
  const supabase = await createClient();
  const { data: favList, error: favError } = await supabase
    .from("favorites")
    .select("target_type, target_id")
    .eq("user_id", userId);
  if (favError || !favList?.length) return { products: [], selections: [], recipes: [] };

  const rows = favList as FavoriteRow[];
  const productIds = rows.filter((r) => r.target_type === "product").map((r) => r.target_id);
  const selectionIds = rows.filter((r) => r.target_type === "selection").map((r) => r.target_id);
  const recipeIds = rows.filter((r) => r.target_type === "recipe").map((r) => r.target_id);

  let products: Product[] = [];
  let selections: FavoriteSelection[] = [];
  let recipes: RecipeListItem[] = [];

  if (productIds.length > 0) {
    const { data: prods } = await supabase
      .from("products")
      .select("*")
      .in("id", productIds);
    products = (prods ?? []) as Product[];
  }
  if (selectionIds.length > 0) {
    const { data: sels } = await supabase
      .from("utaro_selections")
      .select("id, name, brand, image_url_1, protein, fat, carbs")
      .in("id", selectionIds);
    selections = (sels ?? []) as FavoriteSelection[];
  }
  if (recipeIds.length > 0) {
    const { data: recs } = await supabase
      .from("recipes")
      .select("id, created_by, created_at, title, image_url_1, calories, carbs, protein, fat")
      .in("id", recipeIds);
    recipes = (recs ?? []) as RecipeListItem[];
  }

  return { products, selections, recipes };
}

export default async function Mypage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [
    products,
    recipes,
    { products: favoriteProducts, selections: favoriteSelections, recipes: favoriteRecipes },
  ] =
    await Promise.all([
      getMyProducts(user.id),
      getMyRecipes(user.id),
      getFavoriteItems(user.id),
    ]);

  const displayName = user.user_metadata?.name ?? user.email?.split("@")[0] ?? "ユーザー";
  const handle = user.email ? `@${user.email.split("@")[0]}` : "@user";
  const joinedAt = user.created_at
    ? new Date(user.created_at).toLocaleDateString("ja-JP", { year: "numeric", month: "long" })
    : null;

  return (
    <MypageView
      displayName={displayName}
      handle={handle}
      joinedAt={joinedAt}
      products={products}
      recipes={recipes}
      favoriteProducts={favoriteProducts}
      favoriteSelections={favoriteSelections}
      favoriteRecipes={favoriteRecipes}
    />
  );
}

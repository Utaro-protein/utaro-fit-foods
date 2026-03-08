import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import type { Product } from "@/types/product";
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

async function getFavoriteProductsAndSelections(userId: string): Promise<{
  products: Product[];
  selections: FavoriteSelection[];
}> {
  const supabase = await createClient();
  const { data: favList, error: favError } = await supabase
    .from("favorites")
    .select("target_type, target_id")
    .eq("user_id", userId);
  if (favError || !favList?.length) return { products: [], selections: [] };

  const rows = favList as FavoriteRow[];
  const productIds = rows.filter((r) => r.target_type === "product").map((r) => r.target_id);
  const selectionIds = rows.filter((r) => r.target_type === "selection").map((r) => r.target_id);

  let products: Product[] = [];
  let selections: FavoriteSelection[] = [];

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

  return { products, selections };
}

export default async function Mypage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [products, { products: favoriteProducts, selections: favoriteSelections }] =
    await Promise.all([
      getMyProducts(user.id),
      getFavoriteProductsAndSelections(user.id),
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
      favoriteProducts={favoriteProducts}
      favoriteSelections={favoriteSelections}
    />
  );
}

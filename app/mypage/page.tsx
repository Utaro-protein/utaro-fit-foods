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

export default async function Mypage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const products = await getMyProducts(user.id);
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
    />
  );
}

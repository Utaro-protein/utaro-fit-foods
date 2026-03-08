import { createClient } from "@/utils/supabase/server";
import type { Product } from "@/types/product";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditProductForm } from "../../EditProductForm";

async function getProduct(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return data as Product;
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const product = await getProduct(id);
  if (!product || product.created_by !== user.id) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/mypage"
        className="mb-6 inline-block text-sm text-zinc-600 hover:underline"
      >
        ← マイページへ
      </Link>
      <h1 className="mb-6 text-xl font-semibold text-zinc-900">投稿を編集</h1>
      <EditProductForm product={product} />
    </div>
  );
}

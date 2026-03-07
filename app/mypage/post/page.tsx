import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PostFoodForm } from "./PostFoodForm";

export default async function MypagePost() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Link
          href="/mypage"
          className="mb-6 inline-block text-sm text-zinc-600 hover:underline"
        >
          ← マイページへ
        </Link>
        <h1 className="mb-6 text-xl font-bold text-zinc-900">食品を投稿</h1>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <PostFoodForm />
        </div>
      </div>
    </main>
  );
}

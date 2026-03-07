import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function MypageSettings() {
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
        <h1 className="mb-6 text-xl font-bold text-zinc-900">設定</h1>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-zinc-500">ログイン中</p>
          <p className="mt-1 font-medium text-zinc-900">{user.email}</p>
          <p className="mt-4 text-sm text-zinc-500">
            メール・パスワードの変更は今後対応予定です。
          </p>
        </div>
      </div>
    </main>
  );
}

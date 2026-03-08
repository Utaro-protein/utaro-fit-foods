"use client";

import { createClient } from "@/utils/supabase/client";
import { submitProduct } from "./actions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const UNIT_OPTIONS = [
  { value: "100g", label: "100g" },
  { value: "1食あたり", label: "1食あたり" },
  { value: "1袋", label: "1袋" },
  { value: "1本", label: "1本" },
] as const;

const PURPOSE_OPTIONS = [
  { value: "", label: "選択しない" },
  { value: "減量", label: "減量" },
  { value: "増量", label: "増量" },
  { value: "維持期", label: "維持期" },
] as const;

const MAX_IMAGES = 5;

export function PostFoodForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = formRef.current;
    if (!form) return;

    const nameInput = form.elements.namedItem("name") as HTMLInputElement | null;
    const name = nameInput?.value.trim() ?? "";
    if (!name) {
      setError("食品名を入力してください。");
      return;
    }

    const unitSelect = form.elements.namedItem("unit") as HTMLSelectElement | null;
    const unit = unitSelect?.value ?? "";
    if (!unit) {
      setError("基準を選択してください。");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("ログインしてください。");
        setLoading(false);
        return;
      }

      const fileInput = form.querySelector<HTMLInputElement>('input[name="images"]');
      const files = fileInput?.files ? Array.from(fileInput.files).slice(0, MAX_IMAGES) : [];
      const imagePaths: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split(".").pop() || "jpg";
        const path = `upload/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(path, file, { upsert: false });
        if (uploadError) {
          setError(`画像のアップロードに失敗しました: ${uploadError.message}`);
          setLoading(false);
          return;
        }
        imagePaths.push(path);
      }

      const formData = new FormData(form);
      formData.delete("images");
      imagePaths.forEach((path, i) => formData.set(`image_url_${i + 1}`, path));

      const result = await submitProduct({}, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/mypage");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "投稿に失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) {
      setPreviews([]);
      return;
    }
    const urls: string[] = [];
    for (let i = 0; i < Math.min(files.length, MAX_IMAGES); i++) {
      urls.push(URL.createObjectURL(files[i]));
    }
    setPreviews((prev) => {
      prev.forEach(URL.revokeObjectURL);
      return urls;
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-zinc-700">
          食品名 <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          placeholder="例: サラダチキン"
        />
      </div>

      <div>
        <label htmlFor="brand" className="mb-1 block text-sm font-medium text-zinc-700">
          ブランド
        </label>
        <input
          id="brand"
          name="brand"
          type="text"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          placeholder="例: 〇〇食品"
        />
      </div>

      <div>
        <label htmlFor="price" className="mb-1 block text-sm font-medium text-zinc-700">
          金額（円）
        </label>
        <input
          id="price"
          name="price"
          type="number"
          min={0}
          step={1}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          placeholder="例: 298"
        />
      </div>

      <div>
        <label htmlFor="unit" className="mb-1 block text-sm font-medium text-zinc-700">
          基準 <span className="text-red-500">*</span>
        </label>
        <select
          id="unit"
          name="unit"
          required
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        >
          <option value="">選択してください</option>
          {UNIT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <label htmlFor="calories" className="mb-1 block text-sm font-medium text-zinc-700">
            カロリー
          </label>
          <input
            id="calories"
            name="calories"
            type="number"
            min={0}
            step={0.1}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            placeholder="kcal"
          />
        </div>
        <div>
          <label htmlFor="carbs" className="mb-1 block text-sm font-medium text-zinc-700">
            炭水化物 (g)
          </label>
          <input
            id="carbs"
            name="carbs"
            type="number"
            min={0}
            step={0.1}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
        </div>
        <div>
          <label htmlFor="protein" className="mb-1 block text-sm font-medium text-zinc-700">
            たんぱく質 (g)
          </label>
          <input
            id="protein"
            name="protein"
            type="number"
            min={0}
            step={0.1}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
        </div>
        <div>
          <label htmlFor="fat" className="mb-1 block text-sm font-medium text-zinc-700">
            脂質 (g)
          </label>
          <input
            id="fat"
            name="fat"
            type="number"
            min={0}
            step={0.1}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="purpose" className="mb-1 block text-sm font-medium text-zinc-700">
          目的別おすすめ
        </label>
        <select
          id="purpose"
          name="purpose"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        >
          {PURPOSE_OPTIONS.map((opt) => (
            <option key={opt.value || "none"} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="comment" className="mb-1 block text-sm font-medium text-zinc-700">
          コメント（感想）
        </label>
        <textarea
          id="comment"
          name="comment"
          rows={4}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          placeholder="食べた感想やおすすめポイント"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          画像（最大5枚）
        </label>
        <input
          name="images"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFileChange}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-600 file:mr-3 file:rounded file:border-0 file:bg-zinc-100 file:px-4 file:py-2 file:text-zinc-700"
        />
        {previews.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {previews.map((url, i) => (
              <div
                key={url}
                className="h-20 w-20 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`プレビュー ${i + 1}`} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
        >
          {loading ? "投稿中..." : "投稿する"}
        </button>
        <Link
          href="/mypage"
          className="rounded-lg border border-zinc-300 px-6 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          キャンセル
        </Link>
      </div>
    </form>
  );
}

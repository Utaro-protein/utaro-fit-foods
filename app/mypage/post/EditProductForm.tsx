"use client";

import { createClient } from "@/utils/supabase/client";
import { resolveProductImageSrc } from "@/utils/productImage";
import { deleteProduct, updateProduct } from "./actions";
import type { Product } from "@/types/product";
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

const MAX_IMAGES = 1;

function getPathOrUrl(value: string | null | undefined): string {
  if (!value) return "";
  const v = value.trim();
  if (/^https?:\/\//i.test(v)) {
    const prefix = "/storage/v1/object/public/product-images/";
    const i = v.indexOf(prefix);
    if (i >= 0) return v.slice(i + prefix.length);
    return v;
  }
  return v;
}

type Props = { product: Product };

export function EditProductForm({ product }: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [mainImageStatus, setMainImageStatus] = useState(
    product.image_url_1 ? "現在の画像を使用中" : "未選択"
  );

  const existingPaths = [getPathOrUrl(product.image_url_1)];

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
      const imagePaths: string[] = [...existingPaths];

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
        imagePaths[i] = path;
      }

      const formData = new FormData(form);
      formData.delete("images");
      for (let i = 0; i < MAX_IMAGES; i++) {
        const path = imagePaths[i];
        if (path) formData.set(`image_url_${i + 1}`, path);
      }

      const result = await updateProduct(product.id, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/mypage");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新に失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) {
      setPreviews([]);
      setMainImageStatus(product.image_url_1 ? "現在の画像を使用中" : "未選択");
      return;
    }
    const file = files[0];
    setMainImageStatus(file.name);
    const urls = [URL.createObjectURL(file)];
    setPreviews((prev) => {
      prev.forEach(URL.revokeObjectURL);
      return urls;
    });
  }

  function clearMainImage() {
    setPreviews((prev) => {
      prev.forEach(URL.revokeObjectURL);
      return [];
    });
    setMainImageStatus(product.image_url_1 ? "現在の画像を使用中" : "未選択");
    if (mainImageInputRef.current) mainImageInputRef.current.value = "";
  }

  async function handleDelete() {
    if (deleting) return;
    setDeleting(true);
    setError(null);
    const result = await deleteProduct(product.id);
    if (result.error) {
      setError(result.error);
      setDeleting(false);
      return;
    }
    setIsDeleteOpen(false);
    router.push("/mypage");
    router.refresh();
  }

  const currentImageUrls = product.image_url_1
    ? [resolveProductImageSrc(product.image_url_1, "")]
    : [];

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
          defaultValue={product.name}
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
          defaultValue={product.brand ?? ""}
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
          defaultValue={product.price ?? ""}
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
          defaultValue={product.unit}
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
            defaultValue={product.calories ?? ""}
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
            defaultValue={product.carbs ?? ""}
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
            defaultValue={product.protein ?? ""}
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
            defaultValue={product.fat ?? ""}
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
          defaultValue={product.purpose ?? ""}
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
          defaultValue={product.comment ?? ""}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          placeholder="食べた感想やおすすめポイント"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          メイン画像
        </label>
        <input
          ref={mainImageInputRef}
          id="food-main-image"
          name="images"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={handleFileChange}
        />
        {previews.length === 0 ? (
          <div className="space-y-2">
            {currentImageUrls.length > 0 && (
              <>
                <p className="text-xs text-zinc-500">
                  現在の画像（新しいファイルを選ぶと差し替わります）
                </p>
                <div className="h-16 w-16 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={currentImageUrls[0]} alt="現在のメイン画像" className="h-full w-full object-cover" />
                </div>
              </>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <label
                htmlFor="food-main-image"
                className="inline-flex cursor-pointer items-center rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                写真を選択（任意）
              </label>
              <span className="text-sm text-zinc-500">{mainImageStatus}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previews[0]} alt="メイン画像のプレビュー" className="h-full w-full object-cover" />
            </div>
            <button
              type="button"
              onClick={clearMainImage}
              className="text-xs text-zinc-600 underline hover:text-zinc-900"
            >
              写真を削除
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
        >
          {loading ? "更新中..." : "更新する"}
        </button>
        <Link
          href="/mypage"
          className="rounded-lg border border-zinc-300 px-6 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          キャンセル
        </Link>
        <button
          type="button"
          onClick={() => setIsDeleteOpen(true)}
          className="ml-auto rounded-lg border border-red-300 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50"
        >
          投稿を削除
        </button>
      </div>

      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-base font-semibold text-zinc-900">
              この投稿を削除しますか？
            </h3>
            <p className="mt-2 text-sm text-zinc-600">
              この操作は取り消せません。食品投稿「{product.name}」が削除されます。
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                disabled={deleting}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
              >
                {deleting ? "削除中..." : "削除する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

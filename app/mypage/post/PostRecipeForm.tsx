"use client";

import { createClient } from "@/utils/supabase/client";
import { submitRecipe } from "./actions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

/** レシピの表紙写真（工程ごとの写真は含まない） */
const MAX_IMAGES = 1;

type IngredientUnit = "g" | "ml";

type IngredientInput = {
  id: string;
  name: string;
  amount: string;
  unit: IngredientUnit;
};

type StepInput = {
  id: string;
  content: string;
  imageFile: File | null;
  imagePreview: string | null;
};

function createIngredient(): IngredientInput {
  return { id: crypto.randomUUID(), name: "", amount: "", unit: "g" };
}

function createStep(): StepInput {
  return { id: crypto.randomUUID(), content: "", imageFile: null, imagePreview: null };
}

function autoResizeTextarea(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

function RemoveRowButton({
  onClick,
  "aria-label": ariaLabel,
}: {
  onClick: () => void;
  "aria-label": string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-300 text-zinc-600 transition-colors hover:bg-zinc-50"
      aria-label={ariaLabel}
    >
      <svg
        className="h-3.5 w-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden
      >
        <path strokeLinecap="round" d="M5 12h14" />
      </svg>
    </button>
  );
}

export function PostRecipeForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const recipeMainImageInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [recipeGalleryStatus, setRecipeGalleryStatus] = useState("未選択");
  const [ingredients, setIngredients] = useState<IngredientInput[]>([createIngredient()]);
  const [steps, setSteps] = useState<StepInput[]>([createStep()]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = formRef.current;
    if (!form) return;

    const titleInput = form.elements.namedItem("title") as HTMLInputElement | null;
    const title = titleInput?.value.trim() ?? "";
    if (!title) {
      setError("レシピ名を入力してください。");
      return;
    }

    const normalizedIngredients = ingredients
      .map((item) => ({
        name: item.name.trim(),
        amount: Number(item.amount),
        unit: item.unit,
      }))
      .filter((item) => item.name.length > 0 || Number.isFinite(item.amount));

    if (normalizedIngredients.length === 0) {
      setError("材料を1つ以上入力してください。");
      return;
    }
    if (
      normalizedIngredients.some(
        (item) =>
          !item.name ||
          !Number.isFinite(item.amount) ||
          item.amount < 0 ||
          !["g", "ml"].includes(item.unit)
      )
    ) {
      setError("材料の入力内容を確認してください。");
      return;
    }

    const stepsForSubmit = steps
      .map((item) => ({
        content: item.content.trim(),
        imageFile: item.imageFile,
      }))
      .filter((item) => item.content.length > 0);
    if (stepsForSubmit.length === 0) {
      setError("作り方を1つ以上入力してください。");
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
        const path = `recipe/upload/${crypto.randomUUID()}.${ext}`;
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

      const stepPayload: { content: string; image_url: string | null }[] = [];
      for (let i = 0; i < stepsForSubmit.length; i++) {
        const { content, imageFile } = stepsForSubmit[i];
        let stepImagePath: string | null = null;
        if (imageFile) {
          const ext = imageFile.name.split(".").pop() || "jpg";
          const path = `recipe/steps/${crypto.randomUUID()}.${ext}`;
          const { error: stepUploadError } = await supabase.storage
            .from("product-images")
            .upload(path, imageFile, { upsert: false });
          if (stepUploadError) {
            setError(`工程の画像のアップロードに失敗しました: ${stepUploadError.message}`);
            setLoading(false);
            return;
          }
          stepImagePath = path;
        }
        stepPayload.push({ content, image_url: stepImagePath });
      }

      const formData = new FormData(form);
      formData.delete("images");
      imagePaths.forEach((path, i) => formData.set(`image_url_${i + 1}`, path));
      formData.set("ingredients_json", JSON.stringify(normalizedIngredients));
      formData.set("steps_json", JSON.stringify(stepPayload));

      const result = await submitRecipe({}, formData);
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
      setRecipeGalleryStatus("未選択");
      return;
    }
    const file = files[0];
    setRecipeGalleryStatus(file.name);
    const urls = [URL.createObjectURL(file)];
    setPreviews((prev) => {
      prev.forEach(URL.revokeObjectURL);
      return urls;
    });
  }

  function clearRecipeMainImage() {
    setPreviews((prev) => {
      prev.forEach(URL.revokeObjectURL);
      return [];
    });
    setRecipeGalleryStatus("未選択");
    if (recipeMainImageInputRef.current) recipeMainImageInputRef.current.value = "";
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-zinc-700">
          レシピ名 <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          placeholder="例: 鶏むね肉の高タンパク炒め"
        />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-zinc-700">
          レシピ紹介文
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          onInput={(e) => autoResizeTextarea(e.currentTarget)}
          className="w-full resize-none overflow-hidden rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          placeholder="レシピのポイントやおすすめの食べ方"
        />
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
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900"
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
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900"
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
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900"
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
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-800">
            材料 <span className="text-red-500">*</span>
          </h3>
          <button
            type="button"
            onClick={() => setIngredients((prev) => [...prev, createIngredient()])}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
          >
            + 材料を追加
          </button>
        </div>
        <div className="space-y-2">
          {ingredients.map((item, index) => (
            <div key={item.id} className="grid grid-cols-12 gap-2">
              <input
                type="text"
                value={item.name}
                onChange={(e) =>
                  setIngredients((prev) =>
                    prev.map((row) =>
                      row.id === item.id ? { ...row, name: e.target.value } : row
                    )
                  )
                }
                placeholder={`材料 ${index + 1}`}
                className="col-span-6 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
              />
              <input
                type="number"
                min={0}
                step={0.1}
                value={item.amount}
                onChange={(e) =>
                  setIngredients((prev) =>
                    prev.map((row) =>
                      row.id === item.id ? { ...row, amount: e.target.value } : row
                    )
                  )
                }
                placeholder="量"
                className="col-span-3 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
              />
              <select
                value={item.unit}
                onChange={(e) =>
                  setIngredients((prev) =>
                    prev.map((row) =>
                      row.id === item.id ? { ...row, unit: e.target.value as IngredientUnit } : row
                    )
                  )
                }
                className="col-span-2 rounded-lg border border-zinc-300 px-2 py-2 text-sm text-zinc-900"
              >
                <option value="g">g</option>
                <option value="ml">ml</option>
              </select>
              {index === 0 ? (
                <div className="col-span-1 flex h-8 w-8 shrink-0 items-center justify-center" aria-hidden />
              ) : (
                <div className="col-span-1 flex items-center justify-center self-center">
                  <RemoveRowButton
                    onClick={() =>
                      setIngredients((prev) =>
                        prev.length > 1 ? prev.filter((row) => row.id !== item.id) : prev
                      )
                    }
                    aria-label="材料を削除"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-800">
            作り方 <span className="text-red-500">*</span>
          </h3>
          <button
            type="button"
            onClick={() => setSteps((prev) => [...prev, createStep()])}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
          >
            + 工程を追加
          </button>
        </div>
        <div className="space-y-3">
          {steps.map((item, index) => (
            <div key={item.id} className="flex gap-2">
              <div className="mt-2 w-6 shrink-0 text-xs font-semibold text-zinc-500">{index + 1}</div>
              <div className="min-w-0 flex-1 space-y-2">
                <textarea
                  rows={2}
                  value={item.content}
                  onChange={(e) => {
                    autoResizeTextarea(e.currentTarget);
                    setSteps((prev) =>
                      prev.map((row) =>
                        row.id === item.id ? { ...row, content: e.target.value } : row
                      )
                    );
                  }}
                  placeholder="工程内容を入力"
                  className="w-full resize-none overflow-hidden rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
                />
                <div>
                  {!item.imagePreview ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <label
                        htmlFor={`step-image-${item.id}`}
                        className="inline-flex cursor-pointer items-center rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                      >
                        写真を選択（任意）
                      </label>
                      <input
                        id={`step-image-${item.id}`}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0] ?? null;
                          setSteps((prev) =>
                            prev.map((row) => {
                              if (row.id !== item.id) return row;
                              if (row.imagePreview) URL.revokeObjectURL(row.imagePreview);
                              return {
                                ...row,
                                imageFile: file,
                                imagePreview: file ? URL.createObjectURL(file) : null,
                              };
                            })
                          );
                          e.target.value = "";
                        }}
                      />
                      <span className="text-xs text-zinc-500">未選択</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imagePreview}
                          alt={`工程 ${index + 1} のプレビュー`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setSteps((prev) =>
                            prev.map((row) => {
                              if (row.id !== item.id) return row;
                              if (row.imagePreview) URL.revokeObjectURL(row.imagePreview);
                              return { ...row, imageFile: null, imagePreview: null };
                            })
                          )
                        }
                        className="text-xs text-zinc-600 underline hover:text-zinc-900"
                      >
                        写真を削除
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {index === 0 ? (
                <div className="h-8 w-8 shrink-0" aria-hidden />
              ) : (
                <div className="mt-1 shrink-0 self-start">
                  <RemoveRowButton
                    onClick={() =>
                      setSteps((prev) => {
                        if (prev.length <= 1) return prev;
                        return prev.filter((row) => {
                          if (row.id !== item.id) return true;
                          if (row.imagePreview) URL.revokeObjectURL(row.imagePreview);
                          return false;
                        });
                      })
                    }
                    aria-label="工程を削除"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          メイン画像
        </label>
        {previews.length === 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <label
              htmlFor="recipe-gallery-images"
              className="inline-flex cursor-pointer items-center rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
            >
              写真を選択（任意）
            </label>
            <input
              ref={recipeMainImageInputRef}
              id="recipe-gallery-images"
              name="images"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={handleFileChange}
            />
            <span className="text-sm text-zinc-500">{recipeGalleryStatus}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previews[0]}
                alt="メイン画像のプレビュー"
                className="h-full w-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={clearRecipeMainImage}
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

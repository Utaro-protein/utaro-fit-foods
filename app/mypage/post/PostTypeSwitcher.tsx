"use client";

import { useState } from "react";
import { PostFoodForm } from "./PostFoodForm";
import { PostRecipeForm } from "./PostRecipeForm";

type PostType = "food" | "recipe";

export function PostTypeSwitcher() {
  const [postType, setPostType] = useState<PostType>("food");

  return (
    <div className="space-y-6">
      <div className="inline-flex rounded-lg border border-zinc-300 bg-zinc-100 p-1">
        <button
          type="button"
          onClick={() => setPostType("food")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            postType === "food"
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          食品投稿
        </button>
        <button
          type="button"
          onClick={() => setPostType("recipe")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            postType === "recipe"
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          レシピ投稿
        </button>
      </div>

      {postType === "food" ? <PostFoodForm /> : <PostRecipeForm />}
    </div>
  );
}

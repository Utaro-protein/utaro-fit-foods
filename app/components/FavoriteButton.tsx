"use client";

import { toggleFavorite } from "@/app/actions/favorites";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  targetType: "product" | "selection";
  targetId: string;
  initialChecked: boolean;
  className?: string;
};

export function FavoriteButton({
  targetType,
  targetId,
  initialChecked,
  className = "",
}: Props) {
  const router = useRouter();
  const [checked, setChecked] = useState(initialChecked);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setChecked((prev) => !prev);
    const result = await toggleFavorite(targetType, targetId);
    if (result.error) {
      setChecked((prev) => !prev);
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow transition hover:bg-white ${className}`}
      aria-label={checked ? "お気に入りから外す" : "お気に入りに追加"}
    >
      {checked ? (
        <svg
          className="h-5 w-5 text-red-500"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg
          className="h-5 w-5 text-zinc-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      )}
    </button>
  );
}

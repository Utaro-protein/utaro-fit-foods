"use client";

import { FavoriteButton } from "@/app/components/FavoriteButton";
import Link from "next/link";

export type HomeRailItem = {
  id: string;
  name: string;
  brand: string;
  protein: number;
  carbs: number;
  fat: number;
  imageUrl: string;
  href?: string;
  favoriteKey: { type: "product" | "selection"; id: string } | null;
  isFavorited: boolean;
};

type Props = {
  item: HomeRailItem;
  isLoggedIn: boolean;
};

export function HomeRailCard({ item, isLoggedIn }: Props) {
  const card = (
    <div className="w-[170px] shrink-0 overflow-hidden rounded-xl border border-zinc-200/80 bg-white/90 shadow-sm backdrop-blur-sm transition hover:shadow-md">
      <div className="relative h-[95px] w-full overflow-hidden bg-zinc-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
        {isLoggedIn && item.favoriteKey && (
          <FavoriteButton
            targetType={item.favoriteKey.type}
            targetId={item.favoriteKey.id}
            initialChecked={item.isFavorited}
          />
        )}
      </div>
      <div className="space-y-1 px-2.5 py-2">
        <p className="line-clamp-1 text-sm font-semibold text-zinc-900">{item.name}</p>
        <p className="line-clamp-1 text-xs text-zinc-500">{item.brand}</p>
        <p className="text-xs font-semibold text-emerald-700">
          <span>P: {item.protein}g</span> <span>F: {item.fat}g</span>{" "}
          <span>C: {item.carbs}g</span>
        </p>
      </div>
    </div>
  );

  if (!item.href) return card;
  return <Link href={item.href}>{card}</Link>;
}

import { createClient } from "@/utils/supabase/server";
import type { Product } from "@/types/product";
import Link from "next/link";

type HomeItem = {
  id: string;
  name: string;
  brand: string;
  protein: number;
  calories: number;
  imageUrl: string;
  href?: string;
};

async function getUtaroSelection(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("utaro_select", true)
    .order("created_at", { ascending: false })
    .limit(12);
  if (error) return [];
  return (data ?? []) as Product[];
}

async function getNewPosts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(12);
  if (error) return [];
  return (data ?? []) as Product[];
}

function toHomeItem(product: Product): HomeItem {
  return {
    id: product.id,
    name: product.name,
    brand: product.brand ?? "コンビニ食品",
    protein: product.protein != null ? Math.round(Number(product.protein)) : 0,
    calories: product.calories != null ? Math.round(Number(product.calories)) : 0,
    imageUrl: product.image_url_1 ?? "/placeholders/card-food.svg",
    href: `/products/${product.id}`,
  };
}

function RailCard({ item }: { item: HomeItem }) {
  const card = (
    <div className="w-[170px] shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="h-[95px] w-full overflow-hidden bg-zinc-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
      </div>
      <div className="space-y-1 px-2.5 py-2">
        <p className="line-clamp-1 text-sm font-semibold text-zinc-900">{item.name}</p>
        <p className="line-clamp-1 text-xs text-zinc-500">{item.brand}</p>
        <p className="text-xs text-zinc-700">
          <span className="font-semibold text-emerald-700">P: {item.protein}g</span>{" "}
          <span>{item.calories} Cal</span>
        </p>
      </div>
    </div>
  );

  if (!item.href) return card;
  return <Link href={item.href}>{card}</Link>;
}

function RailSection({ title, items }: { title: string; items: HomeItem[] }) {
  return (
    <section className="bg-zinc-100/80 px-4 py-4 sm:px-6">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[22px] font-semibold text-zinc-800">{title}</h3>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="h-2 w-2 rounded-full bg-zinc-400" />
          <span className="h-2 w-2 rounded-full bg-zinc-300" />
        </div>
      </div>
      <div className="home-rail-scroll flex gap-2.5 overflow-x-auto pb-1">
        {items.map((item) => (
          <RailCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

export default async function Home() {
  const [utaroProducts, newPosts] = await Promise.all([
    getUtaroSelection(),
    getNewPosts(),
  ]);
  const pickItems = utaroProducts.map(toHomeItem);
  const newItems = newPosts.map(toHomeItem);
  const fallbackPickItems: HomeItem[] = [
    {
      id: "sample-pick-1",
      name: "ファミマ 国産鶏のサラダ",
      brand: "ファミリーマート",
      protein: 28,
      calories: 240,
      imageUrl: "/placeholders/card-food.svg",
    },
    {
      id: "sample-pick-2",
      name: "サラダチキン プレーン",
      brand: "セブン-イレブン",
      protein: 22,
      calories: 120,
      imageUrl: "/placeholders/card-food.svg",
    },
    {
      id: "sample-pick-3",
      name: "プロテインバー",
      brand: "in バー",
      protein: 15,
      calories: 200,
      imageUrl: "/placeholders/card-food.svg",
    },
    {
      id: "sample-pick-4",
      name: "グリルチキンサラダ",
      brand: "ファミマ",
      protein: 27,
      calories: 230,
      imageUrl: "/placeholders/card-food.svg",
    },
    {
      id: "sample-pick-5",
      name: "低脂質バーガー",
      brand: "バーガーキング",
      protein: 32,
      calories: 480,
      imageUrl: "/placeholders/card-food.svg",
    },
  ];
  const fallbackNewItems: HomeItem[] = [
    {
      id: "sample-new-1",
      name: "高タンパク弁当",
      brand: "ローソン",
      protein: 35,
      calories: 520,
      imageUrl: "/placeholders/card-food.svg",
    },
    {
      id: "sample-new-2",
      name: "ハンバーグ弁当",
      brand: "セブン-イレブン",
      protein: 31,
      calories: 610,
      imageUrl: "/placeholders/card-food.svg",
    },
    {
      id: "sample-new-3",
      name: "牛肉ライト定食",
      brand: "ほっともっと",
      protein: 30,
      calories: 530,
      imageUrl: "/placeholders/card-food.svg",
    },
    {
      id: "sample-new-4",
      name: "グリルチキンサラダ",
      brand: "ファミマ",
      protein: 27,
      calories: 300,
      imageUrl: "/placeholders/card-food.svg",
    },
    {
      id: "sample-new-5",
      name: "鶏むねライス",
      brand: "ファストフード",
      protein: 27,
      calories: 480,
      imageUrl: "/placeholders/card-food.svg",
    },
  ];

  return (
    <main className="min-h-screen bg-zinc-50 pb-20">
      <div className="w-full space-y-4 pt-0 pb-5">
        <section className="relative min-h-[320px] overflow-hidden border-b border-zinc-200 bg-zinc-200 sm:min-h-[380px]">
          {/* 画像をセクション全体に表示（背面） */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/placeholders/hero-food.svg"
            alt="筋トレ飯のヒーロー画像"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* 左側にテキストを重ねる */}
          <div className="absolute inset-y-0 left-0 z-10 flex max-w-md flex-col justify-center px-6 py-10 sm:px-10 sm:py-14">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 drop-shadow-sm sm:text-5xl">
              <span className="mr-2">🔥</span>
              今日の即効筋トレ飯
            </h1>
            <p className="mt-2 text-lg font-medium text-zinc-800 drop-shadow-sm">
              コンビニ・ファストフードから厳選紹介
            </p>
            <p className="mt-4 inline-flex w-fit rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-md">
              今すぐ食べれる高タンパク食品！
            </p>
          </div>
        </section>

        <RailSection title="Utaro's Picks" items={pickItems.length > 0 ? pickItems : fallbackPickItems} />
        <RailSection title="New Muscle Meals" items={newItems.length > 0 ? newItems : fallbackNewItems} />

        <section className="border-y border-zinc-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-zinc-700">
            <span>🔥 減量飯</span>
            <span className="text-zinc-300">|</span>
            <span>💪 増量飯</span>
            <span className="text-zinc-300">|</span>
            <span>🥬 低糖質</span>
            <span className="text-zinc-300">|</span>
            <span>🍳 高タンパク</span>
            <span className="text-zinc-300">|</span>
            <span>🏪 コンビニ飯</span>
          </div>
        </section>

        <div className="pointer-events-none fixed bottom-4 right-4 hidden sm:block">
          <div className="pointer-events-auto flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/placeholders/follow-banner.svg"
              alt="Follow Utaro バナー"
              className="h-[68px] w-[290px] rounded-xl border border-zinc-200 shadow-lg"
            />
            <button
              type="button"
              className="h-8 w-8 rounded-full bg-white text-zinc-500 shadow hover:bg-zinc-100"
              aria-label="バナーを閉じる"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

import { HomeRailCard } from "@/app/components/HomeRailCard";
import type { HomeRailItem } from "@/app/components/HomeRailCard";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { resolveProductImageSrc } from "@/utils/productImage";
import type { Product } from "@/types/product";
import type { RecipeListItem } from "@/types/recipe";

type HomeItem = HomeRailItem;

type UtaroSelectionRow = {
  id: string;
  created_at: string;
  name: string;
  brand: string | null;
  unit: string;
  calories: number | null;
  carbs: number | null;
  protein: number | null;
  fat: number | null;
  price: number | null;
  purpose: string | null;
  utaro_comment: string | null;
  image_url_1: string | null;
  image_url_2: string | null;
  image_url_3: string | null;
  image_url_4: string | null;
  image_url_5: string | null;
  display_order: number | null;
};

async function getUtaroSelections(): Promise<UtaroSelectionRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("utaro_selections")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(12);
  if (error) return [];
  return (data ?? []) as UtaroSelectionRow[];
}

function toHomeItemFromSelection(
  row: UtaroSelectionRow,
  isFavorited: boolean
): HomeItem {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand ?? "コンビニ食品",
    protein: row.protein != null ? Math.round(Number(row.protein)) : 0,
    carbs: row.carbs != null ? Math.round(Number(row.carbs)) : 0,
    fat: row.fat != null ? Math.round(Number(row.fat)) : 0,
    imageUrl: resolveProductImageSrc(row.image_url_1),
    href: `/selections/${row.id}`,
    favoriteKey: { type: "selection", id: row.id },
    isFavorited,
  };
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

async function getNewRecipes(): Promise<RecipeListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recipes")
    .select("id, created_by, created_at, title, image_url_1, calories, carbs, protein, fat")
    .order("created_at", { ascending: false })
    .limit(12);
  if (error) return [];
  return (data ?? []) as RecipeListItem[];
}

function toHomeItem(product: Product, isFavorited: boolean): HomeItem {
  return {
    id: product.id,
    name: product.name,
    brand: product.brand ?? "コンビニ食品",
    protein: product.protein != null ? Math.round(Number(product.protein)) : 0,
    carbs: product.carbs != null ? Math.round(Number(product.carbs)) : 0,
    fat: product.fat != null ? Math.round(Number(product.fat)) : 0,
    imageUrl: resolveProductImageSrc(product.image_url_1),
    href: `/products/${product.id}`,
    favoriteKey: { type: "product", id: product.id },
    isFavorited,
  };
}

function toHomeItemFromRecipe(recipe: RecipeListItem): HomeItem {
  return {
    id: recipe.id,
    name: recipe.title,
    brand: "レシピ",
    protein: recipe.protein != null ? Math.round(Number(recipe.protein)) : 0,
    carbs: recipe.carbs != null ? Math.round(Number(recipe.carbs)) : 0,
    fat: recipe.fat != null ? Math.round(Number(recipe.fat)) : 0,
    imageUrl: resolveProductImageSrc(recipe.image_url_1),
    href: `/recipes/${recipe.id}`,
    favoriteKey: null,
    isFavorited: false,
  };
}

async function getUserFavorites(userId: string): Promise<{ target_type: string; target_id: string }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("favorites")
    .select("target_type, target_id")
    .eq("user_id", userId);
  if (error) return [];
  return (data ?? []) as { target_type: string; target_id: string }[];
}

function RailSection({
  title,
  items,
  isLoggedIn,
  moreHref,
}: {
  title: string;
  items: HomeItem[];
  isLoggedIn: boolean;
  moreHref?: string;
}) {
  return (
    <section className="bg-white/70 px-4 py-4 backdrop-blur-[6px] sm:px-6">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[22px] font-semibold text-zinc-800">{title}</h3>
        {moreHref ? (
          <Link
            href={moreHref}
            className="flex items-center gap-1.5 rounded-lg p-1 text-zinc-500 transition hover:bg-zinc-100 hover:text-emerald-700"
            aria-label={`${title}を検索`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="h-2 w-2 rounded-full bg-zinc-400" />
            <span className="h-2 w-2 rounded-full bg-zinc-300" />
          </Link>
        ) : (
          <div className="flex items-center gap-1.5" aria-hidden>
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="h-2 w-2 rounded-full bg-zinc-400" />
            <span className="h-2 w-2 rounded-full bg-zinc-300" />
          </div>
        )}
      </div>
      <div className="home-rail-scroll flex gap-2.5 overflow-x-auto pb-1">
        {items.map((item) => (
          <HomeRailCard key={item.id} item={item} isLoggedIn={isLoggedIn} />
        ))}
      </div>
    </section>
  );
}

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const favList = user ? await getUserFavorites(user.id) : [];
  const productFavIds = new Set(
    favList.filter((f) => f.target_type === "product").map((f) => f.target_id)
  );
  const selectionFavIds = new Set(
    favList.filter((f) => f.target_type === "selection").map((f) => f.target_id)
  );

  const [utaroSelections, newPosts, newRecipes] = await Promise.all([
    getUtaroSelections(),
    getNewPosts(),
    getNewRecipes(),
  ]);
  const pickItems = utaroSelections.map((r) =>
    toHomeItemFromSelection(r, selectionFavIds.has(r.id))
  );
  const newItems = newPosts.map((p) => toHomeItem(p, productFavIds.has(p.id)));
  const recipeItems = newRecipes.map(toHomeItemFromRecipe);
  const isLoggedIn = !!user;

  const fallbackPickItems: HomeItem[] = [
    {
      id: "sample-pick-1",
      name: "ファミマ 国産鶏のサラダ",
      brand: "ファミリーマート",
      protein: 28,
      carbs: 2,
      fat: 3,
      imageUrl: "/placeholders/card-food.svg",
      favoriteKey: null,
      isFavorited: false,
    },
    {
      id: "sample-pick-2",
      name: "サラダチキン プレーン",
      brand: "セブン-イレブン",
      protein: 22,
      carbs: 0,
      fat: 1,
      imageUrl: "/placeholders/card-food.svg",
      favoriteKey: null,
      isFavorited: false,
    },
    {
      id: "sample-pick-3",
      name: "プロテインバー",
      brand: "in バー",
      protein: 15,
      carbs: 20,
      fat: 8,
      imageUrl: "/placeholders/card-food.svg",
      favoriteKey: null,
      isFavorited: false,
    },
    {
      id: "sample-pick-4",
      name: "グリルチキンサラダ",
      brand: "ファミマ",
      protein: 27,
      carbs: 3,
      fat: 2,
      imageUrl: "/placeholders/card-food.svg",
      favoriteKey: null,
      isFavorited: false,
    },
    {
      id: "sample-pick-5",
      name: "低脂質バーガー",
      brand: "バーガーキング",
      protein: 32,
      carbs: 35,
      fat: 12,
      imageUrl: "/placeholders/card-food.svg",
      favoriteKey: null,
      isFavorited: false,
    },
  ];
  const fallbackNewItems: HomeItem[] = [
    {
      id: "sample-new-1",
      name: "高タンパク弁当",
      brand: "ローソン",
      protein: 35,
      carbs: 45,
      fat: 15,
      imageUrl: "/placeholders/card-food.svg",
      favoriteKey: null,
      isFavorited: false,
    },
    {
      id: "sample-new-2",
      name: "ハンバーグ弁当",
      brand: "セブン-イレブン",
      protein: 31,
      carbs: 55,
      fat: 22,
      imageUrl: "/placeholders/card-food.svg",
      favoriteKey: null,
      isFavorited: false,
    },
    {
      id: "sample-new-3",
      name: "牛肉ライト定食",
      brand: "ほっともっと",
      protein: 30,
      carbs: 50,
      fat: 18,
      imageUrl: "/placeholders/card-food.svg",
      favoriteKey: null,
      isFavorited: false,
    },
    {
      id: "sample-new-4",
      name: "グリルチキンサラダ",
      brand: "ファミマ",
      protein: 27,
      carbs: 3,
      fat: 2,
      imageUrl: "/placeholders/card-food.svg",
      favoriteKey: null,
      isFavorited: false,
    },
    {
      id: "sample-new-5",
      name: "鶏むねライス",
      brand: "ファストフード",
      protein: 27,
      carbs: 40,
      fat: 10,
      imageUrl: "/placeholders/card-food.svg",
      favoriteKey: null,
      isFavorited: false,
    },
  ];
  const fallbackRecipeItems: HomeItem[] = [
    {
      id: "sample-recipe-1",
      name: "鶏むねの香草焼き",
      brand: "レシピ",
      protein: 42,
      carbs: 8,
      fat: 6,
      imageUrl: "/placeholders/card-food.svg",
      favoriteKey: null,
      isFavorited: false,
    },
    {
      id: "sample-recipe-2",
      name: "オートミールプロテ粥",
      brand: "レシピ",
      protein: 28,
      carbs: 45,
      fat: 10,
      imageUrl: "/placeholders/card-food.svg",
      favoriteKey: null,
      isFavorited: false,
    },
    {
      id: "sample-recipe-3",
      name: "豆腐と卵の蒸し物",
      brand: "レシピ",
      protein: 22,
      carbs: 4,
      fat: 12,
      imageUrl: "/placeholders/card-food.svg",
      favoriteKey: null,
      isFavorited: false,
    },
    {
      id: "sample-recipe-4",
      name: "サラダチキン丼（ライス少なめ）",
      brand: "レシピ",
      protein: 38,
      carbs: 52,
      fat: 9,
      imageUrl: "/placeholders/card-food.svg",
      favoriteKey: null,
      isFavorited: false,
    },
    {
      id: "sample-recipe-5",
      name: "ギリシャヨーグルトパフェ",
      brand: "レシピ",
      protein: 25,
      carbs: 30,
      fat: 8,
      imageUrl: "/placeholders/card-food.svg",
      favoriteKey: null,
      isFavorited: false,
    },
  ];

  return (
    <main className="min-h-screen bg-zinc-50 pb-20">
      <div className="w-full space-y-4 pt-0 pb-5">
        <section className="relative min-h-[320px] overflow-hidden border-b border-zinc-200 bg-zinc-200 sm:min-h-[380px]">
          {/* 画像をセクション全体に表示（背面） */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://ptbpcsyeuxqmudxzrjkb.supabase.co/storage/v1/object/public/product-images/Home/Utaro%20banner.jpeg"
            alt="筋トレ飯のヒーロー画像"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* 左側にテキストを重ねる（スマホ時は斜め左・コンパクト） */}
          <div className="absolute inset-y-0 left-0 z-10 flex max-w-[260px] flex-col justify-center pl-4 pr-2 py-10 -translate-x-2 -rotate-1 sm:translate-x-0 sm:rotate-0 sm:max-w-md sm:px-10 md:max-w-lg sm:py-14">
            <div className="relative">
              {/* 白い靄（テキスト背後） */}
              <div
                className="pointer-events-none absolute -inset-3 rounded-lg bg-white/35 backdrop-blur-[6px] sm:-inset-4"
                aria-hidden
              />
              <h1 className="relative text-3xl font-bold tracking-tight text-zinc-900 drop-shadow-sm sm:text-4xl md:text-5xl">
                <span className="whitespace-nowrap">おいしく、手軽に</span>
                <br />
                ボディメイク
              </h1>
              <p className="relative mt-2 text-sm font-medium text-zinc-800 drop-shadow-sm">
                フィットネスインフルエンサー
                <br className="md:hidden" />
                「うたろう」監修
              </p>
              <p className="relative mt-4 inline-flex w-fit rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-md">
                今すぐ食べれる高タンパク食品！
              </p>
            </div>
          </div>
        </section>

        <RailSection
          title="Utaro's Picks"
          items={pickItems.length > 0 ? pickItems : fallbackPickItems}
          isLoggedIn={isLoggedIn}
          moreHref="/selections/search"
        />
        <RailSection
          title="New Muscle Meals"
          items={newItems.length > 0 ? newItems : fallbackNewItems}
          isLoggedIn={isLoggedIn}
        />
        <RailSection
          title="New Muscle Recipes"
          items={recipeItems.length > 0 ? recipeItems : fallbackRecipeItems}
          isLoggedIn={isLoggedIn}
        />

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
              className="h-8 w-8 rounded-full bg-white/90 text-zinc-500 shadow backdrop-blur-sm hover:bg-white"
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

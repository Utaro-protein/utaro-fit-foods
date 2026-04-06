import { createClient } from "@/utils/supabase/server";
import type {
  NumericBounds,
  SelectionSearchBounds,
} from "@/types/utaroSelection";
import type { RangeState } from "./productSearchRange";

type ProductSearchListItem = {
  id: string;
  name: string;
  brand: string | null;
  calories: number | null;
  protein: number | null;
  fat: number | null;
  carbs: number | null;
  price: number | null;
  image_url_1: string | null;
};

type NumericRow = {
  calories: number | null;
  protein: number | null;
  fat: number | null;
  carbs: number | null;
  price: number | null;
};

function boundsFromValues(values: number[]): NumericBounds {
  if (values.length === 0) return { min: 0, max: 0 };
  return { min: Math.min(...values), max: Math.max(...values) };
}

function normalizeBounds(b: NumericBounds): NumericBounds {
  return b;
}

function forceZeroMin(b: NumericBounds): NumericBounds {
  return { min: 0, max: Math.max(b.max, 1) };
}

function collectNumeric(rows: NumericRow[], key: keyof NumericRow): number[] {
  const out: number[] = [];
  for (const row of rows) {
    const v = row[key];
    if (v != null && Number.isFinite(Number(v))) {
      out.push(Math.round(Number(v)));
    }
  }
  return out;
}

const DEFAULT_BOUNDS: SelectionSearchBounds = {
  calories: { min: 0, max: 2000 },
  protein: { min: 0, max: 120 },
  fat: { min: 0, max: 120 },
  carbs: { min: 0, max: 200 },
  price: { min: 0, max: 3000 },
};

export async function getProductBounds(): Promise<SelectionSearchBounds> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("calories, protein, fat, carbs, price");

  if (error || !data?.length) {
    return DEFAULT_BOUNDS;
  }

  const rows = data as NumericRow[];
  return {
    calories: forceZeroMin(
      normalizeBounds(boundsFromValues(collectNumeric(rows, "calories")))
    ),
    protein: forceZeroMin(
      normalizeBounds(boundsFromValues(collectNumeric(rows, "protein")))
    ),
    fat: forceZeroMin(normalizeBounds(boundsFromValues(collectNumeric(rows, "fat")))),
    carbs: forceZeroMin(
      normalizeBounds(boundsFromValues(collectNumeric(rows, "carbs")))
    ),
    price: forceZeroMin(
      normalizeBounds(boundsFromValues(collectNumeric(rows, "price")))
    ),
  };
}

function fullRange(lo: number, hi: number, b: NumericBounds): boolean {
  return lo <= b.min && hi >= b.max;
}

function first(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

type ParsedPair = { lo: number; hi: number; apply: boolean };

function parsePair(
  params: Record<string, string | string[] | undefined>,
  keyMin: string,
  keyMax: string,
  bounds: NumericBounds
): ParsedPair {
  const sMin = first(params[keyMin]);
  const sMax = first(params[keyMax]);
  if (sMin === undefined || sMax === undefined || sMin === "" || sMax === "") {
    return { lo: bounds.min, hi: bounds.max, apply: false };
  }
  const lo = Number(sMin);
  const hi = Number(sMax);
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) {
    return { lo: bounds.min, hi: bounds.max, apply: false };
  }
  const a = Math.min(lo, hi);
  const b = Math.max(lo, hi);
  if (fullRange(a, b, bounds)) {
    return { lo: a, hi: b, apply: false };
  }
  return { lo: a, hi: b, apply: true };
}

export function rangesFromSearchParams(
  params: Record<string, string | string[] | undefined>,
  bounds: SelectionSearchBounds
): RangeState {
  const c = parsePair(params, "calMin", "calMax", bounds.calories);
  const p = parsePair(params, "proteinMin", "proteinMax", bounds.protein);
  const f = parsePair(params, "fatMin", "fatMax", bounds.fat);
  const cb = parsePair(params, "carbMin", "carbMax", bounds.carbs);
  const pr = parsePair(params, "priceMin", "priceMax", bounds.price);
  return {
    calories: [c.lo, c.hi],
    protein: [p.lo, p.hi],
    fat: [f.lo, f.hi],
    carbs: [cb.lo, cb.hi],
    price: [pr.lo, pr.hi],
  };
}

export async function searchProducts(
  params: Record<string, string | string[] | undefined>,
  bounds: SelectionSearchBounds
): Promise<ProductSearchListItem[]> {
  const cal = parsePair(params, "calMin", "calMax", bounds.calories);
  const pro = parsePair(params, "proteinMin", "proteinMax", bounds.protein);
  const fat = parsePair(params, "fatMin", "fatMax", bounds.fat);
  const carb = parsePair(params, "carbMin", "carbMax", bounds.carbs);
  const price = parsePair(params, "priceMin", "priceMax", bounds.price);

  const supabase = await createClient();
  let q = supabase
    .from("products")
    .select("id, name, brand, calories, protein, fat, carbs, price, image_url_1, created_at")
    .order("created_at", { ascending: false });

  if (cal.apply) {
    q = q.gte("calories", cal.lo).lte("calories", cal.hi);
  }
  if (pro.apply) {
    q = q.gte("protein", pro.lo).lte("protein", pro.hi);
  }
  if (fat.apply) {
    q = q.gte("fat", fat.lo).lte("fat", fat.hi);
  }
  if (carb.apply) {
    q = q.gte("carbs", carb.lo).lte("carbs", carb.hi);
  }
  if (price.apply) {
    q = q.gte("price", price.lo).lte("price", price.hi);
  }

  const { data, error } = await q;
  if (error) return [];
  return (data ?? []) as ProductSearchListItem[];
}

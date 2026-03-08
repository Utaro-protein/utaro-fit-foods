const PRODUCT_IMAGE_BUCKET = "product-images";
const PUBLIC_OBJECT_SEGMENT = `/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/`;
const HTTP_URL_RE = /^https?:\/\//i;

export function toProductImagePath(raw: string): string {
  const value = raw.trim();
  if (!value) return "";

  if (HTTP_URL_RE.test(value)) {
    const markerIndex = value.indexOf(PUBLIC_OBJECT_SEGMENT);
    if (markerIndex >= 0) {
      return value.slice(markerIndex + PUBLIC_OBJECT_SEGMENT.length).replace(/^\/+/, "");
    }
    return value;
  }

  return value.replace(/^\/+/, "");
}

export function resolveProductImageSrc(
  value: string | null | undefined,
  fallback = "/placeholders/card-food.svg"
): string {
  if (!value) return fallback;
  const normalized = value.trim();
  if (!normalized) return fallback;
  if (HTTP_URL_RE.test(normalized)) return normalized;

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) return fallback;
  return `${baseUrl}/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/${normalized.replace(/^\/+/, "")}`;
}

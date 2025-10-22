// Utility to generate optimized Cloudinary image URLs

export function getCloudinaryUrl(src, options = {}) {
  if (!src || typeof src !== "string" || !src.includes("cloudinary.com"))
    return src;

  const { width = 400, quality = "auto", format = "webp" } = options;

  return src.replace(
    "/upload/",
    `/upload/w_${width},q_${quality},f_${format}/`
  );
}

// Returns srcSet for WebP and JPEG fallback
export function getCloudinarySrcSet(src, width = 400) {
  if (!src || typeof src !== "string" || !src.includes("cloudinary.com"))
    return undefined;
  const webp = getCloudinaryUrl(src, { width, format: "webp" });
  const jpeg = getCloudinaryUrl(src, { width, format: "jpg" });
  return `${webp} 1x, ${jpeg} 2x`;
}

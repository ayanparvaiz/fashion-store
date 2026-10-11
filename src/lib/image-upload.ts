/**
 * Resizes an uploaded image in the browser and returns a compact JPEG data URL,
 * small enough to keep in local storage for the demo. With Firebase this is
 * replaced by an upload to Cloud Storage that returns a URL.
 */
export async function resizeImage(file: File, maxSize = 900, quality = 0.82): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", quality);
}

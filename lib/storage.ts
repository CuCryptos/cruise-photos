import { put, del } from '@vercel/blob';

// Upload image to Vercel Blob
export async function uploadImage(
  file: File | Buffer,
  filename: string,
  options: {
    folder?: string;
  } = {}
): Promise<{ url: string; pathname: string }> {
  const folder = options.folder || 'cruise-photos';
  const pathname = `${folder}/${filename}`;

  const blob = await put(pathname, file, {
    access: 'public',
    addRandomSuffix: true,
  });

  return {
    url: blob.url,
    pathname: blob.pathname,
  };
}

// Delete image from Vercel Blob
export async function deleteImage(url: string): Promise<void> {
  await del(url);
}

// Generate thumbnail URL using Next.js Image optimization
// Vercel automatically optimizes images through Next.js Image component
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getThumbnailUrl(url: string, width = 400): string {
  // Next.js handles optimization at render time via <Image> component
  // Width parameter kept for API compatibility
  return url;
}

// For preview, we'll add a watermark overlay via CSS in the component
// The full URL is the same as the original
export function getPreviewUrl(url: string): string {
  return url;
}

// Download URL is the same as the stored URL
export function getDownloadUrl(url: string): string {
  return url;
}

/**
 * Image processing utilities
 */

/**
 * Remove white background from image (convert to transparent)
 */
export async function removeWhiteBackground(
  imageData: ImageData
): Promise<ImageData> {
  const data = imageData.data
  const threshold = 240 // White threshold

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    // If pixel is close to white, make it transparent
    if (r > threshold && g > threshold && b > threshold) {
      data[i + 3] = 0 // Set alpha to 0
    }
  }

  return imageData
}

/**
 * Convert blob to data URL
 */
export async function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Optimize image for extension (resize and compress)
 */
export async function optimizeImage(
  blob: Blob,
  maxSize: number = 256
): Promise<Blob> {
  const bitmap = await createImageBitmap(blob)

  // Calculate new dimensions
  let width = bitmap.width
  let height = bitmap.height

  if (width > maxSize || height > maxSize) {
    const ratio = Math.min(maxSize / width, maxSize / height)
    width = Math.floor(width * ratio)
    height = Math.floor(height * ratio)
  }

  // Resize using OffscreenCanvas
  const canvas = new OffscreenCanvas(width, height)
  const ctx = canvas.getContext('2d')!

  ctx.drawImage(bitmap, 0, 0, width, height)

  return canvas.convertToBlob({
    type: 'image/webp',
    quality: 0.8,
  })
}

/**
 * Download image from URL
 */
export async function downloadImage(url: string): Promise<Blob> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`)
  }
  return response.blob()
}

// Shrinks a photo in the browser before uploading it, so big phone photos
// (often 5-15 MB) become a few hundred KB. Uploads and the Feed load much faster.

const MAX_SIDE = 1600 // longest side in pixels; plenty for a listing photo
const JPEG_QUALITY = 0.85 // 0 to 1; 0.85 looks the same to the eye but is far smaller

export async function shrinkImage(file) {
  try {
    // Decode the photo into pixels. Also applies the phone's rotation info, so it isn't sideways.
    const image = await createImageBitmap(file)

    // Work out the new size, keeping the same shape. Never make small photos bigger.
    const scale = Math.min(1, MAX_SIDE / Math.max(image.width, image.height))
    const width = Math.round(image.width * scale)
    const height = Math.round(image.height * scale)

    // Draw the photo onto an invisible canvas at the new size.
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    context.fillStyle = 'white' // JPEG has no transparency, so fill see-through PNG areas with white
    context.fillRect(0, 0, width, height)
    context.drawImage(image, 0, 0, width, height)
    image.close()

    // Save the canvas as a JPEG file.
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY))
    if (!blob) return file

    const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg'
    return new File([blob], newName, { type: 'image/jpeg' })
  } catch {
    // If the browser can't read this image, upload the original and let the form's checks handle it.
    return file
  }
}

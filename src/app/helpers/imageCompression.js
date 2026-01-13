import imageCompression from 'browser-image-compression';

export async function compressImage(file) {
  const options = {
    maxSizeMB: 0.8, // Max 800KB
    maxWidthOrHeight: 1200, // Good for e-commerce
    useWebWorker: true,
  };
  try {
    return await imageCompression(file, options);
  } catch (error) {
    return file; // Fallback to original
  }
}
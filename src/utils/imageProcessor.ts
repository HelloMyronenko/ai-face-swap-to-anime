// Simple client-side image processor without external dependencies
export const processImage = async (
  imageDataURL: string, 
  progressCallback: (progress: number) => void
): Promise<string> => {
  // This file is kept for compatibility but the actual processing
  // is now done directly in the ImageProcessor component
  progressCallback(100);
  return imageDataURL;
};

import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { FaMagic, FaDownload } from 'react-icons/fa';

const ImageProcessor: React.FC = () => {
  const {
    sourceImage,
    resultImage,
    setResultImage,
    isProcessing,
    setIsProcessing,
    error,
    setError,
  } = useAppContext();

  const [effect, setEffect] = useState<'grayscale' | 'pixelate' | 'blur'>('grayscale');

  const applyEffect = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, effectType: string) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    switch (effectType) {
      case 'grayscale':
        for (let i = 0; i < data.length; i += 4) {
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          data[i] = gray;     // red
          data[i + 1] = gray; // green
          data[i + 2] = gray; // blue
        }
        ctx.putImageData(imageData, 0, 0);
        break;

      case 'pixelate':
        const pixelSize = 10;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(canvas, 0, 0, canvas.width / pixelSize, canvas.height / pixelSize);
        ctx.drawImage(canvas, 0, 0, canvas.width / pixelSize, canvas.height / pixelSize, 0, 0, canvas.width, canvas.height);
        break;

      case 'blur':
        ctx.filter = 'blur(5px)';
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d')!;
        tempCtx.drawImage(canvas, 0, 0);
        ctx.drawImage(tempCanvas, 0, 0);
        ctx.filter = 'none';
        break;
    }
  };

  const handleProcessImage = async () => {
    if (!sourceImage) return;

    try {
      setIsProcessing(true);
      setError(null);

      // Create image element
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = sourceImage;
      });

      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Apply effect
      applyEffect(canvas, ctx, effect);

      // Convert to data URL
      const processedImage = canvas.toDataURL('image/png');
      setResultImage(processedImage);

    } catch (err: any) {
      setError(err.message || 'Error processing image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `${effect}-effect.png`;
    link.click();
  };

  return (
    <div className="card p-6">
      <h2 className="text-xl font-bold mb-4">Apply Effect</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Effect:
        </label>
        <select
          value={effect}
          onChange={(e) => setEffect(e.target.value as any)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="grayscale">Grayscale</option>
          <option value="pixelate">Pixelate</option>
          <option value="blur">Blur</option>
        </select>
      </div>

      <button
        onClick={handleProcessImage}
        disabled={!sourceImage || isProcessing}
        className="btn btn-primary mb-4 w-full"
      >
        {isProcessing ? (
          <span className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processing...
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <FaMagic className="mr-2" />
            Apply Effect
          </span>
        )}
      </button>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {resultImage && (
        <div className="mt-4">
          <div className="relative">
            <img src={resultImage} alt="Processed" className="w-full rounded shadow" />
            <button
              onClick={handleDownload}
              className="absolute top-2 right-2 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition-colors flex items-center"
            >
              <FaDownload className="mr-1" />
              Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageProcessor;

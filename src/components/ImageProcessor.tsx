import React, { useEffect } from 'react';
import { FaDownload, FaRedo, FaMagic } from 'react-icons/fa';
import { useAppContext } from '../context/AppContext';

const ImageProcessor: React.FC = () => {
  const {
    sourceImage,
    resultImage,
    setResultImage,
    isProcessing,
    setIsProcessing,
    processingProgress,
    setProcessingProgress,
    error,
    setError
  } = useAppContext();

  useEffect(() => {
    if (sourceImage) {
      setResultImage(null);
      setProcessingProgress(0);
      setError(null);
    }
  }, [sourceImage, setResultImage, setProcessingProgress, setError]);

  // Client-side anime filter as fallback
  const applyAnimeFilter = async (imageUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Could not create canvas context'));
            return;
          }
          
          // Draw original image
          ctx.drawImage(img, 0, 0);
          
          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          // Apply anime-style effects
          for (let i = 0; i < data.length; i += 4) {
            // Posterize effect (reduce color depth)
            data[i] = Math.round(data[i] / 32) * 32;     // R
            data[i + 1] = Math.round(data[i + 1] / 32) * 32; // G
            data[i + 2] = Math.round(data[i + 2] / 32) * 32; // B
            
            // Increase contrast
            const factor = 1.2;
            data[i] = Math.min(255, (data[i] - 128) * factor + 128);
            data[i + 1] = Math.min(255, (data[i + 1] - 128) * factor + 128);
            data[i + 2] = Math.min(255, (data[i + 2] - 128) * factor + 128);
            
            // Add slight pink tint for anime feel
            data[i] = Math.min(255, data[i] * 1.05); // Slight red boost
            data[i + 2] = Math.min(255, data[i + 2] * 0.95); // Slight blue reduction
          }
          
          // Put modified image data back
          ctx.putImageData(imageData, 0, 0);
          
          // Apply smoothing
          ctx.globalCompositeOperation = 'source-over';
          ctx.filter = 'blur(0.5px)';
          ctx.drawImage(canvas, 0, 0);
          ctx.filter = 'none';
          
          // Add edge enhancement
          ctx.globalCompositeOperation = 'overlay';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.globalCompositeOperation = 'source-over';
          
          // Convert to data URL
          resolve(canvas.toDataURL('image/png'));
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = imageUrl;
    });
  };

  const handleProcessImage = async () => {
    if (!sourceImage || isProcessing) return;

    try {
      setIsProcessing(true);
      setProcessingProgress(10);
      setError(null);

      // Try DeepAI API first
      console.log('Attempting to use DeepAI API...');
      
      const formData = new FormData();
      let imageBlob: Blob;

      if (sourceImage.startsWith('data:image')) {
        // Convert base64 to Blob
        const byteString = atob(sourceImage.split(',')[1]);
        const mimeString = sourceImage.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        imageBlob = new Blob([ab], { type: mimeString });
      } else {
        // Load from URL
        const response = await fetch(sourceImage);
        imageBlob = await response.blob();
      }

      formData.append('image', imageBlob, 'image.jpg');
      setProcessingProgress(30);

      try {
        // Test with a simple fetch first
        const testResponse = await fetch('https://api.deepai.org/api/toonify', {
          method: 'POST',
          headers: {
            'api-key': 'quickstart-QUdJIGlzIGNvbWluZy4uLi4K' // Test with quickstart key
          },
          body: formData
        });

        setProcessingProgress(60);

        if (!testResponse.ok) {
          console.error('API Response not OK:', testResponse.status, testResponse.statusText);
          throw new Error(`API returned ${testResponse.status}`);
        }

        const contentType = testResponse.headers.get('content-type');
        console.log('Response content-type:', contentType);

        let result;
        if (contentType && contentType.includes('application/json')) {
          result = await testResponse.json();
          console.log('API JSON Response:', result);
          
          if (result.output_url) {
            setProcessingProgress(100);
            setResultImage(result.output_url);
            return;
          }
        } else {
          const textResult = await testResponse.text();
          console.log('API Text Response:', textResult);
        }

        throw new Error('API did not return expected format');
      } catch (apiError) {
        console.error('DeepAI API Error:', apiError);
        console.log('Falling back to client-side filter...');
        
        // Fallback to client-side anime filter
        setProcessingProgress(70);
        const animeResult = await applyAnimeFilter(sourceImage);
        setProcessingProgress(100);
        setResultImage(animeResult);
        
        // Show info that we're using fallback
        setError('Note: Using client-side filter as API is unavailable. Results may vary.');
      }
    } catch (err) {
      console.error('Error processing image:', err);
      setError(err instanceof Error ? err.message : 'Failed to process image');
      setProcessingProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!resultImage) return;
    
    try {
      let downloadUrl = resultImage;
      
      // If it's a cross-origin URL, fetch and create blob
      if (!resultImage.startsWith('data:')) {
        try {
          const response = await fetch(resultImage);
          const blob = await response.blob();
          downloadUrl = window.URL.createObjectURL(blob);
        } catch (e) {
          console.log('Using direct download due to CORS');
        }
      }
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'anime-face.png';
      link.click();
      
      // Clean up blob URL if created
      if (downloadUrl !== resultImage && downloadUrl.startsWith('blob:')) {
        window.URL.revokeObjectURL(downloadUrl);
      }
    } catch (error) {
      console.error('Download error:', error);
      // Fallback to opening in new tab
      window.open(resultImage, '_blank');
    }
  };

  return (
    <div className="card p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Anime Conversion</h2>
      <p className="text-gray-600 mb-6">
        Transform your photo into anime style using AI
      </p>

      <div className="mb-6">
        <button
          onClick={handleProcessImage}
          disabled={!sourceImage || isProcessing}
          className={`btn btn-primary w-full flex items-center justify-center ${
            !sourceImage || isProcessing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isProcessing ? (
            <>
              <div className="mr-2 w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin"></div>
              Processing... {processingProgress}%
            </>
          ) : (
            <>
              <FaMagic className="mr-2" />
              Convert to Anime
            </>
          )}
        </button>
      </div>

      {error && (
        <div className={`${error.includes('Note:') ? 'bg-blue-100 border-blue-400 text-blue-700' : 'bg-red-100 border-red-400 text-red-700'} border px-4 py-3 rounded mb-6`}>
          <p>{error}</p>
        </div>
      )}

      <div className="bg-gray-100 rounded-lg p-4 min-h-[300px] flex items-center justify-center">
        {resultImage ? (
          <div className="relative w-full">
            <img
              src={resultImage}
              alt="Result"
              className="w-full h-auto rounded-lg shadow-md"
            />
            <div className="absolute bottom-4 right-4 flex space-x-2">
              <button
                onClick={handleDownload}
                className="bg-white text-primary-600 p-3 rounded-full shadow-lg hover:bg-primary-50 transition-colors"
                title="Download"
              >
                <FaDownload />
              </button>
              <button
                onClick={handleProcessImage}
                disabled={isProcessing}
                className={`bg-white text-primary-600 p-3 rounded-full shadow-lg hover:bg-primary-50 transition-colors ${
                  isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                title="Regenerate"
              >
                <FaRedo />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            {sourceImage ? (
              isProcessing ? (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 border-t-4 border-primary-600 border-solid rounded-full animate-spin mb-4"></div>
                  <p>Transforming your image...</p>
                  <p className="text-sm mt-2">Progress: {processingProgress}%</p>
                </div>
              ) : (
                <p>Click "Convert to Anime" to start the transformation</p>
              )
            ) : (
              <p>Upload an image first to see the result here</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageProcessor;

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaUpload, FaImage, FaTrash } from 'react-icons/fa';
import { useAppContext } from '../context/AppContext';

const ImageUploader: React.FC = () => {
  const { sourceImage, setSourceImage, isProcessing, setError } = useAppContext();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    // Check file type
    if (!file.type.match('image.*')) {
      setError('Please upload an image file');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      setSourceImage(reader.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  }, [setSourceImage, setError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    disabled: isProcessing,
    maxFiles: 1
  });

  const handleClearImage = () => {
    setSourceImage(null);
  };

  return (
    <div className="card p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Upload Image</h2>
      <p className="text-gray-600 mb-6">
        Upload a photo with a clear face to convert it to anime style
      </p>
      
      {!sourceImage ? (
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <FaUpload className="mx-auto text-4xl text-gray-400 mb-4" />
          <p className="text-gray-600 font-medium">
            {isDragActive
              ? "Drop the image here"
              : "Drag & drop an image here, or click to select"}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Supports JPG, PNG and WebP (max 5MB)
          </p>
        </div>
      ) : (
        <div className="relative">
          <img 
            src={sourceImage} 
            alt="Source" 
            className="w-full h-auto rounded-lg shadow-md" 
          />
          {!isProcessing && (
            <button 
              onClick={handleClearImage}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
              title="Remove image"
            >
              <FaTrash />
            </button>
          )}
        </div>
      )}
      
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Sample Images</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
            'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
            'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg'
          ].map((url, index) => (
            <div 
              key={index}
              className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => !isProcessing && setSourceImage(url)}
            >
              <img 
                src={url} 
                alt={`Sample ${index + 1}`} 
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;

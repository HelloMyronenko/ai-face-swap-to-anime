import React, { ChangeEvent } from 'react';
import { useAppContext } from '../context/AppContext';
import { FaUpload, FaTimes } from 'react-icons/fa';

const ImageUploader: React.FC = () => {
  const { sourceImage, setSourceImage, setResultImage } = useAppContext();

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSourceImage(reader.result as string);
      setResultImage(null); // Clear previous result
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    setSourceImage(null);
    setResultImage(null);
  };

  return (
    <div className="card p-6 mb-6">
      <h2 className="text-xl font-bold mb-2">Upload Image</h2>
      <p className="text-gray-600 mb-4">Select an image to apply effects</p>
      
      <div className="mb-4">
        <label className="cursor-pointer">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange}
            className="hidden"
          />
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <FaUpload className="mx-auto text-4xl text-gray-400 mb-2" />
            <p className="text-gray-600">Click to upload or drag and drop</p>
            <p className="text-sm text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
          </div>
        </label>
      </div>

      {sourceImage && (
        <div className="mt-4 relative">
          <img src={sourceImage} alt="Preview" className="max-h-80 rounded shadow mx-auto" />
          <button
            onClick={handleClear}
            className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded hover:bg-red-700 transition-colors"
            title="Clear image"
          >
            <FaTimes />
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;

import React from 'react';
import { useState, useEffect } from 'react';
import ImageUploader from './components/ImageUploader';
import ImageProcessor from './components/ImageProcessor';
import Header from './components/Header';
import Footer from './components/Footer';
import { AppContextProvider } from './context/AppContext';
import * as tf from '@tensorflow/tfjs';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Initializing...');

  useEffect(() => {
    const initializeTensorFlow = async () => {
      try {
        setLoadingMessage('Loading TensorFlow.js...');
        // Initialize TensorFlow.js
        await tf.ready();
        setLoadingMessage(`TensorFlow.js loaded (${tf.getBackend()} backend)`);
        
        // Simulate loading of other resources
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoadingMessage('Loading AI models...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing TensorFlow:', error);
        setLoadingMessage('Error loading AI models. Please refresh the page.');
        // Still set isLoading to false after a timeout to allow user to see the error
        setTimeout(() => setIsLoading(false), 3000);
      }
    };
    
    initializeTensorFlow();
  }, []);

  return (
    <AppContextProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow container mx-auto px-4 py-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[70vh]">
              <div className="w-24 h-24 border-t-4 border-primary-600 border-solid rounded-full animate-spin"></div>
              <p className="mt-4 text-lg text-gray-700">{loadingMessage}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              <ImageUploader />
              <ImageProcessor />
            </div>
          )}
        </main>
        
        <Footer />
      </div>
    </AppContextProvider>
  );
};

export default App;

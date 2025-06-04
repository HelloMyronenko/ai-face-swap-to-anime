import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AppContextType {
  sourceImage: string | null;
  setSourceImage: (image: string | null) => void;
  resultImage: string | null;
  setResultImage: (image: string | null) => void;
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;
  processingProgress: number;
  setProcessingProgress: (progress: number) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  return (
    <AppContext.Provider
      value={{
        sourceImage,
        setSourceImage,
        resultImage,
        setResultImage,
        isProcessing,
        setIsProcessing,
        processingProgress,
        setProcessingProgress,
        error,
        setError
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};

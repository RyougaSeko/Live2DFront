import { createContext, useContext, useState, ReactNode } from 'react';

interface PersonDetectionContextType {
  isPersonPresent: boolean;
  setIsPersonPresent: (present: boolean) => void;
  shouldPlayNews: boolean;
}

interface PersonDetectionProviderProps {
  children: ReactNode;
}

const PersonDetectionContext = createContext<PersonDetectionContextType | null>(null);

export const PersonDetectionProvider = ({ children }: PersonDetectionProviderProps) => {
  const [isPersonPresent, setIsPersonPresent] = useState(false);

  const shouldPlayNews = !isPersonPresent;

  return (
    <PersonDetectionContext.Provider value={{ 
      isPersonPresent,
      setIsPersonPresent,
      shouldPlayNews
    }}>
      {children}
    </PersonDetectionContext.Provider>
  );
};

export const usePersonDetection = () => {
  const context = useContext(PersonDetectionContext);
  if (!context) {
    throw new Error('usePersonDetection must be used within a PersonDetectionProvider');
  }
  return context;
}; 
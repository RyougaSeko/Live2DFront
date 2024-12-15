import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface PersonDetectionContextType {
  isPersonPresent: boolean;
  setIsPersonPresent: (present: boolean) => void;
}

interface PersonDetectionProviderProps {
  children: ReactNode;
}

const PersonDetectionContext = createContext<PersonDetectionContextType | null>(null);

export const PersonDetectionProvider = ({ children }: PersonDetectionProviderProps) => {
  const [isPersonPresent, setIsPersonPresent] = useState(false);

  // 人検出状態の変更を監視してログ出力
  useEffect(() => {
    console.log('人検出状態:', isPersonPresent ? '検出' : '未検出');
  }, [isPersonPresent]);

  return (
    <PersonDetectionContext.Provider value={{ 
      isPersonPresent,
      setIsPersonPresent,
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
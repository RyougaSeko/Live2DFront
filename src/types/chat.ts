export interface Message {
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  imageUrls?: string[];
} 
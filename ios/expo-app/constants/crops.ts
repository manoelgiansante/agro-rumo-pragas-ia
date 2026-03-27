export interface CropType {
  id: string;
  displayName: string;
  apiName: string;
  icon: string;
  color: string;
}

export const CROPS: CropType[] = [
  { id: 'soja', displayName: 'Soja', apiName: 'Soybean', icon: '🫘', color: '#4CAF50' },
  { id: 'milho', displayName: 'Milho', apiName: 'Corn', icon: '🌽', color: '#FFC107' },
  { id: 'cafe', displayName: 'Café', apiName: 'Coffee', icon: '☕', color: '#795548' },
  { id: 'algodao', displayName: 'Algodão', apiName: 'Cotton', icon: '🏵️', color: '#E0E0E0' },
  { id: 'cana', displayName: 'Cana', apiName: 'Sugarcane', icon: '🎋', color: '#8BC34A' },
  { id: 'trigo', displayName: 'Trigo', apiName: 'Wheat', icon: '🌾', color: '#FF9800' },
  { id: 'arroz', displayName: 'Arroz', apiName: 'Rice', icon: '🍚', color: '#FFEB3B' },
  { id: 'feijao', displayName: 'Feijão', apiName: 'Bean', icon: '🫘', color: '#8D6E63' },
  { id: 'batata', displayName: 'Batata', apiName: 'Potato', icon: '🥔', color: '#A1887F' },
  { id: 'tomate', displayName: 'Tomate', apiName: 'Tomato', icon: '🍅', color: '#F44336' },
  { id: 'mandioca', displayName: 'Mandioca', apiName: 'Cassava', icon: '🥖', color: '#D7CCC8' },
  { id: 'citros', displayName: 'Citros', apiName: 'Citrus', icon: '🍊', color: '#FF9800' },
  { id: 'uva', displayName: 'Uva', apiName: 'Grape', icon: '🍇', color: '#9C27B0' },
  { id: 'banana', displayName: 'Banana', apiName: 'Banana', icon: '🍌', color: '#FFEB3B' },
  { id: 'sorgo', displayName: 'Sorgo', apiName: 'Sorghum', icon: '🌿', color: '#BF360C' },
  { id: 'amendoim', displayName: 'Amendoim', apiName: 'Peanut', icon: '🥜', color: '#D4A76A' },
  { id: 'girassol', displayName: 'Girassol', apiName: 'Sunflower', icon: '🌻', color: '#FDD835' },
  { id: 'cebola', displayName: 'Cebola', apiName: 'Onion', icon: '🧅', color: '#CE93D8' },
];

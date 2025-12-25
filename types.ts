
export interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  expiryDate?: string;
  category: 'produce' | 'dairy' | 'meat' | 'pantry' | 'spice' | 'other';
  freshness?: 'Fresh' | 'Ripe' | 'Expiring Soon' | 'Expired';
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  image?: string;
  cookingTime: number; // in minutes
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: { name: string; amount: string; substituted?: boolean }[];
  instructions: string[];
  nutrition: {
    calories: number;
    protein: string;
    carbs: string;
    fats: string;
  };
  dietaryTags: string[];
  matchScore: number; // 0-100
}

export interface UserPreferences {
  diet: string[];
  allergies: string[];
  servings: number;
}

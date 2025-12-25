
import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  ChevronRight, 
  AlertCircle,
  Tag,
  Scale
} from 'lucide-react';
import { Ingredient } from '../types';

interface PantryProps {
  pantry: Ingredient[];
  setPantry: (items: Ingredient[]) => void;
}

const Pantry: React.FC<PantryProps> = ({ pantry, setPantry }) => {
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['All', 'Produce', 'Dairy', 'Meat', 'Pantry', 'Spice'];

  const removeItem = (id: string) => {
    setPantry(pantry.filter(i => i.id !== id));
  };

  const filteredPantry = pantry.filter(item => {
    const matchesFilter = filter === 'All' || item.category.toLowerCase() === filter.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-10">
      <header className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-serif font-bold text-slate-800">My Pantry</h1>
          <button 
            onClick={() => window.location.hash = '#/scan'}
            className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-orange-500/20 active:scale-90 transition-transform"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Find an ingredient..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${filter === cat ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 border border-slate-100'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="space-y-4">
        {filteredPantry.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Scale className="w-8 h-8" />
            </div>
            <p className="text-slate-500">No items found.</p>
          </div>
        ) : (
          filteredPantry.map((item) => (
            <div key={item.id} className="group bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between hover:border-orange-200 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getCategoryStyles(item.category)}`}>
                  <Tag className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-800">{item.name}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {item.quantity}
                    </span>
                    {item.freshness === 'Expiring Soon' && (
                      <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-orange-500 tracking-wider">
                        <AlertCircle className="w-3 h-3" /> Expiring Soon
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <ChevronRight className="text-slate-300 w-5 h-5" />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="font-bold text-orange-900">Weekly Summary</h4>
          <p className="text-sm text-orange-700">You saved 2kg of food waste this week!</p>
        </div>
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-orange-500 shadow-sm">
          <Scale className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

function getCategoryStyles(category: string) {
  switch (category.toLowerCase()) {
    case 'produce': return 'bg-emerald-50 text-emerald-600';
    case 'dairy': return 'bg-blue-50 text-blue-600';
    case 'meat': return 'bg-rose-50 text-rose-600';
    case 'spice': return 'bg-amber-50 text-amber-600';
    default: return 'bg-slate-50 text-slate-600';
  }
}

export default Pantry;

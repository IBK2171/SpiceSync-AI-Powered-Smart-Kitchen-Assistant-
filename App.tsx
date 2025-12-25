
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  ChefHat, 
  Camera, 
  Refrigerator, 
  Settings, 
  Search, 
  Utensils, 
  Plus, 
  Trash2,
  ChevronRight,
  Clock,
  Zap,
  Flame,
  User,
  ShoppingBag
} from 'lucide-react';
import Home from './pages/Home';
import Scanner from './pages/Scanner';
import Recipes from './pages/Recipes';
import Pantry from './pages/Pantry';
import Profile from './pages/Profile';
import { Ingredient } from './types';

const App: React.FC = () => {
  const [pantry, setPantry] = useState<Ingredient[]>([]);

  useEffect(() => {
    const savedPantry = localStorage.getItem('spicesync_pantry');
    if (savedPantry) {
      setPantry(JSON.parse(savedPantry));
    }
  }, []);

  const updatePantry = (newPantry: Ingredient[]) => {
    setPantry(newPantry);
    localStorage.setItem('spicesync_pantry', JSON.stringify(newPantry));
  };

  const addIngredients = (items: Ingredient[]) => {
    const updated = [...pantry, ...items];
    updatePantry(updated);
  };

  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen bg-slate-50 pb-20 md:pb-0 md:pt-0">
        <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-orange-500 p-2 rounded-lg">
              <ChefHat className="text-white w-5 h-5" />
            </div>
            <span className="font-serif text-xl font-bold tracking-tight text-slate-800">SpiceSync</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/profile" className="p-2 text-slate-500 hover:text-orange-500 transition-colors">
              <User className="w-5 h-5" />
            </Link>
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
          <Routes>
            <Route path="/" element={<Home pantry={pantry} />} />
            <Route path="/scan" element={<Scanner onScanComplete={addIngredients} />} />
            <Route path="/recipes" element={<Recipes pantry={pantry} />} />
            <Route path="/pantry" element={<Pantry pantry={pantry} setPantry={updatePantry} />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 md:static md:border-t-0 md:bg-transparent">
          <div className="flex justify-around items-center h-16 max-w-md mx-auto md:max-w-none md:fixed md:left-4 md:top-20 md:flex-col md:h-auto md:gap-4 md:bg-white md:p-3 md:rounded-2xl md:shadow-lg md:border md:border-slate-100">
            <NavItem to="/" icon={<Utensils />} label="Home" />
            <NavItem to="/pantry" icon={<Refrigerator />} label="Pantry" />
            <div className="relative -top-4 md:top-0">
              <Link 
                to="/scan" 
                className="flex items-center justify-center w-14 h-14 bg-orange-500 text-white rounded-full shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all active:scale-95"
              >
                <Camera className="w-6 h-6" />
              </Link>
            </div>
            <NavItem to="/recipes" icon={<ChefHat />} label="Recipes" />
            <NavItem to="/profile" icon={<Settings />} label="Settings" />
          </div>
        </nav>
      </div>
    </HashRouter>
  );
};

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-orange-500' : 'text-slate-400 hover:text-slate-600'}`}
    >
      <div className="w-6 h-6">
        {React.cloneElement(icon as React.ReactElement, { size: 24, strokeWidth: isActive ? 2.5 : 2 })}
      </div>
      <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
    </Link>
  );
};

export default App;

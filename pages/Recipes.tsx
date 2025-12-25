
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ChefHat, 
  Search, 
  Clock, 
  Users, 
  ArrowRight, 
  Loader2, 
  PlayCircle, 
  Star, 
  Heart, 
  Flame,
  ArrowUpDown,
  CheckCircle2,
  X,
  SlidersHorizontal,
  ChevronDown,
  Filter,
  Check,
  RefreshCw
} from 'lucide-react';
import { Recipe, Ingredient } from '../types';
import { generateRecipesFromIngredients } from '../services/geminiService';

interface RecipesProps {
  pantry: Ingredient[];
}

type SortOption = 'score' | 'time' | 'difficulty';

const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Keto',
  'Dairy-Free',
  'Low Carb'
];

const Recipes: React.FC<RecipesProps> = ({ pantry }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  
  // Sorting and Filtering states
  const [sortBy, setSortBy] = useState<SortOption>('score');
  const [perfectOnly, setPerfectOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiets, setSelectedDiets] = useState<string[]>([]);
  const [isSortOpen, setIsSortOpen] = useState(false);
  
  const sortRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchRecipes = async (diets: string[] = selectedDiets) => {
    if (pantry.length === 0) return;
    setLoading(true);
    try {
      const results = await generateRecipesFromIngredients(pantry, diets);
      setRecipes(results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleDiet = (tag: string) => {
    const newDiets = selectedDiets.includes(tag) 
      ? selectedDiets.filter(t => t !== tag) 
      : [...selectedDiets, tag];
    
    setSelectedDiets(newDiets);
    // If we change dietary preferences, we might want to re-fetch from AI to get better matches
    // But for now we'll do local filtering and provide a refresh button if results are low
  };

  const processedRecipes = useMemo(() => {
    let filtered = [...recipes];

    if (searchQuery) {
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        r.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (perfectOnly) {
      filtered = filtered.filter(r => r.matchScore > 90);
    }

    if (selectedDiets.length > 0) {
      filtered = filtered.filter(r => 
        selectedDiets.every(diet => 
          r.dietaryTags.some(tag => tag.toLowerCase().includes(diet.toLowerCase()))
        )
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === 'score') {
        return (b.matchScore || 0) - (a.matchScore || 0);
      }
      if (sortBy === 'time') {
        return a.cookingTime - b.cookingTime;
      }
      if (sortBy === 'difficulty') {
        const diffMap: Record<string, number> = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
        return (diffMap[a.difficulty] || 0) - (diffMap[b.difficulty] || 0);
      }
      return 0;
    });

    return filtered;
  }, [recipes, sortBy, perfectOnly, searchQuery, selectedDiets]);

  const activeFiltersCount = (perfectOnly ? 1 : 0) + selectedDiets.length;

  return (
    <div className="space-y-8 pb-10">
      <header className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-serif font-bold text-slate-900 tracking-tight">Recipe Inspiration</h1>
            <p className="text-slate-500 text-sm mt-1">AI-suggested meals based on your available ingredients</p>
          </div>
          <button 
            onClick={() => fetchRecipes()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-orange-500 hover:text-orange-500 transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Regenerate Ideas
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search by name, cuisine, or ingredient..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all shadow-sm"
              />
            </div>

            <div className="relative" ref={sortRef}>
              <button 
                onClick={() => setIsSortOpen(!isSortOpen)}
                className={`h-full px-6 py-3.5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-3 min-w-[200px] hover:border-orange-200 transition-all shadow-sm ${isSortOpen ? 'ring-4 ring-orange-500/10 border-orange-500' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-bold text-slate-700">
                    {sortBy === 'score' ? 'Highest Match' : sortBy === 'time' ? 'Shortest First' : 'Easiest First'}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
              </button>

              {isSortOpen && (
                <div className="absolute right-0 top-full mt-2 w-full min-w-[220px] bg-white border border-slate-100 rounded-2xl shadow-2xl z-[60] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <SortItem active={sortBy === 'score'} label="Highest Match" onClick={() => { setSortBy('score'); setIsSortOpen(false); }} />
                  <SortItem active={sortBy === 'time'} label="Shortest First" onClick={() => { setSortBy('time'); setIsSortOpen(false); }} />
                  <SortItem active={sortBy === 'difficulty'} label="Easiest First" onClick={() => { setSortBy('difficulty'); setIsSortOpen(false); }} />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400">
                <Filter className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Dietary Preferences</span>
              </div>
              {activeFiltersCount > 0 && (
                <button 
                  onClick={() => { setPerfectOnly(false); setSelectedDiets([]); }}
                  className="text-orange-500 hover:text-orange-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors"
                >
                  <X className="w-3 h-3" /> Clear All
                </button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 items-center">
              <FilterChip 
                active={perfectOnly} 
                onClick={() => setPerfectOnly(!perfectOnly)}
                icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                label="Perfect Match"
                variant="special"
              />
              <div className="w-[1px] h-6 bg-slate-200 mx-1 hidden sm:block" />
              {DIETARY_OPTIONS.map(diet => (
                <FilterChip 
                  key={diet} 
                  active={selectedDiets.includes(diet)} 
                  onClick={() => toggleDiet(diet)}
                  label={diet}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-slate-100 border-t-orange-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <ChefHat className="w-8 h-8 text-slate-900" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <p className="font-bold text-slate-900 text-xl">Creating your custom menu...</p>
            <p className="text-sm text-slate-400">Gemini is finding the best recipes for your diet</p>
          </div>
        </div>
      ) : processedRecipes.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-slate-200 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
            <ChefHat className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-slate-900">No recipes found</h3>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto px-6 leading-relaxed">
            {recipes.length === 0 
              ? "Your pantry is empty. Scan your kitchen to unlock recipe suggestions!" 
              : "We couldn't find matches for these dietary filters in the current list."}
          </p>
          <div className="mt-8 flex justify-center gap-4">
            {selectedDiets.length > 0 && (
               <button 
               onClick={() => fetchRecipes()}
               className="px-8 py-3.5 bg-orange-500 text-white font-bold rounded-2xl shadow-xl shadow-orange-500/20 active:scale-95 transition-all hover:bg-orange-600 flex items-center gap-2"
             >
               <RefreshCw className="w-4 h-4" /> Refetch for {selectedDiets[0]}...
             </button>
            )}
            <button 
              onClick={() => {setPerfectOnly(false); setSearchQuery(''); setSelectedDiets([]); setSortBy('score');}}
              className="px-8 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
            >
              Clear Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {processedRecipes.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} onClick={() => setSelectedRecipe(recipe)} />
          ))}
        </div>
      )}

      {selectedRecipe && (
        <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      )}
    </div>
  );
};

const SortItem: React.FC<{ active: boolean; label: string; onClick: () => void }> = ({ active, label, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full text-left px-5 py-3.5 text-sm font-bold flex items-center justify-between transition-colors ${active ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-50'}`}
  >
    {label}
    {active && <Check className="w-4 h-4" />}
  </button>
);

const FilterChip: React.FC<{ active: boolean; label: string; onClick: () => void; icon?: React.ReactNode; variant?: 'default' | 'special' }> = ({ active, label, onClick, icon, variant = 'default' }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all border-2 ${active 
      ? variant === 'special' ? 'bg-emerald-500 border-emerald-500 text-white shadow-md' : 'bg-slate-900 border-slate-900 text-white shadow-md'
      : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200 hover:text-slate-800'}`}
  >
    {icon}
    {label}
  </button>
);

const RecipeCard: React.FC<{ recipe: Recipe; onClick: () => void }> = ({ recipe, onClick }) => (
  <div 
    onClick={onClick}
    className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 cursor-pointer hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500"
  >
    <div className="relative h-64 overflow-hidden">
      <img 
        src={recipe.image} 
        alt={recipe.title} 
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute top-5 left-5">
        <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl backdrop-blur-md ${recipe.matchScore > 90 ? 'bg-emerald-500 text-white' : 'bg-white/95 text-slate-900'}`}>
          {recipe.matchScore}% Compatibility
        </div>
      </div>
      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
        <div className="text-white space-y-1.5">
          <div className="flex flex-wrap gap-2 mb-2">
            {recipe.dietaryTags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2.5 py-0.5 bg-orange-500 text-white rounded-md text-[9px] font-black uppercase tracking-widest">
                {tag}
              </span>
            ))}
          </div>
          <h3 className="font-bold text-2xl leading-tight text-white group-hover:text-orange-400 transition-colors">{recipe.title}</h3>
          <div className="flex gap-4 items-center mt-2 text-white/80">
            <span className="flex items-center gap-1.5 text-xs font-bold">
              <Clock className="w-3.5 h-3.5" /> {recipe.cookingTime}m
            </span>
            <span className="flex items-center gap-1.5 text-xs font-bold">
              <Flame className="w-3.5 h-3.5" /> {recipe.nutrition.calories} kcal
            </span>
          </div>
        </div>
        <div className="bg-white text-slate-900 p-3.5 rounded-2xl shadow-xl group-hover:bg-orange-500 group-hover:text-white transition-all transform group-hover:rotate-12 group-active:scale-90">
          <ArrowRight className="w-5 h-5" />
        </div>
      </div>
    </div>
    <div className="p-7 space-y-5">
      <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed italic opacity-80 group-hover:opacity-100 transition-opacity">
        "{recipe.description}"
      </p>
      <div className="flex items-center justify-between border-t border-slate-50 pt-5">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2.5">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-50 flex items-center justify-center overflow-hidden">
                <Users className="w-3.5 h-3.5 text-slate-300" />
              </div>
            ))}
          </div>
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">SpiceSync Users Love</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span className="text-sm font-black text-slate-900">4.9</span>
        </div>
      </div>
    </div>
  </div>
);

const RecipeModal: React.FC<{ recipe: Recipe; onClose: () => void }> = ({ recipe, onClose }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'steps'>('info');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl max-h-[92vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-8 duration-500">
        <div className="relative h-80 flex-shrink-0">
          <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 w-12 h-12 bg-black/20 backdrop-blur-2xl rounded-2xl flex items-center justify-center text-white border border-white/30 hover:bg-black/40 transition-all hover:scale-110 active:scale-95 z-20"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 p-8 pb-4">
            <div className="flex items-center gap-2 mb-4">
               <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg ${recipe.matchScore > 90 ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white'}`}>
                {recipe.matchScore}% Match
               </span>
               {recipe.dietaryTags.map(tag => (
                 <span key={tag} className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
                   {tag}
                 </span>
               ))}
            </div>
            <h2 className="text-4xl font-serif font-bold text-slate-900 tracking-tight leading-none">{recipe.title}</h2>
          </div>
        </div>

        <div className="flex border-b border-slate-100 px-8 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <TabButton active={activeTab === 'info'} onClick={() => setActiveTab('info')} label="Overview" />
          <TabButton active={activeTab === 'steps'} onClick={() => setActiveTab('steps')} label="Cooking Guide" />
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-12 no-scrollbar">
          {activeTab === 'info' ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                <Stat icon={<Clock className="w-4 h-4" />} label="Prep" value={`${recipe.cookingTime}m`} />
                <Stat icon={<ChefHat className="w-4 h-4" />} label="Skill" value={recipe.difficulty} />
                <Stat icon={<Flame className="w-4 h-4" />} label="Energy" value={`${recipe.nutrition.calories}cal`} />
                <Stat icon={<Users className="w-4 h-4" />} label="Serves" value="2-3" />
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-orange-500 rounded-full" />
                  <h4 className="font-serif text-2xl font-bold text-slate-900">Ingredients</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recipe.ingredients.map((ing, idx) => (
                    <div key={idx} className="group flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-orange-200 hover:bg-white transition-all shadow-sm hover:shadow-md">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">{ing.name}</span>
                        {ing.substituted && (
                          <span className="text-[10px] text-orange-500 font-black uppercase tracking-tighter flex items-center gap-1 mt-0.5">
                            <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Substitution Suggested
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-black text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-inner">{ing.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-6 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-blue-500 rounded-full" />
                  <h4 className="font-serif text-2xl font-bold text-slate-900">Nutrition Profile</h4>
                </div>
                <div className="grid grid-cols-3 gap-4">
                   <NutriCard label="Protein" value={recipe.nutrition.protein} color="blue" />
                   <NutriCard label="Carbs" value={recipe.nutrition.carbs} color="orange" />
                   <NutriCard label="Fats" value={recipe.nutrition.fats} color="amber" />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-10 pb-8">
              <div className="flex items-center justify-between bg-orange-50 p-7 rounded-[2rem] border border-orange-100 shadow-inner">
                <div className="space-y-1">
                  <h4 className="font-bold text-orange-900">Guided Cooking Mode</h4>
                  <p className="text-xs text-orange-700 font-medium">Hands-free voice assistance is calibrated and ready.</p>
                </div>
                <button className="flex items-center gap-2.5 bg-orange-500 text-white px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-500/30 hover:bg-orange-600 active:scale-95 transition-all">
                  <PlayCircle className="w-5 h-5" /> Start
                </button>
              </div>
              <div className="space-y-12">
                {recipe.instructions.map((step, idx) => (
                  <div key={idx} className="flex gap-8 relative group">
                    {idx !== recipe.instructions.length - 1 && (
                      <div className="absolute top-14 bottom-[-48px] left-7 w-[2px] bg-slate-100 group-hover:bg-orange-100 transition-colors" />
                    )}
                    <div className="flex-shrink-0 w-14 h-14 bg-slate-900 text-white rounded-[1.25rem] flex items-center justify-center font-black text-xl relative z-10 shadow-2xl group-hover:bg-orange-500 transition-all group-hover:scale-110">
                      {idx + 1}
                    </div>
                    <div className="pt-2.5 space-y-3 flex-1">
                      <p className="text-slate-800 leading-relaxed font-semibold text-lg tracking-tight">
                        {step}
                      </p>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-100">Step Tip</span>
                        <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-100">Smart Timer</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-8 border-t border-slate-100 bg-white/95 backdrop-blur-md flex gap-5">
          <button className="flex-[3] bg-orange-500 hover:bg-orange-600 text-white font-black py-5 rounded-[1.5rem] flex items-center justify-center gap-3 shadow-2xl shadow-orange-500/30 active:scale-[0.98] transition-all text-xl tracking-tight">
            Mark as Cooked
            <CheckCircle2 className="w-7 h-7" />
          </button>
          <button className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100 transition-all active:scale-90 group">
            <Heart className="w-8 h-8 group-hover:fill-rose-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; label: string }> = ({ active, onClick, label }) => (
  <button 
    onClick={onClick}
    className={`flex-1 py-6 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${active ? 'text-orange-500' : 'text-slate-400'}`}
  >
    {label}
    {active && <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-orange-500 rounded-full mx-6" />}
  </button>
);

const Stat: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 space-y-2 hover:bg-white hover:border-orange-200 transition-all group shadow-sm hover:shadow-md">
    <div className="flex items-center gap-2 text-slate-400 group-hover:text-orange-500 transition-colors">
      {icon}
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <div className="text-sm font-black text-slate-900">{value}</div>
  </div>
);

const NutriCard: React.FC<{ label: string; value: string; color: 'blue' | 'orange' | 'amber' }> = ({ label, value, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100 shadow-blue-500/5',
    orange: 'bg-orange-50 text-orange-600 border-orange-100 shadow-orange-500/5',
    amber: 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-500/5'
  };
  
  return (
    <div className={`p-5 rounded-[1.5rem] border text-center space-y-1.5 shadow-lg ${colors[color]}`}>
      <div className="text-[9px] font-black uppercase tracking-widest opacity-60">{label}</div>
      <div className="text-xl font-black tracking-tight">{value}</div>
    </div>
  );
};

export default Recipes;

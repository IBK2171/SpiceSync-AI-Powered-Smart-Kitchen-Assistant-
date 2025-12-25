
import React from 'react';
import { Link } from 'react-router-dom';
import { Refrigerator, ChefHat, Sparkles, ArrowRight, Clock, Flame } from 'lucide-react';
import { Ingredient } from '../types';

interface HomeProps {
  pantry: Ingredient[];
}

const Home: React.FC<HomeProps> = ({ pantry }) => {
  const expiringSoon = pantry.filter(i => i.freshness === 'Expiring Soon').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section className="relative overflow-hidden bg-slate-900 rounded-3xl p-8 text-white">
        <div className="relative z-10 max-w-xl space-y-4">
          <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight">
            What's in your <span className="text-orange-400">kitchen</span> today?
          </h1>
          <p className="text-slate-300 text-lg">
            Snap a photo of your fridge or pantry, and let AI craft the perfect meal for you.
          </p>
          <div className="pt-4 flex flex-wrap gap-4">
            <Link 
              to="/scan" 
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-xl shadow-orange-900/20"
            >
              Start Scanning
              <Sparkles className="w-5 h-5" />
            </Link>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-20 pointer-events-none hidden md:block">
          <img 
            src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800" 
            alt="Cooking background" 
            className="object-cover w-full h-full"
          />
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-slate-500 text-sm font-medium">Ingredients Logged</p>
            <p className="text-3xl font-bold text-slate-800">{pantry.length}</p>
          </div>
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
            <Refrigerator className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-slate-500 text-sm font-medium">Expiring Soon</p>
            <p className="text-3xl font-bold text-orange-500">{expiringSoon}</p>
          </div>
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-slate-500 text-sm font-medium">Calories Today</p>
            <p className="text-3xl font-bold text-emerald-500">1,240</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
            <Flame className="w-6 h-6" />
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-serif font-bold text-slate-800">Quick Recommendations</h2>
          <Link to="/recipes" className="text-orange-500 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
            See all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RecommendationCard 
            title="Mediterranean Salad"
            time="15 min"
            level="Easy"
            tags={['Vegetarian', 'Quick']}
            image="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=400"
          />
          <RecommendationCard 
            title="Spiced Chicken Wrap"
            time="25 min"
            level="Medium"
            tags={['Protein Rich', 'Spicy']}
            image="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400"
          />
        </div>
      </section>
    </div>
  );
};

const RecommendationCard: React.FC<{ 
  title: string; 
  time: string; 
  level: string; 
  tags: string[]; 
  image: string;
}> = ({ title, time, level, tags, image }) => (
  <div className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className="relative h-48 overflow-hidden">
      <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm">
        {level}
      </div>
    </div>
    <div className="p-5 space-y-3">
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-lg text-slate-800">{title}</h3>
        <span className="flex items-center gap-1 text-slate-500 text-sm">
          <Clock className="w-4 h-4" /> {time}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] uppercase font-bold tracking-wider">
            {tag}
          </span>
        ))}
      </div>
    </div>
  </div>
);

export default Home;

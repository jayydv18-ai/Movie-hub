import React, { useState, useEffect } from 'react';
import { Layers, Film, Tv, ArrowRight, Loader2 } from 'lucide-react';
import { Category } from '../types';
import { api } from '../services/api';

interface CategoriesPageProps {
  onSelectCategory: (genreName: string) => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({ onSelectCategory }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await api.getCategories();
        setCategories(res.categories || []);
      } catch (err) {
        console.error('Failed to load categories', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Categories & Genres
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse through movie genres and themes configured by administrators.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="h-44 bg-slate-900/80 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(cat => (
            <div
              key={cat.id}
              id={`cat-card-${cat.slug}`}
              onClick={() => onSelectCategory(cat.name)}
              className="group relative h-48 rounded-2xl overflow-hidden cursor-pointer border border-slate-800 hover:border-cyan-500/80 shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Background Image */}
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-black/20 p-5 flex flex-col justify-end">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition">
                    {cat.name}
                  </h3>
                  <div className="w-8 h-8 rounded-full bg-slate-900/80 border border-slate-700 flex items-center justify-center text-slate-300 group-hover:text-cyan-400 group-hover:border-cyan-500 transition">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 mt-1 mb-2">
                  {cat.description || 'Explore curated cinema in this genre.'}
                </p>

                <div className="flex items-center gap-3 text-xs text-slate-400 font-medium pt-2 border-t border-slate-800/80">
                  <span className="flex items-center gap-1">
                    <Film className="w-3.5 h-3.5 text-cyan-400" />
                    {cat.movieCount || 0} Movies
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Tv className="w-3.5 h-3.5 text-purple-400" />
                    {cat.seriesCount || 0} Series
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

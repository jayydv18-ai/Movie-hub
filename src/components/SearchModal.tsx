import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Film, Tv, Star, ArrowRight, Loader2 } from 'lucide-react';
import { SearchResultItem } from '../types';
import { api } from '../services/api';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMovie: (slug: string) => void;
  onSelectSeries: (slug: string) => void;
  onSearchAll: (query: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectMovie,
  onSelectSeries,
  onSearchAll,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      setQuery('');
      setResults([]);
      setSuggestions([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const data = await api.search(query.trim());
        setResults(data.results || []);
        setSuggestions(data.suggestions || []);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter' && query.trim()) {
      onSearchAll(query.trim());
      onClose();
    }
  };

  const handleItemClick = (item: SearchResultItem) => {
    if (item.type === 'series') {
      onSelectSeries(item.slug);
    } else {
      onSelectMovie(item.slug);
    }
    onClose();
  };

  const handleSuggestionClick = (sug: string) => {
    const clean = sug.replace('Genre: ', '');
    setQuery(clean);
  };

  if (!isOpen) return null;

  return (
    <div
      id="search-modal-backdrop"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        id="search-modal-container"
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/70 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Header */}
        <div className="flex items-center px-4 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/70 gap-3">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            id="main-search-input"
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search movies, series, actors, directors, genres..."
            className="w-full bg-transparent text-slate-100 placeholder-slate-400 text-base sm:text-lg focus:outline-none"
          />
          {loading && <Loader2 className="w-5 h-5 text-cyan-400 animate-spin shrink-0" />}
          {query && !loading && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs text-slate-400 hover:text-white border border-slate-700 rounded-md bg-slate-800/60"
          >
            ESC
          </button>
        </div>

        {/* Suggestions Bar */}
        {suggestions.length > 0 && (
          <div className="px-4 sm:px-6 py-2.5 bg-slate-950/40 border-b border-slate-800/60 flex items-center gap-2 overflow-x-auto hide-scrollbar">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Suggested:</span>
            {suggestions.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(sug)}
                className="px-2.5 py-0.5 rounded-full text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 whitespace-nowrap transition border border-slate-700/50"
              >
                {sug}
              </button>
            ))}
          </div>
        )}

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-slate-800/60">
          {query && results.length === 0 && !loading && (
            <div className="text-center py-12 text-slate-400">
              <Film className="w-10 h-10 mx-auto text-slate-600 mb-3" />
              <p className="font-medium text-slate-300">No matching titles found in Movie Hub</p>
              <p className="text-xs text-slate-500 mt-1">
                Try searching for a different keyword or genre.
              </p>
            </div>
          )}

          {!query && (
            <div className="text-center py-8 text-slate-500 text-sm">
              Type to search our complete local catalog of curated movies and web series.
            </div>
          )}

          {results.map(item => (
            <div
              key={`${item.type}-${item.id}`}
              onClick={() => handleItemClick(item)}
              className="group py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/40 px-3 -mx-3 rounded-lg transition"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-12 h-16 object-cover rounded-md bg-slate-950 shrink-0 border border-slate-800"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-100 group-hover:text-cyan-400 truncate text-sm sm:text-base transition">
                      {item.title}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-semibold uppercase rounded tracking-wider ${
                        item.type === 'series'
                          ? 'bg-purple-900/60 text-purple-300 border border-purple-700/50'
                          : 'bg-cyan-900/60 text-cyan-300 border border-cyan-700/50'
                      }`}
                    >
                      {item.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{item.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {item.rating && (
                  <div className="flex items-center gap-1 text-xs text-amber-400 font-medium">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{item.rating.toFixed(1)}</span>
                  </div>
                )}
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition" />
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        {query && results.length > 0 && (
          <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-center">
            <button
              onClick={() => {
                onSearchAll(query);
                onClose();
              }}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1"
            >
              View all results in explore mode <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

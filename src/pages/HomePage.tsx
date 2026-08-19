import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Clock, Flame, Tv, Award, ArrowRight, Layers, Play } from 'lucide-react';
import { Movie, Series, Category, Banner } from '../types';
import { api } from '../services/api';
import { HeroBanner } from '../components/HeroBanner';
import { MovieCard } from '../components/MovieCard';
import { SeriesCard } from '../components/SeriesCard';

interface HomePageProps {
  onSelectMovie: (movie: Movie) => void;
  onSelectSeries: (series: Series) => void;
  onPlayTrailer: (item: Movie | Series) => void;
  onNavigate: (view: string, data?: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSelectMovie,
  onSelectSeries,
  onPlayTrailer,
  onNavigate,
}) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoading(true);
        const [banRes, movRes, serRes, catRes] = await Promise.all([
          api.getBanners().catch(() => ({ banners: [] })),
          api.getMovies().catch(() => ({ movies: [], total: 0 })),
          api.getSeries().catch(() => ({ series: [], total: 0 })),
          api.getCategories().catch(() => ({ categories: [] })),
        ]);

        setBanners(banRes.banners || []);
        setMovies(movRes.movies || []);
        setSeriesList(serRes.series || []);
        setCategories(catRes.categories || []);
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const featuredMovies = movies.filter(m => m.featured);
  const trendingMovies = movies.filter(m => m.trending);
  const popularMovies = movies.filter(m => m.popular);
  const latestMovies = [...movies].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const topRatedMovies = [...movies].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  const trendingSeries = seriesList.filter(s => s.trending || s.featured);

  if (loading) {
    return (
      <div className="space-y-12 animate-pulse">
        <div className="w-full h-[520px] bg-slate-900/80 rounded-2xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="h-6 w-48 bg-slate-800 rounded" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(n => (
              <div key={n} className="aspect-[2/3] bg-slate-900 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 sm:space-y-16 pb-12">
      {/* 1. Hero Banner Carousel */}
      <HeroBanner
        banners={banners}
        featuredMovies={featuredMovies.length > 0 ? featuredMovies : movies}
        onSelectMovie={onSelectMovie}
        onPlayTrailer={onPlayTrailer}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* 2. Trending Movies Section */}
        {trendingMovies.length > 0 && (
          <section id="trending-movies-section" className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#C9A66B]">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif italic text-white tracking-wide">
                    Trending Cinema
                  </h2>
                  <p className="text-xs text-white/50">Most sought-after titles in the archive</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('trending')}
                className="text-[10px] uppercase tracking-widest text-[#C9A66B] font-bold hover:text-white flex items-center gap-1 transition"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
              {trendingMovies.slice(0, 5).map(movie => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onSelect={onSelectMovie}
                  onPlayTrailer={onPlayTrailer}
                />
              ))}
            </div>
          </section>
        )}

        {/* 3. Latest Added Movies */}
        <section id="latest-movies-section" className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#C9A66B]">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-serif italic text-white tracking-wide">
                  Latest Additions
                </h2>
                <p className="text-xs text-white/50">Newly curated releases in the vault</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('movies', { sort: 'latest' })}
              className="text-[10px] uppercase tracking-widest text-[#C9A66B] font-bold hover:text-white flex items-center gap-1 transition"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
            {latestMovies.slice(0, 5).map(movie => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onSelect={onSelectMovie}
                onPlayTrailer={onPlayTrailer}
              />
            ))}
          </div>
        </section>

        {/* 4. Web Series Spotlight */}
        {seriesList.length > 0 && (
          <section id="web-series-section" className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#C9A66B]">
                  <Tv className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif italic text-white tracking-wide">
                    Web Series & Sagas
                  </h2>
                  <p className="text-xs text-white/50">Multi-season episodic masterworks</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('series')}
                className="text-[10px] uppercase tracking-widest text-[#C9A66B] font-bold hover:text-white flex items-center gap-1 transition"
              >
                <span>All Series</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-5">
              {seriesList.slice(0, 4).map(series => (
                <SeriesCard
                  key={series.id}
                  series={series}
                  onSelect={onSelectSeries}
                  onPlayTrailer={onPlayTrailer}
                />
              ))}
            </div>
          </section>
        )}

        {/* 5. Popular Movies */}
        {popularMovies.length > 0 && (
          <section id="popular-movies-section" className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#C9A66B]">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif italic text-white tracking-wide">
                    Popular Masterpieces
                  </h2>
                  <p className="text-xs text-white/50">Audience favorites with highest acclaim</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('movies', { sort: 'popular' })}
                className="text-[10px] uppercase tracking-widest text-[#C9A66B] font-bold hover:text-white flex items-center gap-1 transition"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
              {popularMovies.slice(0, 5).map(movie => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onSelect={onSelectMovie}
                  onPlayTrailer={onPlayTrailer}
                />
              ))}
            </div>
          </section>
        )}

        {/* 6. Top Rated Movies */}
        <section id="top-rated-section" className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#C9A66B]">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-serif italic text-white tracking-wide">
                  Critically Acclaimed
                </h2>
                <p className="text-xs text-white/50">Highest rated selections</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('movies', { sort: 'rating' })}
              className="text-[10px] uppercase tracking-widest text-[#C9A66B] font-bold hover:text-white flex items-center gap-1 transition"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
            {topRatedMovies.slice(0, 5).map(movie => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onSelect={onSelectMovie}
                onPlayTrailer={onPlayTrailer}
              />
            ))}
          </div>
        </section>

        {/* 7. Explore Genres Grid */}
        <section id="genres-explorer-section" className="space-y-5">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#C9A66B]">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-serif italic text-white tracking-wide">
                  Explore by Genre
                </h2>
                <p className="text-xs text-white/50">Browse cinema across curated themes</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('categories')}
              className="text-[10px] uppercase tracking-widest text-[#C9A66B] font-bold hover:text-white flex items-center gap-1 transition"
            >
              <span>All Genres</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 sm:gap-4">
            {categories.map(cat => (
              <div
                key={cat.id}
                id={`home-cat-${cat.slug}`}
                onClick={() => onNavigate('movies', { genre: cat.name })}
                className="group relative h-28 sm:h-32 rounded-xl overflow-hidden cursor-pointer border border-white/10 hover:border-[#C9A66B]/60 shadow-lg transition-all duration-300 hover:scale-[1.02]"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent flex flex-col justify-end p-3.5">
                  <h3 className="font-serif italic font-bold text-white text-base group-hover:text-[#C9A66B] transition">
                    {cat.name}
                  </h3>
                  <span className="text-[10px] uppercase tracking-wider text-white/40 font-medium">
                    {cat.totalCount !== undefined ? `${cat.totalCount} Titles` : 'Browse'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

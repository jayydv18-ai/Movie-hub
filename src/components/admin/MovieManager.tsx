import React, { useState, useEffect } from 'react';
import {
  Film,
  Plus,
  Search,
  Edit2,
  Trash2,
  Star,
  Check,
  X,
  Upload,
  Sparkles,
  TrendingUp,
  Flame,
  AlertCircle,
  Loader2,
  Eye,
  UserPlus,
} from 'lucide-react';
import { Movie, Category, CastMember } from '../../types';
import { api } from '../../services/api';

interface MovieManagerProps {
  initialOpenAdd?: boolean;
  onCloseAdd?: () => void;
}

export const MovieManager: React.FC<MovieManagerProps> = ({
  initialOpenAdd = false,
  onCloseAdd,
}) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(initialOpenAdd);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [deleteConfirmMovie, setDeleteConfirmMovie] = useState<Movie | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [releaseDate, setReleaseDate] = useState('2025-01-01');
  const [releaseYear, setReleaseYear] = useState(2025);
  const [runtime, setRuntime] = useState(120);
  const [language, setLanguage] = useState('English');
  const [country, setCountry] = useState('United States');
  const [rating, setRating] = useState(8.5);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Action', 'Sci-Fi']);
  const [poster, setPoster] = useState('');
  const [backdrop, setBackdrop] = useState('');
  const [trailerUrl, setTrailerUrl] = useState('');
  const [officialWatchUrl, setOfficialWatchUrl] = useState('');
  const [director, setDirector] = useState('');
  const [writer, setWriter] = useState('');
  const [producer, setProducer] = useState('');
  const [featured, setFeatured] = useState(false);
  const [trending, setTrending] = useState(false);
  const [popular, setPopular] = useState(false);
  const [published, setPublished] = useState(true);
  const [cast, setCast] = useState<CastMember[]>([
    { name: '', role: '', avatar: '' },
  ]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [movRes, catRes] = await Promise.all([
        api.getMovies(),
        api.getCategories(),
      ]);
      setMovies(movRes.movies || []);
      setCategories(catRes.categories || []);
    } catch (err) {
      console.error('Failed to load movies data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (initialOpenAdd) {
      handleOpenCreate();
    }
  }, [initialOpenAdd]);

  const handleOpenCreate = () => {
    setEditingMovie(null);
    setTitle('');
    setSlug('');
    setDescription('');
    setReleaseDate('2025-06-15');
    setReleaseYear(2025);
    setRuntime(124);
    setLanguage('English');
    setCountry('United States');
    setRating(8.5);
    setSelectedGenres(['Action', 'Sci-Fi']);
    setPoster('https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80');
    setBackdrop('https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1600&auto=format&fit=crop&q=80');
    setTrailerUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    setOfficialWatchUrl('https://www.netflix.com');
    setDirector('Christopher Nolan');
    setWriter('Jonathan Nolan');
    setProducer('Syncopy / Warner Bros.');
    setFeatured(false);
    setTrending(true);
    setPopular(true);
    setPublished(true);
    setCast([
      { name: 'Leonardo DiCaprio', role: 'Dom Cobb', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80' },
      { name: 'Joseph Gordon-Levitt', role: 'Arthur', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80' }
    ]);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (movie: Movie) => {
    setEditingMovie(movie);
    setTitle(movie.title);
    setSlug(movie.slug);
    setDescription(movie.description);
    setReleaseDate(movie.releaseDate);
    setReleaseYear(movie.releaseYear);
    setRuntime(movie.runtime || 120);
    setLanguage(movie.language || 'English');
    setCountry(movie.country || 'United States');
    setRating(movie.rating || 8.0);
    setSelectedGenres(movie.genres || []);
    setPoster(movie.poster);
    setBackdrop(movie.backdrop || '');
    setTrailerUrl(movie.trailerUrl || '');
    setOfficialWatchUrl(movie.officialWatchUrl || '');
    setDirector(movie.director || '');
    setWriter(movie.writer || '');
    setProducer(movie.producer || '');
    setFeatured(Boolean(movie.featured));
    setTrending(Boolean(movie.trending));
    setPopular(Boolean(movie.popular));
    setPublished(movie.published !== false);
    setCast(movie.cast && movie.cast.length > 0 ? movie.cast : [{ name: '', role: '', avatar: '' }]);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'poster' | 'backdrop' | 'cast', castIndex?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      if (target === 'poster') setPoster(base64);
      else if (target === 'backdrop') setBackdrop(base64);
      else if (target === 'cast' && castIndex !== undefined) {
        const updated = [...cast];
        updated[castIndex].avatar = base64;
        setCast(updated);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleToggleGenre = (g: string) => {
    if (selectedGenres.includes(g)) {
      setSelectedGenres(selectedGenres.filter(item => item !== g));
    } else {
      setSelectedGenres([...selectedGenres, g]);
    }
  };

  const handleAddCastRow = () => {
    setCast([...cast, { name: '', role: '', avatar: '' }]);
  };

  const handleRemoveCastRow = (index: number) => {
    setCast(cast.filter((_, idx) => idx !== index));
  };

  const handleCastChange = (index: number, field: keyof CastMember, val: string) => {
    const updated = [...cast];
    updated[index][field] = val;
    setCast(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Movie title is required');
      return;
    }
    if (!poster.trim()) {
      setFormError('Poster image URL is required');
      return;
    }

    setSaving(true);
    setFormError(null);

    const validCast = cast.filter(c => c.name.trim() !== '');

    const payload = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      description: description.trim(),
      releaseDate,
      releaseYear: Number(releaseYear) || 2025,
      runtime: Number(runtime) || 120,
      language: language.trim() || 'English',
      country: country.trim() || 'United States',
      rating: Number(rating) || 8.0,
      genres: selectedGenres.length > 0 ? selectedGenres : ['Action'],
      poster: poster.trim(),
      backdrop: backdrop.trim() || poster.trim(),
      trailerUrl: trailerUrl.trim(),
      officialWatchUrl: officialWatchUrl.trim(),
      director: director.trim(),
      writer: writer.trim(),
      producer: producer.trim(),
      featured,
      trending,
      popular,
      published,
      cast: validCast,
    };

    try {
      if (editingMovie) {
        await api.updateMovie(editingMovie.id, payload);
      } else {
        await api.createMovie(payload);
      }
      setIsModalOpen(false);
      if (onCloseAdd) onCloseAdd();
      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save movie');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmMovie) return;
    try {
      await api.deleteMovie(deleteConfirmMovie.id);
      setDeleteConfirmMovie(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete movie');
    }
  };

  const filteredMovies = movies.filter(m => {
    const matchesSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.director?.toLowerCase().includes(search.toLowerCase());
    const matchesGenre =
      selectedGenre === 'All' || m.genres?.includes(selectedGenre);
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Film className="w-6 h-6 text-cyan-400" />
            <span>Manage Movies</span>
          </h2>
          <p className="text-xs text-slate-400">
            Create, update, tag, and publish movies in your self-hosted catalog.
          </p>
        </div>

        <button
          id="admin-add-movie-modal-btn"
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-950/50 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Movie</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, director..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <select
          value={selectedGenre}
          onChange={e => setSelectedGenre(e.target.value)}
          className="w-full sm:w-48 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
        >
          <option value="All">All Genres</option>
          {categories.map(c => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Movies Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        </div>
      ) : filteredMovies.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800 space-y-3">
          <Film className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">No Movies Found</p>
          <p className="text-xs text-slate-500">
            {movies.length === 0
              ? 'Click "Add New Movie" above to populate your catalog.'
              : 'No movies match your current search/genre filter.'}
          </p>
        </div>
      ) : (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-4">Movie</th>
                  <th className="p-4">Genres</th>
                  <th className="p-4">Year / Runtime</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Status & Tags</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredMovies.map(movie => (
                  <tr key={movie.id} className="hover:bg-slate-850/50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          className="w-10 h-14 rounded-lg object-cover bg-slate-950 shrink-0 border border-slate-800"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=100&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div className="min-w-0 max-w-[200px] sm:max-w-xs">
                          <p className="font-bold text-white text-sm truncate">{movie.title}</p>
                          <p className="text-[11px] text-slate-400 truncate">
                            Dir: {movie.director || 'N/A'} • {movie.language}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1 flex-wrap max-w-[180px]">
                        {movie.genres?.slice(0, 3).map(g => (
                          <span
                            key={g}
                            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-cyan-300 border border-slate-700"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <p className="font-semibold text-white">{movie.releaseYear}</p>
                      <p className="text-slate-500 text-[11px]">{movie.runtime ? `${movie.runtime} mins` : 'N/A'}</p>
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 font-bold text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {movie.rating}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {movie.featured && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-700">
                            Featured
                          </span>
                        )}
                        {movie.trending && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-700">
                            Trending
                          </span>
                        )}
                        {movie.popular && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-700">
                            Popular
                          </span>
                        )}
                        {!movie.published && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                            Draft
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(movie)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition"
                          title="Edit Movie"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmMovie(movie)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition"
                          title="Delete Movie"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Movie Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div
            className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingMovie ? 'Edit Movie Details' : 'Add New Movie to Catalog'}
                </h3>
                <p className="text-xs text-slate-400">
                  Fill in the cinematic metadata and trailer credentials.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  if (onCloseAdd) onCloseAdd();
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {formError && (
                <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Basic Info */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-1.5">
                  1. Title & General Info
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Movie Title *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="Inception"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Custom Slug (Optional)</label>
                    <input
                      type="text"
                      value={slug}
                      onChange={e => setSlug(e.target.value)}
                      placeholder="inception"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Plot Summary / Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="A thief who steals corporate secrets through the use of dream-sharing technology..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Release Year</label>
                    <input
                      type="number"
                      value={releaseYear}
                      onChange={e => setReleaseYear(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Release Date</label>
                    <input
                      type="date"
                      value={releaseDate}
                      onChange={e => setReleaseDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Runtime (mins)</label>
                    <input
                      type="number"
                      value={runtime}
                      onChange={e => setRuntime(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Rating (0-10)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={rating}
                      onChange={e => setRating(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Language</label>
                    <input
                      type="text"
                      value={language}
                      onChange={e => setLanguage(e.target.value)}
                      placeholder="English"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Country</label>
                    <input
                      type="text"
                      value={country}
                      onChange={e => setCountry(e.target.value)}
                      placeholder="United States"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* Genres Picker */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-1.5">
                  2. Select Genres
                </h4>
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  {categories.map(c => {
                    const isSelected = selectedGenres.includes(c.name);
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => handleToggleGenre(c.name)}
                        className={`px-3 py-1.5 rounded-xl font-semibold border transition ${
                          isSelected
                            ? 'bg-cyan-600 text-white border-cyan-500 shadow'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Media & Artwork */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-1.5">
                  3. Artwork, Trailers & Streaming Links
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Poster */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Poster Image URL *</label>
                    <input
                      type="text"
                      required
                      value={poster}
                      onChange={e => setPoster(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500 mb-2"
                    />
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 cursor-pointer border border-slate-700">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Poster File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleFileUpload(e, 'poster')}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Backdrop */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Backdrop Banner URL</label>
                    <input
                      type="text"
                      value={backdrop}
                      onChange={e => setBackdrop(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500 mb-2"
                    />
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 cursor-pointer border border-slate-700">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Backdrop File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleFileUpload(e, 'backdrop')}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Trailer Video URL (YouTube, Vimeo, MP4)</label>
                    <input
                      type="text"
                      value={trailerUrl}
                      onChange={e => setTrailerUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Official Legal Stream URL (Netflix, Prime, etc.)</label>
                    <input
                      type="text"
                      value={officialWatchUrl}
                      onChange={e => setOfficialWatchUrl(e.target.value)}
                      placeholder="https://www.netflix.com/title/..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* Crew */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-1.5">
                  4. Production Crew & Studio
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Director</label>
                    <input
                      type="text"
                      value={director}
                      onChange={e => setDirector(e.target.value)}
                      placeholder="Christopher Nolan"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Writer</label>
                    <input
                      type="text"
                      value={writer}
                      onChange={e => setWriter(e.target.value)}
                      placeholder="Jonathan Nolan"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Producer Studio</label>
                    <input
                      type="text"
                      value={producer}
                      onChange={e => setProducer(e.target.value)}
                      placeholder="Warner Bros. Pictures"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* Cast dynamic rows */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    5. Star Cast Members
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddCastRow}
                    className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Add Cast Member</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {cast.map((c, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <input
                        type="text"
                        value={c.name}
                        onChange={e => handleCastChange(idx, 'name', e.target.value)}
                        placeholder="Actor Name"
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                      />
                      <input
                        type="text"
                        value={c.role || ''}
                        onChange={e => handleCastChange(idx, 'role', e.target.value)}
                        placeholder="Character Role"
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                      />
                      <input
                        type="text"
                        value={c.avatar || ''}
                        onChange={e => handleCastChange(idx, 'avatar', e.target.value)}
                        placeholder="Avatar URL"
                        className="w-32 sm:w-48 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveCastRow(idx)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Toggles */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-1.5">
                  6. Visibility & Highlighting Toggles
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={e => setFeatured(e.target.checked)}
                      className="w-4 h-4 text-cyan-500 rounded"
                    />
                    <div>
                      <p className="font-semibold text-white">Featured</p>
                      <p className="text-[10px] text-slate-500">Show in Hero Carousel</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={trending}
                      onChange={e => setTrending(e.target.checked)}
                      className="w-4 h-4 text-rose-500 rounded"
                    />
                    <div>
                      <p className="font-semibold text-white">Trending</p>
                      <p className="text-[10px] text-slate-500">Highlight in Trending</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={popular}
                      onChange={e => setPopular(e.target.checked)}
                      className="w-4 h-4 text-amber-500 rounded"
                    />
                    <div>
                      <p className="font-semibold text-white">Popular</p>
                      <p className="text-[10px] text-slate-500">Audience Masterpiece</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={published}
                      onChange={e => setPublished(e.target.checked)}
                      className="w-4 h-4 text-emerald-500 rounded"
                    />
                    <div>
                      <p className="font-semibold text-white">Published</p>
                      <p className="text-[10px] text-slate-500">Visible to Public</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-cyan-950/50 disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingMovie ? 'Save Movie Changes' : 'Create Movie Record'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-center">
            <Trash2 className="w-12 h-12 text-rose-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">Delete Movie?</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to delete <strong className="text-white">"{deleteConfirmMovie.title}"</strong> from the database? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmMovie(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-950/50"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

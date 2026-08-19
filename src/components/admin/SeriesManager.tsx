import React, { useState, useEffect } from 'react';
import {
  Tv,
  Plus,
  Search,
  Edit2,
  Trash2,
  Star,
  Check,
  X,
  Upload,
  AlertCircle,
  Loader2,
  Layers,
  Film,
  PlusCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Series, Season, Episode, Category } from '../../types';
import { api } from '../../services/api';

interface SeriesManagerProps {
  initialOpenAdd?: boolean;
  onCloseAdd?: () => void;
}

export const SeriesManager: React.FC<SeriesManagerProps> = ({
  initialOpenAdd = false,
  onCloseAdd,
}) => {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(initialOpenAdd);
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);
  const [deleteConfirmSeries, setDeleteConfirmSeries] = useState<Series | null>(null);
  const [managingSeasonsSeries, setManagingSeasonsSeries] = useState<Series | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [releaseDate, setReleaseDate] = useState('2025-01-01');
  const [language, setLanguage] = useState('English');
  const [country, setCountry] = useState('United States');
  const [rating, setRating] = useState(8.5);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Drama', 'Thriller']);
  const [poster, setPoster] = useState('');
  const [backdrop, setBackdrop] = useState('');
  const [trailerUrl, setTrailerUrl] = useState('');
  const [featured, setFeatured] = useState(false);
  const [trending, setTrending] = useState(false);
  const [published, setPublished] = useState(true);

  // Season & Episode Form Modals
  const [isSeasonModalOpen, setIsSeasonModalOpen] = useState(false);
  const [seasonNumber, setSeasonNumber] = useState(1);
  const [seasonTitle, setSeasonTitle] = useState('Season 1');
  const [seasonOverview, setSeasonOverview] = useState('');

  const [isEpisodeModalOpen, setIsEpisodeModalOpen] = useState(false);
  const [activeSeasonForEpisode, setActiveSeasonForEpisode] = useState<string>('');
  const [episodeNumber, setEpisodeNumber] = useState(1);
  const [episodeTitle, setEpisodeTitle] = useState('Episode 1: Pilot');
  const [episodeDuration, setEpisodeDuration] = useState(50);
  const [episodeDescription, setEpisodeDescription] = useState('');
  const [episodeThumbnail, setEpisodeThumbnail] = useState('');
  const [episodeTrailerUrl, setEpisodeTrailerUrl] = useState('');
  const [episodeWatchUrl, setEpisodeWatchUrl] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [serRes, catRes] = await Promise.all([
        api.getSeries(),
        api.getCategories(),
      ]);
      setSeriesList(serRes.series || []);
      setCategories(catRes.categories || []);

      // If we are currently inspecting seasons for a series, refresh its data
      if (managingSeasonsSeries) {
        const refreshed = (serRes.series || []).find((s: Series) => s.id === managingSeasonsSeries.id);
        if (refreshed) setManagingSeasonsSeries(refreshed);
      }
    } catch (err) {
      console.error('Failed to load series data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingSeries(null);
    setTitle('');
    setSlug('');
    setDescription('');
    setReleaseDate('2025-05-01');
    setLanguage('English');
    setCountry('United States');
    setRating(8.5);
    setSelectedGenres(['Drama', 'Sci-Fi']);
    setPoster('https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80');
    setBackdrop('https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1600&auto=format&fit=crop&q=80');
    setTrailerUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    setFeatured(true);
    setTrending(true);
    setPublished(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (series: Series) => {
    setEditingSeries(series);
    setTitle(series.title);
    setSlug(series.slug);
    setDescription(series.description);
    setReleaseDate(series.releaseDate);
    setLanguage(series.language || 'English');
    setCountry(series.country || 'United States');
    setRating(series.rating || 8.0);
    setSelectedGenres(series.genres || []);
    setPoster(series.poster);
    setBackdrop(series.backdrop || '');
    setTrailerUrl(series.trailerUrl || '');
    setFeatured(Boolean(series.featured));
    setTrending(Boolean(series.trending));
    setPublished(series.published !== false);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleToggleGenre = (g: string) => {
    if (selectedGenres.includes(g)) {
      setSelectedGenres(selectedGenres.filter(item => item !== g));
    } else {
      setSelectedGenres([...selectedGenres, g]);
    }
  };

  const handleSaveSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Series title is required');
      return;
    }
    if (!poster.trim()) {
      setFormError('Poster image URL is required');
      return;
    }

    setSaving(true);
    setFormError(null);

    const payload = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      description: description.trim(),
      releaseDate,
      language: language.trim() || 'English',
      country: country.trim() || 'United States',
      rating: Number(rating) || 8.0,
      genres: selectedGenres.length > 0 ? selectedGenres : ['Drama'],
      poster: poster.trim(),
      backdrop: backdrop.trim() || poster.trim(),
      trailerUrl: trailerUrl.trim(),
      featured,
      trending,
      published,
    };

    try {
      if (editingSeries) {
        await api.updateSeries(editingSeries.id, payload);
      } else {
        await api.createSeries(payload);
      }
      setIsModalOpen(false);
      if (onCloseAdd) onCloseAdd();
      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save series');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSeries = async () => {
    if (!deleteConfirmSeries) return;
    try {
      await api.deleteSeries(deleteConfirmSeries.id);
      setDeleteConfirmSeries(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete series');
    }
  };

  // Season & Episode Handlers
  const handleAddSeason = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingSeasonsSeries) return;

    try {
      await api.addSeason(managingSeasonsSeries.id, {
        seasonNumber: Number(seasonNumber) || 1,
        title: seasonTitle.trim() || `Season ${seasonNumber}`,
        overview: seasonOverview.trim(),
      });
      setIsSeasonModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to add season');
    }
  };

  const handleAddEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingSeasonsSeries || !activeSeasonForEpisode) return;

    try {
      await api.addEpisode(managingSeasonsSeries.id, activeSeasonForEpisode, {
        episodeNumber: Number(episodeNumber) || 1,
        title: episodeTitle.trim(),
        duration: Number(episodeDuration) || 45,
        description: episodeDescription.trim(),
        thumbnail: episodeThumbnail.trim() || managingSeasonsSeries.backdrop || managingSeasonsSeries.poster,
        trailerUrl: episodeTrailerUrl.trim(),
        officialWatchUrl: episodeWatchUrl.trim(),
      });
      setIsEpisodeModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to add episode');
    }
  };

  const handleDeleteEpisode = async (_seasonId: string, episodeId: string) => {
    if (!managingSeasonsSeries) return;
    if (!confirm('Are you sure you want to delete this episode?')) return;
    try {
      await api.deleteEpisode(episodeId);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete episode');
    }
  };

  const filteredSeries = seriesList.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Tv className="w-6 h-6 text-purple-400" />
            <span>Manage Web Series & Seasons</span>
          </h2>
          <p className="text-xs text-slate-400">
            Configure multi-season TV shows, chapters, and episode links.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-950/50 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Web Series</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-md bg-slate-900/90 rounded-2xl border border-slate-800 p-1">
        <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search web series by title..."
          className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Series Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      ) : filteredSeries.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800 space-y-3">
          <Tv className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">No Web Series Found</p>
          <p className="text-xs text-slate-500">
            Click "Add New Web Series" to create a new show.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-4">Series Title</th>
                  <th className="p-4">Seasons / Episodes</th>
                  <th className="p-4">Genres</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredSeries.map(series => {
                  const totalEpisodes = (series.seasons || []).reduce(
                    (acc, s) => acc + (s.episodes?.length || 0),
                    0
                  );
                  return (
                    <tr key={series.id} className="hover:bg-slate-850/50 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={series.poster}
                            alt={series.title}
                            className="w-10 h-14 rounded-lg object-cover bg-slate-950 shrink-0 border border-slate-800"
                          />
                          <div className="min-w-0 max-w-[200px] sm:max-w-xs">
                            <p className="font-bold text-white text-sm truncate">{series.title}</p>
                            <p className="text-[11px] text-slate-400 truncate">
                              {new Date(series.releaseDate).getFullYear()} • {series.language}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <button
                          onClick={() => setManagingSeasonsSeries(series)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950/70 hover:bg-purple-900 border border-purple-800/60 text-purple-300 font-semibold transition"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>
                            {series.seasons?.length || 0} Seasons ({totalEpisodes} EPs)
                          </span>
                        </button>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1 flex-wrap max-w-[160px]">
                          {series.genres?.slice(0, 2).map(g => (
                            <span
                              key={g}
                              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-purple-300 border border-slate-700"
                            >
                              {g}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-bold text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          {series.rating}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {series.featured && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-700">
                              Featured
                            </span>
                          )}
                          {series.trending && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-700">
                              Trending
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setManagingSeasonsSeries(series)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-purple-900 text-purple-300 transition"
                            title="Manage Episodes & Seasons"
                          >
                            <Layers className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(series)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition"
                            title="Edit Series Info"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmSeries(series)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition"
                            title="Delete Series"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Series Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div
            className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingSeries ? 'Edit Web Series Details' : 'Create New Web Series'}
                </h3>
                <p className="text-xs text-slate-400">
                  After saving the series, you can add seasons and episodes.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSeries} className="p-6 overflow-y-auto space-y-5 text-xs">
              {formError && (
                <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Series Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Stranger Things"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Custom Slug (Optional)</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={e => setSlug(e.target.value)}
                    placeholder="stranger-things"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Series Description *</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Plot summary of the web series..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Release Date</label>
                  <input
                    type="date"
                    value={releaseDate}
                    onChange={e => setReleaseDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Language</label>
                  <input
                    type="text"
                    value={language}
                    onChange={e => setLanguage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={rating}
                    onChange={e => setRating(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Genres */}
              <div className="space-y-1.5">
                <label className="block text-slate-300 font-semibold">Select Genres</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {categories.map(c => {
                    const isSelected = selectedGenres.includes(c.name);
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => handleToggleGenre(c.name)}
                        className={`px-3 py-1.5 rounded-xl font-semibold border transition ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-500'
                            : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Poster & Backdrop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Poster URL *</label>
                  <input
                    type="text"
                    required
                    value={poster}
                    onChange={e => setPoster(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Backdrop URL</label>
                  <input
                    type="text"
                    value={backdrop}
                    onChange={e => setBackdrop(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Series Trailer URL</label>
                <input
                  type="text"
                  value={trailerUrl}
                  onChange={e => setTrailerUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={e => setFeatured(e.target.checked)}
                    className="w-4 h-4 text-purple-500 rounded"
                  />
                  <span className="font-semibold text-white">Featured</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={trending}
                    onChange={e => setTrending(e.target.checked)}
                    className="w-4 h-4 text-rose-500 rounded"
                  />
                  <span className="font-semibold text-white">Trending</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={e => setPublished(e.target.checked)}
                    className="w-4 h-4 text-emerald-500 rounded"
                  />
                  <span className="font-semibold text-white">Published</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-950/50"
                >
                  {saving ? 'Saving...' : 'Save Series'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Season & Episode Manager Inspector View */}
      {managingSeasonsSeries && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div
            className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-400" />
                  <span>Seasons & Episodes for "{managingSeasonsSeries.title}"</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Manage seasons and individual episode metadata.
                </p>
              </div>
              <button
                onClick={() => setManagingSeasonsSeries(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-white">
                  Seasons ({managingSeasonsSeries.seasons?.length || 0})
                </p>
                <button
                  onClick={() => {
                    const nextNum = (managingSeasonsSeries.seasons?.length || 0) + 1;
                    setSeasonNumber(nextNum);
                    setSeasonTitle(`Season ${nextNum}`);
                    setSeasonOverview('');
                    setIsSeasonModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 text-white font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Season</span>
                </button>
              </div>

              {/* Seasons List */}
              {(!managingSeasonsSeries.seasons || managingSeasonsSeries.seasons.length === 0) ? (
                <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-400">
                  No seasons configured. Click "Add New Season" to begin.
                </div>
              ) : (
                <div className="space-y-6">
                  {managingSeasonsSeries.seasons.map(season => (
                    <div
                      key={season.id}
                      className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                        <div>
                          <h4 className="font-bold text-sm text-white flex items-center gap-2">
                            <span>{season.title || `Season ${season.seasonNumber}`}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-purple-950 text-purple-300 border border-purple-800">
                              {season.episodes?.length || 0} Episodes
                            </span>
                          </h4>
                          {season.overview && (
                            <p className="text-slate-400 text-[11px] mt-0.5">{season.overview}</p>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            setActiveSeasonForEpisode(season.id);
                            const nextEp = (season.episodes?.length || 0) + 1;
                            setEpisodeNumber(nextEp);
                            setEpisodeTitle(`Episode ${nextEp}`);
                            setEpisodeDuration(48);
                            setEpisodeDescription('');
                            setEpisodeThumbnail(managingSeasonsSeries.backdrop || managingSeasonsSeries.poster);
                            setEpisodeTrailerUrl('');
                            setEpisodeWatchUrl('');
                            setIsEpisodeModalOpen(true);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-700 text-xs font-semibold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Episode</span>
                        </button>
                      </div>

                      {/* Episodes Table */}
                      {(!season.episodes || season.episodes.length === 0) ? (
                        <p className="text-slate-500 italic text-[11px]">No episodes added to this season yet.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {season.episodes.map(ep => (
                            <div
                              key={ep.id}
                              className="p-3 bg-slate-900 rounded-xl border border-slate-800/80 flex items-start gap-3 justify-between"
                            >
                              <div className="flex items-start gap-2.5 min-w-0">
                                <img
                                  src={ep.thumbnail || managingSeasonsSeries.poster}
                                  alt={ep.title}
                                  className="w-12 h-12 rounded-lg object-cover bg-slate-950 shrink-0"
                                />
                                <div className="min-w-0">
                                  <p className="font-bold text-white text-xs truncate">
                                    EP {ep.episodeNumber}: {ep.title}
                                  </p>
                                  <p className="text-[11px] text-slate-400 truncate">
                                    {ep.duration ? `${ep.duration}m` : 'N/A'} • {ep.description || 'No plot'}
                                  </p>
                                </div>
                              </div>

                              <button
                                onClick={() => handleDeleteEpisode(season.id, ep.id)}
                                className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800"
                                title="Delete Episode"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setManagingSeasonsSeries(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Season Sub-Modal */}
      {isSeasonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleAddSeason}
            className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4 text-xs"
          >
            <h3 className="text-sm font-bold text-white">Add New Season</h3>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Season Number</label>
              <input
                type="number"
                required
                value={seasonNumber}
                onChange={e => setSeasonNumber(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Season Title</label>
              <input
                type="text"
                required
                value={seasonTitle}
                onChange={e => setSeasonTitle(e.target.value)}
                placeholder="Season 1"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Overview (Optional)</label>
              <textarea
                rows={2}
                value={seasonOverview}
                onChange={e => setSeasonOverview(e.target.value)}
                placeholder="Season arc description..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsSeasonModalOpen(false)}
                className="px-3.5 py-2 bg-slate-800 text-slate-300 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-xl font-semibold"
              >
                Add Season
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Episode Sub-Modal */}
      {isEpisodeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleAddEpisode}
            className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4 text-xs"
          >
            <h3 className="text-sm font-bold text-white">Add Episode to Season</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Episode #</label>
                <input
                  type="number"
                  required
                  value={episodeNumber}
                  onChange={e => setEpisodeNumber(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Duration (mins)</label>
                <input
                  type="number"
                  value={episodeDuration}
                  onChange={e => setEpisodeDuration(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Episode Title *</label>
              <input
                type="text"
                required
                value={episodeTitle}
                onChange={e => setEpisodeTitle(e.target.value)}
                placeholder="Chapter 1: The Vanishing"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Episode Plot</label>
              <textarea
                rows={2}
                value={episodeDescription}
                onChange={e => setEpisodeDescription(e.target.value)}
                placeholder="On his way home from a friend's house..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Thumbnail URL</label>
                <input
                  type="text"
                  value={episodeThumbnail}
                  onChange={e => setEpisodeThumbnail(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Episode Trailer URL</label>
                <input
                  type="text"
                  value={episodeTrailerUrl}
                  onChange={e => setEpisodeTrailerUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Official Watch URL</label>
              <input
                type="text"
                value={episodeWatchUrl}
                onChange={e => setEpisodeWatchUrl(e.target.value)}
                placeholder="https://www.netflix.com/..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEpisodeModalOpen(false)}
                className="px-3.5 py-2 bg-slate-800 text-slate-300 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-xl font-semibold"
              >
                Save Episode
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirmSeries && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-center">
            <Trash2 className="w-12 h-12 text-rose-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">Delete Web Series?</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to delete <strong className="text-white">"{deleteConfirmSeries.title}"</strong> and all its associated seasons and episodes?
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmSeries(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSeries}
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

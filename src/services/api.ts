import { Movie, Series, Season, Episode, Category, Banner, User, WatchlistItem, AdminStats, SearchResultItem } from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('moviehub_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorData.error || `HTTP error ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  async register(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return handleResponse(res);
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async updateProfile(data: { name?: string; profileImage?: string; password?: string }): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Movies
  async getMovies(params: Record<string, any> = {}): Promise<{ movies: Movie[]; total: number }> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    const res = await fetch(`${API_BASE}/movies?${query.toString()}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async getMovie(slugOrId: string): Promise<{ movie: Movie; similar: Movie[] }> {
    const res = await fetch(`${API_BASE}/movies/${encodeURIComponent(slugOrId)}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async createMovie(data: Partial<Movie>): Promise<{ movie: Movie }> {
    const res = await fetch(`${API_BASE}/movies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateMovie(id: string, data: Partial<Movie>): Promise<{ movie: Movie }> {
    const res = await fetch(`${API_BASE}/movies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteMovie(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/movies/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  // Series
  async getSeries(params: Record<string, any> = {}): Promise<{ series: (Series & { seasonCount?: number; episodeCount?: number })[]; total: number }> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    const res = await fetch(`${API_BASE}/series?${query.toString()}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async getSeriesById(slugOrId: string): Promise<{ series: Series; similar: Series[] }> {
    const res = await fetch(`${API_BASE}/series/${encodeURIComponent(slugOrId)}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async createSeries(data: Partial<Series>): Promise<{ series: Series }> {
    const res = await fetch(`${API_BASE}/series`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateSeries(id: string, data: Partial<Series>): Promise<{ series: Series }> {
    const res = await fetch(`${API_BASE}/series/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteSeries(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/series/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  // Seasons
  async createSeason(data: { seriesId: string; seasonNumber: number; title: string }): Promise<{ season: Season }> {
    const res = await fetch(`${API_BASE}/seasons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateSeason(id: string, data: Partial<Season>): Promise<{ season: Season }> {
    const res = await fetch(`${API_BASE}/seasons/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteSeason(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/seasons/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  // Episodes
  async createEpisode(data: Partial<Episode>): Promise<{ episode: Episode }> {
    const res = await fetch(`${API_BASE}/episodes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateEpisode(id: string, data: Partial<Episode>): Promise<{ episode: Episode }> {
    const res = await fetch(`${API_BASE}/episodes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteEpisode(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/episodes/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  // Categories
  async getCategories(): Promise<{ categories: (Category & { movieCount?: number; seriesCount?: number; totalCount?: number })[] }> {
    const res = await fetch(`${API_BASE}/categories`);
    return handleResponse(res);
  },

  async createCategory(data: Partial<Category>): Promise<{ category: Category }> {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateCategory(id: string, data: Partial<Category>): Promise<{ category: Category }> {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteCategory(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  // Banners
  async getBanners(): Promise<{ banners: Banner[] }> {
    const res = await fetch(`${API_BASE}/banners`);
    return handleResponse(res);
  },

  async getAdminBanners(): Promise<{ banners: Banner[] }> {
    const res = await fetch(`${API_BASE}/admin/banners`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async createBanner(data: Partial<Banner>): Promise<{ banner: Banner }> {
    const res = await fetch(`${API_BASE}/banners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateBanner(id: string, data: Partial<Banner>): Promise<{ banner: Banner }> {
    const res = await fetch(`${API_BASE}/banners/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteBanner(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/banners/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  // Users
  async getUsers(): Promise<{ users: User[] }> {
    const res = await fetch(`${API_BASE}/users`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async updateUserStatus(id: string, status: 'active' | 'disabled', role?: 'user' | 'admin'): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/users/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ status, role }),
    });
    return handleResponse(res);
  },

  async updateUserRole(id: string, role: 'user' | 'admin'): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/users/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ status: 'active', role }),
    });
    return handleResponse(res);
  },

  async deleteUser(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  // Seasons & Episodes Helpers
  async addSeason(seriesId: string, data: { seasonNumber: number; title: string; overview?: string }): Promise<{ season: Season }> {
    return this.createSeason({ seriesId, ...data });
  },

  async addEpisode(seriesId: string, seasonId: string, data: Partial<Episode>): Promise<{ episode: Episode }> {
    return this.createEpisode({ seriesId, seasonId, ...data });
  },

  // Watchlist
  async getWatchlist(): Promise<{ watchlist: WatchlistItem[] }> {
    const res = await fetch(`${API_BASE}/watchlist`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async addToWatchlist(movieId?: string, seriesId?: string, itemType: 'movie' | 'series' = 'movie'): Promise<{ item: WatchlistItem }> {
    const res = await fetch(`${API_BASE}/watchlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ movieId, seriesId, itemType }),
    });
    return handleResponse(res);
  },

  async removeFromWatchlist(targetId: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/watchlist/${targetId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  // Search
  async search(query: string): Promise<{ results: SearchResultItem[]; suggestions: string[] }> {
    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
    return handleResponse(res);
  },

  // Stats
  async getStats(): Promise<AdminStats & { activityLogs: { id: string; action: string; timestamp: string }[] }> {
    const res = await fetch(`${API_BASE}/stats`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async getAdminStats(): Promise<AdminStats & { activityLogs: { id: string; action: string; timestamp: string }[] }> {
    return this.getStats();
  },

  // Upload image
  async uploadImage(data: string, filename?: string): Promise<{ url: string }> {
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ data, filename }),
    });
    return handleResponse(res);
  }
};

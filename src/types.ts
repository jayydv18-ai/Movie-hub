export interface User {
  id: string;
  name: string;
  email: string;
  profileImage: string;
  role: 'user' | 'admin';
  status: 'active' | 'disabled';
  createdAt: string;
  watchlistCount?: number;
}

export interface CastMember {
  name: string;
  role?: string;
  avatar?: string;
}

export interface Movie {
  id: string;
  title: string;
  slug: string;
  description: string;
  poster: string;
  backdrop: string;
  releaseDate: string;
  releaseYear: number;
  runtime: number; // in minutes
  language: string;
  country: string;
  genres: string[];
  rating: number; // 0.0 - 10.0
  director: string;
  writer: string;
  producer: string;
  cast: CastMember[];
  trailerUrl: string;
  officialWatchUrl: string;
  featured: boolean;
  trending: boolean;
  popular: boolean;
  published: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface Series {
  id: string;
  title: string;
  slug: string;
  description: string;
  poster: string;
  backdrop: string;
  releaseDate: string;
  language: string;
  country: string;
  genres: string[];
  rating: number;
  cast: CastMember[];
  director: string;
  trailerUrl: string;
  featured: boolean;
  trending: boolean;
  published: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
  seasons?: Season[];
}

export interface Season {
  id: string;
  seriesId: string;
  seasonNumber: number;
  title: string;
  overview?: string;
  createdAt: string;
  episodes?: Episode[];
}

export interface Episode {
  id: string;
  seriesId: string;
  seasonId: string;
  episodeNumber: number;
  title: string;
  description: string;
  thumbnail: string;
  duration: number; // minutes
  trailerUrl: string;
  officialWatchUrl: string;
  published: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  order: number;
  status: 'active' | 'inactive';
  movieCount?: number;
  seriesCount?: number;
  totalCount?: number;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  movieId?: string;
  seriesId?: string;
  itemType: 'movie' | 'series';
  item?: Movie | Series;
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  contentId: string;
  contentType: 'movie' | 'series' | 'custom';
  buttonText: string;
  buttonUrl: string;
  order: number;
  status: 'active' | 'inactive';
  active?: boolean;
}

export interface AdminStats {
  totalUsers: number;
  totalMovies: number;
  totalSeries: number;
  totalEpisodes: number;
  totalCategories: number;
  totalWatchlistItems: number;
  totalViews: number;
  recentMovies: Movie[];
  popularMovies: Movie[];
  categoryDistribution: { name: string; count: number }[];
  viewsTrend: { label: string; views: number }[];
}

export interface FilterOptions {
  genre?: string;
  language?: string;
  year?: string;
  ratingMin?: number;
  country?: string;
  sort?: 'latest' | 'oldest' | 'rating' | 'popular' | 'title';
  search?: string;
}

export interface SearchResultItem {
  id: string;
  title: string;
  slug: string;
  type: 'movie' | 'series' | 'person';
  subtitle: string;
  image: string;
  rating?: number;
  year?: number | string;
  genres?: string[];
}

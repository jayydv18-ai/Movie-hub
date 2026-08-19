import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const JWT_SECRET = process.env.JWT_SECRET || "movie-hub-secure-jwt-secret-key-2026";

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Helper crypto functions for password hashing and tokens
function hashPassword(password: string): string {
  const salt = "moviehub_salt_2026";
  return crypto.createHash("sha256").update(password + salt).digest("hex");
}

function generateToken(payload: object): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString("base64url");
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${signature}`;
}

function verifyToken(token: string): any | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSignature = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
    if (expectedSignature !== signature) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// Database Schema Interfaces
interface Database {
  users: Array<{
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    profileImage: string;
    role: "user" | "admin";
    status: "active" | "disabled";
    createdAt: string;
  }>;
  movies: Array<any>;
  series: Array<any>;
  seasons: Array<any>;
  episodes: Array<any>;
  categories: Array<any>;
  watchlists: Array<any>;
  banners: Array<any>;
  activityLogs: Array<any>;
}

// Ensure Database & Initial Seeds
function getInitialSeedData(): Database {
  const now = new Date().toISOString();
  return {
    users: [
      {
        id: "usr_admin_1",
        name: "Admin Director",
        email: "admin@moviehub.com",
        passwordHash: hashPassword("Admin@12345"),
        profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        role: "admin",
        status: "active",
        createdAt: now,
      },
      {
        id: "usr_demo_1",
        name: "Alex Morgan",
        email: "user@moviehub.com",
        passwordHash: hashPassword("User@12345"),
        profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        role: "user",
        status: "active",
        createdAt: now,
      },
    ],
    categories: [
      {
        id: "cat_action",
        name: "Action",
        slug: "action",
        image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80",
        description: "High-octane blockbusters, breathtaking stunts, and adrenaline rushes.",
        order: 1,
        status: "active",
      },
      {
        id: "cat_scifi",
        name: "Sci-Fi",
        slug: "sci-fi",
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
        description: "Interstellar voyages, future worlds, and futuristic technology.",
        order: 2,
        status: "active",
      },
      {
        id: "cat_thriller",
        name: "Thriller",
        slug: "thriller",
        image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
        description: "Gripping suspense, psychological twists, and high-stakes mysteries.",
        order: 3,
        status: "active",
      },
      {
        id: "cat_drama",
        name: "Drama",
        slug: "drama",
        image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&auto=format&fit=crop&q=80",
        description: "Deep, emotional, character-driven masterworks and true stories.",
        order: 4,
        status: "active",
      },
      {
        id: "cat_comedy",
        name: "Comedy",
        slug: "comedy",
        image: "https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=600&auto=format&fit=crop&q=80",
        description: "Heartwarming humor, witty banter, and laugh-out-loud entertainment.",
        order: 5,
        status: "active",
      },
      {
        id: "cat_horror",
        name: "Horror",
        slug: "horror",
        image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80",
        description: "Chilling terrors, haunted legends, and spine-tingling encounters.",
        order: 6,
        status: "active",
      },
      {
        id: "cat_romance",
        name: "Romance",
        slug: "romance",
        image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&auto=format&fit=crop&q=80",
        description: "Passionate love stories, unforgettable bonds, and poetic journeys.",
        order: 7,
        status: "active",
      },
      {
        id: "cat_animation",
        name: "Animation",
        slug: "animation",
        image: "https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80",
        description: "Vibrant worlds, creative stories, and visual masterpieces for all ages.",
        order: 8,
        status: "active",
      },
      {
        id: "cat_crime",
        name: "Crime",
        slug: "crime",
        image: "https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?w=600&auto=format&fit=crop&q=80",
        description: "Underworld syndicates, sharp detectives, and criminal masterminds.",
        order: 9,
        status: "active",
      },
      {
        id: "cat_adventure",
        name: "Adventure",
        slug: "adventure",
        image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=80",
        description: "Epic expeditions, lost civilizations, and uncharted territories.",
        order: 10,
        status: "active",
      },
    ],
    movies: [
      {
        id: "mov_1",
        title: "Chronicles of Kepler: Beyond Orbit",
        slug: "chronicles-of-kepler-beyond-orbit",
        description: "In the year 2184, an exploratory deep-space cruiser encounters an ancient quantum anomaly orbiting a distant exoplanet, triggering temporal echoes that challenge human destiny.",
        poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
        backdrop: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1600&auto=format&fit=crop&q=80",
        releaseDate: "2025-11-14",
        releaseYear: 2025,
        runtime: 148,
        language: "English",
        country: "United States",
        genres: ["Sci-Fi", "Adventure", "Drama"],
        rating: 9.1,
        director: "Elena Vance",
        writer: "Marcus Holloway & Elena Vance",
        producer: "Christopher Nolan Studios",
        cast: [
          { name: "Devon Ramirez", role: "Commander Caleb Holt", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
          { name: "Sylvia Chen", role: "Dr. Maya Lin", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
          { name: "Liam Sterling", role: "AI Navigator Nexus", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" }
        ],
        trailerUrl: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
        officialWatchUrl: "https://www.apple.com/apple-tv-plus/",
        featured: true,
        trending: true,
        popular: true,
        published: true,
        views: 14200,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "mov_2",
        title: "Shadow Protocol: Neon Syndicate",
        slug: "shadow-protocol-neon-syndicate",
        description: "A retired intelligence operative in futuristic Neo-Kyoto is blackmailed into executing one final heist against a mega-corporation that controls synthetic cybernetics.",
        poster: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80",
        backdrop: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80",
        releaseDate: "2025-08-22",
        releaseYear: 2025,
        runtime: 126,
        language: "English",
        country: "Japan / USA",
        genres: ["Action", "Thriller", "Crime"],
        rating: 8.7,
        director: "Kenji Takahashi",
        writer: "Rachel Scott",
        producer: "Apex Motion Pictures",
        cast: [
          { name: "Kenji Sato", role: "Ren Vance", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80" },
          { name: "Zoe Kravitz-Ross", role: "Kira", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80" },
          { name: "Harrison Blake", role: "Vance Morgan", avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80" }
        ],
        trailerUrl: "https://www.youtube.com/watch?v=d9MyW72ELq0",
        officialWatchUrl: "https://www.primevideo.com/",
        featured: true,
        trending: true,
        popular: true,
        published: true,
        views: 18900,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "mov_3",
        title: "The Silent Symphony",
        slug: "the-silent-symphony",
        description: "An emotionally moving biographical drama following a deaf prodigy pianist in 19th-century Vienna who invents a new acoustic technique to compose a legendary orchestra piece.",
        poster: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
        backdrop: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1600&auto=format&fit=crop&q=80",
        releaseDate: "2024-12-05",
        releaseYear: 2024,
        runtime: 135,
        language: "German / English",
        country: "Austria",
        genres: ["Drama", "Romance"],
        rating: 8.9,
        director: "Julian Richter",
        writer: "Julian Richter & Sophie Weber",
        producer: "Vienna Cinematic Guild",
        cast: [
          { name: "Maximilian Klaus", role: "Johann Albrecht", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80" },
          { name: "Clara Schumann-Beck", role: "Isla Thorne", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80" }
        ],
        trailerUrl: "https://www.youtube.com/watch?v=8hP9D6kZseM",
        officialWatchUrl: "https://www.netflix.com/",
        featured: false,
        trending: false,
        popular: true,
        published: true,
        views: 9540,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "mov_4",
        title: "Apex Velocity: Midnight Drift",
        slug: "apex-velocity-midnight-drift",
        description: "Underground street racers and advanced mechanical engineers clash on high-altitude mountain passes in the ultimate electric hypercar championship.",
        poster: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&auto=format&fit=crop&q=80",
        backdrop: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1600&auto=format&fit=crop&q=80",
        releaseDate: "2025-06-18",
        releaseYear: 2025,
        runtime: 118,
        language: "English",
        country: "United States",
        genres: ["Action", "Crime", "Adventure"],
        rating: 7.9,
        director: "Carlos Dominguez",
        writer: "Tyler Ray",
        producer: "Velocity Horizon Films",
        cast: [
          { name: "Damian Cruz", role: "Mateo Ortiz", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" },
          { name: "Mia Valenti", role: "Lucia Vega", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" }
        ],
        trailerUrl: "https://www.youtube.com/watch?v=2LqzF5WauAw",
        officialWatchUrl: "https://www.max.com/",
        featured: false,
        trending: true,
        popular: true,
        published: true,
        views: 12400,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "mov_5",
        title: "The Whispering Pines",
        slug: "the-whispering-pines",
        description: "A paranormal investigator visits an isolated Nordic logging town where the ancient pine trees echo with voices of those who went missing during the solstice.",
        poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
        backdrop: "https://images.unsplash.com/photo-1511497584788-87676104235f?w=1600&auto=format&fit=crop&q=80",
        releaseDate: "2025-10-31",
        releaseYear: 2025,
        runtime: 104,
        language: "Swedish / English",
        country: "Sweden",
        genres: ["Horror", "Mystery", "Thriller"],
        rating: 8.2,
        director: "Astrid Lindholm",
        writer: "Astrid Lindholm",
        producer: "Nordic Shadow Studios",
        cast: [
          { name: "Freja Larsson", role: "Dr. Karen Holm", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
          { name: "Einar Nilsson", role: "Sheriff Brodin", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80" }
        ],
        trailerUrl: "https://www.youtube.com/watch?v=s7EdQ4FqbhY",
        officialWatchUrl: "https://www.shudder.com/",
        featured: false,
        trending: true,
        popular: false,
        published: true,
        views: 8100,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "mov_6",
        title: "Laughter in Lisbon",
        slug: "laughter-in-lisbon",
        description: "Two rival food critics mistakenly book the same historic loft in Lisbon during the annual Sardine Festival, leading to hilarious culinary duels and unexpected sparks.",
        poster: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&auto=format&fit=crop&q=80",
        backdrop: "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=1600&auto=format&fit=crop&q=80",
        releaseDate: "2025-05-10",
        releaseYear: 2025,
        runtime: 102,
        language: "Portuguese / English",
        country: "Portugal",
        genres: ["Comedy", "Romance"],
        rating: 7.8,
        director: "Tiago Silva",
        writer: "Beatriz Costa",
        producer: "Sunlit Coast Productions",
        cast: [
          { name: "Rodrigo Santos", role: "Andre", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
          { name: "Camila Duarte", role: "Chloe Dupont", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80" }
        ],
        trailerUrl: "https://www.youtube.com/watch?v=TcMBFSGVi1c",
        officialWatchUrl: "https://www.hulu.com/",
        featured: false,
        trending: false,
        popular: true,
        published: true,
        views: 6900,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "mov_7",
        title: "Aetheria: Spirit of the Wind",
        slug: "aetheria-spirit-of-the-wind",
        description: "An enchanting animated masterpiece about a courageous wind-weaver apprentice who ventures across sky islands to rekindle the celestial breath of life.",
        poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
        backdrop: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80",
        releaseDate: "2025-09-01",
        releaseYear: 2025,
        runtime: 110,
        language: "Japanese / English",
        country: "Japan",
        genres: ["Animation", "Adventure", "Fantasy"],
        rating: 9.3,
        director: "Hayato Miyazaki",
        writer: "Hayato Miyazaki",
        producer: "Studio Mirage",
        cast: [
          { name: "Yuki Tanaka", role: "Aoi (Voice)", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
          { name: "Kenichi Mori", role: "Zephyr (Voice)", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80" }
        ],
        trailerUrl: "https://www.youtube.com/watch?v=4bgn2f0f4gE",
        officialWatchUrl: "https://www.disneyplus.com/",
        featured: true,
        trending: true,
        popular: true,
        published: true,
        views: 22100,
        createdAt: now,
        updatedAt: now,
      }
    ],
    series: [
      {
        id: "ser_1",
        title: "Cyber City: Sector 9",
        slug: "cyber-city-sector-9",
        description: "In a sprawling mega-metropolis partitioned by high-tech security walls, an elite division of cyber investigators uncovers an underground syndicate hacking human memories.",
        poster: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
        backdrop: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1600&auto=format&fit=crop&q=80",
        releaseDate: "2024-10-12",
        language: "English",
        country: "United Kingdom",
        genres: ["Sci-Fi", "Crime", "Thriller"],
        rating: 9.0,
        director: "Gareth Edwards & Nadia Vance",
        trailerUrl: "https://www.youtube.com/watch?v=d9MyW72ELq0",
        featured: true,
        trending: true,
        published: true,
        views: 28400,
        cast: [
          { name: "Cillian Murphy-Drake", role: "Inspector Thomas Cross", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" },
          { name: "Naomi Harris", role: "Dr. Jessica Roy", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" }
        ],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "ser_2",
        title: "Kingdoms of Obsidian",
        slug: "kingdoms-of-obsidian",
        description: "Four dynastic houses wage ruthless political warfare and mystical clashes over the Obsidian Throne while an ancient frozen entity stirs in the Northern Abyss.",
        poster: "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=600&auto=format&fit=crop&q=80",
        backdrop: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80",
        releaseDate: "2025-01-15",
        language: "English",
        country: "United States / New Zealand",
        genres: ["Action", "Drama", "Fantasy"],
        rating: 9.4,
        director: "David Benioff & Laura Thorne",
        trailerUrl: "https://www.youtube.com/watch?v=KPLWWIOCOOQ",
        featured: true,
        trending: true,
        published: true,
        views: 34100,
        cast: [
          { name: "Richard Madden-Lee", role: "Lord Brandon Starkwood", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
          { name: "Emilia Clarke-Vance", role: "Queen Valyria", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" }
        ],
        createdAt: now,
        updatedAt: now,
      }
    ],
    seasons: [
      {
        id: "sea_1",
        seriesId: "ser_1",
        seasonNumber: 1,
        title: "Season 1: The Memory Broker",
        createdAt: now,
      },
      {
        id: "sea_2",
        seriesId: "ser_1",
        seasonNumber: 2,
        title: "Season 2: Neural Blackout",
        createdAt: now,
      },
      {
        id: "sea_3",
        seriesId: "ser_2",
        seasonNumber: 1,
        title: "Season 1: The Crown of Ashes",
        createdAt: now,
      }
    ],
    episodes: [
      {
        id: "ep_1",
        seriesId: "ser_1",
        seasonId: "sea_1",
        episodeNumber: 1,
        title: "Pilot: Ghost in the Grid",
        description: "A mysterious cyber black market memory broker is discovered dead in Sector 9 with all neural implants erased.",
        thumbnail: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
        duration: 58,
        trailerUrl: "https://www.youtube.com/watch?v=d9MyW72ELq0",
        officialWatchUrl: "https://www.netflix.com/",
        published: true,
        createdAt: now,
      },
      {
        id: "ep_2",
        seriesId: "ser_1",
        seasonId: "sea_1",
        episodeNumber: 2,
        title: "Subroutine Zero",
        description: "Inspector Cross follows a trail of encrypted datastreams leading to the city's power grid mainframe.",
        thumbnail: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&auto=format&fit=crop&q=80",
        duration: 52,
        trailerUrl: "https://www.youtube.com/watch?v=d9MyW72ELq0",
        officialWatchUrl: "https://www.netflix.com/",
        published: true,
        createdAt: now,
      },
      {
        id: "ep_3",
        seriesId: "ser_1",
        seasonId: "sea_1",
        episodeNumber: 3,
        title: "Neon Shadows",
        description: "An unexpected blackout hits the upper sector while Cross and Dr. Roy race against a lockdown protocol.",
        thumbnail: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80",
        duration: 55,
        trailerUrl: "https://www.youtube.com/watch?v=d9MyW72ELq0",
        officialWatchUrl: "https://www.netflix.com/",
        published: true,
        createdAt: now,
      },
      {
        id: "ep_4",
        seriesId: "ser_2",
        seasonId: "sea_3",
        episodeNumber: 1,
        title: "The Winter Solstice Council",
        description: "The Great Houses gather at the Obsidian Citadel as the omens of the Blood Moon appear in the sky.",
        thumbnail: "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=600&auto=format&fit=crop&q=80",
        duration: 64,
        trailerUrl: "https://www.youtube.com/watch?v=KPLWWIOCOOQ",
        officialWatchUrl: "https://www.max.com/",
        published: true,
        createdAt: now,
      },
      {
        id: "ep_5",
        seriesId: "ser_2",
        seasonId: "sea_3",
        episodeNumber: 2,
        title: "Blades in the Mist",
        description: "A stealth ambush along the Dragon Spine Ridge tests the loyalty of the Northern Guard.",
        thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
        duration: 61,
        trailerUrl: "https://www.youtube.com/watch?v=KPLWWIOCOOQ",
        officialWatchUrl: "https://www.max.com/",
        published: true,
        createdAt: now,
      }
    ],
    banners: [
      {
        id: "ban_1",
        title: "Chronicles of Kepler: Beyond Orbit",
        subtitle: "Humanity's daring voyage across the quantum divide. An epic visual triumph.",
        image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1600&auto=format&fit=crop&q=80",
        contentId: "mov_1",
        contentType: "movie",
        buttonText: "Discover Masterpiece",
        buttonUrl: "/movie/chronicles-of-kepler-beyond-orbit",
        order: 1,
        status: "active",
      },
      {
        id: "ban_2",
        title: "Shadow Protocol: Neon Syndicate",
        subtitle: "High-octane cyber thrillers in the neon underworld of Neo-Kyoto.",
        image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80",
        contentId: "mov_2",
        contentType: "movie",
        buttonText: "Explore Syndicate",
        buttonUrl: "/movie/shadow-protocol-neon-syndicate",
        order: 2,
        status: "active",
      },
      {
        id: "ban_3",
        title: "Aetheria: Spirit of the Wind",
        subtitle: "A visually mesmerizing animation journey through floating sky islands.",
        image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80",
        contentId: "mov_7",
        contentType: "movie",
        buttonText: "Experience Magic",
        buttonUrl: "/movie/aetheria-spirit-of-the-wind",
        order: 3,
        status: "active",
      }
    ],
    watchlists: [
      {
        id: "wtch_1",
        userId: "usr_demo_1",
        movieId: "mov_1",
        itemType: "movie",
        createdAt: now,
      },
      {
        id: "wtch_2",
        userId: "usr_demo_1",
        seriesId: "ser_1",
        itemType: "series",
        createdAt: now,
      }
    ],
    activityLogs: [
      { id: "act_1", action: "User alex_morgan added Chronicles of Kepler to Watchlist", timestamp: now },
      { id: "act_2", action: "Admin updated Shadow Protocol banner", timestamp: now },
      { id: "act_3", action: "New movie Aetheria: Spirit of the Wind published", timestamp: now }
    ]
  };
}

// Read / Write Database Helpers
function readDB(): Database {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initial = getInitialSeedData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    const initial = getInitialSeedData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }
}

function writeDB(db: Database) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
}

// Authentication Middlewares
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: "user" | "admin";
    name: string;
  };
}

function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Authentication token required" });
  }
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
  req.user = payload;
  next();
}

function optionalToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      req.user = payload;
    }
  }
  next();
}

function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Administrator privileges required." });
  }
  next();
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// -------------------------------------------------------------
// REST API ENDPOINTS
// -------------------------------------------------------------

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 1. AUTHENTICATION ENDPOINTS
app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }
  const db = readDB();
  const existing = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "An account with this email already exists." });
  }

  const newUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: hashPassword(password),
    profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    role: "user" as const,
    status: "active" as const,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  db.activityLogs.unshift({
    id: `act_${Date.now()}`,
    action: `New user registration: ${newUser.name} (${newUser.email})`,
    timestamp: new Date().toISOString()
  });
  writeDB(db);

  const token = generateToken({ id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name });
  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      profileImage: newUser.profileImage,
      role: newUser.role,
      status: newUser.status,
      createdAt: newUser.createdAt,
    }
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }
  const db = readDB();
  const user = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: "Invalid email or password." });
  }
  if (user.status === "disabled") {
    return res.status(403).json({ error: "Your account has been deactivated. Please contact support." });
  }

  const token = generateToken({ id: user.id, email: user.email, role: user.role, name: user.name });
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    }
  });
});

app.get("/api/auth/me", authenticateToken, (req: AuthenticatedRequest, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.user?.id);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }
  if (user.status === "disabled") {
    return res.status(403).json({ error: "Account deactivated." });
  }
  const watchlistCount = db.watchlists.filter(w => w.userId === user.id).length;
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      watchlistCount,
    }
  });
});

app.put("/api/auth/profile", authenticateToken, (req: AuthenticatedRequest, res) => {
  const { name, profileImage, password } = req.body;
  const db = readDB();
  const userIndex = db.users.findIndex(u => u.id === req.user?.id);
  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found." });
  }

  if (name) db.users[userIndex].name = name.trim();
  if (profileImage) db.users[userIndex].profileImage = profileImage;
  if (password && password.length >= 6) {
    db.users[userIndex].passwordHash = hashPassword(password);
  }

  writeDB(db);
  const updated = db.users[userIndex];
  res.json({
    user: {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      profileImage: updated.profileImage,
      role: updated.role,
      status: updated.status,
      createdAt: updated.createdAt,
    }
  });
});

// 2. MOVIES ENDPOINTS
app.get("/api/movies", optionalToken, (req: AuthenticatedRequest, res) => {
  const db = readDB();
  let movies = [...db.movies];

  // If not admin, only return published
  const isAdmin = req.user?.role === "admin";
  const { genre, language, year, ratingMin, country, sort, search, featured, trending, popular, all } = req.query;

  if (!isAdmin || all !== "true") {
    movies = movies.filter(m => m.published !== false);
  }

  if (genre && typeof genre === "string" && genre !== "All") {
    movies = movies.filter(m => m.genres && m.genres.some((g: string) => g.toLowerCase() === genre.toLowerCase()));
  }

  if (language && typeof language === "string" && language !== "All") {
    movies = movies.filter(m => m.language && m.language.toLowerCase().includes(language.toLowerCase()));
  }

  if (country && typeof country === "string" && country !== "All") {
    movies = movies.filter(m => m.country && m.country.toLowerCase().includes(country.toLowerCase()));
  }

  if (year && typeof year === "string" && year !== "All") {
    movies = movies.filter(m => m.releaseYear === parseInt(year, 10));
  }

  if (ratingMin && typeof ratingMin === "string") {
    const min = parseFloat(ratingMin);
    if (!isNaN(min)) {
      movies = movies.filter(m => m.rating >= min);
    }
  }

  if (featured === "true") {
    movies = movies.filter(m => m.featured);
  }

  if (trending === "true") {
    movies = movies.filter(m => m.trending);
  }

  if (popular === "true") {
    movies = movies.filter(m => m.popular);
  }

  if (search && typeof search === "string" && search.trim() !== "") {
    const q = search.toLowerCase().trim();
    movies = movies.filter(m => 
      m.title.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      (m.director && m.director.toLowerCase().includes(q)) ||
      (m.cast && m.cast.some((c: any) => c.name.toLowerCase().includes(q))) ||
      (m.genres && m.genres.some((g: string) => g.toLowerCase().includes(q)))
    );
  }

  // Sorting
  if (sort === "oldest") {
    movies.sort((a, b) => (a.releaseYear || 0) - (b.releaseYear || 0));
  } else if (sort === "rating") {
    movies.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (sort === "popular") {
    movies.sort((a, b) => (b.views || 0) - (a.views || 0));
  } else if (sort === "title") {
    movies.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    // default: latest
    movies.sort((a, b) => new Date(b.createdAt || b.releaseDate).getTime() - new Date(a.createdAt || a.releaseDate).getTime());
  }

  res.json({ movies, total: movies.length });
});

app.get("/api/movies/:slugOrId", (req, res) => {
  const { slugOrId } = req.params;
  const db = readDB();
  const movieIndex = db.movies.findIndex(m => m.slug === slugOrId || m.id === slugOrId);

  if (movieIndex === -1) {
    return res.status(404).json({ error: "Movie not found" });
  }

  // Increment views
  db.movies[movieIndex].views = (db.movies[movieIndex].views || 0) + 1;
  writeDB(db);

  const movie = db.movies[movieIndex];
  // Find similar movies by matching genres
  const similar = db.movies
    .filter(m => m.id !== movie.id && m.published !== false && m.genres.some((g: string) => movie.genres.includes(g)))
    .slice(0, 6);

  res.json({ movie, similar });
});

app.post("/api/movies", authenticateToken, requireAdmin, (req, res) => {
  const {
    title,
    slug,
    description,
    poster,
    backdrop,
    releaseDate,
    releaseYear,
    runtime,
    language,
    country,
    genres,
    rating,
    director,
    writer,
    producer,
    cast,
    trailerUrl,
    officialWatchUrl,
    featured,
    trending,
    popular,
    published
  } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: "Title and description are required." });
  }

  const db = readDB();
  const finalSlug = (slug ? slugify(slug) : slugify(title)) || `movie-${Date.now()}`;
  
  // Check unique slug
  let uniqueSlug = finalSlug;
  let counter = 1;
  while (db.movies.some(m => m.slug === uniqueSlug)) {
    uniqueSlug = `${finalSlug}-${counter}`;
    counter++;
  }

  const now = new Date().toISOString();
  const newMovie = {
    id: `mov_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    title: title.trim(),
    slug: uniqueSlug,
    description: description.trim(),
    poster: poster || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    backdrop: backdrop || "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1600&auto=format&fit=crop&q=80",
    releaseDate: releaseDate || now.split("T")[0],
    releaseYear: releaseYear ? parseInt(releaseYear, 10) : new Date().getFullYear(),
    runtime: runtime ? parseInt(runtime, 10) : 120,
    language: language || "English",
    country: country || "United States",
    genres: Array.isArray(genres) ? genres : ["Action"],
    rating: rating !== undefined ? parseFloat(rating) : 7.5,
    director: director || "Director Name",
    writer: writer || "Writer Name",
    producer: producer || "Producer Studio",
    cast: Array.isArray(cast) ? cast : [],
    trailerUrl: trailerUrl || "",
    officialWatchUrl: officialWatchUrl || "",
    featured: Boolean(featured),
    trending: Boolean(trending),
    popular: Boolean(popular),
    published: published !== undefined ? Boolean(published) : true,
    views: 0,
    createdAt: now,
    updatedAt: now,
  };

  db.movies.unshift(newMovie);
  db.activityLogs.unshift({
    id: `act_${Date.now()}`,
    action: `Movie added: "${newMovie.title}"`,
    timestamp: now
  });
  writeDB(db);

  res.status(201).json({ movie: newMovie });
});

app.put("/api/movies/:id", authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const index = db.movies.findIndex(m => m.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Movie not found" });
  }

  const existing = db.movies[index];
  const updatedMovie = {
    ...existing,
    ...req.body,
    id: existing.id,
    releaseYear: req.body.releaseYear ? parseInt(req.body.releaseYear, 10) : existing.releaseYear,
    runtime: req.body.runtime ? parseInt(req.body.runtime, 10) : existing.runtime,
    rating: req.body.rating !== undefined ? parseFloat(req.body.rating) : existing.rating,
    genres: Array.isArray(req.body.genres) ? req.body.genres : existing.genres,
    cast: Array.isArray(req.body.cast) ? req.body.cast : existing.cast,
    updatedAt: new Date().toISOString()
  };

  db.movies[index] = updatedMovie;
  db.activityLogs.unshift({
    id: `act_${Date.now()}`,
    action: `Movie updated: "${updatedMovie.title}"`,
    timestamp: new Date().toISOString()
  });
  writeDB(db);

  res.json({ movie: updatedMovie });
});

app.delete("/api/movies/:id", authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const movie = db.movies.find(m => m.id === id);
  if (!movie) {
    return res.status(404).json({ error: "Movie not found" });
  }

  db.movies = db.movies.filter(m => m.id !== id);
  // Also clean up watchlist items
  db.watchlists = db.watchlists.filter(w => w.movieId !== id);
  db.activityLogs.unshift({
    id: `act_${Date.now()}`,
    action: `Movie deleted: "${movie.title}"`,
    timestamp: new Date().toISOString()
  });
  writeDB(db);

  res.json({ success: true, message: "Movie deleted successfully" });
});

// 3. SERIES & SEASONS & EPISODES ENDPOINTS
app.get("/api/series", optionalToken, (req: AuthenticatedRequest, res) => {
  const db = readDB();
  let series = [...db.series];
  const isAdmin = req.user?.role === "admin";
  const { genre, language, sort, search, featured, trending, all } = req.query;

  if (!isAdmin || all !== "true") {
    series = series.filter(s => s.published !== false);
  }

  if (genre && typeof genre === "string" && genre !== "All") {
    series = series.filter(s => s.genres && s.genres.some((g: string) => g.toLowerCase() === genre.toLowerCase()));
  }

  if (language && typeof language === "string" && language !== "All") {
    series = series.filter(s => s.language && s.language.toLowerCase().includes(language.toLowerCase()));
  }

  if (featured === "true") {
    series = series.filter(s => s.featured);
  }

  if (trending === "true") {
    series = series.filter(s => s.trending);
  }

  if (search && typeof search === "string" && search.trim() !== "") {
    const q = search.toLowerCase().trim();
    series = series.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      (s.genres && s.genres.some((g: string) => g.toLowerCase().includes(q)))
    );
  }

  if (sort === "rating") {
    series.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (sort === "popular") {
    series.sort((a, b) => (b.views || 0) - (a.views || 0));
  } else if (sort === "title") {
    series.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    series.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  // Attach season count
  const seriesWithCounts = series.map(s => {
    const sCount = db.seasons.filter(sea => sea.seriesId === s.id).length;
    const epCount = db.episodes.filter(ep => ep.seriesId === s.id).length;
    return { ...s, seasonCount: sCount, episodeCount: epCount };
  });

  res.json({ series: seriesWithCounts, total: series.length });
});

app.get("/api/series/:slugOrId", (req, res) => {
  const { slugOrId } = req.params;
  const db = readDB();
  const seriesIndex = db.series.findIndex(s => s.slug === slugOrId || s.id === slugOrId);

  if (seriesIndex === -1) {
    return res.status(404).json({ error: "Series not found" });
  }

  db.series[seriesIndex].views = (db.series[seriesIndex].views || 0) + 1;
  writeDB(db);

  const series = db.series[seriesIndex];
  const seasons = db.seasons
    .filter(sea => sea.seriesId === series.id)
    .sort((a, b) => a.seasonNumber - b.seasonNumber)
    .map(season => {
      const episodes = db.episodes
        .filter(ep => ep.seasonId === season.id && ep.published !== false)
        .sort((a, b) => a.episodeNumber - b.episodeNumber);
      return { ...season, episodes };
    });

  const similar = db.series
    .filter(s => s.id !== series.id && s.published !== false && s.genres.some((g: string) => series.genres.includes(g)))
    .slice(0, 6);

  res.json({ series: { ...series, seasons }, similar });
});

app.post("/api/series", authenticateToken, requireAdmin, (req, res) => {
  const {
    title,
    slug,
    description,
    poster,
    backdrop,
    releaseDate,
    language,
    country,
    genres,
    rating,
    cast,
    director,
    trailerUrl,
    featured,
    trending,
    published
  } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: "Title and description are required." });
  }

  const db = readDB();
  const finalSlug = (slug ? slugify(slug) : slugify(title)) || `series-${Date.now()}`;
  let uniqueSlug = finalSlug;
  let counter = 1;
  while (db.series.some(s => s.slug === uniqueSlug)) {
    uniqueSlug = `${finalSlug}-${counter}`;
    counter++;
  }

  const now = new Date().toISOString();
  const newSeries = {
    id: `ser_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    title: title.trim(),
    slug: uniqueSlug,
    description: description.trim(),
    poster: poster || "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
    backdrop: backdrop || "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1600&auto=format&fit=crop&q=80",
    releaseDate: releaseDate || now.split("T")[0],
    language: language || "English",
    country: country || "United States",
    genres: Array.isArray(genres) ? genres : ["Drama"],
    rating: rating !== undefined ? parseFloat(rating) : 8.0,
    cast: Array.isArray(cast) ? cast : [],
    director: director || "Series Showrunner",
    trailerUrl: trailerUrl || "",
    featured: Boolean(featured),
    trending: Boolean(trending),
    published: published !== undefined ? Boolean(published) : true,
    views: 0,
    createdAt: now,
    updatedAt: now,
  };

  // Create default Season 1
  const defaultSeason = {
    id: `sea_${Date.now()}_1`,
    seriesId: newSeries.id,
    seasonNumber: 1,
    title: "Season 1",
    createdAt: now
  };

  db.series.unshift(newSeries);
  db.seasons.push(defaultSeason);
  db.activityLogs.unshift({
    id: `act_${Date.now()}`,
    action: `Series added: "${newSeries.title}"`,
    timestamp: now
  });
  writeDB(db);

  res.status(201).json({ series: newSeries });
});

app.put("/api/series/:id", authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const index = db.series.findIndex(s => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Series not found" });
  }

  const existing = db.series[index];
  const updated = {
    ...existing,
    ...req.body,
    id: existing.id,
    rating: req.body.rating !== undefined ? parseFloat(req.body.rating) : existing.rating,
    genres: Array.isArray(req.body.genres) ? req.body.genres : existing.genres,
    cast: Array.isArray(req.body.cast) ? req.body.cast : existing.cast,
    updatedAt: new Date().toISOString()
  };

  db.series[index] = updated;
  db.activityLogs.unshift({
    id: `act_${Date.now()}`,
    action: `Series updated: "${updated.title}"`,
    timestamp: new Date().toISOString()
  });
  writeDB(db);

  res.json({ series: updated });
});

app.delete("/api/series/:id", authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const series = db.series.find(s => s.id === id);
  if (!series) {
    return res.status(404).json({ error: "Series not found" });
  }

  db.series = db.series.filter(s => s.id !== id);
  db.seasons = db.seasons.filter(s => s.seriesId !== id);
  db.episodes = db.episodes.filter(e => e.seriesId !== id);
  db.watchlists = db.watchlists.filter(w => w.seriesId !== id);

  db.activityLogs.unshift({
    id: `act_${Date.now()}`,
    action: `Series deleted: "${series.title}"`,
    timestamp: new Date().toISOString()
  });
  writeDB(db);

  res.json({ success: true, message: "Series and related seasons/episodes deleted." });
});

// Seasons Endpoints
app.post("/api/seasons", authenticateToken, requireAdmin, (req, res) => {
  const { seriesId, seasonNumber, title } = req.body;
  if (!seriesId) return res.status(400).json({ error: "seriesId is required" });

  const db = readDB();
  const newSeason = {
    id: `sea_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    seriesId,
    seasonNumber: parseInt(seasonNumber, 10) || 1,
    title: title || `Season ${seasonNumber}`,
    createdAt: new Date().toISOString()
  };

  db.seasons.push(newSeason);
  writeDB(db);
  res.status(201).json({ season: newSeason });
});

app.put("/api/seasons/:id", authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const index = db.seasons.findIndex(s => s.id === id);
  if (index === -1) return res.status(404).json({ error: "Season not found" });

  db.seasons[index] = { ...db.seasons[index], ...req.body };
  writeDB(db);
  res.json({ season: db.seasons[index] });
});

app.delete("/api/seasons/:id", authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.seasons = db.seasons.filter(s => s.id !== id);
  db.episodes = db.episodes.filter(e => e.seasonId !== id);
  writeDB(db);
  res.json({ success: true });
});

// Episodes Endpoints
app.post("/api/episodes", authenticateToken, requireAdmin, (req, res) => {
  const { seriesId, seasonId, episodeNumber, title, description, thumbnail, duration, trailerUrl, officialWatchUrl, published } = req.body;
  if (!seriesId || !seasonId || !title) {
    return res.status(400).json({ error: "seriesId, seasonId, and title are required" });
  }

  const db = readDB();
  const newEpisode = {
    id: `ep_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    seriesId,
    seasonId,
    episodeNumber: parseInt(episodeNumber, 10) || 1,
    title: title.trim(),
    description: description || "",
    thumbnail: thumbnail || "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
    duration: duration ? parseInt(duration, 10) : 45,
    trailerUrl: trailerUrl || "",
    officialWatchUrl: officialWatchUrl || "",
    published: published !== undefined ? Boolean(published) : true,
    createdAt: new Date().toISOString()
  };

  db.episodes.push(newEpisode);
  writeDB(db);
  res.status(201).json({ episode: newEpisode });
});

app.put("/api/episodes/:id", authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const index = db.episodes.findIndex(e => e.id === id);
  if (index === -1) return res.status(404).json({ error: "Episode not found" });

  db.episodes[index] = {
    ...db.episodes[index],
    ...req.body,
    episodeNumber: req.body.episodeNumber ? parseInt(req.body.episodeNumber, 10) : db.episodes[index].episodeNumber,
    duration: req.body.duration ? parseInt(req.body.duration, 10) : db.episodes[index].duration
  };
  writeDB(db);
  res.json({ episode: db.episodes[index] });
});

app.delete("/api/episodes/:id", authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.episodes = db.episodes.filter(e => e.id !== id);
  writeDB(db);
  res.json({ success: true });
});

// 4. CATEGORIES ENDPOINTS
app.get("/api/categories", (req, res) => {
  const db = readDB();
  const categories = [...db.categories].sort((a, b) => a.order - b.order);
  // Add count of movies per category
  const categoriesWithCounts = categories.map(cat => {
    const movieCount = db.movies.filter(m => m.published !== false && m.genres.some((g: string) => g.toLowerCase() === cat.name.toLowerCase() || g.toLowerCase() === cat.slug.toLowerCase())).length;
    const seriesCount = db.series.filter(s => s.published !== false && s.genres.some((g: string) => g.toLowerCase() === cat.name.toLowerCase() || g.toLowerCase() === cat.slug.toLowerCase())).length;
    return { ...cat, movieCount, seriesCount, totalCount: movieCount + seriesCount };
  });
  res.json({ categories: categoriesWithCounts });
});

app.post("/api/categories", authenticateToken, requireAdmin, (req, res) => {
  const { name, slug, image, description, order, status } = req.body;
  if (!name) return res.status(400).json({ error: "Category name is required" });

  const db = readDB();
  const catSlug = slug ? slugify(slug) : slugify(name);
  const newCat = {
    id: `cat_${Date.now()}`,
    name: name.trim(),
    slug: catSlug,
    image: image || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80",
    description: description || "",
    order: order ? parseInt(order, 10) : db.categories.length + 1,
    status: status || "active",
  };

  db.categories.push(newCat);
  writeDB(db);
  res.status(201).json({ category: newCat });
});

app.put("/api/categories/:id", authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const index = db.categories.findIndex(c => c.id === id);
  if (index === -1) return res.status(404).json({ error: "Category not found" });

  db.categories[index] = { ...db.categories[index], ...req.body };
  writeDB(db);
  res.json({ category: db.categories[index] });
});

app.delete("/api/categories/:id", authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.categories = db.categories.filter(c => c.id !== id);
  writeDB(db);
  res.json({ success: true });
});

// 5. BANNERS ENDPOINTS
app.get("/api/banners", (req, res) => {
  const db = readDB();
  const banners = db.banners
    .filter(b => b.status === "active")
    .sort((a, b) => a.order - b.order);
  res.json({ banners });
});

app.get("/api/admin/banners", authenticateToken, requireAdmin, (req, res) => {
  const db = readDB();
  const banners = [...db.banners].sort((a, b) => a.order - b.order);
  res.json({ banners });
});

app.post("/api/banners", authenticateToken, requireAdmin, (req, res) => {
  const { title, subtitle, image, contentId, contentType, buttonText, buttonUrl, order, status } = req.body;
  if (!title || !image) return res.status(400).json({ error: "Title and image are required" });

  const db = readDB();
  const newBanner = {
    id: `ban_${Date.now()}`,
    title: title.trim(),
    subtitle: subtitle || "",
    image,
    contentId: contentId || "",
    contentType: contentType || "custom",
    buttonText: buttonText || "View Details",
    buttonUrl: buttonUrl || "/",
    order: order ? parseInt(order, 10) : db.banners.length + 1,
    status: status || "active",
  };

  db.banners.push(newBanner);
  writeDB(db);
  res.status(201).json({ banner: newBanner });
});

app.put("/api/banners/:id", authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const index = db.banners.findIndex(b => b.id === id);
  if (index === -1) return res.status(404).json({ error: "Banner not found" });

  db.banners[index] = { ...db.banners[index], ...req.body };
  writeDB(db);
  res.json({ banner: db.banners[index] });
});

app.delete("/api/banners/:id", authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.banners = db.banners.filter(b => b.id !== id);
  writeDB(db);
  res.json({ success: true });
});

// 6. USER MANAGEMENT ENDPOINTS
app.get("/api/users", authenticateToken, requireAdmin, (req, res) => {
  const db = readDB();
  const sanitizedUsers = db.users.map(u => {
    const watchlistCount = db.watchlists.filter(w => w.userId === u.id).length;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      profileImage: u.profileImage,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt,
      watchlistCount
    };
  });
  res.json({ users: sanitizedUsers });
});

app.put("/api/users/:id/status", authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { status, role } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: "User not found" });

  if (user.id === req.user?.id && status === "disabled") {
    return res.status(400).json({ error: "You cannot disable your own admin account." });
  }

  if (status && (status === "active" || status === "disabled")) {
    user.status = status;
  }
  if (role && (role === "user" || role === "admin")) {
    user.role = role;
  }

  writeDB(db);
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    }
  });
});

app.delete("/api/users/:id", authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  if (id === req.user?.id) {
    return res.status(400).json({ error: "Cannot delete your own account." });
  }
  const db = readDB();
  db.users = db.users.filter(u => u.id !== id);
  db.watchlists = db.watchlists.filter(w => w.userId !== id);
  writeDB(db);
  res.json({ success: true });
});

// 7. WATCHLIST ENDPOINTS
app.get("/api/watchlist", authenticateToken, (req: AuthenticatedRequest, res) => {
  const db = readDB();
  const userItems = db.watchlists.filter(w => w.userId === req.user?.id);
  
  const populated = userItems.map(item => {
    if (item.itemType === "series" || item.seriesId) {
      const s = db.series.find(x => x.id === (item.seriesId || item.movieId));
      return { ...item, item: s, itemType: "series" };
    } else {
      const m = db.movies.find(x => x.id === item.movieId);
      return { ...item, item: m, itemType: "movie" };
    }
  }).filter(item => item.item !== undefined);

  res.json({ watchlist: populated });
});

app.post("/api/watchlist", authenticateToken, (req: AuthenticatedRequest, res) => {
  const { movieId, seriesId, itemType } = req.body;
  const targetId = movieId || seriesId;
  if (!targetId) return res.status(400).json({ error: "movieId or seriesId is required" });

  const db = readDB();
  const userId = req.user!.id;
  const existing = db.watchlists.find(w => w.userId === userId && (w.movieId === targetId || w.seriesId === targetId));

  if (existing) {
    return res.json({ message: "Item already in watchlist", item: existing });
  }

  const newItem = {
    id: `wtch_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    userId,
    movieId: itemType === "series" ? undefined : targetId,
    seriesId: itemType === "series" ? targetId : undefined,
    itemType: itemType || "movie",
    createdAt: new Date().toISOString()
  };

  db.watchlists.push(newItem);
  writeDB(db);
  res.status(201).json({ item: newItem, message: "Added to watchlist" });
});

app.delete("/api/watchlist/:targetId", authenticateToken, (req: AuthenticatedRequest, res) => {
  const { targetId } = req.params;
  const userId = req.user!.id;
  const db = readDB();

  db.watchlists = db.watchlists.filter(w => 
    !(w.userId === userId && (w.id === targetId || w.movieId === targetId || w.seriesId === targetId))
  );
  writeDB(db);
  res.json({ success: true, message: "Removed from watchlist" });
});

// 8. FAST SEARCH ENDPOINT
app.get("/api/search", (req, res) => {
  const query = (req.query.q as string || "").toLowerCase().trim();
  if (!query) {
    return res.json({ results: [], suggestions: [] });
  }

  const db = readDB();
  const results: any[] = [];
  const suggestionsSet = new Set<string>();

  // Search Movies
  db.movies.forEach(m => {
    if (m.published === false) return;
    const titleMatch = m.title.toLowerCase().includes(query);
    const descMatch = m.description.toLowerCase().includes(query);
    const directorMatch = m.director && m.director.toLowerCase().includes(query);
    const langMatch = m.language && m.language.toLowerCase().includes(query);
    const genreMatch = m.genres && m.genres.some((g: string) => g.toLowerCase().includes(query));
    const castMatch = m.cast && m.cast.some((c: any) => c.name.toLowerCase().includes(query));

    if (titleMatch || descMatch || directorMatch || langMatch || genreMatch || castMatch) {
      results.push({
        id: m.id,
        title: m.title,
        slug: m.slug,
        type: "movie",
        subtitle: `${m.releaseYear} • ${m.genres.slice(0, 2).join(", ")}`,
        image: m.poster,
        rating: m.rating,
        year: m.releaseYear,
        genres: m.genres
      });
      suggestionsSet.add(m.title);
    }
  });

  // Search Series
  db.series.forEach(s => {
    if (s.published === false) return;
    const titleMatch = s.title.toLowerCase().includes(query);
    const descMatch = s.description.toLowerCase().includes(query);
    const genreMatch = s.genres && s.genres.some((g: string) => g.toLowerCase().includes(query));
    const castMatch = s.cast && s.cast.some((c: any) => c.name.toLowerCase().includes(query));

    if (titleMatch || descMatch || genreMatch || castMatch) {
      results.push({
        id: s.id,
        title: s.title,
        slug: s.slug,
        type: "series",
        subtitle: `Series • ${s.genres.slice(0, 2).join(", ")}`,
        image: s.poster,
        rating: s.rating,
        genres: s.genres
      });
      suggestionsSet.add(s.title);
    }
  });

  // Collect matching genres and directors
  db.categories.forEach(c => {
    if (c.name.toLowerCase().includes(query)) {
      suggestionsSet.add(`Genre: ${c.name}`);
    }
  });

  res.json({
    results,
    suggestions: Array.from(suggestionsSet).slice(0, 8)
  });
});

// 9. ADMIN DASHBOARD STATS
app.get("/api/stats", authenticateToken, requireAdmin, (req, res) => {
  const db = readDB();
  const totalMovies = db.movies.length;
  const totalSeries = db.series.length;
  const totalEpisodes = db.episodes.length;
  const totalCategories = db.categories.length;
  const totalUsers = db.users.length;
  const totalWatchlistItems = db.watchlists.length;

  const totalViews = db.movies.reduce((acc, m) => acc + (m.views || 0), 0) +
                     db.series.reduce((acc, s) => acc + (s.views || 0), 0);

  const popularMovies = [...db.movies].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
  const recentMovies = [...db.movies].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const categoryDistribution = db.categories.map(cat => {
    const count = db.movies.filter(m => m.genres.some((g: string) => g.toLowerCase() === cat.name.toLowerCase())).length;
    return { name: cat.name, count };
  });

  const viewsTrend = [
    { label: "Mon", views: Math.floor(totalViews * 0.12) + 120 },
    { label: "Tue", views: Math.floor(totalViews * 0.15) + 180 },
    { label: "Wed", views: Math.floor(totalViews * 0.14) + 140 },
    { label: "Thu", views: Math.floor(totalViews * 0.18) + 210 },
    { label: "Fri", views: Math.floor(totalViews * 0.22) + 320 },
    { label: "Sat", views: Math.floor(totalViews * 0.28) + 450 },
    { label: "Sun", views: Math.floor(totalViews * 0.25) + 390 },
  ];

  res.json({
    totalUsers,
    totalMovies,
    totalSeries,
    totalEpisodes,
    totalCategories,
    totalWatchlistItems,
    totalViews,
    recentMovies,
    popularMovies,
    categoryDistribution,
    viewsTrend,
    activityLogs: db.activityLogs.slice(0, 10)
  });
});

// 10. IMAGE UPLOAD HANDLER (Handles base64 / data URLs / mock CDN storage)
app.post("/api/upload", authenticateToken, requireAdmin, (req, res) => {
  const { data, filename } = req.body;
  if (!data) {
    return res.status(400).json({ error: "Image data is required" });
  }

  // If it's already a URL, return it
  if (typeof data === "string" && data.startsWith("http")) {
    return res.json({ url: data });
  }

  // Base64 storage
  if (typeof data === "string" && data.startsWith("data:image")) {
    // Return data URI directly or save to data/uploads if needed
    return res.json({ url: data });
  }

  res.status(400).json({ error: "Invalid image format" });
});

// -------------------------------------------------------------
// VITE / STATIC SERVING INTEGRATION
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Movie Hub server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

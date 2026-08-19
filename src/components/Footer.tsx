import React from 'react';
import { Film, Shield, Heart } from 'lucide-react';
import { LegalPageType } from './LegalModal';

interface FooterProps {
  onNavigate: (view: string, data?: any) => void;
  onOpenLegal: (type: LegalPageType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenLegal }) => {
  return (
    <footer className="w-full bg-[#050505] border-t border-white/10 text-white/60 text-xs mt-20 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#C9A66B] to-[#8E6D3E] flex items-center justify-center text-black">
                <Film className="w-3.5 h-3.5 text-black stroke-[2.5]" />
              </div>
              <span className="font-serif italic font-bold text-lg text-[#C9A66B] tracking-tight">MOVIE HUB</span>
            </div>
            <p className="text-xs text-white/50 leading-relaxed">
              Curated dark cinema archive. Handcrafted catalog with zero external API dependencies and direct legal streaming pointers.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-[#C9A66B]/80 pt-1">
              <Shield className="w-3.5 h-3.5 text-[#C9A66B]" />
              <span>100% Authorized Legal Cinema</span>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-bold text-[#C9A66B] text-[10px] uppercase tracking-[0.2em] mb-3">Explore Vault</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-white text-white/50 transition">
                  Featured Premiere
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('movies')} className="hover:text-white text-white/50 transition">
                  All Movies
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('series')} className="hover:text-white text-white/50 transition">
                  Web Series & Seasons
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('trending')} className="hover:text-white text-white/50 transition">
                  Trending Titles
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('categories')} className="hover:text-white text-white/50 transition">
                  Genre Directory
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold text-[#C9A66B] text-[10px] uppercase tracking-[0.2em] mb-3">Curated Genres</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('movies', { genre: 'Action' })} className="hover:text-white text-white/50 transition">
                  Action & Thrillers
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('movies', { genre: 'Sci-Fi' })} className="hover:text-white text-white/50 transition">
                  Sci-Fi & Cyberpunk
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('movies', { genre: 'Drama' })} className="hover:text-white text-white/50 transition">
                  Drama & Masterpieces
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('movies', { genre: 'Animation' })} className="hover:text-white text-white/50 transition">
                  Animation & Fantasy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('movies', { genre: 'Horror' })} className="hover:text-white text-white/50 transition">
                  Horror & Mystery
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Policy */}
          <div>
            <h4 className="font-bold text-[#C9A66B] text-[10px] uppercase tracking-[0.2em] mb-3">Legal & Compliance</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onOpenLegal('about')} className="hover:text-white text-white/50 transition">
                  About Movie Hub
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('contact')} className="hover:text-white text-white/50 transition">
                  Contact Support
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('privacy')} className="hover:text-white text-white/50 transition">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('terms')} className="hover:text-white text-white/50 transition">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('disclaimer')} className="hover:text-[#C9A66B] text-[#C9A66B]/90 font-medium transition">
                  Legal Disclaimer
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('copyright')} className="hover:text-white text-white/50 transition">
                  Copyright & DMCA
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] uppercase tracking-[0.15em] text-white/40">
          <p>© {new Date().getFullYear()} Movie Hub • Premium Entertainment & Cinema Architecture</p>
          <p className="flex items-center gap-1.5 text-white/30">
            Self-contained Vault <span className="text-[#C9A66B]">•</span> No External APIs
          </p>
        </div>
      </div>
    </footer>
  );
};

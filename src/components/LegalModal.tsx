import React from 'react';
import { X, ShieldCheck, Mail, FileText, AlertTriangle, Copyright } from 'lucide-react';

export type LegalPageType = 'about' | 'contact' | 'privacy' | 'terms' | 'disclaimer' | 'copyright';

interface LegalModalProps {
  pageType: LegalPageType | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ pageType, onClose }) => {
  if (!pageType) return null;

  const renderContent = () => {
    switch (pageType) {
      case 'about':
        return (
          <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
            <div className="flex items-center gap-3 text-cyan-400 font-bold text-lg border-b border-slate-800 pb-2">
              <ShieldCheck className="w-6 h-6" />
              <span>About Movie Hub</span>
            </div>
            <p>
              <strong>Movie Hub</strong> is a premier, self-hosted cinematic discovery platform designed for film aficionados, web series enthusiasts, and digital entertainment curators.
            </p>
            <p>
              Unlike automated scraping databases or external API aggregators, Movie Hub operates on an independent, precision-curated local catalog directly managed by cinema editors and administrators.
            </p>
            <h4 className="font-semibold text-slate-100 pt-2">Our Mission</h4>
            <p>
              To offer a high-performance, dark cinematic web interface where users can discover original storylines, explore episodic web series, manage custom watchlists, and seamlessly locate authorized, legal streaming platforms.
            </p>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
            <div className="flex items-center gap-3 text-cyan-400 font-bold text-lg border-b border-slate-800 pb-2">
              <Mail className="w-6 h-6" />
              <span>Contact Movie Hub Team</span>
            </div>
            <p>
              Have a question, feedback, editorial inquiry, or technical concern regarding Movie Hub? Our support team is here to assist.
            </p>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <p><strong>General Inquiries:</strong> support@moviehub.io</p>
              <p><strong>Editorial & Content Submissions:</strong> editor@moviehub.io</p>
              <p><strong>Legal & Compliance:</strong> legal@moviehub.io</p>
            </div>
            <p className="text-xs text-slate-500">
              Response time is typically within 24 to 48 business hours.
            </p>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
            <div className="flex items-center gap-3 text-cyan-400 font-bold text-lg border-b border-slate-800 pb-2">
              <FileText className="w-6 h-6" />
              <span>Privacy Policy</span>
            </div>
            <p>
              Your privacy is paramount at Movie Hub. We only collect the minimal information necessary to provide account services and personalized watchlists:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-400">
              <li>Account Credentials (Name, Email, securely hashed passwords).</li>
              <li>User Watchlist Selections and preferences.</li>
              <li>Anonymized aggregate view metrics for catalog trends.</li>
            </ul>
            <p>
              We do <strong>never sell, lease, or distribute</strong> your personal information to third-party data brokers or advertisers.
            </p>
          </div>
        );

      case 'terms':
        return (
          <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
            <div className="flex items-center gap-3 text-cyan-400 font-bold text-lg border-b border-slate-800 pb-2">
              <FileText className="w-6 h-6" />
              <span>Terms & Conditions</span>
            </div>
            <p>
              By accessing and using Movie Hub, you agree to comply with all applicable local, national, and international laws.
            </p>
            <p>
              You agree not to attempt unauthorized administrative access, abuse server APIs, or attempt to upload harmful content. All user accounts found in violation are subject to deactivation.
            </p>
          </div>
        );

      case 'disclaimer':
        return (
          <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
            <div className="flex items-center gap-3 text-amber-400 font-bold text-lg border-b border-slate-800 pb-2">
              <AlertTriangle className="w-6 h-6" />
              <span>Legal Disclaimer & Authorized Streams</span>
            </div>
            <div className="p-3.5 bg-amber-950/40 border border-amber-800/60 rounded-xl text-amber-200 text-xs leading-relaxed">
              <strong>Strict Compliance Notice:</strong> Movie Hub is an informational directory and review catalog. We <strong>do NOT host, stream, or distribute unauthorized, copyrighted movie files or torrents</strong> on our servers.
            </div>
            <p>
              All external streaming links provided on Movie Hub redirect users to official, licensed digital distribution platforms (such as Netflix, Prime Video, Apple TV+, Disney+, Hulu, HBO Max, etc.).
            </p>
            <p>
              Movie Hub is not affiliated with or endorsed by external streaming companies unless specifically noted.
            </p>
          </div>
        );

      case 'copyright':
        return (
          <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
            <div className="flex items-center gap-3 text-cyan-400 font-bold text-lg border-b border-slate-800 pb-2">
              <Copyright className="w-6 h-6" />
              <span>Copyright & DMCA Policy</span>
            </div>
            <p>
              Movie Hub respects intellectual property rights. All movie titles, descriptions, and promotional artwork are used strictly for informational, educational, and commentary purposes under fair use doctrine.
            </p>
            <p>
              If you are a copyright owner or authorized representative and believe content on Movie Hub infringes your copyright, please contact our designated agent at <span className="text-cyan-400 font-mono">dmca@moviehub.io</span> with:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-400 text-xs">
              <li>Identification of the copyrighted work claimed to have been infringed.</li>
              <li>Exact URL or title on Movie Hub.</li>
              <li>Your contact information and legal verification statement.</li>
            </ul>
          </div>
        );
    }
  };

  return (
    <div
      id="legal-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        id="legal-modal-container"
        className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Information & Legal</span>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {renderContent()}
        </div>

        <div className="px-6 py-3.5 bg-slate-950/80 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

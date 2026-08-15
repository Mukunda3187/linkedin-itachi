import React, { useState } from 'react';
import { Copy, Check, Sparkles, X } from 'lucide-react';

interface LinkedInPostCardProps {
  postText: string;
  onClose: () => void;
}

export const LinkedInPostCard: React.FC<LinkedInPostCardProps> = ({
  postText,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(postText);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = postText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    }
  };

  return (
    <div className="itachi-post-overlay pointer-events-auto select-text">
      <div
        className="itachi-post-card glass-card-crimson text-neutral-100 transition-all duration-500 shadow-2xl card-enter"
        style={{
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.95), 0 0 40px rgba(220, 38, 38, 0.15)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40 backdrop-blur-md">
          <div className="flex items-center space-x-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="font-serif tracking-widest text-xs uppercase text-neutral-300 font-semibold">
              Mangekyō Generated • LinkedIn Post
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-all duration-200"
            title="Close and restart"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Post Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar font-sans text-sm md:text-base leading-relaxed text-neutral-200 whitespace-pre-wrap selection:bg-red-900 selection:text-white">
          {postText}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-white/10 bg-black/50 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-neutral-400 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-red-400" />
            <span>Ready for 1-click LinkedIn publishing</span>
          </div>

          <button
            onClick={handleCopy}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-medium text-xs md:text-sm tracking-wider uppercase transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg ${
              copied
                ? 'bg-emerald-600/90 text-white shadow-emerald-900/50 scale-[1.02]'
                : 'bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white shadow-red-950/80 hover:shadow-red-800/40 active:scale-95'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-white animate-scale-check" />
                <span className="font-bold">POST COPIED ✓</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-red-200" />
                <span>COPY WHOLE TEXT</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

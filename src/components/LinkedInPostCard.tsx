import React, { useState } from 'react';
import { Copy, Check, X } from 'lucide-react';

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
    <div
      className="itachi-post-overlay pointer-events-auto select-text"
      style={{ fontFamily: 'var(--font-russo)' }}
    >
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
            <span className="tracking-widest text-xs uppercase text-neutral-300">
              LinkedIn Description
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

        {/* Body: post text + copy button side by side */}
        <div className="flex-1 flex items-end gap-4 px-6 py-5">
          <div className="flex-1 overflow-y-auto custom-scrollbar text-sm md:text-base leading-relaxed text-neutral-100 whitespace-pre-wrap selection:bg-red-900 selection:text-white">
            {postText}
          </div>

          <button
            onClick={handleCopy}
            className={`shrink-0 flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-xl border-2 transition-all duration-300 ${
              copied
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 scale-[1.05]'
                : 'border-red-600/70 text-red-500 hover:border-red-500 hover:bg-red-600/10 active:scale-95'
            }`}
            title={copied ? 'Copied' : 'Copy'}
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            <span className="text-[9px] tracking-wider">{copied ? 'COPIED' : 'COPY'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

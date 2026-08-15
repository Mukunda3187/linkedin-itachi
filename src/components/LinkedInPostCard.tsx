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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(0,0,0,0.4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" style={{ flexShrink: 0 }} />
            <span style={{ letterSpacing: '0.15em', fontSize: '12px', textTransform: 'uppercase', color: '#d4d4d4' }}>
              LinkedIn Description
            </span>
          </div>

          <button
            onClick={onClose}
            className="hover:text-white hover:bg-white/10"
            style={{
              padding: '6px',
              borderRadius: '999px',
              color: '#a3a3a3',
              transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
            title="Close and restart"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body: post text + copy button side by side */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '18px',
            padding: '22px 24px 26px',
          }}
        >
          <div
            className="custom-scrollbar selection:bg-red-900 selection:text-white"
            style={{
              flex: 1,
              overflowY: 'auto',
              fontSize: '15px',
              lineHeight: 1.7,
              color: '#f0f0f0',
              whiteSpace: 'pre-wrap',
            }}
          >
            {postText}
          </div>

          <button
            onClick={handleCopy}
            style={{
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              width: '64px',
              height: '64px',
              borderRadius: '12px',
              border: copied ? '2px solid #10b981' : '2px solid rgba(220,38,38,0.7)',
              background: copied ? 'rgba(16,185,129,0.1)' : 'transparent',
              transition: 'all 0.25s ease',
            }}
            title={copied ? 'Copied' : 'Copy'}
          >
            {copied ? (
              <Check className="w-5 h-5" style={{ color: '#34d399' }} />
            ) : (
              <Copy className="w-5 h-5" style={{ color: '#ef4444' }} />
            )}
            <span style={{ fontSize: '9px', letterSpacing: '0.1em', color: '#ffffff' }}>
              {copied ? 'COPIED' : 'COPY'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

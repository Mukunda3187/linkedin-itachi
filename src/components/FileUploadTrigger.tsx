import React, { useRef, useEffect } from 'react';

interface FileUploadTriggerProps {
  onFilesSelected: (files: File[]) => void;
  shouldTriggerAutoUpload: boolean;
  onUploadHandled: () => void;
  uploadedFiles: File[];
  isAnalyzing: boolean;
  errorMessage?: string | null;
  onRetry: () => void;
}

export const FileUploadTrigger: React.FC<FileUploadTriggerProps> = ({
  onFilesSelected,
  shouldTriggerAutoUpload,
  onUploadHandled,
  uploadedFiles,
  isAnalyzing,
  errorMessage,
  onRetry,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Automatically launch file picker when requested
  useEffect(() => {
    if (shouldTriggerAutoUpload && fileInputRef.current) {
      // Small timeout ensures render transition is complete
      const timer = setTimeout(() => {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
          fileInputRef.current.click();
          onUploadHandled();
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [shouldTriggerAutoUpload, onUploadHandled]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files).filter((file) =>
        ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)
      );
      if (selected.length > 0) {
        onFilesSelected(selected);
      }
    }
  };

  return (
    <>
      {/* Hidden system file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={handleFileChange}
        className="hidden"
        id="itachi-file-input"
        style={{ display: 'none' }}
      />

      {/* Floating subtle status badge when files are selected or analyzing */}
      {(isAnalyzing || (uploadedFiles.length > 0 && !errorMessage)) && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <div className="flex items-center space-x-3 px-5 py-2.5 rounded-full glass-panel border border-red-500/30 shadow-lg shadow-black/80 backdrop-blur-xl animate-breathe">
            <div className="flex items-center space-x-2 text-xs font-medium text-neutral-200">
              {isAnalyzing ? (
                <img
                  src="/sharingan.png"
                  alt=""
                  className="sharingan-spin"
                  style={{ width: '16px', height: '16px' }}
                />
              ) : (
                <UploadCloud className="w-4 h-4 text-red-400 animate-pulse" />
              )}
              <span>
                {isAnalyzing
                  ? `Analyzing ${uploadedFiles.length} Project files${uploadedFiles.length > 1 ? 's' : ''}...`
                  : `${uploadedFiles.length} files${uploadedFiles.length > 1 ? 's' : ''} Loaded`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Error notification banner */}
      {errorMessage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="flex items-center space-x-3 px-5 py-3 rounded-xl bg-red-950/80 border border-red-500/50 shadow-2xl backdrop-blur-md text-red-200 text-sm">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
            <button
              onClick={onRetry}
              className="ml-2 px-3 py-1 bg-red-800 hover:bg-red-700 text-white rounded-md text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </>
  );
};

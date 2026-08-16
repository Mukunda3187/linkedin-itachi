import React, { useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

interface PdfToPngConverterProps {
  triggerSignal: number; // increments each time we want to open the picker
}

export const PdfToPngConverter: React.FC<PdfToPngConverterProps> = ({ triggerSignal }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastSignal = useRef<number>(0);

  React.useEffect(() => {
    if (triggerSignal !== lastSignal.current) {
      lastSignal.current = triggerSignal;
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
        fileInputRef.current.click();
      }
    }
  }, [triggerSignal]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file.');
      window.setTimeout(() => setError(null), 4000);
      return;
    }

    setIsConverting(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      // Convert every page to a PNG and download each one
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const scale = 2; // higher = sharper output
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas not supported');

        await page.render({ canvasContext: ctx, viewport }).promise;

        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        const baseName = file.name.replace(/\.pdf$/i, '');
        link.download = pdf.numPages > 1 ? `${baseName}-page-${pageNum}.png` : `${baseName}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('PDF conversion error:', err);
      setError('Could not convert that PDF. Please try a different file.');
      window.setTimeout(() => setError(null), 4000);
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        onChange={handleFileChange}
        className="hidden"
        style={{ display: 'none' }}
      />

      {isConverting && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div className="flex items-center space-x-3 px-5 py-2.5 rounded-full glass-panel border border-red-500/30 shadow-lg shadow-black/80 backdrop-blur-xl">
            <span className="text-xs font-medium text-neutral-200">Converting PDF to PNG...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50">
          <div className="px-5 py-3 rounded-xl bg-red-950/80 border border-red-500/50 shadow-2xl backdrop-blur-md text-red-200 text-sm">
            {error}
          </div>
        </div>
      )}
    </>
  );
};

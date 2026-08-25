import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import JSZip from 'jszip';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const RENDER_SCALE = 2;

export interface PdfPageImage {
  fileName: string;
  blob: Blob;
  dataUrl: string;
}

// Renders every page of a PDF file to a separate PNG image.
export async function convertPdfToPngs(file: File): Promise<PdfPageImage[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const baseName = file.name.replace(/\.pdf$/i, '');
  const pages: PdfPageImage[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: RENDER_SCALE });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    await page.render({ canvasContext: ctx, viewport }).promise;

    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error(`Failed to render page ${pageNum}`));
      }, 'image/png');
    });

    pages.push({
      fileName: `${baseName}-page-${String(pageNum).padStart(2, '0')}.png`,
      blob,
      dataUrl: canvas.toDataURL('image/png'),
    });
  }

  return pages;
}

// Bundles every rendered page into a single ZIP and triggers ONE download.
// (Mobile browsers block/drop multiple separate auto-downloads, so a single
// zip is the reliable way to hand back multi-page PDF output on any device.)
export async function downloadPdfPageImages(
  pages: PdfPageImage[],
  zipBaseName: string
): Promise<void> {
  const zip = new JSZip();
  pages.forEach((page) => {
    zip.file(page.fileName, page.blob);
  });

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${zipBaseName}-pages.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

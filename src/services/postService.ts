import { convertPdfToPngs, downloadPdfPageImages } from './pdfToImages';

export interface ImageAnalysisResult {
  postText: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (err) => reject(err);
  });
}

const MAX_DIMENSION = 1280;
const JPEG_QUALITY = 0.8;

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
      resolve(dataUrl.split(',')[1]);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image for compression'));
    };

    img.src = objectUrl;
  });
}

interface ImagePayload {
  mimeType: string;
  data: string;
}

async function buildImagePayloads(files: File[]): Promise<ImagePayload[]> {
  const images: ImagePayload[] = [];

  for (const file of files) {
    if (file.type === 'application/pdf') {
      // Render every page of the PDF to its own PNG, download them all,
      // and send every page to the AI (not just the first one).
      const pages = await convertPdfToPngs(file);
      downloadPdfPageImages(pages);

      for (const page of pages) {
        images.push({
          mimeType: 'image/png',
          data: page.dataUrl.split(',')[1],
        });
      }
      continue;
    }

    try {
      images.push({
        mimeType: 'image/jpeg',
        data: await compressImage(file),
      });
    } catch {
      images.push({
        mimeType: file.type || 'image/jpeg',
        data: await fileToBase64(file),
      });
    }
  }

  return images;
}

export async function analyzeImagesAndGeneratePost(files: File[]): Promise<ImageAnalysisResult> {
  const images = await buildImagePayloads(files);

  const response = await fetch(`${API_BASE}/api/generate-post`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ images }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody?.error || `Request failed (${response.status})`);
  }

  const data = await response.json();
  if (!data.postText) {
    throw new Error('Empty response from server.');
  }

  return { postText: data.postText };
}

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

export async function analyzeImagesAndGeneratePost(files: File[]): Promise<ImageAnalysisResult> {

  const images = await Promise.all(
    files.map(async (file) => ({
      mimeType: file.type || 'image/jpeg',
      data: await fileToBase64(file),
    }))
  );

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

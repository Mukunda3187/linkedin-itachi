import React, { useState, useCallback, useEffect } from 'react';
import { CinematicCanvas } from './components/CinematicCanvas';
import { FileUploadTrigger } from './components/FileUploadTrigger';
import { LinkedInPostCard } from './components/LinkedInPostCard';
import { analyzeImagesAndGeneratePost } from './services/postService';

type ExperienceState =
  | 'idle' // Normal eyes, waiting for user click
  | 'animating' // Sharingan evolution sequence playing (frames 1-73)
  | 'mangekyo' // Sequence finished at frame 73, auto-triggering file picker
  | 'analyzing' // Processing uploaded images with Gemini Vision
  | 'post_visible' // Centered glassmorphic LinkedIn post with 15s timer
  | 'complete'; // Post dismissed, ready to awaken again

export const App: React.FC = () => {
  const [state, setState] = useState<ExperienceState>('idle');
  const [shouldAutoUpload, setShouldAutoUpload] = useState<boolean>(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [generatedPost, setGeneratedPost] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Step 2: User clicks Itachi's eye
  const handleEyeClick = useCallback(() => {
    if (state === 'idle' || state === 'complete') {
      setErrorMessage(null);
      setState('animating');
    }
  }, [state]);

  // Step 4 & 5: Sequence reaches Frame 73 (Mangekyō Sharingan)
  const handleAnimationComplete = useCallback(() => {
    setState('mangekyo');
    // Automatically trigger file picker immediately
    setShouldAutoUpload(true);
  }, []);

  const handleUploadHandled = useCallback(() => {
    setShouldAutoUpload(false);
  }, []);

  // Step 6 & 7 & 8: User selected images -> AI Analysis & LinkedIn post generation
  const handleFilesSelected = async (files: File[]) => {
    if (!files || files.length === 0) {
      setErrorMessage('Unable to load the selected image. Please try again.');
      return;
    }

    try {
      setUploadedFiles(files);
      setState('analyzing');
      setErrorMessage(null);

      const result = await analyzeImagesAndGeneratePost(files);
      setGeneratedPost(result.postText);
      setState('post_visible');
    } catch (err) {
      console.error('Analysis error:', err);
      setErrorMessage('Something went wrong while analyzing your images. Please try again.');
      setState('mangekyo');
    }
  };

const handleClosePost = useCallback(() => {
    window.location.reload();
  }, []);

  // If an error is shown, automatically reload the page after 15 seconds
  useEffect(() => {
    if (!errorMessage) return;

    const timer = window.setTimeout(() => {
      window.location.reload();
    }, 10000);

    return () => window.clearTimeout(timer);
  }, [errorMessage]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#050507] text-white">
      {/* Background Cinematic Canvas (Frames 1-73 + Atmospheric Embers & Rain) */}
      <CinematicCanvas
        isPlaying={state === 'animating'}
        onAnimationComplete={handleAnimationComplete}
        onEyeClick={handleEyeClick}
        isEyeClickable={state === 'idle' || state === 'complete'}
      />

      {/* Cinematic Vignette Overlay */}
      <div className="cinematic-vignette pointer-events-none" />
      <div className="crimson-ambient-glow pointer-events-none" />

      {/* Hidden File Input with Programmatic Trigger */}
      <FileUploadTrigger
        onFilesSelected={handleFilesSelected}
        shouldTriggerAutoUpload={shouldAutoUpload}
        onUploadHandled={handleUploadHandled}
        uploadedFiles={uploadedFiles}
        isAnalyzing={state === 'analyzing'}
        errorMessage={errorMessage}
        onRetry={() => {
          setErrorMessage(null);
          setShouldAutoUpload(true);
        }}
      />

      {state === 'post_visible' && generatedPost && (
        <LinkedInPostCard
          postText={generatedPost}
          onClose={handleClosePost}
        />
      )}
    </main>
  );
};
export default App;

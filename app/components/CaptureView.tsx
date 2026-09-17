'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, ImageIcon, Sparkles, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

type CaptureViewProps = {
  onCapture: (imageDataUrl: string) => void;
  isDetecting: boolean;
};

export function CaptureView({ onCapture, isDetecting }: CaptureViewProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [flash, setFlash] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = mediaStream;
      setStream(mediaStream);
      setHasCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch {
      setHasCamera(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setStream(null);
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && stream) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1080;
      canvas.height = video.videoHeight || 1080;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setFlash(true);
        setTimeout(() => setFlash(false), 400);
        setSelectedImage(dataUrl);
        stopCamera();
        onCapture(dataUrl);
      }
    }
  }, [stream, onCapture, stopCamera]);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setSelectedImage(dataUrl);
        setFlash(true);
        setTimeout(() => setFlash(false), 400);
        onCapture(dataUrl);
      };
      reader.readAsDataURL(file);
    },
    [onCapture]
  );

  const retake = useCallback(() => {
    setSelectedImage(null);
    startCamera();
  }, [startCamera]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 pt-4">
      {/* Camera viewport — rounded square */}
      <div className="relative w-full max-w-[320px] aspect-square">
        {/* Outer glow */}
        <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-primary/15 via-primary/5 to-transparent blur-xl" />

        {/* Rounded square frame */}
        <div className="relative h-full w-full rounded-[1.75rem] overflow-hidden border-2 border-secondary bg-black shadow-xl shadow-black/10">
          {selectedImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={selectedImage}
              alt="Captured meal"
              className="h-full w-full object-cover"
            />
          ) : hasCamera ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-white/60">
              <Camera className="h-12 w-12" strokeWidth={1.2} />
              <p className="text-xs text-center px-6">
                Camera unavailable.
                <br />
                Upload a photo instead.
              </p>
            </div>
          )}

          {/* Scanning line overlay during detection */}
          {isDetecting && !selectedImage && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-x-0 h-0.5 bg-primary shadow-[0_0_12px_2px_rgba(37,99,235,0.6)] animate-scan-line" />
            </div>
          )}

          {/* Detection overlay on captured image */}
          {isDetecting && selectedImage && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                <p className="text-xs text-white font-medium">Detecting dish...</p>
              </div>
            </div>
          )}

          {/* Shutter flash */}
          {flash && (
            <div className="absolute inset-0 bg-white animate-shutter pointer-events-none" />
          )}
        </div>
      </div>

      {/* Action area */}
      <div className="mt-10 flex flex-col items-center gap-5">
        {selectedImage ? (
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-muted-foreground">
              {isDetecting ? 'Analyzing your meal...' : 'Looks great! Ready to post.'}
            </p>
            {!isDetecting && (
              <button
                onClick={retake}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Retake photo
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Capture button — blue gradient, white icon */}
            <button
              onClick={capturePhoto}
              disabled={!hasCamera || !stream || isDetecting}
              className={cn(
                'relative flex h-20 w-20 items-center justify-center rounded-full transition-all',
                'bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/30',
                'hover:scale-105 active:scale-95',
                'disabled:opacity-30 disabled:hover:scale-100'
              )}
              aria-label="Take photo"
            >
              {!isDetecting && (
                <span className="absolute inset-0 rounded-full border-2 border-blue-400 animate-pulse-ring" />
              )}
              <Camera className="h-8 w-8 text-white" strokeWidth={2} />
            </button>

            {/* Upload from gallery */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ImageIcon className="h-4 w-4" />
              Upload from gallery
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </>
        )}
      </div>

      {/* Helper text */}
      {!selectedImage && !isDetecting && (
        <p className="mt-8 text-xs text-muted-foreground/60 flex items-center gap-1.5">
          <Sparkles className="h-3 w-3" />
          Point your camera at your meal
        </p>
      )}
    </div>
  );
}

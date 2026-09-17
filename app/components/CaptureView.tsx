'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, ImageIcon, Sparkles, RefreshCw, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

type CaptureViewProps = {
  onCapture: (imageDataUrl: string) => void;
  isDetecting: boolean;
  capturedImage: string | null;
  onRetake: () => void;
};

export function CaptureView({ onCapture, isDetecting, capturedImage, onRetake }: CaptureViewProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [flash, setFlash] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async (mode: 'environment' | 'user') => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode },
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

  const flipCamera = useCallback(() => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    startCamera(newMode);
  }, [facingMode, startCamera]);

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
        setFlash(true);
        setTimeout(() => setFlash(false), 400);
        onCapture(dataUrl);
      };
      reader.readAsDataURL(file);
    },
    [onCapture]
  );

  const retake = useCallback(() => {
    onRetake();
    startCamera(facingMode);
  }, [facingMode, startCamera, onRetake]);

  useEffect(() => {
    if (!selectedImage) {
      startCamera(facingMode);
    }
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImage, startCamera]);

  // Handle actual hardware flash (torch) if supported by device
  useEffect(() => {
    if (stream) {
      const track = stream.getVideoTracks()[0];
      if (track && track.applyConstraints) {
        try {
          track.applyConstraints({
            advanced: [{ torch: isFlashOn } as any],
          }).catch(() => {
            // Torch not supported or error applying constraint, ignore silently
          });
        } catch (e) {
          // Ignore
        }
      }
    }
  }, [isFlashOn, stream]);

  return (
    <div className="flex flex-1 flex-col items-center justify-start px-4 pt-24 pb-24">
      {/* Camera viewport — rounded square */}
      <div className="relative w-full max-w-[380px] aspect-square">
        {/* Outer glow */}
        <div className="absolute -inset-3 rounded-[2.5rem] bg-gradient-to-br from-primary/15 via-primary/5 to-transparent blur-xl" />

        {/* Rounded square frame */}
        <div className="relative h-full w-full rounded-[2.25rem] overflow-hidden bg-black shadow-xl shadow-black/10">
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
      <div className="mt-10 flex flex-col items-center gap-5 w-full">
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
          <div className="flex flex-col items-center w-full">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            {/* Add an image button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2.5 text-[17px] font-bold text-slate-300 hover:scale-105 transition-transform bg-transparent border border-slate-300/40 px-6 py-2.5 rounded-full mb-10"
            >
              <ImageIcon className="h-5 w-5" />
              Add an image
            </button>

            <div className="relative flex w-full max-w-[300px] items-center justify-center">
              {/* Capture button — shutter style */}
              <button
                onClick={capturePhoto}
                disabled={!hasCamera || !stream || isDetecting}
                className={cn(
                  'relative flex h-[90px] w-[90px] items-center justify-center rounded-full transition-all p-1',
                  'border-[6px] border-slate-300 bg-transparent',
                  'hover:scale-105 active:scale-95',
                  'disabled:opacity-30 disabled:hover:scale-100'
                )}
                aria-label="Take photo"
              >
                {!isDetecting && (
                  <span className="absolute -inset-[10px] rounded-full border border-slate-300 animate-pulse-ring" />
                )}
                {/* Inner solid circle instead of Camera icon */}
                <div className="h-full w-full rounded-full bg-slate-300 shadow-sm" />
              </button>

              {/* Flash button */}
              <button
                onClick={() => setIsFlashOn(!isFlashOn)}
                disabled={!hasCamera || isDetecting}
                className="absolute left-0 p-2 text-slate-300 hover:scale-110 transition-transform disabled:opacity-30"
                aria-label="Toggle flash"
              >
                <Zap
                  className="h-[46px] w-[46px] scale-y-[1.15]"
                  strokeWidth={2}
                  fill={isFlashOn ? 'currentColor' : 'none'}
                />
              </button>

              {/* Flip camera button */}
              <button
                onClick={flipCamera}
                disabled={!hasCamera || isDetecting}
                className="absolute right-0 p-2 text-slate-300 hover:scale-110 transition-transform disabled:opacity-30"
                aria-label="Flip camera"
              >
                <RefreshCw className="h-[46px] w-[46px]" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useCallback } from 'react';
import { Utensils, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CaptureView } from './components/CaptureView';
import { FeedView } from './components/FeedView';
import { CaptureSheet } from './components/CaptureSheet';
import type { FoodEntry } from '@/lib/supabase-client';

export default function Home() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [feedRefreshKey, setFeedRefreshKey] = useState(0);
  const [feedOpen, setFeedOpen] = useState(false);

  const handleCapture = useCallback((imageDataUrl: string) => {
    setCapturedImage(imageDataUrl);
    setIsDetecting(true);
    setTimeout(() => {
      setIsDetecting(false);
      setSheetOpen(true);
    }, 1200);
  }, []);

  const handleSheetClose = useCallback(() => {
    setSheetOpen(false);
    setCapturedImage(null);
  }, []);

  const handlePosted = useCallback((_entry: FoodEntry) => {
    setSheetOpen(false);
    setCapturedImage(null);
    setFeedRefreshKey((k) => k + 1);
  }, []);

  const handleFeedDeleted = useCallback(() => {
    setFeedRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="min-h-screen bg-white text-foreground">
      <div className="mx-auto max-w-md min-h-screen flex flex-col relative bg-white overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-md shadow-blue-500/25">
              <Utensils className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">finMO</span>
          </div>
        </header>

        {/* Capture view (always present underneath) */}
        <main className="flex flex-1 flex-col overflow-hidden">
          <CaptureView onCapture={handleCapture} isDetecting={isDetecting} />
        </main>

        {/* Capture sheet */}
        <CaptureSheet
          open={sheetOpen}
          onClose={handleSheetClose}
          imageDataUrl={capturedImage}
          onPosted={handlePosted}
        />

        {/* Slide-up feed drawer */}
        {!sheetOpen && (
          <div
            className={cn(
              'absolute bottom-0 inset-x-0 z-30 bg-white rounded-t-3xl border-t border-border/30 shadow-2xl shadow-black/10',
              'flex flex-col',
              feedOpen
                ? 'h-[88vh] animate-drawer-up'
                : 'h-[120px] animate-drawer-down'
            )}
          >
            {/* Drag / toggle handle */}
            <button
              onClick={() => setFeedOpen((v) => !v)}
              className="flex flex-col items-center gap-1 pt-3 pb-2 shrink-0 w-full"
            >
              <div className="h-1.5 w-10 rounded-full bg-muted-foreground/25" />
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-sm font-semibold text-foreground">Feed</span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-muted-foreground transition-transform duration-300',
                    feedOpen && 'rotate-180'
                  )}
                />
              </div>
            </button>

            {/* Feed content — only render when drawer is open to allow scroll */}
            {feedOpen && (
              <FeedView refreshKey={feedRefreshKey} onDeleted={handleFeedDeleted} />
            )}

            {/* Collapsed preview when drawer is closed */}
            {!feedOpen && (
              <div className="flex-1 flex items-center justify-center px-5">
                <p className="text-sm text-muted-foreground">
                  Tap to view your food expense history
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

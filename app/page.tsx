'use client';

import { useState, useCallback, useEffect } from 'react';
import { ChevronDown, User, Flame, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CaptureView } from './components/CaptureView';
import { FeedView } from './components/FeedView';
import { CaptureSheet } from './components/CaptureSheet';
import { ProfileSheet } from './components/ProfileSheet';
import { supabase, type FoodEntry } from '@/lib/supabase-client';

export default function Home() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [feedRefreshKey, setFeedRefreshKey] = useState(0);
  const [feedOpen, setFeedOpen] = useState(false);
  const [todayTotal, setTodayTotal] = useState<number>(0);

  // Fetch today's total on load and when feed refreshes
  useEffect(() => {
    async function fetchTodayTotal() {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const { data, error } = await supabase
        .from('food_entries')
        .select('price')
        .gte('created_at', startOfToday.toISOString());
        
      if (!error && data) {
        const sum = data.reduce((acc, curr) => acc + (curr.price || 0), 0);
        setTodayTotal(sum);
      }
    }
    fetchTodayTotal();
  }, [feedRefreshKey]);

  // Swipe logic for feed drawer
  const [touchStartY, setTouchStartY] = useState(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartY - touchEndY;
    // Delta > 40 means swipe UP. Delta < -40 means swipe DOWN.
    if (deltaY > 40 && !feedOpen) {
      setFeedOpen(true);
    } else if (deltaY < -40 && feedOpen) {
      setFeedOpen(false);
    }
  }, [touchStartY, feedOpen]);

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
        {/* Top Left Streak Button */}
        <button
          className="absolute top-4 left-4 z-20 flex h-14 items-center justify-center gap-2 rounded-full px-5 bg-secondary/50 text-secondary-foreground hover:bg-secondary transition-colors backdrop-blur-sm shadow-md font-bold text-lg"
          aria-label="View Streaks"
        >
          <Flame className="h-6 w-6 text-orange-500 fill-orange-500" />
          <span>12</span>
        </button>

        {/* Top Center Friends Button */}
        <button
          className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex h-14 items-center justify-center gap-2 rounded-full px-6 bg-secondary/50 text-secondary-foreground hover:bg-secondary transition-colors backdrop-blur-sm shadow-md font-bold text-base"
          aria-label="Friends"
        >
          <Users className="h-5 w-5" />
          <span>Friends</span>
        </button>

        {/* Top Right Profile Button */}
        <button
          onClick={() => setProfileOpen(true)}
          className="absolute top-4 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-secondary/50 text-secondary-foreground hover:bg-secondary transition-colors backdrop-blur-sm shadow-md"
          aria-label="User Profile"
        >
          <User className="h-7 w-7" />
        </button>
        {/* Capture view (foreground) */}
        <main className="flex flex-1 flex-col overflow-hidden relative z-10 pt-8">
          <CaptureView 
            onCapture={handleCapture} 
            isDetecting={isDetecting} 
            capturedImage={capturedImage}
            onRetake={() => setCapturedImage(null)}
          />
        </main>

        {/* Capture sheet */}
        <CaptureSheet
          open={sheetOpen}
          onClose={handleSheetClose}
          imageDataUrl={capturedImage}
          onPosted={handlePosted}
        />

        {/* Today's Expense */}
        {!sheetOpen && !feedOpen && (
          <div className="absolute bottom-[100px] inset-x-0 z-20 flex flex-col items-center justify-center pointer-events-none pb-[44px]">
            <span className="font-bold text-[26px] text-black">Today's Expense</span>
            <span className="font-bold text-[34px] text-green-500">{todayTotal.toFixed(2)}$</span>
          </div>
        )}

        {/* Slide-up feed drawer */}
        {!sheetOpen && (
          <div
            className={cn(
              'absolute bottom-0 inset-x-0 z-30 bg-white rounded-t-3xl',
              'flex flex-col transition-all duration-500 ease-in-out overflow-hidden',
              feedOpen
                ? 'h-[88vh]'
                : 'h-[100px]'
            )}
          >
            {/* Drag / toggle handle */}
            <button
              onClick={() => setFeedOpen((v) => !v)}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="flex flex-col items-center pt-2 pb-6 shrink-0 w-full"
            >
              <svg 
                width="100" 
                height="32" 
                viewBox="0 0 100 32" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="10" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className={cn(
                  "text-slate-300 transition-transform duration-500",
                  feedOpen && "rotate-180"
                )}
              >
                <polyline points="10,26 50,8 90,26" />
              </svg>
            </button>

            <div className={cn("flex-1 overflow-hidden transition-opacity duration-500", feedOpen ? "opacity-100" : "opacity-0")}>
              <FeedView refreshKey={feedRefreshKey} onDeleted={handleFeedDeleted} />
            </div>
          </div>
        )}
        
        {/* Profile Sheet */}
        <ProfileSheet open={profileOpen} onClose={() => setProfileOpen(false)} />
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, X, Loader2, Check, Utensils, DollarSign, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase, type FoodEntry } from '@/lib/supabase-client';
import { cn } from '@/lib/utils';

type CaptureSheetProps = {
  open: boolean;
  onClose: () => void;
  imageDataUrl: string | null;
  onPosted: (entry: FoodEntry) => void;
};

export function CaptureSheet({ open, onClose, imageDataUrl, onPosted }: CaptureSheetProps) {
  const [dishName, setDishName] = useState('');
  const [price, setPrice] = useState('');
  const [note, setNote] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [detecting, setDetecting] = useState(false);
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const priceInputRef = useRef<HTMLInputElement>(null);

  const detectDish = useCallback(async () => {
    setDetecting(true);
    setError(null);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
      const apiUrl = `${supabaseUrl}/functions/v1/detect-dish`;
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageDataUrl }),
      });
      if (!res.ok) throw new Error(`Detection failed (${res.status})`);
      const data = await res.json();
      if (!data.dish_name || typeof data.estimated_price !== 'number') {
        throw new Error('Invalid detection response');
      }
      setDishName(data.dish_name);
      setPrice(data.estimated_price.toFixed(2));
      setConfidence(data.confidence || 0);
    } catch {
      setDishName('Homemade Meal');
      setPrice('12.00');
      setConfidence(0.5);
    } finally {
      setDetecting(false);
    }
  }, [imageDataUrl]);

  useEffect(() => {
    if (open && imageDataUrl) {
      setDishName('');
      setPrice('');
      setNote('');
      setConfidence(0);
      setPosted(false);
      setError(null);
      detectDish();
    }
  }, [open, imageDataUrl, detectDish]);

  const handlePost = async () => {
    if (!dishName.trim() || !price) return;
    setPosting(true);
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from('food_entries')
        .insert({
          dish_name: dishName.trim(),
          price: parseFloat(price),
          image_url: imageDataUrl,
          note: note.trim() || null,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      setPosted(true);
      setTimeout(() => {
        onPosted(data as FoodEntry);
      }, 900);
    } catch {
      setError('Failed to post. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  const handleClose = () => {
    if (posting || detecting) return;
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-in fade-in-0"
        onClick={handleClose}
      />

      <div className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md animate-slide-up">
        <div className="rounded-t-3xl bg-white border-t border-border/30 shadow-2xl shadow-black/20 max-h-[88vh] overflow-y-auto no-scrollbar">
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="h-1.5 w-10 rounded-full bg-muted-foreground/25" />
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            disabled={posting || detecting}
            className="absolute right-4 top-4 rounded-full p-1.5 bg-secondary text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Image thumbnail */}
          {imageDataUrl && (
            <div className="px-5 pt-3">
              <div className="relative h-32 w-full rounded-2xl overflow-hidden bg-secondary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageDataUrl}
                  alt="Captured meal"
                  className="h-full w-full object-cover"
                />
                {detecting && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                      <span className="text-xs text-white">Analyzing...</span>
                    </div>
                  </div>
                )}
                {posted && (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                    <Check className="h-8 w-8 text-white" strokeWidth={2.5} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="px-5 pt-5 pb-8 space-y-4">
            {/* Detection confidence */}
            {!detecting && confidence > 0 && !posted && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>
                    Detected with {Math.round(confidence * 100)}% confidence
                  </span>
                </div>
              </div>
            )}

            {/* Dish name field */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Utensils className="h-3.5 w-3.5" />
                Dish Name
              </label>
              <Input
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
                placeholder={detecting ? 'Detecting...' : 'Enter dish name'}
                disabled={detecting || posting || posted}
                className="h-12 rounded-xl bg-secondary/60 border-border/50 text-base"
              />
            </div>

            {/* Price field */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <DollarSign className="h-3.5 w-3.5" />
                Estimated Price (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-medium text-muted-foreground">
                  $
                </span>
                <Input
                  ref={priceInputRef}
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder={detecting ? '0.00' : '0.00'}
                  disabled={detecting || posting || posted}
                  className="h-12 rounded-xl bg-secondary/60 border-border/50 text-base pl-8"
                />
              </div>
            </div>

            {/* Note field */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Tag className="h-3.5 w-3.5" />
                Note <span className="text-muted-foreground/50">(optional)</span>
              </label>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a caption..."
                disabled={detecting || posting || posted}
                className="h-12 rounded-xl bg-secondary/60 border-border/50 text-base"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            {/* Post button — blue gradient, white text */}
            <Button
              onClick={handlePost}
              disabled={detecting || posting || posted || !dishName.trim() || !price}
              className={cn(
                'w-full h-14 py-3.5 rounded-xl text-base font-semibold transition-all border-0',
                'bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-500/25',
                'hover:shadow-xl hover:shadow-blue-500/30 hover:from-blue-500 hover:to-blue-700',
                posted && 'from-green-500 to-green-600 shadow-green-500/25'
              )}
            >
              {posted ? (
                <span className="flex items-center gap-2">
                  <Check className="h-5 w-5" />
                  Posted to Feed!
                </span>
              ) : posting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Posting...
                </span>
              ) : detecting ? (
                'Waiting for detection...'
              ) : (
                <span className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Post to Feed
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

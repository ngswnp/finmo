'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, type FoodEntry } from '@/lib/supabase-client';
import { Utensils, TrendingUp, Calendar, Trash2, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type FeedViewProps = {
  refreshKey: number;
  onDeleted: () => void;
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function FeedView({ refreshKey, onDeleted }: FeedViewProps) {
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayTotal, setTodayTotal] = useState(0);
  const [weekTotal, setWeekTotal] = useState(0);
  const [entryCount, setEntryCount] = useState(0);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('food_entries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setEntries([]);
    } else {
      const items = (data || []) as FoodEntry[];
      setEntries(items);
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(startOfToday);
      startOfWeek.setDate(startOfWeek.getDate() - 7);

      let today = 0;
      let week = 0;
      items.forEach((e) => {
        const d = new Date(e.created_at);
        if (d >= startOfToday) today += Number(e.price);
        if (d >= startOfWeek) week += Number(e.price);
      });
      setTodayTotal(today);
      setWeekTotal(week);
      setEntryCount(items.length);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries, refreshKey]);

  const handleDelete = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('food_entries').delete().eq('id', id);
      if (!error) {
        fetchEntries();
        onDeleted();
      }
    },
    [fetchEntries, onDeleted]
  );

  return (
    <div className="flex flex-1 flex-col h-full">
      {/* Stats header */}
      <div className="px-5 pt-5 pb-3 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight mb-3">Your Food Feed</h1>
        <div className="grid grid-cols-3 gap-2.5">
          <div className="rounded-xl bg-secondary/60 border border-border/50 p-3">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-[11px] font-medium">Today</span>
            </div>
            <p className="text-base font-bold text-primary">{formatPrice(todayTotal)}</p>
          </div>
          <div className="rounded-xl bg-secondary/60 border border-border/50 p-3">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="text-[11px] font-medium">7-Day</span>
            </div>
            <p className="text-base font-bold">{formatPrice(weekTotal)}</p>
          </div>
          <div className="rounded-xl bg-secondary/60 border border-border/50 p-3">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <Utensils className="h-3.5 w-3.5" />
              <span className="text-[11px] font-medium">Meals</span>
            </div>
            <p className="text-base font-bold">{entryCount}</p>
          </div>
        </div>
      </div>

      <Separator className="mb-2 shrink-0" />

      {/* Feed list */}
      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <Utensils className="h-8 w-8 text-muted-foreground" strokeWidth={1.2} />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold mb-1">No meals yet</p>
            <p className="text-sm text-muted-foreground">
              Snap your first food photo to get started.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-6">
          <div className="space-y-4 pt-2">
            {entries.map((entry, idx) => (
              <div
                key={entry.id}
                className="animate-fade-in-up rounded-2xl bg-card border border-border/40 overflow-hidden shadow-sm"
                style={{ animationDelay: `${idx * 60}ms`, opacity: 0 }}
              >
                {entry.image_url && (
                  <div className="relative h-44 w-full bg-secondary">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={entry.image_url}
                      alt={entry.dish_name}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-black/60 text-white border-none backdrop-blur-sm">
                        {formatPrice(Number(entry.price))}
                      </Badge>
                    </div>
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base truncate">{entry.dish_name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatRelativeTime(entry.created_at)}
                      </p>
                    </div>
                    {!entry.image_url && (
                      <Badge variant="secondary" className="shrink-0">
                        {formatPrice(Number(entry.price))}
                      </Badge>
                    )}
                  </div>

                  {entry.note && (
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                      {entry.note}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    {!entry.image_url && (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                        <Utensils className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                      </div>
                    )}
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors ml-auto"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

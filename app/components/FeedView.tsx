'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, type FoodEntry } from '@/lib/supabase-client';
import { Utensils, TrendingUp, Calendar, Trash2, Loader2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

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
  const [selectedEntry, setSelectedEntry] = useState<FoodEntry | null>(null);
  const [isClosingDetail, setIsClosingDetail] = useState(false);

  const closeDetail = useCallback(() => {
    setIsClosingDetail(true);
    setTimeout(() => {
      setSelectedEntry(null);
      setIsClosingDetail(false);
    }, 200);
  }, []);

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
          <div className="grid grid-cols-3 gap-3 pt-2">
            {entries.map((entry, idx) => (
              <button
                key={entry.id}
                onClick={() => setSelectedEntry(entry)}
                className="animate-fade-in-up relative aspect-square rounded-[1.5rem] bg-secondary border border-border/40 overflow-hidden shadow-sm"
                style={{ animationDelay: `${idx * 40}ms`, opacity: 0 }}
              >
                {entry.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={entry.image_url}
                    alt={entry.dish_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Utensils className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                )}
                {/* Price badge overlaid */}
                <div className="absolute bottom-2 right-2">
                  <Badge className="bg-black/60 text-white border-none backdrop-blur-sm px-1.5 py-0.5 text-[10px] font-bold">
                    {formatPrice(Number(entry.price))}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Detail Modal Overlay */}
      {selectedEntry && (
        <div className={cn(
          "absolute inset-0 z-50 bg-white/95 backdrop-blur-xl flex flex-col pt-14 pb-8 px-5 duration-200 fill-mode-forwards",
          isClosingDetail ? "animate-out fade-out zoom-out-95" : "animate-in fade-in zoom-in-95"
        )}>
          <button 
            onClick={closeDetail}
            className="absolute top-4 right-4 p-2.5 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-colors shadow-sm z-10"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="relative aspect-square w-full rounded-[2.25rem] overflow-hidden bg-black shadow-xl shadow-black/10 mb-6 shrink-0">
             {selectedEntry.image_url ? (
               // eslint-disable-next-line @next/next/no-img-element
               <img src={selectedEntry.image_url} alt={selectedEntry.dish_name} className="h-full w-full object-cover" />
             ) : (
               <div className="flex h-full w-full items-center justify-center bg-secondary">
                 <Utensils className="h-16 w-16 text-muted-foreground" />
               </div>
             )}
          </div>
          
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <h2 className="text-3xl font-bold tracking-tight">{selectedEntry.dish_name}</h2>
            <div className="flex items-center justify-between mt-2">
              <p className="text-2xl font-bold text-green-500">{formatPrice(Number(selectedEntry.price))}</p>
              <p className="text-sm font-medium text-muted-foreground">{formatRelativeTime(selectedEntry.created_at)}</p>
            </div>
            
            {selectedEntry.note && (
              <div className="mt-6 p-5 bg-secondary/50 rounded-2xl border border-border/50">
                <p className="text-base text-foreground leading-relaxed">{selectedEntry.note}</p>
              </div>
            )}
          </div>
          
          <div className="mt-auto pt-6 flex justify-center shrink-0">
            <button
              onClick={() => {
                handleDelete(selectedEntry.id);
                closeDetail();
              }}
              className="flex items-center gap-2 text-sm font-bold text-red-500 bg-red-500/10 px-8 py-3.5 rounded-full hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="h-5 w-5" />
              Delete this entry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

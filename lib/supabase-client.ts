'use client';

import { createClient } from '@supabase/supabase-js';

export const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://dndaapfxssugdvcbuicc.supabase.co';

export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'sb_publishable_nUfRhH8hpthEQTsmmAYFGw_6bvAzs-l';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type FoodEntry = {
  id: string;
  dish_name: string;
  price: number;
  image_url: string | null;
  note: string | null;
  created_at: string;
};

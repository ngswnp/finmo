import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dndaapfxssugdvcbuicc.supabase.co';
const supabaseAnonKey = 'sb_publishable_nUfRhH8hpthEQTsmmAYFGw_6bvAzs-l';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase
    .from('food_entries')
    .insert({
      dish_name: 'Test Dish',
      price: 15.00,
      image_url: null,
      note: 'test'
    });
  console.log('Error:', error);
  console.log('Data:', data);
}

run();


import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bskajjkedyfpobeqjqix.supabase.co';
const supabaseKey = 'sb_publishable_yxakfstL71KpgRM4WT_FpQ_0WOgOZTn';

export const supabase = createClient(supabaseUrl, supabaseKey);

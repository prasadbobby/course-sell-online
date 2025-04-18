const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

// Check if Supabase credentials are available
const isSupabaseConfigured = supabaseUrl && supabaseKey;

let supabase = null;
if (isSupabaseConfigured) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('Supabase client initialized');
} else {
  console.log('Supabase not configured - storage fallback not available');
}

module.exports = {
  supabase,
  isSupabaseConfigured
};
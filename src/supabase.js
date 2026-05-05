import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://lgvdssfnceardtwudujg.supabase.co";
// Copia la "anon public key" desde Supabase Dashboard > Project Settings > API
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxndmRzc2ZuY2VhcmR0d3VkdWpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NzM2MTgsImV4cCI6MjA5MzU0OTYxOH0.uAcp5BVUqI0sIZa5llDBzRWRgYz1Sno2ru42djysRIU";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

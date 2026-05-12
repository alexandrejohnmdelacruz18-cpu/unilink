// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qdhxdnbviylqmbjhnxro.supabase.co'; // Remove the /rest/v1 part
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkaHhkbmJ2aXlscW1iamhueHJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyOTU1NDksImV4cCI6MjA5Mzg3MTU0OX0.2jzYz_3udfNfYVEBMkFmnH_VYCJRxmrIxHtO3oD7Oo8';

export const supabase = createClient(supabaseUrl, supabaseKey);
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ujnpnpykbvomxhtbnpkr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqbnBucHlrYnZvbXhodGJucGtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0ODM3MzgsImV4cCI6MjA2NDA1OTczOH0.Gbyj9ArzF_-XdzAxOgFhxaL3OYwmPcHMPaksUyHtFjs";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
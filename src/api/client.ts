// src/api/client.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Rate limiting interceptor
let requestCount = 0;
let lastReset = Date.now();

export const rateLimiter = {
  check: (limit: number = 100): boolean => {
    const now = Date.now();
    if (now - lastReset > 60000) {
      requestCount = 0;
      lastReset = now;
    }
    requestCount++;
    return requestCount <= limit;
  },
  getRemaining: (limit: number = 100): number => {
    return Math.max(0, limit - requestCount);
  },
};

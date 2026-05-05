// Direct REST client for Supabase — no heavy SDK needed
const SUPABASE_URL = 'https://mwwxjhdnbdlfrfzklffe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13d3hqaGRuYmRsZnJmemtsZmZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NDc1OTAsImV4cCI6MjA5MzUyMzU5MH0._7aALtbyVAnqJKxOfiCCuFkOOIY-vDNtak5U9sjHFfo';

export async function insertWish(data: {
  name: string;
  wish: string;
  push_token: string | null;
  curse_start: string;
  curse_end: string;
}) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/wishes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const text = await response.text();
      console.warn('Failed to save wish:', text);
      return false;
    }

    console.log('Ritual saved to the cursed database 👁️');
    return true;
  } catch (e) {
    console.warn('Network error saving wish:', e);
    return false;
  }
}

export async function fetchWishes(): Promise<Array<{
  id: string;
  name: string;
  wish: string;
  curse_start: string;
  curse_end: string;
  created_at: string;
}>> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/wishes?select=id,name,wish,curse_start,curse_end,created_at&order=created_at.desc&limit=50`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    if (!response.ok) return [];
    return await response.json();
  } catch (e) {
    console.warn('Failed to fetch wishes:', e);
    return [];
  }
}

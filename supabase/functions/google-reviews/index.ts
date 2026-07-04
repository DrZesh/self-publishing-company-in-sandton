const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Cache-Control': 'public, max-age=900, s-maxage=3600',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const apiKey = Deno.env.get('GOOGLE_API_KEY');
    const placeId = Deno.env.get('GOOGLE_PLACE_ID');
    if (!apiKey || !placeId) {
      return json({ error: 'Google Reviews integration is not configured.' }, 500);
    }

    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    url.searchParams.set('place_id', placeId);
    url.searchParams.set('fields', 'rating,reviews,user_ratings_total');
    url.searchParams.set('reviews_sort', 'newest');
    url.searchParams.set('key', apiKey);

    const response = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Google Places request failed (${response.status}).`);
    }

    const data = await response.json();
    if (data.status !== 'OK') {
      throw new Error(`Google Places API returned ${data.status || 'UNKNOWN_STATUS'}.`);
    }

    const result = data.result || {};
    const reviews = (result.reviews || []).map((review: Record<string, unknown>) => ({
      name: review.author_name || 'Google reviewer',
      rating: Number(review.rating || 0),
      text: review.text || '',
      date: review.time
        ? new Date(Number(review.time) * 1000).toLocaleDateString('en-ZA', {
            year: 'numeric',
            month: 'long',
            timeZone: 'Africa/Johannesburg',
          })
        : '',
      profilePhoto: review.profile_photo_url || null,
    }));

    return json({
      reviews,
      avgRating: Number(result.rating || 0),
      totalReviews: Number(result.user_ratings_total || reviews.length),
    });
  } catch (error) {
    console.error('google-reviews error:', error?.message || error);
    return json({ error: error?.message || 'Unable to fetch Google Reviews.' }, 500);
  }
});

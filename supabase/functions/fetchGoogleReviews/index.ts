import { createClientFromRequest, serve } from '../_shared/server.ts';

serve('fetchGoogleReviews', async (req) => {
  try {
    const platform = createClientFromRequest(req);

    const apiKey = Deno.env.get('GOOGLE_API_KEY');
    const placeId = Deno.env.get('GOOGLE_PLACE_ID');

    if (!apiKey || !placeId) {
      return Response.json({ error: 'Missing Google API credentials' }, { status: 500 });
    }

    // Fetch place details with reviews from Google Places API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=rating,review,reviews&key=${apiKey}`
    );

    if (!response.ok) {
      return Response.json({ error: 'Failed to fetch reviews from Google' }, { status: 500 });
    }

    const data = await response.json();

    if (data.status !== 'OK') {
      return Response.json({ error: `Google API error: ${data.status}` }, { status: 400 });
    }

    const result = data.result;

    // Format reviews
    const reviews = (result.reviews || []).map(review => ({
      name: review.author_name,
      rating: review.rating,
      text: review.text,
      date: new Date(review.time * 1000).toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'long',
      }),
      profilePhoto: review.profile_photo_url,
    }));

    const avgRating = result.rating || 0;

    return Response.json({
      reviews,
      avgRating,
      totalReviews: result.reviews?.length || 0,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
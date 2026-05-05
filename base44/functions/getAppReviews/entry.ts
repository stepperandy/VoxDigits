import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * getAppReviews — get app reviews and ratings
 */
Deno.serve(async (req) => {
  try {
    const reviews = [
      { rating: 5, title: 'Best VPN out there', text: 'Fast, reliable, and great support', author: 'John D.', date: '2026-05-01' },
      { rating: 5, title: 'Love it', text: 'Works perfectly on all my devices', author: 'Sarah M.', date: '2026-04-28' },
      { rating: 4, title: 'Great but needs work', text: 'Good speeds but UI could be better', author: 'Alex K.', date: '2026-04-25' },
      { rating: 5, title: 'Excellent service', text: '24/7 support is outstanding', author: 'Mike T.', date: '2026-04-22' },
    ];

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    return Response.json({
      average_rating: avgRating.toFixed(1),
      total_reviews: reviews.length,
      reviews: reviews.sort((a, b) => new Date(b.date) - new Date(a.date)),
    });
  } catch (error) {
    console.error('getAppReviews error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
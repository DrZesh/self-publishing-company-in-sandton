import React from 'react';
import { Star, Send, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReviewsTab({ reviewData, setReviewData, submitReview, projects }) {
  const completedProjects = projects?.filter(p => ['Completed', 'Delivered'].includes(p.stage)) || [];
  const canReview = completedProjects.length > 0;

  return (
    <div className="space-y-6">
      {/* Review Form */}
      {!canReview ? (
        <div className="bg-gradient-to-br from-[#1A1A2E] to-[#16213E] rounded-3xl border border-gray-700/50 p-16 text-center">
          <div className="w-20 h-20 bg-gray-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Reviews Available After Completion</h3>
          <p className="text-gray-400">Once your project is completed, we'd love to hear about your experience!</p>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-[#1A1A2E] to-[#16213E] rounded-3xl border border-[#B87333]/20 p-6 shadow-xl">
          <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-[#D4A574]" />
            Share Your Experience
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 mb-2 block">Overall Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setReviewData({ ...reviewData, rating: star })}
                    className={`transition-transform hover:scale-110 ${
                      star <= reviewData.rating ? 'text-[#D4A574]' : 'text-gray-600'
                    }`}
                  >
                    <Star className="w-10 h-10 fill-current" />
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {reviewData.rating === 5 && 'Excellent! ⭐⭐⭐⭐⭐'}
                {reviewData.rating === 4 && 'Very Good! ⭐⭐⭐⭐'}
                {reviewData.rating === 3 && 'Good! ⭐⭐⭐'}
                {reviewData.rating === 2 && 'Fair ⭐⭐'}
                {reviewData.rating === 1 && 'Poor ⭐'}
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 mb-2 block">Your Testimonial</label>
              <textarea
                value={reviewData.testimonial}
                onChange={(e) => setReviewData({ ...reviewData, testimonial: e.target.value })}
                placeholder="Share your experience working with Creative Books SA..."
                rows={5}
                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#B87333]/40 resize-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="allow-website"
                checked={reviewData.allow_website}
                onChange={(e) => setReviewData({ ...reviewData, allow_website: e.target.checked })}
                className="w-4 h-4 rounded border-gray-700 bg-gray-800/50 text-[#B87333] focus:ring-[#B87333]/40"
              />
              <label htmlFor="allow-website" className="text-sm text-gray-300">
                I allow Creative Books SA to display my testimonial on their website
              </label>
            </div>

            <Button
              onClick={submitReview}
              disabled={!reviewData.testimonial.trim()}
              className="w-full bg-gradient-to-r from-[#B87333] to-[#D4A574] hover:from-[#A06828] hover:to-[#B87333] text-white font-semibold py-3 rounded-xl shadow-lg shadow-[#B87333]/30 transition-all duration-300"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Review
            </Button>
          </div>
        </div>
      )}

      {/* Google Reviews CTA */}
      <div className="bg-gradient-to-r from-[#B87333]/20 to-[#D4A574]/20 rounded-3xl border border-[#B87333]/30 p-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Star className="w-6 h-6 text-[#D4A574] fill-current" />
          <Star className="w-6 h-6 text-[#D4A574] fill-current" />
          <Star className="w-6 h-6 text-[#D4A574] fill-current" />
          <Star className="w-6 h-6 text-[#D4A574] fill-current" />
          <Star className="w-6 h-6 text-[#D4A574] fill-current" />
        </div>
        <h3 className="font-bold text-white text-lg mb-2">Love Your Experience?</h3>
        <p className="text-gray-400 text-sm mb-4">Help other authors discover Creative Books SA by leaving us a Google review</p>
        <a
          href="https://g.page/r/your-google-place-id/review"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          Leave Google Review
        </a>
      </div>
    </div>
  );
}
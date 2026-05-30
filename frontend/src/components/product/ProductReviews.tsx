import { useState, useEffect } from "react";
import { reviewsApi } from "@/api";
import { useAuth } from "@/hooks";
import { Star, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-hot-toast";

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState({ average_rating: 0, total_reviews: 0 });
  const [loading, setLoading] = useState(true);
  
  // Review form
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      const [reviewsRes, statsRes] = await Promise.all([
        reviewsApi.getProductReviews(productId),
        reviewsApi.getProductReviewStats(productId)
      ]);
      setReviews(reviewsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error("Failed to load reviews", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    
    setIsSubmitting(true);
    try {
      await reviewsApi.createReview(productId, { rating, review_text: reviewText });
      toast.success("Review submitted!");
      setReviewText("");
      setRating(5);
      fetchReviews();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await reviewsApi.deleteReview(reviewId);
      toast.success("Review deleted");
      fetchReviews();
    } catch (err) {
      toast.error("Failed to delete review");
    }
  };

  return (
    <div className="mt-16 border-t border-gray-100 dark:border-gray-800 pt-16">
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-2xl font-bold text-black dark:text-white">Customer Reviews</h2>
        <div className="flex items-center gap-2 rounded-full bg-gray-50 dark:bg-gray-900 px-3 py-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-bold text-black dark:text-white">
            {stats.average_rating.toFixed(1)}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ({stats.total_reviews} {stats.total_reviews === 1 ? 'review' : 'reviews'})
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Write Review Section */}
        <div className="lg:col-span-1">
          {isAuthenticated ? (
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-black p-6 shadow-sm">
              <h3 className="text-lg font-bold text-black dark:text-white mb-4">Write a Review</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-6 w-6 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-700'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Review (Optional)</label>
                  <textarea
                    rows={4}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-4 py-3 text-sm focus:border-black focus:ring-1 focus:ring-black dark:text-white outline-none transition-all resize-none"
                    placeholder="Share your thoughts about this product..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-black px-4 py-3 text-sm font-bold text-white transition-all hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-8 text-center">
              <MessageCircle className="mx-auto h-8 w-8 text-gray-400 mb-3" />
              <h3 className="text-lg font-bold text-black dark:text-white">Share Your Thoughts</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Sign in to review this product.</p>
              <a href="/login" className="mt-4 inline-block rounded-xl bg-black px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
                Log In
              </a>
            </div>
          )}
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <p className="text-gray-500 dark:text-gray-400">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No reviews yet. Be the first to review!</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-black p-6 shadow-sm flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="h-10 w-10 shrink-0 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-black dark:text-white">
                  {review.user?.full_name ? review.user.full_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-black dark:text-white">{review.user?.full_name || 'Customer'}</span>
                      {review.is_verified_purchase && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-full">
                          Verified
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 dark:text-gray-800'}`}
                      />
                    ))}
                  </div>

                  {review.review_text && (
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {review.review_text}
                    </p>
                  )}
                  
                  {(user?.id === review.user_id || user?.is_superuser) && (
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="mt-4 text-xs font-medium text-red-500 hover:text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

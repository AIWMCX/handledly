import { Star } from "lucide-react";

interface GoogleReviewsBadgeProps {
  rating?: number;
  reviewCount?: number;
  compact?: boolean;
}

export function GoogleReviewsBadge({ 
  rating = 4.9, 
  reviewCount = 500,
  compact = false 
}: GoogleReviewsBadgeProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white shadow-depth-2 border border-border/50">
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${
                i < fullStars 
                  ? "text-amber-400 fill-amber-400" 
                  : i === fullStars && hasHalfStar
                  ? "text-amber-400 fill-amber-400/50"
                  : "text-gray-200 fill-gray-200"
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-semibold text-primary">{rating}</span>
        <span className="text-xs text-muted-foreground">({reviewCount}+ customer reviews)</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl glass-card shadow-depth-2 border border-white/50">
      {/* Star icon instead of Google logo */}
      <div className="w-8 h-8 rounded-full bg-accent/10 shadow-sm flex items-center justify-center">
        <Star className="w-5 h-5 text-accent fill-accent" />
      </div>
      
      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-bold text-primary">{rating}</span>
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < fullStars 
                    ? "text-amber-400 fill-amber-400" 
                    : i === fullStars && hasHalfStar
                    ? "text-amber-400 fill-amber-400/50"
                    : "text-gray-200 fill-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {reviewCount}+ customer reviews
        </p>
      </div>
    </div>
  );
}

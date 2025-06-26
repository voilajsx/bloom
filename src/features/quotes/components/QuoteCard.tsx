/**
 * Quotes Feature - Individual Quote Card Component
 * @module @voilajsx/bloom/features/quotes
 * @file src/features/quotes/components/QuoteCard.tsx
 */

import { Button } from '@voilajsx/uikit/button';
import { Badge } from '@voilajsx/uikit/badge';
import { Card, CardContent } from '@voilajsx/uikit/card';
import { Heart, Share2, Quote } from 'lucide-react';

interface Quote {
  id: string;
  content: string;
  author: string;
  tags?: string[];
  length?: number;
}

interface QuoteCardProps {
  quote: Quote;
  featured?: boolean;
  showAuthor?: boolean;
  onFavorite?: () => void;
  onShare?: () => void;
  isFavorited?: boolean;
  className?: string;
}

export default function QuoteCard({ 
  quote, 
  featured = false,
  showAuthor = true,
  onFavorite,
  onShare,
  isFavorited = false,
  className = ''
}: QuoteCardProps) {
  
  const cardClasses = featured 
    ? 'border-primary bg-gradient-to-br from-primary/5 to-accent/5' 
    : 'hover:shadow-md transition-shadow duration-200';

  return (
    <Card className={`${cardClasses} ${className}`}>
      <CardContent className={`p-6 ${featured ? 'md:p-8' : ''}`}>
        
        {/* Quote Icon */}
        <div className="flex justify-center mb-4">
          <Quote className={`${featured ? 'w-8 h-8' : 'w-6 h-6'} text-primary/60`} />
        </div>

        {/* Quote Content */}
        <blockquote className={`text-center mb-6 ${featured ? 'text-xl md:text-2xl' : 'text-lg'} leading-relaxed`}>
          <p className="text-foreground font-medium italic">
            "{quote.content}"
          </p>
        </blockquote>

        {/* Author */}
        {showAuthor && (
          <div className="text-center mb-6">
            <p className={`text-muted-foreground ${featured ? 'text-lg' : 'text-base'}`}>
              — {quote.author}
            </p>
          </div>
        )}

        {/* Tags */}
        {quote.tags && quote.tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {quote.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center gap-3">
          {onFavorite && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onFavorite}
              className={`${isFavorited ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground'}`}
            >
              <Heart className={`w-4 h-4 mr-2 ${isFavorited ? 'fill-current' : ''}`} />
              {isFavorited ? 'Favorited' : 'Favorite'}
            </Button>
          )}
          
          {onShare && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onShare}
              className="text-muted-foreground"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          )}
        </div>

        {/* Featured Badge */}
        {featured && (
          <div className="flex justify-center mt-4">
            <Badge className="bg-primary/10 text-primary border-primary/20">
              ✨ Featured Quote
            </Badge>
          </div>
        )}

        {/* Quote Stats */}
        {quote.length && (
          <div className="flex justify-center mt-4">
            <Badge variant="outline" className="text-xs">
              {quote.length} characters
            </Badge>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
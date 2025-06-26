/**
 * Quotes Feature - Quote List Grid Component
 * @module @voilajsx/bloom/features/quotes
 * @file src/features/quotes/components/QuoteList.tsx
 */

import { Card, CardContent } from '@voilajsx/uikit/card';
import { Badge } from '@voilajsx/uikit/badge';
import { BookOpen } from 'lucide-react';
import QuoteCard from './QuoteCard';

interface Quote {
  id: string;
  content: string;
  author: string;
  tags?: string[];
  length?: number;
}

interface QuoteListProps {
  quotes: Quote[];
  loading?: boolean;
  showAuthor?: boolean;
  onFavorite?: (quoteId: string) => void;
  onShare?: (quote: Quote) => void;
  favoriteIds?: string[];
  emptyMessage?: string;
  className?: string;
}

export default function QuoteList({
  quotes,
  loading = false,
  showAuthor = true,
  onFavorite,
  onShare,
  favoriteIds = [],
  emptyMessage = "No quotes available",
  className = ''
}: QuoteListProps) {

  // Loading State
  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex justify-center mb-4">
                <div className="w-6 h-6 bg-muted rounded"></div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-4/5 mx-auto"></div>
                <div className="h-4 bg-muted rounded w-3/5 mx-auto"></div>
              </div>
              <div className="h-4 bg-muted rounded w-1/2 mx-auto mb-6"></div>
              <div className="flex justify-center gap-2">
                <div className="h-8 bg-muted rounded w-20"></div>
                <div className="h-8 bg-muted rounded w-20"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Empty State
  if (!loading && quotes.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Card>
          <CardContent className="p-12">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2 text-foreground">No Quotes Found</h3>
            <p className="text-muted-foreground">{emptyMessage}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quotes Grid
  return (
    <div className={className}>
      {/* Grid Header Stats */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <Badge variant="outline">
            {quotes.length} quotes
          </Badge>
          {favoriteIds.length > 0 && (
            <Badge variant="secondary">
              {favoriteIds.length} favorites
            </Badge>
          )}
        </div>
      </div>

      {/* Quotes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quotes.map((quote, index) => (
          <div 
            key={quote.id} 
            className="animate-bloom-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <QuoteCard
              quote={quote}
              showAuthor={showAuthor}
              onFavorite={onFavorite ? () => onFavorite(quote.id) : undefined}
              onShare={onShare ? () => onShare(quote) : undefined}
              isFavorited={favoriteIds.includes(quote.id)}
            />
          </div>
        ))}
      </div>

      {/* Load More Indicator */}
      {quotes.length > 0 && (
        <div className="text-center mt-8">
          <Badge variant="outline" className="text-xs">
            Showing {quotes.length} quotes
          </Badge>
        </div>
      )}
    </div>
  );
}
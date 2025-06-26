/**
 * Quotes Feature - Main Quotes Page Component
 * @module @voilajsx/bloom/features/quotes
 * @file src/features/quotes/pages/QuotesPage.tsx
 */

import { Button } from '@voilajsx/uikit/button';
import { Badge } from '@voilajsx/uikit/badge';
import { Card, CardContent } from '@voilajsx/uikit/card';
import { Alert, AlertDescription } from '@voilajsx/uikit/alert';
import { Loader2, RefreshCw, Heart } from 'lucide-react';
import { useQuotes } from '../hooks/useQuotes';
import QuoteList from '../components/QuoteList';
import QuoteCard from '../components/QuoteCard';

export default function QuotesPage() {
  const {
    quotes,
    featuredQuote,
    loading,
    error,
    settings,
    refreshQuotes,
    getFavorites,
    toggleFavorite,
    shareQuote
  } = useQuotes();

  return (
    <div className="space-y-16">
      {/* Header */}
      <section className="py-16 px-8 text-center border-b border-border">
        <Badge variant="secondary" className="mb-6">
          🌸 Daily Inspiration
        </Badge>
        <h1 className="text-5xl font-bold mb-6">
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Quotes
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Discover wisdom and inspiration from great minds throughout history. 
          Let these quotes motivate and guide your journey.
        </p>
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            onClick={refreshQuotes} 
            disabled={loading.quotes}
            variant="outline"
            className="min-w-32"
          >
            {loading.quotes ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                New Quotes
              </>
            )}
          </Button>
          
          <Button 
            onClick={() => window.location.href = '#favorites'} 
            variant="ghost"
            className="min-w-32"
          >
            <Heart className="h-4 w-4 mr-2" />
            Favorites ({getFavorites().length})
          </Button>
        </div>
      </section>

      {/* Error State */}
      {error && (
        <div className="max-w-4xl mx-auto px-8 py-8">
          <Alert variant="destructive">
            <AlertDescription>
              {error}. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Featured Quote */}
      {featuredQuote && !loading.featured && (
        <section className="py-16 px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Quote of the Day</h2>
            <QuoteCard 
              quote={featuredQuote}
              featured={true}
              onFavorite={() => toggleFavorite(featuredQuote.id)}
              onShare={() => shareQuote(featuredQuote)}
              showAuthor={settings.showAuthor}
            />
          </div>
        </section>
      )}

      {/* Loading State for Featured */}
      {loading.featured && (
        <section className="py-16 px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Card>
              <CardContent className="p-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading featured quote...</p>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Quotes Grid */}
      <section className="py-16 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Latest Quotes</h2>
            <Badge variant="outline">
              {quotes.length} quotes loaded
            </Badge>
          </div>
          
          <QuoteList 
            quotes={quotes}
            loading={loading.quotes}
            onFavorite={toggleFavorite}
            onShare={shareQuote}
            showAuthor={settings.showAuthor}
            emptyMessage="No quotes available. Try refreshing to load new quotes."
          />
        </div>
      </section>

      {/* Auto-refresh indicator */}
      {settings.autoRefresh && (
        <div className="fixed bottom-6 right-6 z-50">
          <Badge variant="secondary" className="text-xs">
            Auto-refresh enabled
          </Badge>
        </div>
      )}
    </div>
  );
}
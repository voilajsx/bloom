/**
 * Quotes Feature - Pure Advice Slip API (no fallback)
 * @module @voilajsx/bloom/features/quotes
 * @file src/features/quotes/hooks/useQuotes.ts
 */

import { useState, useEffect, useCallback } from 'react';
import { useBloomStorage } from '@/shared/hooks/useBloomStorage';
import { useApi } from '@/shared/hooks/useApi';

interface Quote {
  id: string;
  content: string;
  author: string;
  tags?: string[];
  length?: number;
}

interface QuotesSettings {
  autoRefresh: boolean;
  refreshInterval: number;
  showAuthor: boolean;
  quotesPerPage: number;
}

interface LoadingState {
  quotes: boolean;
  featured: boolean;
  refresh: boolean;
}

export function useQuotes() {
  const { get, set } = useBloomStorage();
  const { apiGet } = useApi();

  // State management
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [featuredQuote, setFeaturedQuote] = useState<Quote | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [settings, setSettings] = useState<QuotesSettings>({
    autoRefresh: true,
    refreshInterval: 30000,
    showAuthor: true,
    quotesPerPage: 6
  });
  const [loading, setLoading] = useState<LoadingState>({
    quotes: false,
    featured: false,
    refresh: false
  });
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadSettings();
    loadFavorites();
    loadQuotes();
    loadFeaturedQuote();
  }, []);

  // Auto-refresh setup
  useEffect(() => {
    if (!settings.autoRefresh) return;

    const interval = setInterval(() => {
      refreshQuotes();
    }, settings.refreshInterval);

    return () => clearInterval(interval);
  }, [settings.autoRefresh, settings.refreshInterval]);

  // Load settings from storage
  const loadSettings = async () => {
    try {
      const autoRefresh = await get('quotes.autoRefresh', true);
      const refreshInterval = await get('quotes.refreshInterval', 30000);
      const showAuthor = await get('quotes.showAuthor', true);
      const quotesPerPage = await get('quotes.quotesPerPage', 6);

      setSettings({
        autoRefresh,
        refreshInterval,
        showAuthor,
        quotesPerPage
      });
    } catch (error) {
      console.error('[Quotes] Failed to load settings:', error);
    }
  };

  // Load favorites from storage
  const loadFavorites = async () => {
    try {
      const savedFavorites = await get('quotes.favorites', []);
      setFavorites(savedFavorites);
    } catch (error) {
      console.error('[Quotes] Failed to load favorites:', error);
    }
  };

  // Load quotes from Advice Slip API
  const loadQuotes = async () => {
    setLoading(prev => ({ ...prev, quotes: true }));
    setError(null);

    try {
      console.log('[Quotes] Loading advice from Advice Slip API...');
      
      // Get multiple advice by calling API multiple times
      const promises = Array(settings.quotesPerPage).fill(null).map((_, index) => 
        apiGet('https://api.adviceslip.com/advice').then(response => ({
          response,
          index
        }))
      );

      const results = await Promise.all(promises);
      
      // Process successful responses
      const quotesData: Quote[] = [];
      results.forEach(({ response, index }) => {
        if (response.success && response.data?.slip) {
          const slip = response.data.slip;
          quotesData.push({
            id: `advice-${slip.id}-${Date.now()}-${index}`,
            content: slip.advice,
            author: 'Anonymous Wisdom',
            tags: ['advice', 'wisdom'],
            length: slip.advice.length
          });
        }
      });

      if (quotesData.length > 0) {
        setQuotes(quotesData);
        console.log('[Quotes] Advice Slip API successful!', quotesData);
      } else {
        throw new Error('No advice received from API');
      }
    } catch (error) {
      console.error('[Quotes] Advice Slip API failed:', error);
      setError('Failed to load advice from API. Please try refreshing.');
    } finally {
      setLoading(prev => ({ ...prev, quotes: false }));
    }
  };

  // Load featured advice
  const loadFeaturedQuote = async () => {
    setLoading(prev => ({ ...prev, featured: true }));

    try {
      console.log('[Quotes] Loading featured advice...');
      const response = await apiGet('https://api.adviceslip.com/advice');

      if (response.success && response.data?.slip) {
        const slip = response.data.slip;
        const featuredQuote = {
          id: `featured-advice-${slip.id}-${Date.now()}`,
          content: slip.advice,
          author: 'Featured Wisdom',
          tags: ['featured', 'advice'],
          length: slip.advice.length
        };

        setFeaturedQuote(featuredQuote);
        console.log('[Quotes] Featured advice loaded:', featuredQuote);
      } else {
        throw new Error('No featured advice received');
      }
    } catch (error) {
      console.error('[Quotes] Failed to load featured advice:', error);
    } finally {
      setLoading(prev => ({ ...prev, featured: false }));
    }
  };

  // Refresh all quotes
  const refreshQuotes = useCallback(async () => {
    setLoading(prev => ({ ...prev, refresh: true }));
    
    try {
      await Promise.all([
        loadQuotes(),
        loadFeaturedQuote()
      ]);
    } finally {
      setLoading(prev => ({ ...prev, refresh: false }));
    }
  }, [settings.quotesPerPage]);

  // Update setting
  const updateSetting = async <K extends keyof QuotesSettings>(
    key: K,
    value: QuotesSettings[K]
  ) => {
    try {
      setSettings(prev => ({ ...prev, [key]: value }));
      await set(`quotes.${key}`, value);
      
      // Reload quotes if quotesPerPage changed
      if (key === 'quotesPerPage') {
        loadQuotes();
      }
    } catch (error) {
      console.error(`[Quotes] Failed to update ${key}:`, error);
      setSettings(prev => ({ ...prev, [key]: settings[key] }));
    }
  };

  // Toggle favorite quote
  const toggleFavorite = async (quoteId: string) => {
    try {
      const newFavorites = favorites.includes(quoteId)
        ? favorites.filter(id => id !== quoteId)
        : [...favorites, quoteId];

      setFavorites(newFavorites);
      await set('quotes.favorites', newFavorites);
    } catch (error) {
      console.error('[Quotes] Failed to update favorites:', error);
    }
  };

  // Share quote
  const shareQuote = async (quote: Quote) => {
    const shareText = `"${quote.content}" — ${quote.author}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Inspirational Advice',
          text: shareText,
          url: window.location.href
        });
      } catch (error) {
        // Fallback to clipboard
        copyToClipboard(shareText);
      }
    } else {
      copyToClipboard(shareText);
    }
  };

  // Copy to clipboard helper
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Advice copied to clipboard');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  // Get favorite quotes
  const getFavorites = () => {
    return quotes.filter(quote => favorites.includes(quote.id));
  };

  return {
    // State
    quotes,
    featuredQuote,
    favorites,
    settings,
    loading,
    error,

    // Actions
    refreshQuotes,
    updateSetting,
    toggleFavorite,
    shareQuote,

    // Utilities
    getFavorites,
    isReady: !loading.quotes && !loading.featured
  };
}
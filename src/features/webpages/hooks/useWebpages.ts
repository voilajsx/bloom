/**
 * Webpages Feature - Business logic and state management
 * @module @voilajsx/bloom/features/webpages
 * @file src/features/webpages/hooks/useWebpages.ts
 */

import { useState, useEffect } from 'react';
import { useBloomStorage } from '@/shared/hooks/useBloomStorage';
import defaults from '@/defaults';

interface WebpagesSettings {
  companyName: string;
}

export function useWebpages() {
  const { get, set } = useBloomStorage();
  const [settings, setSettings] = useState<WebpagesSettings>({
    companyName: 'Bloom Company'
  });
  const [loading, setLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const companyName = await get('webpages.companyName', defaults['app-name'] || 'Bloom Company');
        
        setSettings({
          companyName
        });
      } catch (error) {
        console.error('[Webpages] Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [get]);

  // Update a setting
  const updateSetting = async <K extends keyof WebpagesSettings>(
    key: K, 
    value: WebpagesSettings[K]
  ) => {
    try {
      setSettings(prev => ({ ...prev, [key]: value }));
      await set(`webpages.${key}`, value);
    } catch (error) {
      console.error(`[Webpages] Failed to update ${key}:`, error);
      // Revert on failure
      setSettings(prev => ({ ...prev, [key]: settings[key] }));
    }
  };

  // Navigation helper
  const navigate = (path: string) => {
    window.location.href = path;
  };

  // Page metadata helper
  const getPageMeta = (page: 'home' | 'about' | 'contact') => {
    const meta = {
      home: {
        title: `${settings.companyName} - Home`,
        description: `Welcome to ${settings.companyName}. Built with Bloom Framework.`
      },
      about: {
        title: `About ${settings.companyName}`,
        description: `Learn more about ${settings.companyName} and our mission.`
      },
      contact: {
        title: `Contact ${settings.companyName}`,
        description: `Get in touch with the ${settings.companyName} team.`
      }
    };

    return meta[page];
  };

  return {
    // State
    settings,
    loading,
    
    // Computed values
    companyName: settings.companyName,
    
    // Actions
    updateSetting,
    navigate,
    getPageMeta,
    
    // Utilities
    isReady: !loading
  };
}
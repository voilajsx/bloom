/**
 * Bloom Framework - Layout with Stable Header/Footer
 * @module @voilajsx/bloom/platform
 * @file src/platform/layout.tsx
 */

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ThemeProvider } from '@voilajsx/uikit/theme-provider';
import { PageLayout } from '@voilajsx/uikit/page';
import { AdminLayout } from '@voilajsx/uikit/admin';
import { AuthLayout } from '@voilajsx/uikit/auth';
import { BlankLayout } from '@voilajsx/uikit/blank';
import { PopupLayout } from '@voilajsx/uikit/popup';
import { Home, Info, Mail, Quote } from 'lucide-react';
import defaults, { getNavigationWithBasePath, getBasePath } from '@/defaults';


// Local navigation item interface
interface NavigationItem {
  key: string;
  label: string;
  href: string;
  icon?: React.ComponentType;
  isActive?: boolean;
}
// Icon mapping from string to component
const iconMap: Record<string, React.ComponentType> = {
  Home,
  Info,
  Mail,
  Quote,
};

// Convert defaults navigation to UIKit format with base path
function convertNavigation(items: readonly any[], basePath: string): NavigationItem[] {
  return [...items].map(item => {
    // Create full URL with base path
    const fullHref = basePath !== '/' ? `${basePath.replace(/\/$/, '')}${item.href}` : item.href;
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
    
    return {
      key: item.key,
      label: item.label,
      href: fullHref,
      icon: item.icon ? iconMap[item.icon] : undefined,
      isActive: currentPath === fullHref
    };
  });
}

// Get layout based on current path
function getLayoutFromPath(pathname: string): 'page' | 'admin' | 'auth' | 'blank' | 'popup' {
  const basePath = getBasePath();
  const path = basePath !== '/' && pathname.startsWith(basePath) 
    ? pathname.slice(basePath.length - 1) || '/'
    : pathname;
  
  const layoutRoutes = defaults['layout-routes'] || {};
  
  // Check exact matches first
  for (const [layoutType, routes] of Object.entries(layoutRoutes)) {
    if (Array.isArray(routes)) {
      for (const route of routes) {
        if (route !== '/*' && !route.endsWith('*')) {
          if (path === route) {
            return layoutType as any;
          }
        }
      }
    }
  }
  
  // Check prefix matches
  for (const [layoutType, routes] of Object.entries(layoutRoutes)) {
    if (Array.isArray(routes)) {
      for (const route of routes) {
        if (route.endsWith('*')) {
          const prefix = route.slice(0, -1);
          if (path.startsWith(prefix)) {
            return layoutType as any;
          }
        }
      }
    }
  }
  
  // Wildcard fallback
  for (const [layoutType, routes] of Object.entries(layoutRoutes)) {
    if (Array.isArray(routes) && routes.includes('/*')) {
      return layoutType as any;
    }
  }
  
  return defaults['default-layout'] as any || 'page';
}

interface BloomLayoutWrapperProps {
  children: React.ReactNode;
  layout?: 'page' | 'admin' | 'auth' | 'blank' | 'popup';
}

export function BloomLayoutWrapper({ 
  children, 
  layout 
}: BloomLayoutWrapperProps) {
  const location = useLocation();
  const [currentLayout, setCurrentLayout] = useState(() => 
    layout || getLayoutFromPath(location.pathname)
  );
  
  // Update layout only when needed
  useEffect(() => {
    if (!layout) {
      const newLayout = getLayoutFromPath(location.pathname);
      if (newLayout !== currentLayout) {
        setCurrentLayout(newLayout);
      }
    }
  }, [location.pathname, layout, currentLayout]);
  
  const basePath = getBasePath();
  const navigation = convertNavigation(defaults['navigation-items'] || [], basePath);
  
  // Theme and layout configuration
  const config = {
    theme: defaults['app-theme'] || 'studio',
    mode: defaults['app-mode'] || 'light',
    title: defaults['app-name'] || 'Bloom App',
    navigation: navigation,
  };

  // Stable layout wrapper with content slot
  return React.createElement(ThemeProvider, {
    theme: config.theme,
    mode: config.mode,
    detectSystem: true,
    children: React.createElement(LayoutRenderer, {
      layout: currentLayout,
      config,
      children
    })
  });
}

// Separate layout renderer to prevent full re-renders
function LayoutRenderer({ 
  layout, 
  config, 
  children 
}: {
  layout: string;
  config: any;
  children: React.ReactNode;
}) {
  const layoutProps = {
    scheme: 'default' as const,
    tone: 'clean' as const,
    size: (defaults['layout-size'] || 'xl') as any,
    title: config.title,
    navigation: config.navigation,
  };

  switch (layout) {
    case 'admin':
      return React.createElement(AdminLayout, {
        ...layoutProps,
        scheme: 'sidebar' as const,
        tone: 'subtle' as const,
        size: 'lg' as const,
        children
      });

    case 'auth':
      return React.createElement(AuthLayout, {
        ...layoutProps,
        scheme: 'card' as const,
        tone: 'clean' as const,
        size: 'md' as const,
        children
      });

    case 'blank':
      return React.createElement(BlankLayout, {
        ...layoutProps,
        scheme: 'default' as const,
        tone: 'clean' as const,
        size: 'lg' as const,
        children
      });

    case 'popup':
      return React.createElement(PopupLayout, {
        ...layoutProps,
        scheme: 'modal' as const,
        tone: 'clean' as const,
        size: 'md' as const,
        children
      });

    default: // 'page'
      return React.createElement(PageLayout, {
        ...layoutProps,
        scheme: 'default' as const,
        tone: 'clean' as const,
        size: 'xl' as const,
        children
      });
  }
}
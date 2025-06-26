/**
 * Bloom Framework - Complete Fixed Router
 * @module @voilajsx/bloom/platform
 * @file src/platform/router.ts
 */

import React, { useMemo, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { BlankLayout } from '@voilajsx/uikit/blank';
import { PageLayout } from '@voilajsx/uikit/page';
import { AdminLayout } from '@voilajsx/uikit/admin';
import { AuthLayout } from '@voilajsx/uikit/auth';
import { PopupLayout } from '@voilajsx/uikit/popup';
import { Button } from '@voilajsx/uikit/button';
import { AlertTriangle, Home, Info, Mail, Quote } from 'lucide-react';
import type {
  BloomCompiledRoute,
  BloomFeatureRegistry,
  BloomRouterConfig
} from './types';
import {
  getRouteByPath,
  extractRouteParams
} from './discovery';
import defaults, { getBasePath } from '@/defaults';

// Icon mapping
const iconMap: Record<string, React.ComponentType> = {
  Home,
  Info,
  Mail,
  Quote,
};

// Get layout type from path
function getLayoutType(pathname: string): 'page' | 'admin' | 'auth' | 'blank' | 'popup' {
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
          if (path === route) return layoutType as any;
        }
      }
    }
  }
  
  // Check prefix matches
  for (const [layoutType, routes] of Object.entries(layoutRoutes)) {
    if (Array.isArray(routes)) {
      for (const route of routes) {
        if (route.endsWith('*')) {
          if (path.startsWith(route.slice(0, -1))) return layoutType as any;
        }
      }
    }
  }
  
  // Check wildcard
  for (const [layoutType, routes] of Object.entries(layoutRoutes)) {
    if (Array.isArray(routes) && routes.includes('/*')) {
      return layoutType as any;
    }
  }
  
  return 'page';
}

// Get navigation items with proper active state
function getNavigation(currentPath: string) {
  const basePath = getBasePath();
  return [...defaults['navigation-items']].map(item => ({
    key: item.key,
    label: item.label,
    href: basePath !== '/' ? `${basePath.replace(/\/$/, '')}${item.href}` : item.href,
    icon: item.icon ? iconMap[item.icon] : undefined,
    isActive: currentPath === (basePath !== '/' ? `${basePath.replace(/\/$/, '')}${item.href}` : item.href),
  }));
}

/**
 * Stable layout wrapper
 */
function StableLayoutWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const layoutType = getLayoutType(location.pathname);
  const navigation = getNavigation(location.pathname);
  
  const layoutProps = {
    scheme: 'default' as const,
    tone: 'clean' as const,
    size: 'xl' as const,
    title: defaults['app-name'] || 'Bloom App',
    navigation,
    currentPath: location.pathname,
    onNavigate: (href: string) => {
      navigate(href);
    },
    children
  };

  switch (layoutType) {
    case 'admin':
      return React.createElement(AdminLayout, {
        ...layoutProps,
        scheme: 'sidebar' as const,
        tone: 'subtle' as const,
        size: 'lg' as const,
      });

    case 'auth':
      return React.createElement(AuthLayout, {
        ...layoutProps,
        scheme: 'card' as const,
        size: 'md' as const,
      });

    case 'blank':
      return React.createElement(BlankLayout, {
        ...layoutProps,
        size: 'lg' as const,
      });

    case 'popup':
      return React.createElement(PopupLayout, {
        ...layoutProps,
        scheme: 'modal' as const,
        size: 'md' as const,
      });

    default: // 'page'
      return React.createElement(PageLayout, layoutProps);
  }
}

/**
 * Route renderer
 */
function RouteRenderer({ 
  route, 
  params 
}: { 
  route: BloomCompiledRoute; 
  params: Record<string, string> 
}) {
  const LoaderComponent = React.useMemo(() => {
    return function ComponentLoader() {
      const [Component, setComponent] = React.useState<React.ComponentType<any> | null>(null);
      const [error, setError] = React.useState<string | null>(null);
      
      React.useEffect(() => {
        let mounted = true;
        
        route.component()
          .then(module => {
            if (mounted) {
              setComponent(() => module.default);
            }
          })
          .catch(err => {
            if (mounted) {
              console.error(`Failed to load ${route.path}:`, err);
              setError(`Failed to load page: ${route.path}`);
            }
          });
        
        return () => { mounted = false; };
      }, []);
      
      if (error) {
        return React.createElement(RouteError, { route, error });
      }
      
      if (!Component) {
        return React.createElement('div', { 
          className: 'opacity-0'
        });
      }
      
      return React.createElement('div', {
        className: 'animate-bloom-fade-in'
      }, React.createElement(Component, params));
    };
  }, [route.id]);
  
  return React.createElement(LoaderComponent);
}

/**
 * Route error component
 */
function RouteError({ route, error }: { route: BloomCompiledRoute; error?: string }) {
  const navigate = useNavigate();

  return React.createElement(BlankLayout, {
    scheme: 'error',
    tone: 'clean',
    size: 'lg',
    children: React.createElement('div', {
      className: 'text-center space-y-6'
    }, [
      React.createElement(AlertTriangle, {
        key: 'icon',
        className: 'w-16 h-16 mx-auto text-destructive'
      }),
      React.createElement('h1', {
        key: 'title',
        className: 'text-2xl font-bold'
      }, 'Page Error'),
      React.createElement('p', {
        key: 'desc',
        className: 'text-muted-foreground'
      }, error || `Could not load: ${route.path}`),
      React.createElement(Button, {
        key: 'home',
        onClick: () => navigate('/'),
        className: 'flex items-center gap-2'
      }, [
        React.createElement(Home, { key: 'icon', className: 'w-4 h-4' }),
        'Go Home'
      ])
    ])
  });
}

/**
 * 404 Not Found page
 */
function NotFoundPage() {
  const navigate = useNavigate();

  return React.createElement(BlankLayout, {
    scheme: 'error',
    tone: 'clean',
    size: 'lg',
    children: React.createElement('div', {
      className: 'text-center space-y-8 animate-bloom-fade-in'
    }, [
      React.createElement('div', {
        key: 'header',
        className: 'space-y-4'
      }, [
        React.createElement('div', {
          key: 'icon',
          className: 'text-8xl'
        }, '🌸'),
        React.createElement('h1', {
          key: 'title',
          className: 'text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent'
        }, '404'),
        React.createElement('p', {
          key: 'desc',
          className: 'text-xl text-muted-foreground'
        }, 'Page not found')
      ]),
      React.createElement('div', {
        key: 'actions',
        className: 'flex gap-3 justify-center'
      }, [
        React.createElement(Button, {
          key: 'home',
          onClick: () => navigate('/'),
          className: 'flex items-center gap-2'
        }, [
          React.createElement(Home, { key: 'icon', className: 'w-4 h-4' }),
          'Go Home'
        ]),
        React.createElement(Button, {
          key: 'back',
          variant: 'outline',
          onClick: () => window.history.back()
        }, 'Go Back')
      ])
    ])
  });
}

/**
 * Main Bloom Router
 */
export function BloomRouter({ routes }: BloomRouterConfig) {
  const location = useLocation();

  // Update meta tags
  useEffect(() => {
    const route = getRouteByPath(routes, location.pathname);
    if (route?.title) {
      document.title = route.title;
    }
  }, [location.pathname, routes]);

  // Generate routes
  const reactRoutes = useMemo(() => {
    return routes.map(route => 
      React.createElement(Route, {
        key: route.id,
        path: route.path,
        element: React.createElement(RouteRenderer, {
          route,
          params: extractRouteParams(route, location.pathname)
        })
      })
    );
  }, [routes, location.pathname]);

  if (!reactRoutes.length) {
    return React.createElement('div');
  }

  // Wrap in stable layout
  return React.createElement(StableLayoutWrapper, {
    children: React.createElement(Routes, null, [
      ...reactRoutes,
      React.createElement(Route, {
        key: '404',
        path: '*',
        element: React.createElement(NotFoundPage)
      })
    ])
  });
}

/**
 * Navigation helper hook
 */
export function useBloomRouter() {
  const location = useLocation();
  const navigate = useNavigate();

  return {
    location,
    navigate,
    pathname: location.pathname,
    search: location.search,
    hash: location.hash,
    isCurrentPath: (path: string) => location.pathname === path
  };
}
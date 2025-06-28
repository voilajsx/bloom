/**
 * Bloom Framework - Cleaned Router with Feature-only Layout Control
 * @module @voilajsx/bloom/platform
 * @file src/platform/router.ts
 */

import React, { useMemo, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { BlankLayout } from '@voilajsx/uikit/blank';
import { Button } from '@voilajsx/uikit/button';
import { AlertTriangle, Home } from 'lucide-react';
import type {
  BloomCompiledRoute,
  BloomFeatureRegistry,
  BloomRouterConfig
} from './types';
import {
  getRouteByPath,
  extractRouteParams
} from './discovery';
import { BloomLayoutWrapper } from './layout';
import defaults from '@/defaults';

/**
 * Get layout for a route - simplified to feature-only control
 */
function getRouteLayout(route: BloomCompiledRoute): 'page' | 'admin' | 'auth' | 'blank' | 'popup' {
  // Use route-specified layout or default to 'page'
  const layoutType = route.layout && route.layout !== 'default' 
    ? route.layout 
    : (defaults['default-layout'] || 'page');
    
  console.log(`🎯 Route layout: ${route.path} → ${layoutType} (from feature config)`);
  return layoutType as any;
}

/**
 * Route renderer with layout wrapper
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
      
      // Determine layout from feature config
      const layoutType = getRouteLayout(route);
      
      // Create the component content
      const componentContent = React.createElement('div', {
        className: 'animate-bloom-fade-in'
      }, React.createElement(Component, params));
      
      // Wrap component in layout wrapper
      return React.createElement(BloomLayoutWrapper, {
        layout: layoutType,
        children: componentContent
      });
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
    scheme: 'simple',
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

  const pageContent = React.createElement('div', {
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
  ]);

  return React.createElement(BloomLayoutWrapper, {
    layout: 'blank',
    children: pageContent
  });
}

/**
 * Main Bloom Router - Simplified
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

  // Simple debugging for feature-based layout
  useEffect(() => {
    const route = getRouteByPath(routes, location.pathname);
    if (route && process.env.NODE_ENV === 'development') {
      const layoutType = getRouteLayout(route);
      console.log('🌸 Router Debug:', {
        path: location.pathname,
        feature: route.featureName,
        routeLayout: route.layout,
        resolvedLayout: layoutType
      });
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

  return React.createElement(Routes, null, [
    ...reactRoutes,
    React.createElement(Route, {
      key: '404',
      path: '*',
      element: React.createElement(NotFoundPage)
    })
  ]);
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
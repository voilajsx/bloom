/**
 * Bloom Framework - Clean Layout Wrapper using Defaults Configuration
 * @module @voilajsx/bloom/platform
 * @file src/platform/layout.tsx
 */

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@voilajsx/uikit/theme-provider';
import { PageLayout } from '@voilajsx/uikit/page';
import { AdminLayout } from '@voilajsx/uikit/admin';
import { AuthLayout } from '@voilajsx/uikit/auth';
import { BlankLayout } from '@voilajsx/uikit/blank';
import { PopupLayout } from '@voilajsx/uikit/popup';
import { Home, Info, Mail, Quote } from 'lucide-react';
import defaults, { getBasePath, getLayoutConfig } from '@/defaults';
import { getBreadcrumbs, type BreadcrumbConfig } from './breadcrumbs';

// Navigation item interface for UIKit
interface NavigationItem {
  key: string;
  label: string;
  href: string;
  icon?: React.ComponentType;
  isActive?: boolean;
}

// Icon mapping
const iconMap: Record<string, React.ComponentType> = {
  Home,
  Info,
  Mail,
  Quote,
};

// Convert navigation items with proper base path and active states
function getNavigationItems(currentPath: string): NavigationItem[] {
  const basePath = getBasePath();
  const items = defaults['navigation-items'] || [];
  
  return items.map(item => {
    // When React Router uses basename, hrefs should be relative (no base path)
    // React Router will automatically add the basename
    const href = item.href; // Keep original href relative
    
    // For active state comparison, we need the full path including base path
    const fullHref = basePath !== '/' ? `${basePath.replace(/\/$/, '')}${item.href}` : item.href;
    
    return {
      key: item.key,
      label: item.label,
      href: href, // Relative href for React Router
      icon: item.icon ? iconMap[item.icon] : undefined,
      isActive: currentPath === fullHref // Compare against full path
    };
  });
}

interface BloomLayoutWrapperProps {
  children: React.ReactNode;
  layout?: 'page' | 'admin' | 'auth' | 'blank' | 'popup';
  breadcrumbs?: BreadcrumbConfig;
}

export function BloomLayoutWrapper({ 
  children, 
  layout = 'page',
  breadcrumbs
}: BloomLayoutWrapperProps) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get navigation with current active states
  const navigation = getNavigationItems(location.pathname);
  
  // Get breadcrumbs for current route
  const currentBreadcrumbs = getBreadcrumbs(location.pathname, breadcrumbs);
  
  // Navigation handler
  const handleNavigation = (href: string) => {
    navigate(href);
  };
  

  
  // App configuration with debug
  const detectedTheme = defaults['app-theme'] || 'neon';
  console.log('🔍 [THEME DEBUG] Final detected theme:', detectedTheme);
  
  const appConfig = {
    theme: detectedTheme,
    mode: defaults['app-mode'] || 'light',
    title: defaults['app-name'] || 'Bloom App',
  };
  
  console.log('🔍 [THEME DEBUG] Final appConfig:', appConfig);

  // Debug log for navigation
  if (process.env.NODE_ENV === 'development') {
    console.log('🌸 Navigation Debug:', {
      currentPath: location.pathname,
      basePath: getBasePath(),
      layout,
      navigationItems: navigation.length,
      activeNavItem: navigation.find(nav => nav.isActive)?.label || 'none',
      breadcrumbs: currentBreadcrumbs.length,
      sampleNavHref: navigation[0]?.href // Show relative href
    });
  }

  return (
    <ThemeProvider
      theme={appConfig.theme}
      mode={appConfig.mode}
      detectSystem={true}
    >
      <LayoutRenderer
        layout={layout}
        title={appConfig.title}
        navigation={navigation}
        currentPath={location.pathname}
        onNavigate={handleNavigation}
        breadcrumbs={currentBreadcrumbs}
      >
        {children}
      </LayoutRenderer>
    </ThemeProvider>
  );
}

// Layout renderer component
interface LayoutRendererProps {
  layout: string;
  title: string;
  navigation: NavigationItem[];
  currentPath: string;
  onNavigate: (href: string) => void;
  breadcrumbs: Array<{ label: string; href?: string; isActive?: boolean }>;
  children: React.ReactNode;
}

function LayoutRenderer({
  layout,
  title,
  navigation,
  currentPath,
  onNavigate,
  breadcrumbs,
  children
}: LayoutRendererProps) {
  
  // Get layout configuration from defaults
  const config = getLayoutConfig(layout as any);
  
// Debug breadcrumbs in development
  if (process.env.NODE_ENV === 'development' && breadcrumbs.length > 0) {
    console.log('🍞 Breadcrumbs:', breadcrumbs.map(b => ({ 
      label: b.label, 
      href: b.href, 
      clickable: !!b.href 
    })));
  }
  
  switch (layout) {
    case 'admin': {
      const adminConfig = config;
      
      // Create logo element
      const logoElement = adminConfig.logo?.type === 'image' 
        ? React.createElement('img', {
            src: adminConfig.logo.value,
            alt: title,
            className: 'h-8 w-auto'
          })
        : React.createElement('div', {
            className: 'flex items-center gap-2'
          }, [
            React.createElement('div', {
              key: 'icon',
              className: 'w-8 h-8 bg-primary rounded-lg flex items-center justify-center'
            }, React.createElement('span', {
              className: 'text-primary-foreground font-bold'
            }, adminConfig.logo?.value || 'A')),
            adminConfig.logo?.showTitle && React.createElement('span', {
              key: 'title',
              className: 'text-lg font-bold text-foreground'
            }, title)
          ]);

      return (
        <AdminLayout 
          scheme={adminConfig.scheme || 'sidebar'} 
          tone={adminConfig.tone || 'subtle'} 
          size={adminConfig.size || 'lg'}
        >
          <AdminLayout.Header 
            title={title}
            breadcrumbs={breadcrumbs.length > 0 ? breadcrumbs : undefined}
           
            actions={adminConfig.header?.showIndicator && React.createElement('div', {
              className: 'text-sm text-muted-foreground'
            }, adminConfig.header.indicator)}
          />
          <AdminLayout.Sidebar
            navigation={navigation}
            currentPath={currentPath}
            onNavigate={onNavigate}
            logo={logoElement}
          />
          <AdminLayout.Content>
            {children}
          </AdminLayout.Content>
        </AdminLayout>
      );
    }

    case 'auth': {
      const authConfig = config;
      return (
        <AuthLayout 
          scheme={authConfig.scheme || 'card'} 
          tone={authConfig.tone || 'clean'} 
          size={authConfig.size || 'md'}
        >
          {children}
        </AuthLayout>
      );
    }

    case 'blank': {
      const blankConfig = config;
      return (
        <BlankLayout 
          scheme={blankConfig.scheme || 'simple'} 
          tone={blankConfig.tone || 'clean'} 
          size={blankConfig.size || 'lg'}
        >
          {children}
        </BlankLayout>
      );
    }

    case 'popup': {
      const popupConfig = config;
      return (
        <PopupLayout 
          scheme={popupConfig.scheme || 'modal'} 
          tone={popupConfig.tone || 'clean'} 
          size={popupConfig.size || 'md'}
        >
          {children}
        </PopupLayout>
      );
    }

    default: { // 'page'
      const pageConfig = config;
      
      // Process footer copyright template
      const copyright = pageConfig.footer?.copyright?.replace('{title}', title);
      
      return (
        <PageLayout 
          scheme={pageConfig.scheme || 'default'} 
          tone={pageConfig.tone || 'clean'} 
          size={pageConfig.size || 'xl'}
        >
          <PageLayout.Header
            title={title}
            navigation={navigation}
            currentPath={currentPath}
            onNavigate={onNavigate}
            actions={pageConfig.header?.showIndicator && React.createElement('div', {
              className: 'text-sm text-muted-foreground'
            }, pageConfig.header.indicator)}
          />
          <PageLayout.Content 
            breadcrumbs={breadcrumbs.length > 0 ? breadcrumbs : undefined}>
            {children}
          </PageLayout.Content>
          <PageLayout.Footer
            navigation={pageConfig.footer?.navigation || []}
            copyright={copyright}
          />
        </PageLayout>
      );
    }
  }
}
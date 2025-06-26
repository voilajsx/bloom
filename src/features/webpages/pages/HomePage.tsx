/**
 * Webpages Feature - Home Page Component
 * @module @voilajsx/bloom/features/webpages
 * @file src/features/webpages/pages/HomePage.tsx
 */

import { Button } from '@voilajsx/uikit/button';
import { Badge } from '@voilajsx/uikit/badge';
import { Card, CardContent } from '@voilajsx/uikit/card';
import { useWebpages } from '../hooks/useWebpages';

export default function HomePage() {
  const { companyName } = useWebpages();

  return (
    <div className="space-y-16 ">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center text-center">
        <div className="max-w-4xl mx-auto px-8">
          
          <Badge variant="secondary" className="mb-8 text-xs px-3 py-1">
            🌸 Bloom Framework
          </Badge>
          
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Welcome
            </span>
            <span className="text-foreground"> to {companyName}</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Built with Bloom Framework - The feature-modular frontend framework with SSG and LLM-accelerated development.
          </p>
          
          <div className="flex justify-center space-x-2 mb-12">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-100"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-200"></div>
          </div>
          
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-8">
        <div className="max-w-4xl mx-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center p-6">
              <CardContent className="p-6">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="font-semibold mb-2 text-foreground">Feature Modular</h3>
                <p className="text-sm text-muted-foreground">
                  True feature isolation with auto-discovery
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6">
              <CardContent className="p-6">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="font-semibold mb-2 text-foreground">SSG Ready</h3>
                <p className="text-sm text-muted-foreground">
                  Static site generation with dynamic capabilities
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6">
              <CardContent className="p-6">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="font-semibold mb-2 text-foreground">LLM Accelerated</h3>
                <p className="text-sm text-muted-foreground">
                  Predictable patterns for AI-assisted development
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4 text-foreground">
              Start Building Today
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Experience the future of frontend development with true modularity, 
              lightning-fast builds, and AI-powered code generation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="min-w-32">
                Get Started
              </Button>
              <Button variant="outline" size="lg" className="min-w-32">
                View Docs
              </Button>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
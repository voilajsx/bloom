/**
 * Webpages Feature - About Page Component
 * @module @voilajsx/bloom/features/webpages
 * @file src/features/webpages/pages/AboutPage.tsx
 */

import { Badge } from '@voilajsx/uikit/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { useWebpages } from '../hooks/useWebpages';

export default function AboutPage() {
  const { companyName } = useWebpages();

  return (
    <div className="space-y-16">
      {/* Page Header */}
      <section className="py-16 px-8 text-center">
        <Badge variant="secondary" className="mb-6">
          About Us
        </Badge>
        <h1 className="text-5xl font-bold mb-6 text-foreground">
          About {companyName}
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          We're building the future of frontend development with Bloom Framework - 
          a revolutionary approach to modular, maintainable, and AI-accelerated web applications.
        </p>
      </section>

      {/* Content Sections */}
      <section className="py-16 px-8">
        <div className="max-w-4xl mx-auto space-y-16">
          
          {/* Mission */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                To revolutionize frontend development by providing a framework that combines 
                true feature modularity, lightning-fast static generation, and AI-powered 
                development workflows. We believe teams should be able to work independently 
                while maintaining consistency and quality.
              </p>
            </CardContent>
          </Card>

          {/* Values */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="text-xl">🚀</span>
                  Innovation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Pushing the boundaries of what's possible in frontend development 
                  through cutting-edge patterns and AI integration.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="text-xl">🤝</span>
                  Collaboration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Building tools that enable teams to work together seamlessly 
                  while maintaining independence and reducing conflicts.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="text-xl">⚡</span>
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Delivering exceptional performance through static generation, 
                  smart bundling, and optimized runtime patterns.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="text-xl">🎨</span>
                  Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Creating delightful developer experiences that make building 
                  complex applications feel simple and enjoyable.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">10x</div>
              <div className="text-sm text-muted-foreground">Faster Development</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">100%</div>
              <div className="text-sm text-muted-foreground">Feature Isolation</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">∞</div>
              <div className="text-sm text-muted-foreground">Scalability</div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
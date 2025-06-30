/**
 * MyDashboard Feature - Main Page
 * @file pages/MainPage.tsx
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Button } from '@voilajsx/uikit/button';
import { Badge } from '@voilajsx/uikit/badge';

export default function MyDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-16">
        <Badge variant="secondary" className="mb-4">
          ✨ MyDashboard
        </Badge>
        <h1 className="text-4xl font-bold mb-4 text-foreground">
          Welcome to MyDashboard
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your new mydashboard feature is ready to customize.
        </p>
      </section>

      {/* Content Section */}
      <section className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This is your new mydashboard feature. Start customizing:
            </p>
            <div className="flex gap-3">
              <Button className="bg-primary text-primary-foreground">
                Primary Action
              </Button>
              <Button variant="outline">
                Secondary Action
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
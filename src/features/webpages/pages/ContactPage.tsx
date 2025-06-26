/**
 * Webpages Feature - Contact Page Component
 * @module @voilajsx/bloom/features/webpages
 * @file src/features/webpages/pages/ContactPage.tsx
 */

import React, { useState } from 'react';
import { Button } from '@voilajsx/uikit/button';
import { Input } from '@voilajsx/uikit/input';
import { Label } from '@voilajsx/uikit/label';
import { Textarea } from '@voilajsx/uikit/textarea';
import { Badge } from '@voilajsx/uikit/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Alert, AlertDescription } from '@voilajsx/uikit/alert';
import { useWebpages } from '../hooks/useWebpages';

export default function ContactPage() {
  const { companyName } = useWebpages();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Contact form submitted:', formData);
    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="space-y-16">
      {/* Page Header */}
      <section className="py-16 px-8 text-center">
        <Badge variant="secondary" className="mb-6">
          Contact Us
        </Badge>
        <h1 className="text-5xl font-bold mb-6 text-foreground">
          Get in Touch
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Have questions about Bloom Framework? Want to collaborate? 
          We'd love to hear from you and help you build amazing applications.
        </p>
      </section>

      {/* Contact Content */}
      <section className="py-16 px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <Alert>
                    <AlertDescription>
                      Thank you for your message! We'll get back to you soon.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="What's this about?"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us more about your project or question..."
                        rows={6}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full">
                      Send Message
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-xl">🏢</span>
                    {companyName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Building the future of frontend development, one feature at a time.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-xl">📧</span>
                    Email
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">hello@bloom-framework.dev</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-xl">🐙</span>
                    GitHub
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">github.com/voilajsx/bloom</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-xl">⚡</span>
                    Response Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We typically respond within 24 hours during business days.
                  </p>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
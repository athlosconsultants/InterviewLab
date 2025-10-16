'use client';

import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function ReportPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, message }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit report');
      }

      setSubmitted(true);
      setEmail('');
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-16 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Report a Problem</h1>
          <p className="text-muted-foreground">
            Found a bug or issue? Let us know and we&apos;ll look into it.
          </p>
        </div>

        {!submitted ? (
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-800">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-base font-medium mb-2">
                  Your Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="h-12"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  We&apos;ll use this to follow up if needed
                </p>
              </div>

              <div>
                <Label htmlFor="message" className="text-base font-medium mb-2">
                  Problem Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="message"
                  placeholder="Please describe the issue you're experiencing in detail. Include steps to reproduce if possible..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  disabled={loading}
                  rows={8}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  The more detail you provide, the better we can help
                </p>
              </div>

              {error && (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-900 dark:text-red-100 text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || !email || !message}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg"
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </Button>
            </form>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl p-8 shadow-lg border-2 border-green-300 dark:border-green-800 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-3">
              Thank You!
            </h2>
            <p className="text-green-800 dark:text-green-200 mb-6">
              Your report has been submitted successfully. We&apos;ll review it
              and get back to you if we need more information.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => setSubmitted(false)}
                variant="outline"
                className="border-2"
              >
                Submit Another Report
              </Button>
              <Link href="/">
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        )}

        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            💡 Reporting Tips
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4 list-disc">
            <li>Describe what you were trying to do</li>
            <li>Explain what happened vs. what you expected</li>
            <li>Include any error messages you saw</li>
            <li>Mention your browser and device if relevant</li>
          </ul>
        </div>
      </div>

      <Footer />
    </main>
  );
}

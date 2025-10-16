import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - InterviewLab',
  description: 'Privacy policy for InterviewLab services.',
};

export default function PrivacyPage() {
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
      <div className="container mx-auto px-6 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 2025</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Interview Lab (&quot;we&quot;, &quot;our&quot;, or
              &quot;us&quot;) is committed to protecting your privacy. This
              Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you use our AI-powered interview
              practice platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              2. Information We Collect
            </h2>
            <h3 className="text-xl font-semibold mb-3 mt-4">
              Personal Information
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We may collect the following types of personal information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Email address (for account creation and authentication)</li>
              <li>Payment information (processed securely through Stripe)</li>
              <li>CV/resume content (uploaded for interview practice)</li>
              <li>Job descriptions (provided for interview customization)</li>
              <li>
                Interview transcripts and responses (generated during practice
                sessions)
              </li>
              <li>
                Usage data (including session duration, features used, and
                performance metrics)
              </li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">
              Automatically Collected Information
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              We automatically collect certain information about your device and
              usage patterns, including IP address, browser type, operating
              system, and pages visited.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              3. How We Use Your Information
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Provide and maintain our interview practice service</li>
              <li>
                Generate personalized AI interview questions based on your CV
                and job descriptions
              </li>
              <li>Process payments and manage your account</li>
              <li>Improve our services through analytics and user feedback</li>
              <li>Send you service-related communications and updates</li>
              <li>Detect and prevent fraud or abuse of our services</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              4. Data Sharing and Third Parties
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We do not sell your personal information. We may share your
              information with:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>
                <strong>OpenAI:</strong> Your interview content is processed
                through OpenAI&apos;s GPT-4 API to generate questions and
                feedback
              </li>
              <li>
                <strong>Stripe:</strong> Payment information is processed
                securely through Stripe&apos;s payment platform
              </li>
              <li>
                <strong>Supabase:</strong> Authentication and database services
                are provided through Supabase
              </li>
              <li>
                <strong>Service providers:</strong> Third-party vendors who
                assist us in operating our platform
              </li>
              <li>
                <strong>Legal requirements:</strong> When required by law or to
                protect our rights
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement industry-standard security measures to protect your
              data, including encryption in transit and at rest, secure
              authentication, and regular security audits. However, no method of
              transmission over the Internet is 100% secure, and we cannot
              guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your personal information for as long as necessary to
              provide our services and comply with legal obligations. Interview
              transcripts and uploaded documents are stored securely and can be
              deleted upon request.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal information</li>
              <li>Object to processing of your information</li>
              <li>Request data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              To exercise these rights, please contact us at{' '}
              <a
                href="mailto:support@theinterviewlab.io"
                className="text-primary hover:underline"
              >
                support@theinterviewlab.io
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies and similar tracking technologies to maintain your
              session, remember your preferences, and analyze site usage. You
              can control cookie settings through your browser, though disabling
              cookies may affect functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              9. Children&apos;s Privacy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Our service is not intended for users under the age of 16. We do
              not knowingly collect personal information from children. If you
              believe we have collected information from a child, please contact
              us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              10. International Data Transfers
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Your information may be transferred to and processed in countries
              other than your country of residence. We ensure appropriate
              safeguards are in place to protect your information in accordance
              with this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              11. Changes to This Policy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will
              notify you of any material changes by posting the new policy on
              this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about this Privacy Policy or our data
              practices, please contact us at{' '}
              <a
                href="mailto:support@theinterviewlab.io"
                className="text-primary hover:underline"
              >
                support@theinterviewlab.io
              </a>
              .
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}

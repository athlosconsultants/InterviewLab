import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions - InterviewLab',
  description: 'Terms and conditions for using InterviewLab services.',
};

export default function TermsPage() {
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
        <h1 className="text-4xl font-bold mb-6">Terms & Conditions</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 2025</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to The Interview Lab. By accessing or using our website
              and services, you agree to be bound by these Terms & Conditions
              and all applicable laws and regulations. If you do not agree with
              any of these terms, you are prohibited from using or accessing
              this site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Permission is granted to temporarily access the materials
              (information or software) on The Interview Lab&apos;s website for
              personal, non-commercial transitory viewing only. This is the
              grant of a license, not a transfer of title, and under this
              license you may not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Modify or copy the materials</li>
              <li>
                Use the materials for any commercial purpose, or for any public
                display (commercial or non-commercial)
              </li>
              <li>
                Attempt to decompile or reverse engineer any software contained
                on The Interview Lab&apos;s website
              </li>
              <li>
                Remove any copyright or other proprietary notations from the
                materials
              </li>
              <li>
                Transfer the materials to another person or &quot;mirror&quot;
                the materials on any other server
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              3. Service Description
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              InterviewLab provides AI-powered interview practice services using
              advanced language models. The service is designed to help
              candidates prepare for real interviews through simulated
              conversations and feedback. Results and feedback provided are for
              educational purposes only and should not be considered as
              guaranteed outcomes in actual interview scenarios.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. User Accounts</h2>
            <p className="text-muted-foreground leading-relaxed">
              To access certain features of the service, you may be required to
              create an account. You are responsible for maintaining the
              confidentiality of your account credentials and for all activities
              that occur under your account. You agree to notify us immediately
              of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              5. Payment and Refunds
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Certain features of our service require payment. All payments are
              processed securely through Stripe. Refund policies will be
              outlined at the time of purchase. Credits or interview sessions
              purchased are non-transferable and have no cash value.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. User Content</h2>
            <p className="text-muted-foreground leading-relaxed">
              Users may upload CVs, job descriptions, and other materials to use
              the service. You retain ownership of your content, but grant us a
              license to use, store, and process this content solely for the
              purpose of providing our services. We will not share your personal
              content with third parties except as necessary to provide the
              service or as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              7. Limitation of Liability
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              The Interview Lab and its suppliers shall not be held liable for
              any damages arising from the use or inability to use our services,
              even if we have been notified of the possibility of such damages.
              Our AI-generated feedback is provided for educational purposes and
              should not be considered professional career advice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              8. Privacy and Data Protection
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Your use of our service is also governed by our Privacy Policy.
              Please review our Privacy Policy to understand our practices
              regarding the collection and use of your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              9. Modifications to Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to revise these terms at any time without
              notice. By continuing to use the service after changes are posted,
              you agree to be bound by the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These terms shall be governed by and construed in accordance with
              the laws of Australia, and you irrevocably submit to the exclusive
              jurisdiction of the courts in that location.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms & Conditions, please
              contact us at{' '}
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

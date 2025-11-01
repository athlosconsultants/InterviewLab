import Link from 'next/link';

export function Footer() {
  return (
    <footer className="py-12 border-t border-slate-200 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">InterviewLab</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              AI-powered mock interviews that help candidates prepare with
              confidence for real-world opportunities.
            </p>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/terms"
                  className="text-slate-600 hover:text-cyan-600 transition-colors duration-200"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-slate-600 hover:text-cyan-600 transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="mailto:support@theinterviewlab.io"
                  className="text-slate-600 hover:text-cyan-600 transition-colors duration-200"
                >
                  support@theinterviewlab.io
                </a>
              </li>
              <li>
                <Link
                  href="/report"
                  className="text-slate-600 hover:text-cyan-600 transition-colors duration-200"
                >
                  Report a Problem
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-600">
            <div className="text-center md:text-left">
              <p>© 2025 InterviewLab. Powered by OpenAI GPT-4.</p>
              <p className="mt-1 text-xs">
                The Interview Lab is a registered business name in Australia,
                operated as a sole trader.
              </p>
            </div>
            <p className="text-center md:text-right">
              Practice makes perfect. Interview prep made intelligent.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

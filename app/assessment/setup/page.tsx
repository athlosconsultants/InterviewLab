'use client';

import { redirect } from 'next/navigation';

export default function AssessmentSetupPage() {
  // Redirect to new two-screen flow
  redirect('/assessment/setup/configure');
}

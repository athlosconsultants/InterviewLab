import { redirect } from 'next/navigation';

export default function SetupPage() {
  // Redirect to new two-screen flow
  redirect('/setup/configure');
}

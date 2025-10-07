import { IntakeForm } from '@/components/forms/IntakeForm';

export default function SetupPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Interview Setup</h1>
          <p className="text-lg text-muted-foreground">
            Tell us about the role and upload your materials
          </p>
        </div>

        <div className="rounded-lg border p-6 shadow-sm">
          <IntakeForm />
        </div>
      </div>
    </main>
  );
}

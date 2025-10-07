export default async function InterviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Interview Session</h1>
        <p className="text-lg text-muted-foreground">Session ID: {id}</p>
      </div>
    </main>
  );
}

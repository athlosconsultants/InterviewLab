import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">InterviewLab</h1>
        <p className="text-lg text-muted-foreground">AI-driven interview simulation platform</p>
        <Button>Get Started</Button>
      </div>
    </main>
  );
}


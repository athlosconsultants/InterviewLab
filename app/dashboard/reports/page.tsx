'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Star, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getCachedData } from '@/hooks/usePremiumDataPrefetch';

interface ReportSession {
  id: string;
  job_title: string;
  company: string;
  created_at: string;
  overall_score: number;
  status: string;
}

export default function ReportsPage() {
  const [sessions, setSessions] = useState<ReportSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      try {
        // Try cache first for instant loading
        const cachedData = getCachedData('sessions');
        if (cachedData && cachedData.success) {
          setSessions(cachedData.sessions);
          setLoading(false);
          console.log('[Reports] Loaded from cache (instant):', cachedData.sessions.length, 'sessions');
          return;
        }

        // Fallback to API if no cache
        console.log('[Reports] Fetching from API...');
        const response = await fetch('/api/user/sessions');
        const data = await response.json();
        
        console.log('[Reports] API response:', data);
        
        if (data.success) {
          setSessions(data.sessions);
          console.log('[Reports] Loaded from API:', data.sessions.length, 'sessions');
        } else {
          console.error('[Reports] API returned error:', data.error);
        }
      } catch (error) {
        console.error('[Reports] Failed to fetch sessions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSessions();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50/30 via-white to-white">
      <div className="mx-auto max-w-4xl px-6 md:px-8 py-12 md:py-16">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl md:text-4xl font-light text-slate-800 tracking-tight">
            Your Practice Sessions
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            View detailed feedback from all your completed interviews
          </p>
        </div>

        {/* Sessions List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-500">Loading your sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
            <p className="text-slate-600 mb-4">No completed interviews yet</p>
            <Button asChild className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
              <Link href="/setup">Start Your First Interview</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:border-cyan-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-slate-800">
                      {session.job_title} @ {session.company}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                      </span>
                      {session.overall_score && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-amber-500" />
                          {session.overall_score}/10
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        session.status === 'feedback' 
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {session.status === 'feedback' ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {session.status === 'feedback' ? (
                      <Button variant="outline" asChild size="sm">
                        <Link href={`/report/${session.id}`}>
                          View Report
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
                        <Link href={`/interview/${session.id}`}>
                          Continue
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}


'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface AnalyticsEvent {
  id: string;
  event_name: string;
  user_id: string | null;
  payload: Record<string, any>;
  user_agent: string | null;
  ip_address: string | null;
  created_at: string;
}

export default function AnalyticsDebugPage() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Get admin session token from sessionStorage
      const sessionToken = sessionStorage.getItem('admin_session');
      if (!sessionToken) {
        throw new Error(
          'Not authenticated. Please refresh the page and log in again.'
        );
      }

      // Decode session token to get credentials
      const credentials = JSON.parse(atob(sessionToken));
      const basicAuth = btoa(`${credentials.username}:${credentials.password}`);

      const response = await fetch('/api/analytics/events?limit=500', {
        headers: {
          Authorization: `Basic ${basicAuth}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            'Unauthorized. Please refresh the page and log in again.'
          );
        }
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      setEvents(data.events || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
      console.error('Failed to load analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEvents = filter
    ? events.filter((e) =>
        e.event_name?.toLowerCase().includes(filter.toLowerCase())
      )
    : events;

  // Group by event name for summary
  const eventCounts = events.reduce(
    (acc, e) => {
      acc[e.event_name] = (acc[e.event_name] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading analytics...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Analytics Dashboard (Production)
          </h1>
          <p className="text-slate-600">
            Viewing {events.length} of {total} total events from database
          </p>
          {error && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-900 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-sm text-slate-600">Total Events</div>
            <div className="text-2xl font-bold">{events.length}</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-sm text-slate-600">Widget Loads</div>
            <div className="text-2xl font-bold">
              {eventCounts['preview_widget_load'] || 0}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-sm text-slate-600">Role Selections</div>
            <div className="text-2xl font-bold">
              {eventCounts['preview_role_selected'] || 0}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-sm text-slate-600">CTA Clicks</div>
            <div className="text-2xl font-bold">
              {eventCounts['preview_cta_clicked'] || 0}
            </div>
          </div>
        </div>

        {/* Event Type Summary */}
        <div className="bg-white rounded-lg p-6 shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Event Summary</h2>
          <div className="space-y-2">
            {Object.entries(eventCounts)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .map(([name, count]) => (
                <div
                  key={name}
                  className="flex justify-between items-center py-2 border-b"
                >
                  <span className="font-mono text-sm">{name}</span>
                  <span className="font-semibold">{count as number}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Filter events..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <Button onClick={loadEvents} variant="outline" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>

        {/* Events Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 border-b">
                <tr>
                  <th className="text-left p-4 font-semibold">Timestamp</th>
                  <th className="text-left p-4 font-semibold">Event</th>
                  <th className="text-left p-4 font-semibold">Payload</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center p-8 text-slate-500">
                      No events found
                    </td>
                  </tr>
                ) : (
                  filteredEvents
                    .slice()
                    .reverse()
                    .map((event, idx) => (
                      <tr key={event.id} className="border-b hover:bg-slate-50">
                        <td className="p-4 text-sm text-slate-600">
                          {new Date(event.created_at).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <code className="text-sm bg-slate-100 px-2 py-1 rounded">
                            {event.event_name}
                          </code>
                        </td>
                        <td className="p-4">
                          <pre className="text-xs text-slate-600 max-w-md overflow-x-auto">
                            {JSON.stringify(event.payload, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

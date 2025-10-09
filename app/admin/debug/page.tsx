'use client';

import { useState, useEffect } from 'react';
import {
  getStoredEvents,
  getSessionAnalytics,
  clearStoredEvents,
} from '@/lib/analytics';

/**
 * T110: Admin debug view to inspect session timing signals and analytics
 */
export default function AdminDebugPage() {
  const [sessionId, setSessionId] = useState('');
  const [sessionData, setSessionData] = useState<any>(null);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [localAnalytics, setLocalAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load recent sessions on mount
  useEffect(() => {
    fetchRecentSessions();
  }, []);

  const fetchRecentSessions = async () => {
    try {
      const response = await fetch('/api/admin/debug', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.sessions) {
        setRecentSessions(data.sessions);
      }
    } catch (err) {
      console.error('Failed to fetch recent sessions:', err);
    }
  };

  const fetchSessionDebugData = async () => {
    if (!sessionId.trim()) {
      setError('Please enter a session ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Fetch server-side data
      const response = await fetch(`/api/admin/debug?session_id=${sessionId}`);
      const data = await response.json();

      if (response.ok) {
        setSessionData(data);

        // Get local analytics data
        const analytics = getSessionAnalytics(sessionId);
        setLocalAnalytics(analytics);
      } else {
        setError(data.error || 'Failed to fetch session data');
      }
    } catch (err) {
      setError('Failed to fetch session data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearAnalytics = () => {
    clearStoredEvents();
    setLocalAnalytics(null);
    alert('Local analytics cleared');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Admin Debug - Session Analytics
        </h1>

        {/* Session ID Input */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Session Inspector</h2>
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Enter Session ID"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              className="flex-1 p-3 border rounded-lg"
            />
            <button
              onClick={fetchSessionDebugData}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Inspect Session'}
            </button>
          </div>

          {error && (
            <div className="text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>
          )}
        </div>

        {/* Recent Sessions */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Recent Sessions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentSessions.map((session) => (
              <div
                key={session.id}
                className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setSessionId(session.id)}
              >
                <div className="font-mono text-sm text-gray-600 mb-2">
                  {session.id.slice(0, 8)}...
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      session.status === 'complete'
                        ? 'bg-green-100 text-green-800'
                        : session.status === 'running'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {session.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {session.mode} | {session.plan_tier}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(session.updated_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Session Data Display */}
        {sessionData && (
          <div className="space-y-6">
            {/* Session Overview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Session Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <div className="font-semibold">
                    {sessionData.session.status}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Mode</div>
                  <div className="font-semibold">
                    {sessionData.session.mode}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Plan</div>
                  <div className="font-semibold">
                    {sessionData.session.plan_tier}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Stage</div>
                  <div className="font-semibold">
                    {sessionData.session.current_stage} /{' '}
                    {sessionData.session.stages_planned}
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Analytics Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Total Turns</div>
                  <div className="font-semibold text-2xl">
                    {sessionData.analytics.total_turns}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Small Talk</div>
                  <div className="font-semibold text-2xl">
                    {sessionData.analytics.small_talk_turns}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Total Replays</div>
                  <div className="font-semibold text-2xl">
                    {sessionData.analytics.total_replay_count}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Total Reveals</div>
                  <div className="font-semibold text-2xl">
                    {sessionData.analytics.total_reveal_count}
                  </div>
                </div>
              </div>
            </div>

            {/* T112: Difficulty Curve */}
            {sessionData.session.difficulty_curve &&
              sessionData.session.difficulty_curve.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Difficulty Curve (T112)
                  </h2>
                  <div className="space-y-3">
                    {sessionData.session.difficulty_curve.map(
                      (adjustment: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between border-b pb-2 last:border-b-0"
                        >
                          <div className="flex items-center space-x-4">
                            <span className="font-medium">
                              Q{adjustment.question_number}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(
                                adjustment.timestamp
                              ).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <span
                                className={`px-2 py-1 text-xs rounded ${
                                  adjustment.previous_difficulty === 'easy'
                                    ? 'bg-green-100 text-green-800'
                                    : adjustment.previous_difficulty ===
                                        'medium'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {adjustment.previous_difficulty}
                              </span>
                              <span>→</span>
                              <span
                                className={`px-2 py-1 text-xs rounded ${
                                  adjustment.new_difficulty === 'easy'
                                    ? 'bg-green-100 text-green-800'
                                    : adjustment.new_difficulty === 'medium'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {adjustment.new_difficulty}
                              </span>
                            </div>
                            {adjustment.answer_quality && (
                              <span
                                className={`px-2 py-1 text-xs rounded ${
                                  adjustment.answer_quality === 'strong'
                                    ? 'bg-blue-100 text-blue-800'
                                    : adjustment.answer_quality === 'medium'
                                      ? 'bg-gray-100 text-gray-800'
                                      : 'bg-orange-100 text-orange-800'
                                }`}
                              >
                                {adjustment.answer_quality} answer
                              </span>
                            )}
                            <span className="text-xs text-gray-500 capitalize">
                              {adjustment.adjustment_reason.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Turns Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Turns Timeline</h2>
              <div className="space-y-4">
                {sessionData.turns.map((turn: any) => (
                  <div
                    key={turn.id}
                    className="border-l-4 border-blue-500 pl-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-semibold">Turn {turn.index}</span>
                        <span
                          className={`ml-2 px-2 py-1 text-xs rounded ${
                            turn.turn_type === 'small_talk'
                              ? 'bg-amber-100 text-amber-800'
                              : turn.turn_type === 'confirmation'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {turn.turn_type || 'question'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(turn.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 mb-2">
                      {turn.question.text}
                    </div>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>Category: {turn.question.category}</span>
                      <span>Difficulty: {turn.question.difficulty}</span>
                      {turn.timing.replay_count > 0 && (
                        <span>Replays: {turn.timing.replay_count}</span>
                      )}
                      {turn.timing.reveal_count > 0 && (
                        <span>Reveals: {turn.timing.reveal_count}</span>
                      )}
                      {turn.answer_provided && (
                        <span>Answer: {turn.answer_length} chars</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Local Analytics */}
            {localAnalytics && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    Local Analytics Events
                  </h2>
                  <button
                    onClick={clearAnalytics}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Clear Local Data
                  </button>
                </div>
                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-2">
                    Events Summary
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>Total: {localAnalytics.summary.total_events}</div>
                    <div>
                      Small Talk:{' '}
                      {localAnalytics.summary.small_talk_interactions}
                    </div>
                    <div>Reveals: {localAnalytics.summary.reveal_count}</div>
                    <div>Replays: {localAnalytics.summary.replay_count}</div>
                  </div>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {localAnalytics.events.map((event: any, index: number) => (
                    <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                      <span className="font-semibold">{event.event}</span>
                      <span className="ml-2 text-gray-500">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                      {event.metadata && (
                        <pre className="mt-1 text-xs text-gray-600 overflow-x-auto">
                          {JSON.stringify(event.metadata, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

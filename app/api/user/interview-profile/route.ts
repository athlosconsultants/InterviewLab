import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import type { InterviewProfile, CvMetadata, LastInterview } from '@/lib/schema';

/**
 * GET /api/user/interview-profile
 * Fetches user's interview profile for smart prefilling
 * Returns: CV metadata, last interview settings, interview history
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get CV metadata from documents table
    const { data: cvDocs, error: cvError } = await supabase
      .from('documents')
      .select('storage_key, created_at')
      .eq('user_id', user.id)
      .eq('type', 'cv')
      .order('created_at', { ascending: false })
      .limit(1);

    let cvFile: CvMetadata | undefined;
    if (cvDocs && cvDocs.length > 0) {
      const cv = cvDocs[0];
      // Extract filename from storage_key (format: "cvs/{user_id}/{filename}")
      const filename = cv.storage_key.split('/').pop() || 'resume.pdf';
      
      cvFile = {
        filename,
        uploadDate: cv.created_at,
        s3Key: cv.storage_key,
        fileSize: 0, // We don't store size in documents table, will be 0 for now
      };
    }

    // Get last completed interview from sessions table
    const { data: lastSession, error: sessionError } = await supabase
      .from('sessions')
      .select('job_title, company, location, mode, stages_planned, stage_targets, created_at')
      .eq('user_id', user.id)
      .eq('status', 'complete')
      .order('created_at', { ascending: false })
      .limit(1);

    let lastInterview: LastInterview | undefined;
    if (lastSession && lastSession.length > 0) {
      const session = lastSession[0] as any;
      const stageTargets = session.stage_targets as number[] | null;
      const questionsPerStage = stageTargets && stageTargets.length > 0
        ? stageTargets[0] // Use first stage's target as default
        : 5;

      lastInterview = {
        jobTitle: session.job_title || '',
        company: session.company || '',
        location: session.location || undefined,
        jobDescription: undefined, // Don't prefill job description
        mode: session.mode || 'text',
        stages: session.stages_planned || 1,
        questionsPerStage,
        completedAt: session.created_at,
      };
    }

    // Get interview history (last 10 completed interviews for suggestions)
    const { data: historySessions, error: historyError } = await supabase
      .from('sessions')
      .select('job_title, company, location, created_at')
      .eq('user_id', user.id)
      .eq('status', 'complete')
      .order('created_at', { ascending: false })
      .limit(10);

    const interviewHistory =
      historySessions?.map((s: any) => ({
        jobTitle: s.job_title || '',
        company: s.company || '',
        location: s.location || undefined,
        completedAt: s.created_at,
      })) || [];

    const profile: InterviewProfile = {
      userId: user.id,
      cvFile,
      lastInterview,
      interviewHistory,
    };

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/interview-profile
 * Updates user's interview profile after interview completion
 * Body: { lastInterview: LastInterview }
 */
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { lastInterview } = body as { lastInterview: LastInterview };

    if (!lastInterview) {
      return NextResponse.json(
        { error: 'lastInterview is required' },
        { status: 400 }
      );
    }

    // For Phase 1, we're just returning success
    // The actual profile storage will be handled by sessions table
    // In future phases, we could add a dedicated user_profiles table

    return NextResponse.json({
      success: true,
      message: 'Profile updated (stored in sessions table)',
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


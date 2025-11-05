import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has any CV documents
    const { data: cvDocs, error: cvError } = await supabase
      .from('documents')
      .select('id, created_at')
      .eq('user_id', user.id)
      .eq('type', 'cv')
      .order('created_at', { ascending: false })
      .limit(1);

    if (cvError) {
      console.error('CV status fetch error:', cvError);
      return NextResponse.json(
        { error: 'Failed to check CV status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      hasCv: cvDocs && cvDocs.length > 0,
      lastUploaded: cvDocs && cvDocs.length > 0 ? cvDocs[0].created_at : null,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


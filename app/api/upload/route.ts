import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { uploadFile, FileType } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as FileType;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (
      !type ||
      !['cv', 'jobspec', 'extra', 'audio', 'report'].includes(type)
    ) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Upload file
    const result = await uploadFile(file, type, user.id);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Save document metadata to database
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        type: type,
        storage_key: result.storageKey,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // File was uploaded but metadata wasn't saved - still return success
      // but log the error for investigation
    }

    return NextResponse.json({
      success: true,
      storageKey: result.storageKey,
      documentId: document?.id,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

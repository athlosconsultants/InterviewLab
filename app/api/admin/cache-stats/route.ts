/**
 * T98 - Cache statistics endpoint for monitoring
 */

import { NextResponse } from 'next/server';
import { researchCache } from '@/lib/cache';

export async function GET() {
  try {
    const stats = researchCache.getStats();

    return NextResponse.json({
      success: true,
      ...stats,
    });
  } catch (error) {
    console.error('Error fetching cache stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch cache statistics',
      },
      { status: 500 }
    );
  }
}

// Clear cache endpoint (for testing)
export async function DELETE() {
  try {
    researchCache.clear();

    return NextResponse.json({
      success: true,
      message: 'Cache cleared successfully',
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to clear cache',
      },
      { status: 500 }
    );
  }
}

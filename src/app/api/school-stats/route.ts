import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // total schools
    const rows: any = await query({
      query: 'SELECT COUNT(*) AS count FROM schools',
    });
    const schoolCount = rows[0]?.count || 0;

    // last added
    const last: any = await query({
      query: 'SELECT name FROM schools ORDER BY created_at DESC LIMIT 1',
    });
    const lastAdded = last[0]?.name || 'N/A';

    // most viewed
    const viewed: any = await query({
      query: 'SELECT name FROM schools ORDER BY views DESC LIMIT 1',
    });
    const mostViewed = viewed[0]?.name || 'N/A';

    // favourites
    const favs: any = await query({
      query: 'SELECT COUNT(*) AS count FROM favourites',
    });
    const favouritesCount = favs[0]?.count || 0;

    return NextResponse.json({
      schoolCount,
      lastAdded,
      mostViewed,
      favouritesCount,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}

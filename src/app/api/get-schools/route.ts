import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') || 'name';
    const order = searchParams.get('order') || 'ASC';

    // Validate sort parameters to prevent SQL injection
    const validSortFields = ['name', 'city', 'created_at'];
    const validOrder = ['ASC', 'DESC'];

    const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
    const sortOrder = validOrder.includes(order.toUpperCase()) ? order.toUpperCase() : 'ASC';

    const results = await query({
      query: `SELECT id, name, address, city, image FROM schools ORDER BY ${sortField} ${sortOrder}`,
    });

    return NextResponse.json({ schools: results });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('API Error:', error.message);
      return NextResponse.json(
        {
          message: 'Internal server error',
          error: error.message,
        },
        { status: 500 }
      );
    } else {
      console.error('Unknown API error:', error);
      return NextResponse.json(
        { message: 'Internal server error' },
        { status: 500 }
      );
    }
  }
}
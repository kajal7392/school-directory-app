// src/app/api/auth/me/route.ts
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Get token from cookies
    const cookieHeader = request.headers.get('cookie');
    const token = cookieHeader?.split(';')
      .find(cookie => cookie.trim().startsWith('auth-token='))
      ?.split('=')[1];

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Verify token using your auth library
    const decoded = verifyToken(token);
    
    // Get user from database
    const users = await query<any[]>({
      query: 'SELECT id, username, email, role, avatar FROM users WHERE id = ?',
      values: [decoded.userId],
    });

    if (users.length === 0) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({ user: users[0] });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { verifyPassword, generateToken } from '@/lib/auth';

interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  role: string;
  avatar: string | null;
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      console.log('Missing credentials');
      return NextResponse.json(
        { message: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Find user in database - using users table with password_hash
    const users = await query<User[]>({
      query: 'SELECT id, username, email, password_hash, role, avatar FROM users WHERE username = ? OR email = ?',
      values: [username, username],
    });

    if (users.length === 0) {
      console.log('User  not found:', username);
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Verify password - using password_hash field
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('Invalid password');
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check JWT_SECRET
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not set in environment variables');
      return NextResponse.json(
        { message: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Create JWT token using the generateToken function
    console.log('Creating JWT token...');
    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    // Prepare response, exclude password_hash
    const { password_hash, ...userWithoutPassword } = user;
    console.log('Login successful for user:', user.username);
    console.log("Password hash generated:", password_hash);
    
    const response = NextResponse.json({
      message: 'Login successful',
      user: userWithoutPassword,
    });

    // Set cookie on response
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    return response;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Login error details:', error.message);
      return NextResponse.json(
        {
          message: 'Internal server error',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
        { status: 500 }
      );
    } else {
      console.error('Unknown login error:', error);
      return NextResponse.json(
        { message: 'Internal server error' },
        { status: 500 }
      );
    }
  }
}

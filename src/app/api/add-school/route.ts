import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { verifyToken } from '@/lib/auth';
import fs from 'fs/promises';

interface UserRole {
  role: string;
}

interface InsertResult {
  insertId: number;
}

export async function POST(request: NextRequest) {
  try {
    let token: string | null = null;
    // Authentication check
    const authHeader = request.headers.get('authorization');
    token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      const cookieHeader = request.headers.get('cookie');
      token = cookieHeader
        ?.split(';')
        .find((cookie) => cookie.trim().startsWith('auth-token='))
        ?.split('=')[1] ?? null;
    }

    console.log('Token found:', !!token);

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let decoded: { userId: number };
    try {
      decoded = verifyToken(token);
      console.log('Decoded token:', decoded);
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Authorization check - using users table instead of admins
    const user = await query<UserRole[]>({
      query: 'SELECT role FROM users WHERE id = ?',
      values: [decoded.userId],
    });

    console.log('User  role:', user);

    if (!user || user.length === 0) {
      console.log('User  not found in database');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (user[0].role !== 'admin') {
      console.log('User  is not an admin, role:', user[0].role);
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 });
    }

    console.log('User  authorized as admin, proceeding with school addition');
    // Parse form data
    const formData = await request.formData();

    // Extract and validate fields
    const name = formData.get('name') as string | null;
    const address = formData.get('address') as string | null;
    const city = formData.get('city') as string | null;
    const state = formData.get('state') as string | null;
    const contact = formData.get('contact') as string | null;
    const email_id = formData.get('email_id') as string | null;
    const imageFile = formData.get('image') as File | null;

    // Validate required text fields
    const requiredFields: Record<string, string | null> = { name, address, city, state, contact, email_id };
    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value) {
        return NextResponse.json(
          {
            message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required`,
          },
          { status: 400 }
        );
      }
    }

    // Validate image file
    if (!imageFile) {
      return NextResponse.json({ message: 'School image is required' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(imageFile.type)) {
      return NextResponse.json(
        { message: 'Only JPG, PNG, WEBP, and GIF images are allowed' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email_id!)) {
      return NextResponse.json({ message: 'Invalid email format' }, { status: 400 });
    }

    // Validate image file type
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json({ message: 'Uploaded file must be an image' }, { status: 400 });
    }

    // Check if image size is reasonable (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (imageFile.size > maxSize) {
      return NextResponse.json({ message: 'Image size must be less than 5MB' }, { status: 400 });
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'schoolImages');
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `school-${uniqueSuffix}${path.extname(imageFile.name)}`;
    const filePath = path.join(uploadDir, filename);

    // Save image to filesystem
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.writeFile(filePath, buffer);

    const imagePath = `/schoolImages/${filename}`;

    // Insert into database
    const result = await query<InsertResult>({
      query: "INSERT INTO schools (name, address, city, state, contact, image, email_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
      values: [name, address, city, state, contact, imagePath, email_id],
    });

    return NextResponse.json(
      {
        message: 'School added successfully!',
        schoolId: result.insertId,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('API Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        message: 'Internal server error',
        error: message,
      },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
